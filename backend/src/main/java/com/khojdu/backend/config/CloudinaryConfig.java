package com.khojdu.backend.config;

import com.cloudinary.Cloudinary;
import lombok.Data;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.HashMap;
import java.util.Map;

@Data
@Configuration
@ConfigurationProperties(prefix = "file.cloudinary")
@Slf4j
public class CloudinaryConfig {

    private String cloudName;
    private String apiKey;
    private String apiSecret;

    @Bean
    public Cloudinary cloudinary() {
        // Trim values to avoid accidental whitespace from env vars or properties
        String cloud = cloudName == null ? null : cloudName.trim();
        String key = apiKey == null ? null : apiKey.trim();
        String secret = apiSecret == null ? null : apiSecret.trim();

        // Fail fast with a helpful message if any critical value is missing
        if (cloud == null || cloud.isEmpty()) {
            throw new IllegalStateException("Cloudinary configuration error: 'file.cloudinary.cloud-name' is not set or empty. Set CLOUDINARY_CLOUD_NAME environment variable or file.cloudinary.cloud-name property.");
        }
        if (key == null || key.isEmpty()) {
            throw new IllegalStateException("Cloudinary configuration error: 'file.cloudinary.api-key' is not set or empty. Set CLOUDINARY_API_KEY environment variable or file.cloudinary.api-key property.");
        }
        if (secret == null || secret.isEmpty()) {
            throw new IllegalStateException("Cloudinary configuration error: 'file.cloudinary.api-secret' is not set or empty. Set CLOUDINARY_API_SECRET environment variable or file.cloudinary.api-secret property.");
        }

        // Detect common masked placeholder (e.g. '********') and fail early with actionable message
        if (secret.matches("^*+$")) {
            throw new IllegalStateException("Cloudinary configuration error: 'file.cloudinary.api-secret' appears to be a masked placeholder (e.g. '********'). Please set the real CLOUDINARY_API_SECRET environment variable (no surrounding quotes) and restart the application.");
        }
        Map<String, String> config = new HashMap<>();
        config.put("cloud_name", cloud);
        config.put("api_key", key);
        config.put("api_secret", secret);
        config.put("secure", "true");

        // Log masked config (do not log secret)
        String maskedKey = key.length() > 4 ? "****" + key.substring(key.length() - 4) : key;
        log.info("Initializing Cloudinary with cloud_name='{}' api_key='{}'", cloud, maskedKey);

        return new Cloudinary(config);
    }
}
