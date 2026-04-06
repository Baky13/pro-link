package com.prolink.dto;

import com.prolink.entity.Notification;
import lombok.Data;
import java.time.LocalDateTime;

@Data
public class NotificationDto {
    private Long id;
    private Notification.Type type;
    private String title;
    private String message;
    private Boolean isRead;
    private Long referenceId;
    private LocalDateTime createdAt;
}
