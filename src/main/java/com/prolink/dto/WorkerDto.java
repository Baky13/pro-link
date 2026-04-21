package com.prolink.dto;

import com.prolink.entity.WorkerProfile;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

public class WorkerDto {

    @Data
    public static class Request {
        @Size(max = 200, message = "Должность: максимум 200 символов")
        private String title;

        @Size(max = 2000, message = "О себе: максимум 2000 символов")
        private String bio;

        @Size(max = 500, message = "Ссылка на GitHub слишком длинная")
        private String githubUrl;

        @Size(max = 500, message = "Ссылка на портфолио слишком длинная")
        private String portfolioUrl;

        @Size(max = 500, message = "Ссылка на LinkedIn слишком длинная")
        private String linkedinUrl;

        @Min(value = 0, message = "Зарплата не может быть отрицательной")
        @Max(value = 100_000_000, message = "Зарплата слишком большая")
        private Integer expectedSalary;

        private Boolean isOpenToWork;
        private WorkerProfile.JobSearchStatus jobSearchStatus;
        private LocalDate availableFrom;

        @Min(value = 0, message = "Опыт работы не может быть отрицательным")
        @Max(value = 80, message = "Опыт работы слишком большой")
        private Integer experienceYears;

        private List<String> skills;
    }

    @Data
    public static class Response {
        private Long id;
        private Long userId;
        private String title;
        private String bio;
        private String resumeUrl;
        private String githubUrl;
        private String portfolioUrl;
        private String linkedinUrl;
        private Integer expectedSalary;
        private Boolean isOpenToWork;
        private WorkerProfile.JobSearchStatus jobSearchStatus;
        private LocalDate availableFrom;
        private Integer experienceYears;
        private List<String> skills;
        private List<ExperienceDto> experiences;
        private UserDto user;
    }

    @Data
    public static class ExperienceRequest {
        private String companyName;
        private String position;
        private String description;
        private LocalDate startDate;
        private LocalDate endDate;
        private Boolean isCurrent;
    }

    @Data
    public static class ExperienceDto {
        private Long id;
        private String companyName;
        private String position;
        private String description;
        private LocalDate startDate;
        private LocalDate endDate;
        private Boolean isCurrent;
    }
}
