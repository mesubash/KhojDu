package com.khojdu.backend.controller;

import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.entity.Amenity;
import com.khojdu.backend.entity.enums.AmenityCategory;
import com.khojdu.backend.repository.AmenityRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/amenities")
@RequiredArgsConstructor
@Tag(name = "Amenities", description = "Property amenities endpoints")
public class AmenityController {

    private final AmenityRepository amenityRepository;

    @GetMapping
    @Operation(summary = "Get all amenities", description = "Get list of all available amenities")
    public ResponseEntity<ApiResponse<List<AmenityDto>>> getAllAmenities() {
        List<AmenityDto> amenities = amenityRepository.findAllOrderByCategoryAndName().stream()
                .map(AmenityDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(amenities));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get amenities by category", description = "Get amenities filtered by category")
    public ResponseEntity<ApiResponse<List<AmenityDto>>> getAmenitiesByCategory(
            @PathVariable String category) {
        List<AmenityDto> amenities = amenityRepository.findByCategory(
                        AmenityCategory.valueOf(category)
                ).stream()
                .map(AmenityDto::fromEntity)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(amenities));
    }

    // Lightweight DTO to avoid lazy-loading issues
    public record AmenityDto(String id, String name, String icon, String category) {
        static AmenityDto fromEntity(Amenity amenity) {
            return new AmenityDto(
                    amenity.getId().toString(),
                    amenity.getName(),
                    amenity.getIcon(),
                    amenity.getCategory() != null ? amenity.getCategory().name() : null
            );
        }
    }
}
