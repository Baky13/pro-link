package com.prolink.dto;

import com.prolink.entity.Vacancy;
import com.prolink.entity.WorkerProfile;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.List;

public class VacancyDto {

    @Data
    public static class Request {
        @NotBlank private String title;
        @NotBlank private String description;
        private String requirements;
        private Integer salaryFrom;
        private Integer salaryTo;
        private String currency;
        @NotNull private Long categoryId;
        private String city;
        private String address;
        private Double latitude;
        private Double longitude;
        private Vacancy.EmploymentType employmentType;
        private Boolean isHot;
        private Boolean isUrgent;
        private Integer responseDeadlineDays;
        private Boolean autoRejectEnabled;
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
