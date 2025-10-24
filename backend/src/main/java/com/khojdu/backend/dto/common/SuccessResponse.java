package com.khojdu.backend.dto.common;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SuccessResponse {
    private String message;
    private LocalDateTime timestamp = LocalDateTime.now();

    public static SuccessResponse of(String message) {
        return new SuccessResponse(message, LocalDateTime.now());
    }
}
