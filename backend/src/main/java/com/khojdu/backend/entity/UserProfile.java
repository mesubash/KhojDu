package com.khojdu.backend.entity;

import com.khojdu.backend.entity.enums.PropertyType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_profiles")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String bio;

    @Column(name = "preferred_location")
    private String preferredLocation;

    @Column(name = "budget_min")
    private BigDecimal budgetMin;

    @Column(name = "budget_max")
    private BigDecimal budgetMax;

    @Enumerated(EnumType.STRING)
    @Column(name = "preferred_property_type")
    private PropertyType preferredPropertyType;

    @Column(name = "family_size")
    private Integer familySize = 1;

    @Column(name = "has_pets")
    private Boolean hasPets = false;

    @Column(name = "smoking_allowed")
    private Boolean smokingAllowed = false;

    @Column(name = "drinking_allowed")
    private Boolean drinkingAllowed = false;

    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

}
