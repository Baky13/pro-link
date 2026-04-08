package com.prolink.service;

import com.prolink.dto.ChatDto;
import com.prolink.dto.UserDto;
import com.prolink.entity.*;
import com.prolink.exception.BadRequestException;
import com.prolink.exception.ResourceNotFoundException;
import com.prolink.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatRoomRepository chatRoomRepository;
    private final ChatMessageRepository chatMessageRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final NotificationService notificationService;

    @Transactional
    public ChatDto.RoomResponse getOrCreateRoom(Long applicationId, Long userId) {
        Application application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found"));

        Long workerId = application.getWorker().getUser().getId();
        Long employerId = application.getVacancy().getEmployer().getUser().getId();

        return chatRoomRepository.findByWorkerIdAndEmployerId(workerId, employerId)
                .map(this::toRoomResponse)
                .orElseGet(() -> {
                    ChatRoom room = ChatRoom.builder()
                            .application(application)
                            .worker(application.getWorker().getUser())
                            .employer(application.getVacancy().getEmployer().getUser())
                            .build();
                    return toRoomResponse(chatRoomRepository.save(room));
                });
    }

    @Transactional
    public ChatDto.RoomResponse getOrCreateDirectRoom(Long targetUserId, Long currentUserId) {
        User currentUser = userRepository.findById(currentUserId).orElseThrow();
        User targetUser = userRepository.findById(targetUserId).orElseThrow();

        Long workerId, employerId;
        if (currentUser.getRole().name().equals("EMPLOYER")) {
            employerId = currentUserId;
            workerId = targetUserId;
        } else {
            workerId = currentUserId;
            employerId = targetUserId;
        }

        return chatRoomRepository.findByWorkerIdAndEmployerId(workerId, employerId)
                .map(this::toRoomResponse)
                .orElseGet(() -> {
                    ChatRoom room = ChatRoom.builder()
                            .worker(workerId.equals(currentUserId) ? currentUser : targetUser)
                            .employer(employerId.equals(currentUserId) ? currentUser : targetUser)
                            .build();
                    return toRoomResponse(chatRoomRepository.save(room));
                });
    }

    public List<ChatDto.RoomResponse> getUserRooms(Long userId) {
        return chatRoomRepository.findActiveByUserId(userId).stream()
                .map(this::toRoomResponse)
                .collect(Collectors.toList());
    }

    public List<ChatDto.RoomResponse> getArchivedRooms(Long userId) {
        return chatRoomRepository.findArchivedByUserId(userId).stream()
                .map(this::toRoomResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void archiveRoom(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        if (!room.getWorker().getId().equals(userId) && !room.getEmployer().getId().equals(userId)) {
            throw new BadRequestException("Not authorized");
        }
        room.setIsArchived(true);
        chatRoomRepository.save(room);
    }

    @Transactional
    public void unarchiveRoom(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        if (!room.getWorker().getId().equals(userId) && !room.getEmployer().getId().equals(userId)) {
            throw new BadRequestException("Not authorized");
        }
        room.setIsArchived(false);
        chatRoomRepository.save(room);
    }

    @Transactional
    public void deleteRoom(Long roomId, Long userId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        if (!room.getWorker().getId().equals(userId) && !room.getEmployer().getId().equals(userId)) {
            throw new BadRequestException("Not authorized");
        }
        chatRoomRepository.delete(room);
    }

    public Page<ChatDto.MessageResponse> getMessages(Long roomId, Long userId, PageRequest pageRequest) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        if (!room.getWorker().getId().equals(userId) && !room.getEmployer().getId().equals(userId)) {
            throw new BadRequestException("Not authorized");
        }
        chatMessageRepository.markAsRead(roomId, userId);
        notificationService.markChatNotificationsAsRead(userId, roomId);
        return chatMessageRepository.findByRoomIdOrderByCreatedAtAsc(roomId, pageRequest).map(this::toMessageResponse);
    }

    @Transactional
    public ChatDto.MessageResponse sendMessage(Long roomId, String content, Long senderId) {
        ChatRoom room = chatRoomRepository.findById(roomId)
                .orElseThrow(() -> new ResourceNotFoundException("Room not found"));
        User sender = userRepository.findById(senderId).orElseThrow();

        if (!room.getWorker().getId().equals(senderId) && !room.getEmployer().getId().equals(senderId)) {
            throw new BadRequestException("Not authorized");
        }

        ChatMessage message = ChatMessage.builder()
                .room(room)
                .sender(sender)
                .content(content)
                .build();
        chatMessageRepository.save(message);

        ChatDto.MessageResponse response = toMessageResponse(message);
        messagingTemplate.convertAndSend("/topic/room/" + roomId, response);

        User recipient = room.getWorker().getId().equals(senderId) ? room.getEmployer() : room.getWorker();
        notificationService.notify(recipient, Notification.Type.NEW_MESSAGE,
                "Новое сообщение", sender.getFirstName() + ": " + content, roomId);

        return response;
    }

    private ChatDto.RoomResponse toRoomResponse(ChatRoom room) {
        ChatDto.RoomResponse r = new ChatDto.RoomResponse();
        r.setId(room.getId());
        r.setWorker(UserDto.from(room.getWorker()));
        r.setEmployer(UserDto.from(room.getEmployer()));
        return r;
    }

    private ChatDto.MessageResponse toMessageResponse(ChatMessage m) {
        ChatDto.MessageResponse r = new ChatDto.MessageResponse();
        r.setId(m.getId());
        r.setRoomId(m.getRoom().getId());
        r.setSenderId(m.getSender().getId());
        r.setSenderName(m.getSender().getFirstName() + " " + m.getSender().getLastName());
        r.setSenderAvatar(m.getSender().getAvatarUrl());
        r.setContent(m.getContent());
        r.setIsRead(m.getIsRead());
        r.setCreatedAt(m.getCreatedAt());
        return r;
    }
}
