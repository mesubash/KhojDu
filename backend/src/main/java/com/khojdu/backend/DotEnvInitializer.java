package com.khojdu.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Locale;

public class DotEnvInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(entry -> {
            String key = entry.getKey();
            String raw = entry.getValue();

            // Sanitize: remove surrounding single or double quotes and trim whitespace
            String value = raw == null ? null : raw.trim();
            if (value != null && value.length() >= 2) {
                if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
                    value = value.substring(1, value.length() - 1).trim();
                }
            }

            if (value != null) {
                System.setProperty(key, value);
            } else {
                System.setProperty(key, "");
            }

            // Small, safe diagnostic for Cloudinary keys (mask sensitive parts)
            String lower = key.toLowerCase(Locale.ROOT);
            if (lower.contains("cloudinary") || lower.contains("cloud_name") || lower.contains("cloud-name") || lower.contains("api_secret") || lower.contains("api-key") || lower.contains("api_key")) {
                String masked = "";
                if (value != null && !value.isEmpty()) {
                    masked = value.length() <= 8 ? "****" + value : "****" + value.substring(value.length() - 8);
                }
                System.out.println("[DotEnvInitializer] Loaded " + key + "=" + masked);

                // If the value looks like a masked placeholder (only asterisks), warn explicitly
                if (value != null && value.matches("^\\*+$")) {
                    System.err.println("[DotEnvInitializer] WARNING: Environment variable '" + key + "' appears to be a masked placeholder (e.g. '********'). Please set the real value for this variable (no surrounding quotes) to avoid signature/authentication errors.");
                }
            }
        });

        // If REDIS_URL isn't provided, but individual REDIS_* vars are, synthesize spring.redis.url
        String redisUrl = dotenv.get("REDIS_URL");
        if ((redisUrl == null || redisUrl.isBlank())) {
            String host = dotenv.get("REDIS_HOST");
            String port = dotenv.get("REDIS_PORT");
            String user = dotenv.get("REDIS_USERNAME");
            String pass = dotenv.get("REDIS_PASSWORD");
            String useTls = dotenv.get("REDIS_TLS");

            if (host != null && !host.isBlank() && port != null && !port.isBlank()) {
                String scheme = "rediss";
                if (useTls != null && (useTls.equalsIgnoreCase("false") || useTls.equals("0"))) {
                    scheme = "redis";
                }

                StringBuilder sb = new StringBuilder();
                sb.append(scheme).append("://");

                if (user != null && !user.isBlank()) {
                    sb.append(URLEncoder.encode(user, StandardCharsets.UTF_8));
                    if (pass != null && !pass.isBlank()) {
                        sb.append(':').append(URLEncoder.encode(pass, StandardCharsets.UTF_8));
                    }
                    sb.append('@');
                } else if (pass != null && !pass.isBlank()) {
                    sb.append(':').append(URLEncoder.encode(pass, StandardCharsets.UTF_8)).append('@');
                }

                sb.append(host).append(':').append(port);

                String synthesized = sb.toString();
                System.setProperty("spring.redis.url", synthesized);
            }
        } else {
            // If REDIS_URL exists, also expose it as spring.redis.url
            System.setProperty("spring.redis.url", redisUrl);
        }
    }
}
