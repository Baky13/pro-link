package com.prolink.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;
import java.math.BigDecimal;

public class EmployerDto {

    @Data
    public static class Request {
        @NotBlank
        @Size(min = 2, max = 100, message = "Название компании: от 2 до 100 символов")
        private String companyName;

        @Size(max = 2000, message = "Описание: максимум 2000 символов")
        private String description;

        @Size(max = 500, message = "Ссылка на сайт слишком длинная")
        private String website;

        @Size(max = 100, message = "Отрасль: максимум 100 символов")
        private String industry;

        @Size(max = 50, message = "Размер компании: максимум 50 символов")
        private String companySize;

        @Min(value = 1800, message = "Год основания не может быть раньше 1800")
        @Max(value = 2100, message = "Год основания не может быть больше 2100")
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
