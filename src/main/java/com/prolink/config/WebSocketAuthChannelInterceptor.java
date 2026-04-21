package com.prolink.config;

import com.prolink.entity.ChatRoom;
import com.prolink.entity.User;
import com.prolink.repository.ChatRoomRepository;
import com.prolink.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Lazy;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Component
@RequiredArgsConstructor
public class WebSocketAuthChannelInterceptor implements ChannelInterceptor {

    private static final Pattern ROOM_TOPIC = Pattern.compile("^/topic/room/(\\d+)$");

    private final ChatRoomRepository chatRoomRepository;
    private final JwtUtil jwtUtil;
    @Lazy
    private final UserDetailsService userDetailsService;

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);
        if (accessor == null) return message;

        StompCommand cmd = accessor.getCommand();
        if (cmd == null) return message;

        if (cmd == StompCommand.CONNECT) {
            Authentication auth = extractAuthFromHeader(accessor);
            if (auth != null) {
                accessor.setUser(auth);
            }
            return message;
        }

        if (cmd == StompCommand.SEND || cmd == StompCommand.SUBSCRIBE) {
            Object principal = accessor.getUser();
            if (!(principal instanceof Authentication auth) || !auth.isAuthenticated()) {
                log.warn("WebSocket {} without authentication (dest={})", cmd, accessor.getDestination());
                throw new AccessDeniedException("Authentication required");
            }

            if (cmd == StompCommand.SUBSCRIBE) {
                String destination = accessor.getDestination();
                if (destination != null) {
                    Matcher m = ROOM_TOPIC.matcher(destination);
                    if (m.matches()) {
                        Long roomId = Long.parseLong(m.group(1));
                        Long userId = resolveUserId(auth);
                        if (userId == null) {
                            throw new AccessDeniedException("Cannot resolve user");
                        }
                        Optional<ChatRoom> room = chatRoomRepository.findById(roomId);
                        if (room.isEmpty()) {
                            throw new AccessDeniedException("Room not found");
                        }
                        ChatRoom r = room.get();
                        boolean isMember = r.getWorker() != null && userId.equals(r.getWorker().getId())
                                || r.getEmployer() != null && userId.equals(r.getEmployer().getId());
                        if (!isMember) {
                            log.warn("User {} tried to subscribe to foreign room {}", userId, roomId);
                            throw new AccessDeniedException("Not a member of this room");
                        }
                    }
                }
            }
        }
        return message;
    }

    private Authentication extractAuthFromHeader(StompHeaderAccessor accessor) {
        List<String> authHeaders = accessor.getNativeHeader("Authorization");
        if (authHeaders == null || authHeaders.isEmpty()) return null;
        String header = authHeaders.get(0);
        if (header == null || !header.startsWith("Bearer ")) return null;
        String token = header.substring(7);
        try {
            String email = jwtUtil.extractUsername(token);
            if (email == null) return null;
            UserDetails ud = userDetailsService.loadUserByUsername(email);
            if (!jwtUtil.isTokenValid(token, ud)) return null;
            return new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
        } catch (Exception e) {
            log.warn("WS CONNECT JWT invalid: {}", e.getMessage());
            return null;
        }
    }

    private Long resolveUserId(Authentication auth) {
        Object principal = auth.getPrincipal();
        if (principal instanceof User u) return u.getId();
        if (principal instanceof UserDetails ud) {
            try {
                var field = ud.getClass().getDeclaredField("id");
                field.setAccessible(true);
                Object val = field.get(ud);
                if (val instanceof Long l) return l;
            } catch (Exception ignored) {}
        }
        return null;
    }
}
