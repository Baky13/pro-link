package com.prolink.controller;

import com.prolink.dto.NotificationDto;
import com.prolink.entity.User;
import com.prolink.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.web.bind.annotation.*;
import org.springframework.security.core.annotation.AuthenticationPrincipal;

import java.util.Map;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping
    public Page<NotificationDto> getAll(@AuthenticationPrincipal User user,
                                         @PageableDefault(size = 20) Pageable pageable) {
        return notificationService.getNotifications(user.getId(), pageable);
    }

    @GetMapping("/unread-count")
    public Map<String, Long> getUnreadCount(@AuthenticationPrincipal User user) {
        return Map.of("count", notificationService.getUnreadCount(user.getId()));
    }

    @PostMapping("/read-all")
    public void markAllAsRead(@AuthenticationPrincipal User user) {
        notificationService.markAllAsRead(user.getId());
    }
}
