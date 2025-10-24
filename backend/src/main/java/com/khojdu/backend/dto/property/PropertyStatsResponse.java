package com.khojdu.backend.dto.property;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PropertyStatsResponse {
    private Long totalViews;
    private Long totalInquiries;
    private Long totalWishlists;
    private Double averageRating;
    private Long totalReviews;

    // Optional: trend data
    private List<ViewsByDate> viewsOverTime;

    @Data
    @AllArgsConstructor
    public static class ViewsByDate {
        private LocalDate date;
        private Long count;
    }
}
