package com.khojdu.backend.dto.user;

import com.khojdu.backend.entity.enums.PropertyType;
import com.khojdu.backend.entity.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileResponse {
    private UUID id;
    private String email;
    private String fullName;
    private String phone;
    private UserRole role;
    private String profileImageUrl;
    private Boolean isVerified;
    private LocalDate dateOfBirth;
    private String occupation;
    private LocalDateTime createdAt;

    // Profile fields
    private String bio;
    private String preferredLocation;
    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    private PropertyType preferredPropertyType;
    private Integer familySize;
    private Boolean hasPets;
    private Boolean smokingAllowed;
    private Boolean drinkingAllowed;
}

