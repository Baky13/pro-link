package com.prolink.service;

import com.prolink.dto.ApplicationDto;
import com.prolink.entity.*;
import com.prolink.exception.BadRequestException;
import com.prolink.exception.ResourceNotFoundException;
import com.prolink.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.Period;

@Service
@RequiredArgsConstructor
public class ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final VacancyRepository vacancyRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final NotificationService notificationService;
    private final VacancyService vacancyService;

    @Transactional
    public ApplicationDto.Response apply(ApplicationDto.Request request, Long userId) {
        WorkerProfile worker = workerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Worker profile not found"));
        Vacancy vacancy = vacancyRepository.findById(request.getVacancyId())
                .orElseThrow(() -> new ResourceNotFoundException("Vacancy not found"));

        if (applicationRepository.existsByVacancyIdAndWorkerId(vacancy.getId(), worker.getId())) {
            throw new BadRequestException("Already applied to this vacancy");
        }

        // Автоотклонение
        if (Boolean.TRUE.equals(vacancy.getAutoRejectEnabled())) {
            String rejectReason = checkAutoReject(vacancy, worker);
            if (rejectReason != null) {
                Application rejected = Application.builder()
                        .vacancy(vacancy)
                        .worker(worker)
                        .coverLetter(request.getCoverLetter())
                        .status(Application.Status.REJECTED)
                        .build();
                applicationRepository.save(rejected);

                notificationService.notify(
                        worker.getUser(),
                        Notification.Type.APPLICATION_STATUS,
                        "Отклик не прошёл проверку",
                        rejectReason,
                        rejected.getId()
                );
                return toResponse(rejected);
            }
        }

        Application application = Application.builder()
                .vacancy(vacancy)
                .worker(worker)
                .coverLetter(request.getCoverLetter())
                .build();
        applicationRepository.save(application);
        vacancyRepository.incrementApplicants(vacancy.getId());

        notificationService.notify(
                vacancy.getEmployer().getUser(),
                Notification.Type.APPLICATION_STATUS,
                "Новый отклик",
                worker.getUser().getFirstName() + " откликнулся на вакансию: " + vacancy.getTitle(),
                application.getId()
        );

        return toResponse(application);
    }

    private String checkAutoReject(Vacancy vacancy, WorkerProfile worker) {
        // Проверка опыта
        if (vacancy.getAutoRejectMinExp() != null &&
                worker.getExperienceYears() < vacancy.getAutoRejectMinExp()) {
            return "Данный работодатель установил ограничение по опыту работы: минимум " +
                    vacancy.getAutoRejectMinExp() + " лет. У вас указано " +
                    worker.getExperienceYears() + " лет опыта.";
        }

        // Проверка возраста
        if (vacancy.getAutoRejectMinAge() != null && worker.getBirthDate() != null) {
            int age = Period.between(worker.getBirthDate(), LocalDate.now()).getYears();
            if (age < vacancy.getAutoRejectMinAge()) {
                return "Данный работодатель установил ограничение по возрасту: от " +
                        vacancy.getAutoRejectMinAge() + " лет. Ваш возраст: " + age + " лет.";
            }
        }

        // Кастомный критерий — просто информируем
        if (vacancy.getAutoRejectCustomCriteria() != null &&
                !vacancy.getAutoRejectCustomCriteria().isBlank()) {
            return "Данный работодатель установил дополнительное требование: " +
                    vacancy.getAutoRejectCustomCriteria() +
                    ". Ваша заявка была отклонена автоматически.";
        }

        return null;
    }

    public Page<ApplicationDto.Response> getMyApplications(Long userId, Pageable pageable) {
        WorkerProfile worker = workerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Worker profile not found"));
        return applicationRepository.findByWorkerId(worker.getId(), pageable).map(this::toResponse);
    }

    public Page<ApplicationDto.Response> getVacancyApplications(Long vacancyId, Long userId, Pageable pageable) {
        Vacancy vacancy = vacancyRepository.findById(vacancyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vacancy not found"));
        if (!vacancy.getEmployer().getUser().getId().equals(userId)) {
            throw new BadRequestException("Not authorized");
        }
        return applicationRepository.findByVacancyId(vacancyId, pageable).map(this::toResponse);
    }

    @Transactional
    public ApplicationDto.Response updateStatus(Long id, Application.Status status, Long userId) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        if (!application.getVacancy().getEmployer().getUser().getId().equals(userId)) {
            throw new BadRequestException("Not authorized");
        }
        application.setStatus(status);
        applicationRepository.save(application);

        String statusText = switch (status) {
            case VIEWED -> "просмотрено";
            case INVITED -> "приглашён на собеседование";
            case REJECTED -> "отклонено";
            default -> "обновлено";
        };
        notificationService.notify(
                application.getWorker().getUser(),
                Notification.Type.APPLICATION_STATUS,
                "Статус отклика изменён",
                "Ваш отклик на вакансию \"" + application.getVacancy().getTitle() + "\" — " + statusText,
                application.getId()
        );

        return toResponse(application);
    }

    public java.util.Map<String, Object> checkApplication(Long vacancyId, Long userId) {
        WorkerProfile worker = workerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Worker profile not found"));
        return applicationRepository.findByVacancyIdAndWorkerId(vacancyId, worker.getId())
                .map(a -> java.util.Map.<String, Object>of("applied", true, "applicationId", a.getId()))
                .orElse(java.util.Map.of("applied", false));
    }

    @Transactional
    public void cancelApplication(Long id, Long userId) {
        Application application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));
        if (!application.getWorker().getUser().getId().equals(userId)) {
            throw new BadRequestException("Not authorized");
        }
        if (application.getStatus() == Application.Status.INVITED) {
            throw new BadRequestException("Нельзя отменить принятый отклик");
        }
        applicationRepository.delete(application);
    }

    private ApplicationDto.Response toResponse(Application a) {
        ApplicationDto.Response r = new ApplicationDto.Response();
        r.setId(a.getId());
        r.setVacancy(vacancyService.toResponse(a.getVacancy()));
        r.setCoverLetter(a.getCoverLetter());
        r.setStatus(a.getStatus());
        r.setCreatedAt(a.getCreatedAt());
        r.setUpdatedAt(a.getUpdatedAt());
        return r;
    }
}
