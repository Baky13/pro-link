package com.prolink.dto;

import com.prolink.entity.Application;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

public class MatchDto {

    /** Совпадение «вакансия для соискателя» (рекомендации, страница вакансии). */
    @Data
    public static class VacancyMatch {
        private VacancyDto.Response vacancy;
        private int matchScore;        // 0..100
        private int skillPercent;      // % совпавших навыков
        private String matchExplanation;
        private String matchAdvice;
        private List<String> missingSkills;
    }

    /** Совпадение «кандидат для работодателя» (ранжированные отклики). */
    @Data
    public static class ApplicantMatch {
        private Long applicationId;
        private Application.Status status;
        private String coverLetter;
        private LocalDateTime createdAt;
        private WorkerDto.Response worker;
        private int matchScore;        // 0..100
        private String matchSummary;
        private List<String> missingSkills;
    }
}
