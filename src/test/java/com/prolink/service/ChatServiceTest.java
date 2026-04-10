package com.prolink.service;

import com.prolink.dto.ChatDto;
import com.prolink.entity.*;
import com.prolink.exception.BadRequestException;
import com.prolink.repository.*;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatServiceTest {

    @Mock ChatRoomRepository chatRoomRepository;
    @Mock ChatMessageRepository chatMessageRepository;
    @Mock ApplicationRepository applicationRepository;
    @Mock UserRepository userRepository;
    @Mock SimpMessagingTemplate messagingTemplate;
    @Mock NotificationService notificationService;

    @InjectMocks ChatService chatService;

    private User makeUser(Long id, String email, User.Role role) {
        return User.builder().id(id).email(email).role(role)
                .firstName("F" + id).lastName("L" + id).build();
    }

    @Test
    void sendMessage_notAuthorized_throwsException() {
        User worker = makeUser(1L, "w@test.com", User.Role.WORKER);
        User employer = makeUser(2L, "e@test.com", User.Role.EMPLOYER);
        User stranger = makeUser(3L, "s@test.com", User.Role.WORKER);

        ChatRoom room = ChatRoom.builder().id(1L).worker(worker).employer(employer).build();

        when(chatRoomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(userRepository.findById(3L)).thenReturn(Optional.of(stranger));

        assertThrows(BadRequestException.class,
                () -> chatService.sendMessage(1L, "hello", 3L));
    }

    @Test
    void sendMessage_success_notifiesRecipient() {
        User worker = makeUser(1L, "w@test.com", User.Role.WORKER);
        User employer = makeUser(2L, "e@test.com", User.Role.EMPLOYER);
        ChatRoom room = ChatRoom.builder().id(1L).worker(worker).employer(employer).build();
        ChatMessage savedMsg = ChatMessage.builder().id(1L).room(room).sender(worker).content("hello").isRead(false).build();

        when(chatRoomRepository.findById(1L)).thenReturn(Optional.of(room));
        when(userRepository.findById(1L)).thenReturn(Optional.of(worker));
        when(chatMessageRepository.save(any())).thenReturn(savedMsg);

        ChatDto.MessageResponse response = chatService.sendMessage(1L, "hello", 1L);

        assertNotNull(response);
        verify(messagingTemplate).convertAndSend(eq("/topic/room/1"), any(ChatDto.MessageResponse.class));
        verify(notificationService).notify(eq(employer), eq(Notification.Type.NEW_MESSAGE), any(), any(), eq(1L));
    }

    @Test
    void deleteRoom_softDelete_workerOnly() {
        User worker = makeUser(1L, "w@test.com", User.Role.WORKER);
        User employer = makeUser(2L, "e@test.com", User.Role.EMPLOYER);
        ChatRoom room = ChatRoom.builder().id(1L).worker(worker).employer(employer)
                .deletedByWorker(false).deletedByEmployer(false).build();

        when(chatRoomRepository.findById(1L)).thenReturn(Optional.of(room));

        chatService.deleteRoom(1L, 1L);

        assertTrue(room.getDeletedByWorker());
        assertFalse(room.getDeletedByEmployer());
        verify(chatRoomRepository).save(room);
        verify(chatRoomRepository, never()).delete(any());
    }
}
