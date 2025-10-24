package com.khojdu.backend;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

public class DotEnvInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
    @Override
    public void initialize(ConfigurableApplicationContext applicationContext) {
        Dotenv dotenv = Dotenv.configure().ignoreIfMissing().load();
        dotenv.entries().forEach(entry ->
                System.setProperty(entry.getKey(), entry.getValue())
        );

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
