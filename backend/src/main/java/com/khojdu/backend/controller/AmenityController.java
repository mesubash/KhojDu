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

@RestController
@RequestMapping("/api/amenities")
@RequiredArgsConstructor
@Tag(name = "Amenities", description = "Property amenities endpoints")
public class AmenityController {

    private final AmenityRepository amenityRepository;

    @GetMapping
    @Operation(summary = "Get all amenities", description = "Get list of all available amenities")
    public ResponseEntity<ApiResponse<List<Amenity>>> getAllAmenities() {
        List<Amenity> amenities = amenityRepository.findAllOrderByCategoryAndName();
        return ResponseEntity.ok(ApiResponse.success(amenities));
    }

    @GetMapping("/category/{category}")
    @Operation(summary = "Get amenities by category", description = "Get amenities filtered by category")
    public ResponseEntity<ApiResponse<List<Amenity>>> getAmenitiesByCategory(
            @PathVariable String category) {
        List<Amenity> amenities = amenityRepository.findByCategory(
                AmenityCategory.valueOf(category)
        );
        return ResponseEntity.ok(ApiResponse.success(amenities));
    }
}