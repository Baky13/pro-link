package com.prolink.dto;

import lombok.Data;
import java.time.LocalDateTime;

public class ChatDto {

    @Data
    public static class MessageRequest {
        private String content;
    }

    @Data
    public static class MessageResponse {
        private Long id;
        private Long roomId;
        private Long senderId;
        private String senderName;
        private String senderAvatar;
        private String content;
        private Boolean isRead;
        private LocalDateTime createdAt;
    }

    @Data
    public static class RoomResponse {
        private Long id;
        private UserDto worker;
        private UserDto employer;
        private MessageResponse lastMessage;
        private Long unreadCount;
    }
}
