package com.prolink.service;

import com.prolink.dto.NotificationDto;
import com.prolink.entity.Notification;
import com.prolink.entity.User;
import com.prolink.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Async
    public void notify(User user, Notification.Type type, String title, String message, Long referenceId) {
        Notification notification = Notification.builder()
                .user(user)
                .type(type)
                .title(title)
                .message(message)
                .referenceId(referenceId)
                .build();
        notificationRepository.save(notification);

        NotificationDto dto = toDto(notification);
        messagingTemplate.convertAndSendToUser(user.getEmail(), "/queue/notifications", dto);
    }

    public Page<NotificationDto> getNotifications(Long userId, Pageable pageable) {
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable).map(this::toDto);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndIsReadFalse(userId);
    }

    @Transactional
    public void markAllAsRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    @Transactional
    public void markChatNotificationsAsRead(Long userId, Long roomId) {
        notificationRepository.markChatNotificationsAsRead(userId, roomId);
    }

    private NotificationDto toDto(Notification n) {
        NotificationDto dto = new NotificationDto();
        dto.setId(n.getId());
        dto.setType(n.getType());
        dto.setTitle(n.getTitle());
        dto.setMessage(n.getMessage());
        dto.setIsRead(n.getIsRead());
        dto.setReferenceId(n.getReferenceId());
        dto.setCreatedAt(n.getCreatedAt());
        return dto;
    }
}
