package com.prolink.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import java.math.BigDecimal;

public class EmployerDto {

    @Data
    public static class Request {
        @NotBlank private String companyName;
        private String description;
        private String website;
        private String industry;
        private String companySize;
        private Integer foundedYear;
    }

    @Data
    public static class Response {
        private Long id;
        private Long userId;
        private String companyName;
        private String description;
        private String website;
        private String logoUrl;
        private String industry;
        private String companySize;
        private Integer foundedYear;
        private BigDecimal rating;
        private Integer reviewsCount;
        private Integer complaintsCount;
        private Boolean isBlacklisted;
        private Boolean isVerified;
        private UserDto user;
    }

    @Data
    public static class Summary {
        private Long id;
        private String companyName;
        private String logoUrl;
        private BigDecimal rating;
        private Boolean isVerified;
    }

    @Data
    public static class ReviewRequest {
        private Integer rating;
        private String comment;
        private Boolean isAnonymous;
    }

    @Data
    public static class ReviewResponse {
        private Long id;
        private Integer rating;
        private String comment;
        private Boolean isAnonymous;
        private String reviewerName;
        private String createdAt;
    }
}
