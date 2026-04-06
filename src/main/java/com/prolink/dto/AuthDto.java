package com.prolink.dto;

import com.prolink.entity.User;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

public class AuthDto {

    @Data
    public static class RegisterRequest {
        @Email @NotBlank
        private String email;
        @NotBlank @Size(min = 6)
        private String password;
        @NotBlank
        private String firstName;
        @NotBlank
        private String lastName;
        private User.Role role;
        private String companyName; // for EMPLOYER
    }

    @Data
    public static class LoginRequest {
        @Email @NotBlank
        private String email;
        @NotBlank
        private String password;
    }

    @Data
    public static class AuthResponse {
        private String accessToken;
        private String refreshToken;
        private UserDto user;

        public AuthResponse(String accessToken, String refreshToken, UserDto user) {
            this.accessToken = accessToken;
            this.refreshToken = refreshToken;
            this.user = user;
        }
    }

    @Data
    public static class RefreshRequest {
        private String refreshToken;
    }
}
