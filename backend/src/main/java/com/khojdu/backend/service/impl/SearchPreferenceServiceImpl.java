package com.khojdu.backend.service.impl;

import com.khojdu.backend.dto.preference.SearchPreferenceRequest;
import com.khojdu.backend.dto.preference.SearchPreferenceResponse;
import com.khojdu.backend.entity.SearchPreference;
import com.khojdu.backend.entity.User;
import com.khojdu.backend.entity.enums.PropertyType;
import com.khojdu.backend.exception.ResourceNotFoundException;
import com.khojdu.backend.mapper.SearchPreferenceMapper;
import com.khojdu.backend.repository.SearchPreferenceRepository;
import com.khojdu.backend.repository.UserRepository;
import com.khojdu.backend.service.SearchPreferenceService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class SearchPreferenceServiceImpl implements SearchPreferenceService {

    private final SearchPreferenceRepository searchPreferenceRepository;
    private final UserRepository userRepository;
    private final SearchPreferenceMapper mapper;

    private User getUser(String identifier) {
        return userRepository.findByEmail(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SearchPreferenceResponse> getMyPreferences(String userIdentifier) {
        User user = getUser(userIdentifier);
        return searchPreferenceRepository.findByUser(user)
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public SearchPreferenceResponse createPreference(String userIdentifier, SearchPreferenceRequest request) {
        User user = getUser(userIdentifier);
        SearchPreference pref = new SearchPreference();
        pref.setUser(user);
        pref.setName(request.getName());
        try {
            pref.setPropertyType(request.getPropertyType() != null ? PropertyType.valueOf(request.getPropertyType()) : null);
        } catch (IllegalArgumentException ex) {
            log.warn("Invalid property type for search preference: {}", request.getPropertyType());
            pref.setPropertyType(null);
        }
        pref.setCity(request.getCity());
        pref.setMinPrice(request.getMinPrice() != null ? java.math.BigDecimal.valueOf(request.getMinPrice()) : null);
        pref.setMaxPrice(request.getMaxPrice() != null ? java.math.BigDecimal.valueOf(request.getMaxPrice()) : null);
        pref.setMinBedrooms(request.getMinBedrooms());
        pref.setMaxBedrooms(request.getMaxBedrooms());
        pref.setNotifyNewMatches(request.getNotifyNewMatches());
        pref.setNotifyPriceDrops(request.getNotifyPriceDrops());

        SearchPreference saved = searchPreferenceRepository.save(pref);
        return mapper.toResponse(saved);
    }

    @Override
    @Transactional
    public void deletePreference(String userIdentifier, UUID preferenceId) {
        User user = getUser(userIdentifier);
        SearchPreference pref = searchPreferenceRepository.findById(preferenceId)
                .orElseThrow(() -> new ResourceNotFoundException("Saved search not found"));
        if (!pref.getUser().getId().equals(user.getId())) {
            throw new ResourceNotFoundException("Saved search not found");
        }
        searchPreferenceRepository.delete(pref);
    }
}
