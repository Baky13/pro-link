package com.prolink.service;

import com.prolink.entity.User;
import com.prolink.exception.BadRequestException;
import com.prolink.exception.ResourceNotFoundException;
import com.prolink.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class PasswordResetService {

    private final UserRepository userRepository;
    private final JavaMailSender mailSender;
    private final PasswordEncoder passwordEncoder;

    private final Map<String, String> tokens = new ConcurrentHashMap<>();

    public void sendResetEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        String token = UUID.randomUUID().toString();
        tokens.put(token, email);

        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(email);
        message.setSubject("Восстановление пароля — ProLink");
        message.setText("Ваш код для сброса пароля: " + token +
                "\n\nКод действителен 15 минут.");
        mailSender.send(message);
    }

    public void resetPassword(String token, String newPassword) {
        String email = tokens.get(token);
        if (email == null) throw new BadRequestException("Неверный или истёкший код");

        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("Пользователь не найден"));

        user.setPassword(passwordEncoder.encode(newPassword));
        userRepository.save(user);
        tokens.remove(token);
    }
}
