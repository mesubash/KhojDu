package com.khojdu.backend.dto.property;

import com.khojdu.backend.entity.enums.PropertyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyCreateRequest {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Property type is required")
    private PropertyType propertyType;

    private String address;
    private String city;
    private String district;
    private Integer wardNumber;

    private BigDecimal latitude;
    private BigDecimal longitude;

    @NotNull(message = "Monthly rent is required")
    private BigDecimal monthlyRent;
    private BigDecimal securityDeposit;

    private Integer bedrooms;
    private Integer bathrooms;
    private Integer totalArea;
    private Integer floorNumber;
    private Integer totalFloors;

    private Boolean isFurnished;
    private Boolean parkingAvailable;
    private Boolean internetIncluded;
    private Boolean utilitiesIncluded;
    private Boolean petsAllowed;
    private Boolean smokingAllowed;

    private LocalDate availableFrom;

    private List<UUID> amenityIds;

    private List<NearbyPlaceRequest> nearbyPlaces;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class NearbyPlaceRequest {
        private String name;
        private String placeType; // e.g., SCHOOL, HOSPITAL, MARKET etc.
        private Integer distanceMeters;
        private Integer walkingTimeMinutes;
    }
}
