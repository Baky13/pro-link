package com.prolink.service;

import com.prolink.dto.AuthDto;
import com.prolink.dto.UserDto;
import com.prolink.entity.*;
import com.prolink.exception.BadRequestException;
import com.prolink.exception.ResourceNotFoundException;
import com.prolink.repository.*;
import com.prolink.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final WorkerProfileRepository workerProfileRepository;
    private final EmployerProfileRepository employerProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final JavaMailSender mailSender;

    @Value("${jwt.refresh-expiration}")
    private long refreshExpiration;

    private static final String FRONTEND_URL = "https://prolink-backend-kokg.onrender.com";

    private record VerifyEntry(Long userId, LocalDateTime expiresAt) {}
    private final Map<String, VerifyEntry> verifyTokens = new ConcurrentHashMap<>();

    @Transactional
    public AuthDto.AuthResponse register(AuthDto.RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already in use");
        }
        log.info("Registering new user: {}", request.getEmail());

        User user = User.builder()
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole() != null ? request.getRole() : User.Role.WORKER)
                .emailVerified(false)
                .build();
        userRepository.save(user);

        if (user.getRole() == User.Role.WORKER) {
            workerProfileRepository.save(WorkerProfile.builder().user(user).build());
        } else if (user.getRole() == User.Role.EMPLOYER) {
            String companyName = request.getCompanyName() != null ? request.getCompanyName() : user.getFirstName();
            employerProfileRepository.save(EmployerProfile.builder().user(user).companyName(companyName).build());
        }

        sendVerificationEmail(user);
        return buildAuthResponse(user);
    }

    public AuthDto.AuthResponse login(AuthDto.LoginRequest request) {
        log.info("Login attempt: {}", request.getEmail());
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        log.info("Login successful: {}", request.getEmail());
        return buildAuthResponse(user);
    }

    @Transactional
    public void verifyEmail(String token) {
        VerifyEntry entry = verifyTokens.get(token);
        if (entry == null) throw new BadRequestException("Неверная или истёкшая ссылка верификации");
        if (entry.expiresAt().isBefore(LocalDateTime.now())) {
            verifyTokens.remove(token);
            throw new BadRequestException("Ссылка верификации истекла. Запросите новую.");
        }
        User user = userRepository.findById(entry.userId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setEmailVerified(true);
        userRepository.save(user);
        verifyTokens.remove(token);
        log.info("Email verified for user: {}", user.getEmail());
    }

    @Transactional
    public void resendVerification(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (Boolean.TRUE.equals(user.getEmailVerified())) {
            throw new BadRequestException("Email уже подтверждён");
        }
        sendVerificationEmail(user);
    }

    @Transactional
    public AuthDto.AuthResponse refresh(String refreshToken) {
        RefreshToken token = refreshTokenRepository.findByTokenAndRevokedFalse(refreshToken)
                .orElseThrow(() -> new BadRequestException("Invalid refresh token"));
        if (token.getExpiresAt().isBefore(LocalDateTime.now())) {
            token.setRevoked(true);
            refreshTokenRepository.save(token);
            throw new BadRequestException("Refresh token expired");
        }
        return buildAuthResponse(token.getUser());
    }

    @Transactional
    public void logout(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    private void sendVerificationEmail(User user) {
        try {
            String token = UUID.randomUUID().toString();
            verifyTokens.put(token, new VerifyEntry(user.getId(), LocalDateTime.now().plusHours(24)));
            String link = FRONTEND_URL + "/verify-email?token=" + token;

            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(user.getEmail());
            message.setSubject("Подтвердите email — ProLink");
            message.setText("Привет, " + user.getFirstName() + "!\n\n" +
                    "Подтвердите ваш email, перейдя по ссылке:\n" + link +
                    "\n\nСсылка действительна 24 часа.");
            mailSender.send(message);
            log.info("Verification email sent to: {}", user.getEmail());
        } catch (Exception e) {
            log.warn("Failed to send verification email to: {}", user.getEmail(), e);
        }
    }

    private AuthDto.AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtUtil.generateToken(user);
        String refreshToken = createRefreshToken(user);
        return new AuthDto.AuthResponse(accessToken, refreshToken, UserDto.from(user));
    }

    private String createRefreshToken(User user) {
        refreshTokenRepository.deleteByUserId(user.getId());
        String token = UUID.randomUUID().toString();
        refreshTokenRepository.save(RefreshToken.builder()
                .user(user)
                .token(token)
                .expiresAt(LocalDateTime.now().plusSeconds(refreshExpiration / 1000))
                .build());
        return token;
    }
}
