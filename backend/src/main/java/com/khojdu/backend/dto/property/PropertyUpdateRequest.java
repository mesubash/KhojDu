package com.khojdu.backend.dto.property;

import com.khojdu.backend.entity.enums.PropertyType;
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
public class PropertyUpdateRequest {

    private String title;
    private String description;
    private PropertyType propertyType;

    private String address;
    private String city;
    private String district;
    private Integer wardNumber;

    private BigDecimal latitude;
    private BigDecimal longitude;

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

    private Boolean isAvailable;
    private LocalDate availableFrom;

    private List<UUID> amenityIds;

    private List<PropertyCreateRequest.NearbyPlaceRequest> nearbyPlaces;
}
