package com.khojdu.backend.dto.preference;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchPreferenceResponse {
    private UUID id;
    private String name;
    private String propertyType;
    private String city;
    private Double minPrice;
    private Double maxPrice;
    private Integer minBedrooms;
    private Integer maxBedrooms;
    private Boolean notifyNewMatches;
    private Boolean notifyPriceDrops;
}
