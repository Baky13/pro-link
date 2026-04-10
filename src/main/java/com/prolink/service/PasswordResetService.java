package com.prolink.service;

import com.prolink.entity.User;
import com.prolink.exception.BadRequestException;
import com.prolink.exception.ResourceNotFoundException;
import com.prolink.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    private record TokenEntry(String email, LocalDateTime expiresAt) {}
    private final Map<String, TokenEntry> tokens = new ConcurrentHashMap<>();

    public void sendResetEmail(String email) {
        userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        String token = UUID.randomUUID().toString();
        tokens.put(token, new TokenEntry(email, LocalDateTime.now().plusMinutes(15)));

        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(email);
            message.setSubject("Восстановление пароля — ProLink");
            message.setText("Ваш код для сброса пароля: " + token +
                    "\n\nКод действителен 15 минут.");
            mailSender.send(message);
            log.info("Password reset email sent to: {}", email);
        } catch (Exception e) {
            log.error("Failed to send password reset email to: {}", email, e);
            tokens.remove(token);
            throw new BadRequestException("Не удалось отправить письмо. Попробуйте позже.");
        }
    }

    public void resetPassword(String token, String newPassword) {
        TokenEntry entry = tokens.get(token);
        if (entry == null) throw new BadRequestException("Неверный или истёкший код");
        if (entry.expiresAt().isBefore(LocalDateTime.now())) {
            tokens.remove(token);
            throw new BadRequestException("Код истёк. Запросите новый.");
        }

        User user = userRepository.findByEmail(entry.email())
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokens.remove(token);
        log.info("Password reset successful for: {}", entry.email());
    }
}
