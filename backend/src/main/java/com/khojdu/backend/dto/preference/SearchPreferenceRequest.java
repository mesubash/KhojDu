package com.khojdu.backend.dto.preference;

import lombok.Data;

@Data
public class SearchPreferenceRequest {
    private String name;
    private String propertyType;
    private String city;
    private Double minPrice;
    private Double maxPrice;
    private Integer minBedrooms;
    private Integer maxBedrooms;
    private Boolean notifyNewMatches = true;
    private Boolean notifyPriceDrops = true;
}
