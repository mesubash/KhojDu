package com.khojdu.backend.controller;

import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.dto.common.PagedResponse;
import com.khojdu.backend.dto.property.PropertyListResponse;
import com.khojdu.backend.dto.property.PropertySearchRequest;
import com.khojdu.backend.service.SearchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/search")
@RequiredArgsConstructor
@Tag(name = "Search", description = "Advanced property search endpoints")
public class SearchController {

    private final SearchService searchService;

    @PostMapping("/properties")
    @Operation(summary = "Advanced property search", description = "Search properties with advanced filters")
    public ResponseEntity<ApiResponse<PagedResponse<PropertyListResponse>>> searchProperties(
            @RequestBody PropertySearchRequest request) {
        PagedResponse<PropertyListResponse> response = searchService.searchProperties(request);
        return ResponseEntity.ok(ApiResponse.success(response));
    }

    @GetMapping("/suggestions")
    @Operation(summary = "Get search suggestions", description = "Get property search suggestions")
    public ResponseEntity<ApiResponse<java.util.List<String>>> getSearchSuggestions(
            @RequestParam String query) {
        // TODO: Implement search suggestions
        return ResponseEntity.ok(ApiResponse.success(java.util.List.of()));
    }

    @GetMapping("/cities")
    @Operation(summary = "Get available cities", description = "Get list of cities with properties")
    public ResponseEntity<ApiResponse<java.util.List<String>>> getAvailableCities() {
        // TODO: Implement city list
        return ResponseEntity.ok(ApiResponse.success(java.util.List.of(
                "Kathmandu", "Lalitpur", "Bhaktapur", "Pokhara", "Biratnagar"
        )));
    }

    @GetMapping("/featured")
    @Operation(summary = "Get featured properties", description = "Public endpoint to fetch limited featured properties")
    public ResponseEntity<ApiResponse<java.util.List<PropertyListResponse>>> getFeatured(
            @RequestParam(defaultValue = "6") int limit) {
        int safeLimit = Math.min(Math.max(limit, 1), 20);
        var properties = searchService.getFeaturedProperties(safeLimit);
        return ResponseEntity.ok(ApiResponse.success(properties));
    }
}
