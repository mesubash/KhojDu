package com.khojdu.backend.entity;

import com.khojdu.backend.entity.enums.PropertyType;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "search_preferences")
@Data
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class SearchPreference {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String name; // "My Dream Apartment"

    // Search criteria
    @Enumerated(EnumType.STRING)
    @Column(name = "property_type")
    private PropertyType propertyType;

    private String city;

    @Column(name = "min_price")
    private BigDecimal minPrice;

    @Column(name = "max_price")
    private BigDecimal maxPrice;

    @Column(name = "min_bedrooms")
    private Integer minBedrooms;

    @Column(name = "max_bedrooms")
    private Integer maxBedrooms;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "amenity_ids", columnDefinition = "uuid[]")
    private UUID[] amenityIds;

    // Notification settings
    @Column(name = "notify_new_matches")
    private Boolean notifyNewMatches = true;

    @Column(name = "notify_price_drops")
    private Boolean notifyPriceDrops = true;

    @CreatedDate
    @Column(name = "created_at")
    private LocalDateTime createdAt;
}

