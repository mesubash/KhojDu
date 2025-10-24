package com.khojdu.backend.dto.property;

import com.khojdu.backend.entity.enums.PropertyStatus;
import com.khojdu.backend.entity.enums.PropertyType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyListResponse {
    private UUID id;
    private String title;
    private PropertyType propertyType;
    private PropertyStatus status;

    private String address;
    private String city;
    private String district;

    private BigDecimal monthlyRent;

    private Integer bedrooms;
    private Integer bathrooms;
    private Integer totalArea;

    private Boolean isFurnished;
    private Boolean parkingAvailable;

    private Boolean isAvailable;
    private Boolean isFeatured;

    private LocalDateTime createdAt;

    // Primary image
    private String primaryImageUrl;

    // Landlord summary
    private String landlordName;
    private Boolean landlordVerified;

    // Stats
    private Long viewCount;
    private Double averageRating;
    private Long reviewCount;

    // Key amenities (top N)
    private List<String> keyAmenities;

    // Optional distance (for location-based search)
    private Double distanceKm;
}
