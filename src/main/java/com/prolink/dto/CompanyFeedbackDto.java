package com.prolink.dto;

import com.prolink.entity.CompanyComplaint;
import com.prolink.entity.CompanyExitReason;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.Map;

public class CompanyFeedbackDto {

    @Data
    public static class ComplaintRequest {
        private CompanyComplaint.Reason reason;
        private String description;
    }

    @Data
    public static class ComplaintResponse {
        private Long id;
        private CompanyComplaint.Reason reason;
        private String description;
        private LocalDateTime createdAt;
    }

    @Data
    public static class ExitReasonRequest {
        private CompanyExitReason.Reason reason;
        private String comment;
    }

    @Data
    public static class ExitReasonStats {
        private Long employerId;
        private Map<String, Long> reasonCounts;
        private Integer totalExits;
    }

    @Data
    public static class SalaryCalcRequest {
        private Long categoryId;
        private String city;
        private Integer experienceYears;
    }

    @Data
    public static class SalaryCalcResponse {
        private Integer salaryMin;
        private Integer salaryAvg;
        private Integer salaryMax;
        private String categoryName;
        private String city;
        private Integer experienceYears;
        private String currency;
    }

    @Data
    public static class StaleApplicationFeedback {
        private Long applicationId;
        private String vacancyTitle;
        private Integer daysWaiting;
        private String missingSkills;
        private String salaryMismatch;
        private String profileCompleteness;
        private String advice;
    }
}
