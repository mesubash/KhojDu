package com.khojdu.backend.controller;

import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.common.SuccessResponse;
import com.khojdu.backend.dto.property.*;
import com.khojdu.backend.service.PropertyService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/properties")
@RequiredArgsConstructor
@Tag(name = "Properties", description = "Property management endpoints")
public class PropertyController {

    private final PropertyService propertyService;

    @PostMapping
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Create a new property", description = "Create a new property listing")
    public ResponseEntity<ApiResponse<PropertyResponse>> createProperty(
            @Valid @RequestBody PropertyCreateRequest request,
            Principal principal) {
        PropertyResponse response = propertyService.createProperty(request, principal.getName());
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success("Property created successfully", response));
    }

    @PutMapping("/{propertyId}")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Update property", description = "Update an existing property")
    public ResponseEntity<ApiResponse<PropertyResponse>> updateProperty(
            @PathVariable UUID propertyId,
            @Valid @RequestBody PropertyUpdateRequest request,
            Principal principal) {
        PropertyResponse response = propertyService.updateProperty(propertyId, request, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Property updated successfully", response));
    }

    @DeleteMapping("/{propertyId}")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Delete property", description = "Delete a property listing")
    public ResponseEntity<ApiResponse<SuccessResponse>> deleteProperty(
            @PathVariable UUID propertyId,
            Principal principal) {
        propertyService.deleteProperty(propertyId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Property deleted successfully",
                SuccessResponse.of("Property deleted successfully")));
    }

    @GetMapping("/{propertyId}")
    @Operation(summary = "Get property details", description = "Get detailed property information")
    public ResponseEntity<ApiResponse<PropertyResponse>> getProperty(
            @PathVariable UUID propertyId,
            Principal principal) {
        String userEmail = principal != null ? principal.getName() : null;
        PropertyResponse response = propertyService.getPublicPropertyById(propertyId, userEmail);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/landlord/{propertyId}")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Get property for landlord", description = "Get property details for property owner")
    public ResponseEntity<ApiResponse<PropertyResponse>> getLandlordProperty(
            @PathVariable UUID propertyId,
            Principal principal) {
        PropertyResponse response = propertyService.getPropertyById(propertyId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping("/search")
    @Operation(summary = "Search properties", description = "Search properties with filters")
    public ResponseEntity<ApiResponse<PagedResponse<PropertyListResponse>>> searchProperties(
            @RequestBody PropertySearchRequest request) {
        PagedResponse<PropertyListResponse> response = propertyService.searchProperties(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured properties", description = "Get featured property listings")
    public ResponseEntity<ApiResponse<PagedResponse<PropertyListResponse>>> getFeaturedProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<PropertyListResponse> response = propertyService.getFeaturedProperties(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/recent")
    @Operation(summary = "Get recent properties", description = "Get recently added properties")
    public ResponseEntity<ApiResponse<PagedResponse<PropertyListResponse>>> getRecentProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        PagedResponse<PropertyListResponse> response = propertyService.getRecentProperties(page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/landlord/my-properties")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Get landlord properties", description = "Get properties owned by the landlord")
    public ResponseEntity<ApiResponse<PagedResponse<PropertyListResponse>>> getMyProperties(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Principal principal) {
        PagedResponse<PropertyListResponse> response = propertyService.getLandlordProperties(
                principal.getName(), page, size);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @PostMapping(value = "/{propertyId}/images", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Upload property images", description = "Upload images for a property")
    public ResponseEntity<ApiResponse<List<String>>> uploadImages(
            @PathVariable UUID propertyId,
            @RequestParam("images") List<MultipartFile> images,
            Principal principal) {
        List<String> uploadedUrls = propertyService.uploadPropertyImages(propertyId, images, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Images uploaded successfully", uploadedUrls));
    }

    @DeleteMapping("/{propertyId}/images/{imageId}")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Delete property image", description = "Delete a property image")
    public ResponseEntity<ApiResponse<SuccessResponse>> deleteImage(
            @PathVariable UUID propertyId,
            @PathVariable UUID imageId,
            Principal principal) {
        propertyService.deletePropertyImage(propertyId, imageId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Image deleted successfully",
                SuccessResponse.of("Image deleted successfully")));
    }

    @PutMapping("/{propertyId}/images/{imageId}/primary")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Set primary image", description = "Set an image as primary for a property")
    public ResponseEntity<ApiResponse<SuccessResponse>> setPrimaryImage(
            @PathVariable UUID propertyId,
            @PathVariable UUID imageId,
            Principal principal) {
        propertyService.setPrimaryImage(propertyId, imageId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Primary image set successfully",
                SuccessResponse.of("Primary image set successfully")));
    }

    @GetMapping("/{propertyId}/stats")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Get property statistics", description = "Get detailed statistics for a property")
    public ResponseEntity<ApiResponse<PropertyStatsResponse>> getPropertyStats(
            @PathVariable UUID propertyId,
            Principal principal) {
        PropertyStatsResponse stats = propertyService.getPropertyStats(propertyId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success(stats));
    }

    @PutMapping("/{propertyId}/toggle-availability")
    @PreAuthorize("hasRole('LANDLORD') or hasRole('ADMIN')")
    @Operation(summary = "Toggle property availability", description = "Toggle availability status of a property")
    public ResponseEntity<ApiResponse<SuccessResponse>> toggleAvailability(
            @PathVariable UUID propertyId,
            Principal principal) {
        propertyService.toggleAvailability(propertyId, principal.getName());
        return ResponseEntity.ok(ApiResponse.success("Property availability updated",
                SuccessResponse.of("Property availability updated successfully")));
    }

    @GetMapping("/{propertyId}/similar")
    @Operation(summary = "Get similar properties", description = "Get properties similar to the given property")
    public ResponseEntity<ApiResponse<List<PropertyListResponse>>> getSimilarProperties(
            @PathVariable UUID propertyId,
            @RequestParam(defaultValue = "5") int limit) {
        List<PropertyListResponse> response = propertyService.getSimilarProperties(propertyId, limit);
        return ResponseEntity.ok(ApiResponse.success(response));
    }
}
