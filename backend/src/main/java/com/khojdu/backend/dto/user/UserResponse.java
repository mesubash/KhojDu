package com.khojdu.backend.dto.user;

import com.khojdu.backend.entity.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
    private String profileImageUrl;
    private Boolean isVerified;
    private Boolean isActive;
    private LocalDate dateOfBirth;
    private String occupation;
    private LocalDateTime createdAt;
}
