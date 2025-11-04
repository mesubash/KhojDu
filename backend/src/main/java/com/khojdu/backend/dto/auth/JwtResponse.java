package com.khojdu.backend.dto.auth;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.khojdu.backend.entity.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class JwtResponse {
    private String accessToken;
    private String tokenType = "Bearer";
    private UserInfo user;

    // Keep refreshToken for internal use but exclude from JSON serialization
    @JsonIgnore
    private String refreshToken;

    // Constructor with refreshToken (for internal use by service layer)
    public JwtResponse(String accessToken, String refreshToken, UserInfo user) {
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.user = user;
    }

    // Constructor without refreshToken (for API responses)
    public JwtResponse(String accessToken, UserInfo user) {
        this.accessToken = accessToken;
        this.user = user;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UserInfo {
        private UUID id;
        private String email;
        private String fullName;
        private UserRole role;
        private Boolean isVerified;
    }
}

