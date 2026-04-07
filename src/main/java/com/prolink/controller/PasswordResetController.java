package com.prolink.controller;

import com.prolink.service.PasswordResetService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class PasswordResetController {

    private final PasswordResetService passwordResetService;

    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(@RequestBody EmailRequest request) {
        passwordResetService.sendResetEmail(request.getEmail());
        return ResponseEntity.ok("Код отправлен на email");
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody ResetRequest request) {
        passwordResetService.resetPassword(request.getToken(), request.getNewPassword());
        return ResponseEntity.ok("Пароль изменён");
    }

    @Data
    static class EmailRequest { private String email; }

    @Data
    static class ResetRequest { private String token; private String newPassword; }
}
