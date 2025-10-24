package com.khojdu.backend.util;

import java.math.BigDecimal;

public class LocationUtil {

    private static final double EARTH_RADIUS_KM = 6371.0;

    public static double calculateDistance(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2) {
        if (lat1 == null || lon1 == null || lat2 == null || lon2 == null) {
            return Double.MAX_VALUE;
        }

        double lat1Rad = Math.toRadians(lat1.doubleValue());
        double lon1Rad = Math.toRadians(lon1.doubleValue());
        double lat2Rad = Math.toRadians(lat2.doubleValue());
        double lon2Rad = Math.toRadians(lon2.doubleValue());

        double dLat = lat2Rad - lat1Rad;
        double dLon = lon2Rad - lon1Rad;

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(lat1Rad) * Math.cos(lat2Rad) *
                        Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    public static boolean isWithinRadius(BigDecimal lat1, BigDecimal lon1, BigDecimal lat2, BigDecimal lon2, double radiusKm) {
        return calculateDistance(lat1, lon1, lat2, lon2) <= radiusKm;
    }

    public static boolean isValidNepalCoordinates(BigDecimal latitude, BigDecimal longitude) {
        if (latitude == null || longitude == null) return false;

        double lat = latitude.doubleValue();
        double lon = longitude.doubleValue();

        // Nepal bounds approximately
        return lat >= 26.0 && lat <= 31.0 && lon >= 80.0 && lon <= 89.0;
    }
}
