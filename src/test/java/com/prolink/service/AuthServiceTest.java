package com.prolink.service;

import com.prolink.dto.AuthDto;
import com.prolink.entity.User;
import com.prolink.exception.BadRequestException;
import com.prolink.repository.*;
import com.prolink.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock WorkerProfileRepository workerProfileRepository;
    @Mock EmployerProfileRepository employerProfileRepository;
    @Mock RefreshTokenRepository refreshTokenRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtUtil jwtUtil;
    @Mock AuthenticationManager authenticationManager;
    @Mock JavaMailSender mailSender;

    @InjectMocks AuthService authService;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(authService, "refreshExpiration", 604800000L);
        ReflectionTestUtils.setField(authService, "frontendUrl", "http://localhost:3000");
    }

    @Test
    void register_success() {
        AuthDto.RegisterRequest request = new AuthDto.RegisterRequest();
        request.setEmail("test@test.com");
        request.setPassword("password123");
        request.setFirstName("Test");
        request.setLastName("User");
        request.setRole(User.Role.WORKER);

        when(userRepository.existsByEmail(any())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(any())).thenAnswer(i -> i.getArgument(0));
        when(jwtUtil.generateToken(any())).thenReturn("access-token");
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AuthDto.AuthResponse response = authService.register(request);

        assertNotNull(response);
        assertEquals("access-token", response.getAccessToken());
        verify(workerProfileRepository).save(any());
    }

    @Test
    void register_emailAlreadyInUse_throwsException() {
        AuthDto.RegisterRequest request = new AuthDto.RegisterRequest();
        request.setEmail("existing@test.com");
        request.setPassword("password123");
        request.setFirstName("Test");
        request.setLastName("User");

        when(userRepository.existsByEmail("existing@test.com")).thenReturn(true);

        assertThrows(BadRequestException.class, () -> authService.register(request));
        verify(userRepository, never()).save(any());
    }

    @Test
    void login_success() {
        User user = User.builder()
                .id(1L).email("test@test.com")
                .password("encoded").role(User.Role.WORKER)
                .firstName("Test").lastName("User")
                .build();

        when(userRepository.findByEmail("test@test.com")).thenReturn(Optional.of(user));
        when(jwtUtil.generateToken(any())).thenReturn("access-token");
        when(refreshTokenRepository.save(any())).thenAnswer(i -> i.getArgument(0));

        AuthDto.LoginRequest request = new AuthDto.LoginRequest();
        request.setEmail("test@test.com");
        request.setPassword("password123");

        AuthDto.AuthResponse response = authService.login(request);

        assertNotNull(response);
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
    }

    @Test
    void logout_deletesRefreshTokens() {
        authService.logout(1L);
        verify(refreshTokenRepository).deleteByUserId(1L);
    }
}
