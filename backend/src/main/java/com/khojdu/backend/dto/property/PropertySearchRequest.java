package com.khojdu.backend.dto.property;

import com.khojdu.backend.entity.enums.PropertyType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertySearchRequest {
    // Pagination & sorting
    private int page = 0;
    private int size = 20;
    private String sortBy = "createdAt";
    private String sortDirection = "DESC";

    // Filters
    private PropertyType propertyType;
    private String city;
    private BigDecimal minRent;
    private BigDecimal maxRent;
    private Integer minBedrooms;
    private Integer maxBedrooms;
    private Boolean isFurnished;
    private Boolean parkingAvailable;
    private Boolean petsAllowed;
    private Boolean availableOnly = true;

    // Optional location for distance calculation
    private BigDecimal latitude;
    private BigDecimal longitude;

    private Double radiusKm;
}
