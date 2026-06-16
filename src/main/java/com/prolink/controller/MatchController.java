package com.prolink.controller;

import com.prolink.dto.MatchDto;
import com.prolink.entity.User;
import com.prolink.exception.BadRequestException;
import com.prolink.service.MatchQueryService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * ИИ-матчинг: рекомендации соискателю и ранжирование откликов работодателю.
 * Это фича-отличие ProLink от HeadHunter.
 */
@RestController
@RequestMapping("/api/match")
@RequiredArgsConstructor
public class MatchController {

    private final MatchQueryService matchQueryService;

    /** Рекомендованные вакансии для соискателя (топ по совпадению). */
    @GetMapping("/recommendations")
    public List<MatchDto.VacancyMatch> recommendations(
            @AuthenticationPrincipal User user,
            @RequestParam(defaultValue = "6") int limit) {
        if (user.getRole() != User.Role.WORKER) {
            throw new BadRequestException("Рекомендации доступны только соискателям");
        }
        return matchQueryService.recommendations(user.getId(), limit);
    }

    /** Совпадение текущего соискателя с конкретной вакансией. */
    @GetMapping("/vacancy/{vacancyId}")
    public MatchDto.VacancyMatch forVacancy(
            @PathVariable Long vacancyId,
            @AuthenticationPrincipal User user) {
        if (user.getRole() != User.Role.WORKER) {
            throw new BadRequestException("Доступно только соискателям");
        }
        return matchQueryService.forVacancy(user.getId(), vacancyId);
    }

    /** Отклики на вакансию, ранжированные по совпадению (для работодателя-владельца). */
    @GetMapping("/applications/{vacancyId}")
    public List<MatchDto.ApplicantMatch> applicants(
            @PathVariable Long vacancyId,
            @AuthenticationPrincipal User user) {
        if (user.getRole() != User.Role.EMPLOYER) {
            throw new BadRequestException("Доступно только работодателям");
        }
        return matchQueryService.applicantsForVacancy(user.getId(), vacancyId);
    }
}
