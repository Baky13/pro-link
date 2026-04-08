package com.prolink.controller;

import com.prolink.dto.ChatDto;
import com.prolink.entity.User;
import com.prolink.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;

@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
public class ChatController {

    private final ChatService chatService;

    @GetMapping("/rooms")
    public List<ChatDto.RoomResponse> getRooms(@AuthenticationPrincipal User user) {
        return chatService.getUserRooms(user.getId());
    }

    @GetMapping("/rooms/archived")
    public List<ChatDto.RoomResponse> getArchivedRooms(@AuthenticationPrincipal User user) {
        return chatService.getArchivedRooms(user.getId());
    }

    @PatchMapping("/rooms/{roomId}/archive")
    public ResponseEntity<Void> archiveRoom(@PathVariable Long roomId, @AuthenticationPrincipal User user) {
        chatService.archiveRoom(roomId, user.getId());
        return ResponseEntity.ok().build();
    }

    @PatchMapping("/rooms/{roomId}/unarchive")
    public ResponseEntity<Void> unarchiveRoom(@PathVariable Long roomId, @AuthenticationPrincipal User user) {
        chatService.unarchiveRoom(roomId, user.getId());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/rooms/{roomId}")
    public ResponseEntity<Void> deleteRoom(@PathVariable Long roomId, @AuthenticationPrincipal User user) {
        chatService.deleteRoom(roomId, user.getId());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/rooms/{roomId}/messages")
    public Page<ChatDto.MessageResponse> getMessages(@PathVariable Long roomId,
                                                      @AuthenticationPrincipal User user,
                                                      @RequestParam(defaultValue = "0") int page,
                                                      @RequestParam(defaultValue = "50") int size) {
        return chatService.getMessages(roomId, user.getId(), PageRequest.of(page, size));
    }

    @PostMapping("/rooms/application/{applicationId}")
    public ChatDto.RoomResponse getOrCreateRoom(@PathVariable Long applicationId,
                                                 @AuthenticationPrincipal User user) {
        return chatService.getOrCreateRoom(applicationId, user.getId());
    }

    @PostMapping("/rooms/direct/{targetUserId}")
    public ChatDto.RoomResponse getOrCreateDirectRoom(@PathVariable Long targetUserId,
                                                       @AuthenticationPrincipal User user) {
        return chatService.getOrCreateDirectRoom(targetUserId, user.getId());
    }

    @PostMapping("/rooms/{roomId}/messages")
    public ResponseEntity<ChatDto.MessageResponse> sendMessageRest(
            @PathVariable Long roomId,
            @RequestBody ChatDto.MessageRequest message,
            @AuthenticationPrincipal User user) {
        return ResponseEntity.ok(chatService.sendMessage(roomId, message.getContent(), user.getId()));
    }

    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable Long roomId,
                             @Payload ChatDto.MessageRequest message,
                             Principal principal) {
        com.prolink.entity.User user = (com.prolink.entity.User)
                org.springframework.security.core.context.SecurityContextHolder
                        .getContext().getAuthentication().getPrincipal();
        chatService.sendMessage(roomId, message.getContent(), user.getId());
    }
}
