package com.prolink.dto;

import com.prolink.entity.WorkerProfile;
import lombok.Data;
import java.time.LocalDate;
import java.util.List;

public class WorkerDto {

    @Data
    public static class Request {
        private String title;
        private String bio;
        private String githubUrl;
        private String portfolioUrl;
        private String linkedinUrl;
        private Integer expectedSalary;
        private Boolean isOpenToWork;
        private WorkerProfile.JobSearchStatus jobSearchStatus;
        private LocalDate availableFrom;
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
