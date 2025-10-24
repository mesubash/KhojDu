package com.khojdu.backend.dto.property;

import com.khojdu.backend.entity.enums.PropertyStatus;
import com.khojdu.backend.entity.enums.PropertyType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyResponse {
    private UUID id;
    private String title;
    private String description;
    private PropertyType propertyType;
    private PropertyStatus status;

    // Location
    private String address;
    private String city;
    private String district;
    private Integer wardNumber;
    private BigDecimal latitude;
    private BigDecimal longitude;

    // Pricing
    private BigDecimal monthlyRent;
    private BigDecimal securityDeposit;

    // Property details
    private Integer bedrooms;
    private Integer bathrooms;
    private Integer totalArea;
    private Integer floorNumber;
    private Integer totalFloors;

    // Features
    private Boolean isFurnished;
    private Boolean parkingAvailable;
    private Boolean internetIncluded;
    private Boolean utilitiesIncluded;
    private Boolean petsAllowed;
    private Boolean smokingAllowed;

    // Availability
    private Boolean isAvailable;
    private LocalDate availableFrom;
    private Boolean isFeatured;

    // Timestamps
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Landlord summary
    private LandlordInfo landlord;

    // Images
    private List<PropertyImageResponse> images;

    // Amenities
    private List<AmenityResponse> amenities;

    // Nearby places
    private List<NearbyPlaceResponse> nearbyPlaces;

    // Stats
    private PropertyStats stats;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LandlordInfo {
        private UUID id;
        private String fullName;
        private String email;
        private String phone;
        private Boolean isVerified;
        private String profileImageUrl;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PropertyImageResponse {
        private UUID id;
        private String imageUrl;
        private String altText;
        private Boolean isPrimary;
        private Integer displayOrder;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AmenityResponse {
        private UUID id;
        private String name;
        private String icon;
        private String category;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NearbyPlaceResponse {
        private UUID id;
        private String name;
        private String placeType;
        private Integer distanceMeters;
        private Integer walkingTimeMinutes;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class PropertyStats {
        private Long viewCount;
        private Long inquiryCount;
        private Long reviewCount;
        private Double averageRating;
    }
}
