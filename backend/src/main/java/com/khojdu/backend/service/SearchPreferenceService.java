package com.khojdu.backend.service;

import com.khojdu.backend.dto.preference.SearchPreferenceRequest;
import com.khojdu.backend.dto.preference.SearchPreferenceResponse;

import java.util.List;
import java.util.UUID;

public interface SearchPreferenceService {
    List<SearchPreferenceResponse> getMyPreferences(String userIdentifier);
    SearchPreferenceResponse createPreference(String userIdentifier, SearchPreferenceRequest request);
    void deletePreference(String userIdentifier, UUID preferenceId);
}
