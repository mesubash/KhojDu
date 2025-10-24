package com.khojdu.backend.dto.property;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyAnalyticsResponse {
    private Long totalViews;
    private Long totalInquiries;
    private Long totalWishlists;
    private Double averageRating;
    private Long totalReviews;

    private List<ViewsByDate> viewsOverTime;
    private Map<String, Long> trafficSources;
    private List<PopularSearchTerm> popularSearchTerms;

    @Data
    @AllArgsConstructor
    public static class ViewsByDate {
        private LocalDate date;
        private Long count;
    }

    @Data
    @AllArgsConstructor
    public static class PopularSearchTerm {
        private String term;
        private Long count;
    }
}
