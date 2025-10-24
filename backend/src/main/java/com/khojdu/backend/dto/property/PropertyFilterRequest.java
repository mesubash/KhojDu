package com.khojdu.backend.dto.property;

import com.khojdu.backend.entity.enums.PropertyType;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Data
public class PropertyFilterRequest {
    private PropertyType propertyType;
    private String city;
    private String district;
    private BigDecimal minRent;
    private BigDecimal maxRent;
    private Integer minBedrooms;
    private Integer maxBedrooms;
    private Boolean isFurnished;
    private Boolean parkingAvailable;
    private Boolean petsAllowed;
    private List<UUID> amenityIds;
    private Boolean availableOnly = true;
}

