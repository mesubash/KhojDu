package com.khojdu.backend.dto.user;

import com.khojdu.backend.entity.enums.PropertyType;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Past;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class UserProfileRequest {

    @Size(min = 2, max = 100)
    private String fullName;

    @Pattern(regexp = "^[0-9]{10}$")
    private String phone;

    @Past
    private LocalDate dateOfBirth;

    @Size(max = 100)
    private String occupation;

    @Size(max = 1000)
    private String bio;

    @Size(max = 255)
    private String preferredLocation;

    private BigDecimal budgetMin;
    private BigDecimal budgetMax;
    private PropertyType preferredPropertyType;
    private Integer familySize;
    private Boolean hasPets;
    private Boolean smokingAllowed;
    private Boolean drinkingAllowed;
}