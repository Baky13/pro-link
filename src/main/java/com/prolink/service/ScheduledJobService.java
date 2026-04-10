package com.prolink.service;

import com.prolink.entity.*;
import com.prolink.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScheduledJobService {

    private final ApplicationRepository applicationRepository;
    private final VacancyRepository vacancyRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final NotificationService notificationService;

    // Каждый день в 10:00 — проверяем зависшие заявки (7+ дней без ответа)
    @Scheduled(cron = "0 0 10 * * *")
    @Transactional
    public void notifyStaleApplications() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(7);
        List<Application> stale = applicationRepository.findStaleApplications(threshold);

        for (Application app : stale) {
            WorkerProfile worker = app.getWorker();
            Vacancy vacancy = app.getVacancy();

            String advice = buildStaleAdvice(worker, vacancy);

            notificationService.notify(
                    worker.getUser(),
                    Notification.Type.STALE_APPLICATION,
                    "Ваша заявка ждёт уже 7+ дней",
                    "Заявка на вакансию \"" + vacancy.getTitle() + "\" без ответа " +
                    java.time.temporal.ChronoUnit.DAYS.between(app.getCreatedAt(), LocalDateTime.now()) +
                    " дней.\n\n" + advice,
                    app.getId()
            );
        }
        log.info("Stale application notifications sent: {}", stale.size());
    }

    // Каждый день в 11:00 — предупреждаем работодателей о просроченных откликах
    @Scheduled(cron = "0 0 11 * * *")
    @Transactional
    public void notifyEmployersOverdueResponses() {
        LocalDateTime threshold = LocalDateTime.now().minusDays(5);
        List<Vacancy> overdueVacancies = vacancyRepository.findVacanciesWithOverdueResponses(threshold);

        for (Vacancy vacancy : overdueVacancies) {
            notificationService.notify(
                    vacancy.getEmployer().getUser(),
                    Notification.Type.RESPONSE_DEADLINE_WARNING,
                    "Есть неотвеченные отклики",
                    "На вакансию \"" + vacancy.getTitle() + "\" есть отклики которые ждут ответа более 5 дней. " +
                    "Компании которые не отвечают получают метку \"не отвечает\" на платформе.",
                    vacancy.getId()
            );
        }
        log.info("Employer overdue response notifications sent: {}", overdueVacancies.size());
    }

    // Каждый час — автодеактивация истёкших вакансий
    @Scheduled(cron = "0 0 * * * *")
    @Transactional
    public void deactivateExpiredVacancies() {
        int count = vacancyRepository.deactivateExpired(LocalDateTime.now());
        if (count > 0) {
            log.info("Deactivated {} expired vacancies", count);
        }
    }

    // Каждый день в 09:00 — уведомляем о повторно открытых вакансиях
    @Scheduled(cron = "0 0 9 * * *")
    @Transactional
    public void notifyReopenedVacancies() {
        List<WorkerProfile> allWorkers = workerProfileRepository.findAll();

        for (WorkerProfile worker : allWorkers) {
            List<Application> reopened = applicationRepository.findReopenedVacanciesForWorker(worker.getId());
            for (Application app : reopened) {
                notificationService.notify(
                        worker.getUser(),
                        Notification.Type.VACANCY_REOPENED,
                        "Вакансия снова открыта",
                        "Вакансия \"" + app.getVacancy().getTitle() + "\" на которую вы откликались — снова открыта. " +
                        "Хотите подать заявку повторно?",
                        app.getVacancy().getId()
                );
            }
        }
    }

    private String buildStaleAdvice(WorkerProfile worker, Vacancy vacancy) {
        StringBuilder advice = new StringBuilder("Возможные причины:\n");

        // Проверяем навыки
        if (vacancy.getSkills() != null && worker.getSkills() != null) {
            List<String> workerSkills = worker.getSkills().stream()
                    .map(s -> s.getSkillName().toLowerCase())
                    .collect(Collectors.toList());
            List<String> missing = vacancy.getSkills().stream()
                    .map(s -> s.getSkillName().toLowerCase())
                    .filter(s -> !workerSkills.contains(s))
                    .collect(Collectors.toList());
            if (!missing.isEmpty()) {
                advice.append("• В вакансии требуется: ").append(String.join(", ", missing))
                      .append(" — но у вас эти навыки не указаны в профиле\n");
            }
        }

        // Проверяем зарплату
        if (worker.getExpectedSalary() != null && vacancy.getSalaryTo() != null
                && worker.getExpectedSalary() > vacancy.getSalaryTo()) {
            advice.append("• Ваша ожидаемая зарплата (").append(worker.getExpectedSalary())
                  .append(") выше максимума вакансии (").append(vacancy.getSalaryTo()).append(")\n");
        }

        // Проверяем заполненность профиля
        int completeness = calcProfileCompleteness(worker);
        if (completeness < 70) {
            advice.append("• Ваш профиль заполнен на ").append(completeness)
                  .append("% — работодатели чаще выбирают полные профили\n");
        }

        if (advice.toString().equals("Возможные причины:\n")) {
            advice.append("• Возможно высокая конкуренция на эту вакансию. Попробуйте написать сопроводительное письмо.");
        }

        return advice.toString();
    }

    private int calcProfileCompleteness(WorkerProfile worker) {
        int score = 0;
        if (worker.getTitle() != null && !worker.getTitle().isBlank()) score += 20;
        if (worker.getBio() != null && !worker.getBio().isBlank()) score += 20;
        if (worker.getResumeUrl() != null) score += 20;
        if (worker.getSkills() != null && !worker.getSkills().isEmpty()) score += 20;
        if (worker.getExperiences() != null && !worker.getExperiences().isEmpty()) score += 20;
        return score;
    }
}
