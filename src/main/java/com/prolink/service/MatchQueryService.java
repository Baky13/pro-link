package com.prolink.service;

import com.prolink.dto.MatchDto;
import com.prolink.entity.Application;
import com.prolink.entity.Vacancy;
import com.prolink.entity.WorkerProfile;
import com.prolink.exception.BadRequestException;
import com.prolink.exception.ResourceNotFoundException;
import com.prolink.repository.ApplicationRepository;
import com.prolink.repository.VacancyRepository;
import com.prolink.repository.WorkerProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Сервис-фасад ИИ-матчинга для контроллера.
 * @Transactional — нужен для lazy-коллекций (навыки/опыт) при скоринге.
 */
@Service
@RequiredArgsConstructor
public class MatchQueryService {

    private final WorkerProfileRepository workerProfileRepository;
    private final VacancyRepository vacancyRepository;
    private final ApplicationRepository applicationRepository;
    private final AiMatchService aiMatchService;
    private final MatchingService matchingService;
    private final VacancyService vacancyService;
    private final ProfileService profileService;

    /** Рекомендации соискателю: топ-N активных вакансий по совпадению. LLM-текст только для топа. */
    @Transactional
    public List<MatchDto.VacancyMatch> recommendations(Long userId, int limit) {
        WorkerProfile worker = workerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Worker profile not found"));

        List<Vacancy> active = vacancyRepository.findByIsActiveTrue(PageRequest.of(0, 100)).getContent();
        // score считаем ОДИН раз на вакансию (иначе Comparator пересчитывал бы его O(n log n) раз)
        List<Vacancy> top = active.stream()
                .map(v -> java.util.Map.entry(v, matchingService.compute(worker, v).score()))
                .sorted(java.util.Map.Entry.<Vacancy, Integer>comparingByValue().reversed())
                .limit(Math.max(1, limit))
                .map(java.util.Map.Entry::getKey)
                .collect(Collectors.toList());

        List<MatchDto.VacancyMatch> result = new ArrayList<>();
        for (Vacancy v : top) {
            result.add(toVacancyMatch(v, aiMatchService.forWorker(worker, v)));
        }
        return result;
    }

    /** Совпадение текущего соискателя с конкретной вакансией (страница вакансии). */
    @Transactional
    public MatchDto.VacancyMatch forVacancy(Long userId, Long vacancyId) {
        WorkerProfile worker = workerProfileRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Worker profile not found"));
        Vacancy v = vacancyRepository.findById(vacancyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vacancy not found"));
        return toVacancyMatch(v, aiMatchService.forWorker(worker, v));
    }

    /** Отклики на вакансию, отсортированы по совпадению (для работодателя-владельца). */
    @Transactional
    public List<MatchDto.ApplicantMatch> applicantsForVacancy(Long userId, Long vacancyId) {
        Vacancy vacancy = vacancyRepository.findById(vacancyId)
                .orElseThrow(() -> new ResourceNotFoundException("Vacancy not found"));
        if (!vacancy.getEmployer().getUser().getId().equals(userId)) {
            throw new BadRequestException("Not authorized");
        }

        List<Application> apps = applicationRepository.findByVacancyId(vacancyId, PageRequest.of(0, 200)).getContent();
        List<MatchDto.ApplicantMatch> result = new ArrayList<>();
        for (Application a : apps) {
            WorkerProfile w = a.getWorker();
            int score;
            String summary;
            List<String> missing;
            // Кэш в БД: считаем LLM-резюме один раз на отклик
            if (a.getMatchComputedAt() != null && a.getMatchScore() != null) {
                score = a.getMatchScore();
                summary = a.getMatchSummary();
                missing = matchingService.compute(w, vacancy).missingSkills();
            } else {
                AiMatchService.ApplicantMatch am = aiMatchService.forApplicant(w, vacancy);
                score = am.score();
                summary = am.summary();
                missing = am.missingSkills();
                a.setMatchScore(score);
                a.setMatchSummary(summary);
                a.setMatchComputedAt(LocalDateTime.now());
                applicationRepository.save(a);
            }
            result.add(toApplicantMatch(a, w, score, summary, missing));
        }
        result.sort(Comparator.comparingInt(MatchDto.ApplicantMatch::getMatchScore).reversed());
        return result;
    }

    private MatchDto.VacancyMatch toVacancyMatch(Vacancy v, AiMatchService.WorkerMatch wm) {
        MatchDto.VacancyMatch dto = new MatchDto.VacancyMatch();
        dto.setVacancy(vacancyService.toResponse(v));
        dto.setMatchScore(wm.score());
        dto.setSkillPercent(wm.skillPercent());
        dto.setMatchExplanation(wm.explanation());
        dto.setMatchAdvice(wm.advice());
        dto.setMissingSkills(wm.missingSkills());
        return dto;
    }

    private MatchDto.ApplicantMatch toApplicantMatch(Application a, WorkerProfile w,
                                                     int score, String summary, List<String> missing) {
        MatchDto.ApplicantMatch dto = new MatchDto.ApplicantMatch();
        dto.setApplicationId(a.getId());
        dto.setStatus(a.getStatus());
        dto.setCoverLetter(a.getCoverLetter());
        dto.setCreatedAt(a.getCreatedAt());
        dto.setWorker(profileService.toWorkerResponse(w));
        dto.setMatchScore(score);
        dto.setMatchSummary(summary);
        dto.setMissingSkills(missing);
        return dto;
    }
}
