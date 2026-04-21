package com.prolink.dto;

import com.prolink.entity.Vacancy;
import com.prolink.entity.WorkerProfile;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

public class VacancyDto {

    @Data
    public static class Request {
        @NotBlank @Size(min = 3, max = 200, message = "Название: от 3 до 200 символов")
        private String title;

        @NotBlank @Size(max = 5000, message = "Описание: максимум 5000 символов")
        private String description;

        @Size(max = 2000, message = "Требования: максимум 2000 символов")
        private String requirements;

        @Min(value = 0, message = "Зарплата не может быть отрицательной")
        @Max(value = 100_000_000, message = "Зарплата слишком большая")
        private Integer salaryFrom;

        @Min(value = 0, message = "Зарплата не может быть отрицательной")
        @Max(value = 100_000_000, message = "Зарплата слишком большая")
        private Integer salaryTo;

        private String currency;

        @NotNull private Long categoryId;

        @Size(max = 100, message = "Город: максимум 100 символов")
        private String city;

        @Size(max = 500) private String address;
        private Double latitude;
        private Double longitude;
        private Vacancy.EmploymentType employmentType;
        private Boolean isHot;
        private Boolean isUrgent;

        @Min(value = 1, message = "Срок ответа — минимум 1 день")
        @Max(value = 90, message = "Срок ответа — максимум 90 дней")
        private Integer responseDeadlineDays;

        private Boolean autoRejectEnabled;

        @Min(value = 0, message = "Минимальный опыт не может быть отрицательным")
        @Max(value = 80, message = "Минимальный опыт слишком большой")
        private Integer autoRejectMinExp;

        private List<String> skills;
        private LocalDateTime expiresAt;
    }

    @Data
    public static class Response {
        private Long id;
        private String title;
        private String description;
        private String requirements;
        private Integer salaryFrom;
        private Integer salaryTo;
        private String currency;
        private String city;
        private String address;
        private Double latitude;
        private Double longitude;
        private Vacancy.EmploymentType employmentType;
        private Boolean isHot;
        private Boolean isUrgent;
        private Boolean isActive;
        private Integer viewsCount;
        private Integer applicantsCount;
        private Integer responseDeadlineDays;
        private Integer autoRejectMinExp;
        private List<String> skills;
        private CategoryDto category;
        private EmployerDto.Summary employer;
        private Long employerUserId;
        private LocalDateTime createdAt;
        private LocalDateTime expiresAt;
    }

    @Data
    public static class Filter {
        private Long categoryId;
        private String city;
        private Integer salaryFrom;
        private Integer salaryTo;
        private Vacancy.EmploymentType employmentType;
        private String search;
        private String skill;
        private Boolean isHot;
        private Boolean isUrgent;
        private WorkerProfile.JobSearchStatus workerStatus;
    }
}
