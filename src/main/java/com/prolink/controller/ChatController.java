package com.prolink.controller;

import com.prolink.dto.ChatDto;
import com.prolink.entity.User;
import com.prolink.service.ChatService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
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
