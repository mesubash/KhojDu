package com.khojdu.backend.controller;

import com.khojdu.backend.dto.common.ApiResponse;
import com.khojdu.backend.dto.common.SuccessResponse;
import com.khojdu.backend.dto.preference.SearchPreferenceRequest;
import com.khojdu.backend.dto.preference.SearchPreferenceResponse;
import com.khojdu.backend.service.SearchPreferenceService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/preferences")
@RequiredArgsConstructor
@Tag(name = "Search Preferences", description = "Manage saved search preferences")
@PreAuthorize("hasRole('TENANT') or hasRole('LANDLORD') or hasRole('ADMIN')")
public class SearchPreferenceController {

    private final SearchPreferenceService preferenceService;

    @GetMapping
    @Operation(summary = "List saved searches")
    public ResponseEntity<ApiResponse<List<SearchPreferenceResponse>>> list(Principal principal) {
        List<SearchPreferenceResponse> prefs = preferenceService.getMyPreferences(principal.getName());
        return ResponseEntity.ok(ApiResponse.success(prefs));
    }

    @PostMapping
    @Operation(summary = "Create saved search")
    public ResponseEntity<ApiResponse<SearchPreferenceResponse>> create(
            @Valid @RequestBody SearchPreferenceRequest request,
            Principal principal
    ) {
        SearchPreferenceResponse resp = preferenceService.createPreference(principal.getName(), request);
        return ResponseEntity.ok(ApiResponse.success("Saved search created", resp));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete saved search")
    public ResponseEntity<ApiResponse<SuccessResponse>> delete(@PathVariable UUID id, Principal principal) {
        preferenceService.deletePreference(principal.getName(), id);
        return ResponseEntity.ok(ApiResponse.success("Deleted", SuccessResponse.of("Deleted")));
    }
}
