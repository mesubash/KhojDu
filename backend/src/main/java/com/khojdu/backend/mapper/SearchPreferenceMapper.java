package com.khojdu.backend.mapper;

import com.khojdu.backend.dto.preference.SearchPreferenceResponse;
import com.khojdu.backend.entity.SearchPreference;
import org.springframework.stereotype.Component;

@Component
public class SearchPreferenceMapper {
    public SearchPreferenceResponse toResponse(SearchPreference pref) {
        if (pref == null) return null;
        SearchPreferenceResponse resp = new SearchPreferenceResponse();
        resp.setId(pref.getId());
        resp.setName(pref.getName());
        resp.setPropertyType(pref.getPropertyType() != null ? pref.getPropertyType().name() : null);
        resp.setCity(pref.getCity());
        resp.setMinPrice(pref.getMinPrice() != null ? pref.getMinPrice().doubleValue() : null);
        resp.setMaxPrice(pref.getMaxPrice() != null ? pref.getMaxPrice().doubleValue() : null);
        resp.setMinBedrooms(pref.getMinBedrooms());
        resp.setMaxBedrooms(pref.getMaxBedrooms());
        resp.setNotifyNewMatches(pref.getNotifyNewMatches());
        resp.setNotifyPriceDrops(pref.getNotifyPriceDrops());
        return resp;
    }
}
