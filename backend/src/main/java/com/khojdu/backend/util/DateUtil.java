package com.khojdu.backend.util;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.temporal.ChronoUnit;

public class DateUtil {

    public static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");
    public static final DateTimeFormatter DATE_TIME_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    public static String formatDate(LocalDate date) {
        return date != null ? date.format(DATE_FORMATTER) : null;
    }

    public static String formatDateTime(LocalDateTime dateTime) {
        return dateTime != null ? dateTime.format(DATE_TIME_FORMATTER) : null;
    }

    public static LocalDate parseDate(String dateStr) {
        return dateStr != null && !dateStr.isEmpty() ? LocalDate.parse(dateStr, DATE_FORMATTER) : null;
    }

    public static LocalDateTime parseDateTime(String dateTimeStr) {
        return dateTimeStr != null && !dateTimeStr.isEmpty() ? LocalDateTime.parse(dateTimeStr, DATE_TIME_FORMATTER) : null;
    }

    public static long daysBetween(LocalDate startDate, LocalDate endDate) {
        return ChronoUnit.DAYS.between(startDate, endDate);
    }

    public static boolean isDateInRange(LocalDate date, LocalDate startDate, LocalDate endDate) {
        return date != null &&
                (startDate == null || !date.isBefore(startDate)) &&
                (endDate == null || !date.isAfter(endDate));
    }

    public static LocalDate getStartOfMonth() {
        return LocalDate.now().withDayOfMonth(1);
    }

    public static LocalDate getEndOfMonth() {
        LocalDate now = LocalDate.now();
        return now.withDayOfMonth(now.lengthOfMonth());
    }

    public static LocalDateTime getStartOfDay(LocalDate date) {
        return date.atStartOfDay();
    }

    public static LocalDateTime getEndOfDay(LocalDate date) {
        return date.atTime(23, 59, 59, 999999999);
    }
}
