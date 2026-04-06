package com.prolink.dto;

import com.prolink.entity.Application;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.time.LocalDateTime;

public class ApplicationDto {

    @Data
    public static class Request {
        @NotNull private Long vacancyId;
        private String coverLetter;
    }

    @Data
    public static class Response {
        private Long id;
        private VacancyDto.Response vacancy;
        private WorkerDto.Response worker;
        private String coverLetter;
        private Application.Status status;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
    }

    @Data
    public static class StatusUpdate {
        private Application.Status status;
    }
}
