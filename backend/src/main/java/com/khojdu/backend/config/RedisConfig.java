package com.khojdu.backend.config;

import org.springframework.boot.autoconfigure.data.redis.RedisProperties;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.env.Environment;
import org.springframework.data.redis.connection.RedisPassword;
import org.springframework.data.redis.connection.RedisStandaloneConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceClientConfiguration;
import org.springframework.data.redis.connection.lettuce.LettuceConnectionFactory;

import java.time.Duration;

@Configuration
public class RedisConfig {

    @Bean
    public LettuceConnectionFactory redisConnectionFactory(Environment env) {
        // read host/port/username/password from spring.data.redis.* or spring.redis.*
        String host = env.getProperty("spring.data.redis.host", env.getProperty("spring.redis.host", ""));
        int port = Integer.parseInt(env.getProperty("spring.data.redis.port", env.getProperty("spring.redis.port", "6379")));
        String username = env.getProperty("spring.data.redis.username", env.getProperty("spring.redis.username"));
        String password = env.getProperty("spring.data.redis.password", env.getProperty("spring.redis.password"));
        boolean useSsl = Boolean.parseBoolean(env.getProperty("spring.data.redis.ssl", env.getProperty("spring.redis.ssl", "true")));

        RedisStandaloneConfiguration serverConfig = new RedisStandaloneConfiguration();
        if (host != null && !host.isBlank()) serverConfig.setHostName(host);
        serverConfig.setPort(port);
        if (username != null && !username.isBlank()) serverConfig.setUsername(username);
        if (password != null && !password.isBlank()) serverConfig.setPassword(RedisPassword.of(password));

        // build base builder and set common options
        LettuceClientConfiguration.LettuceClientConfigurationBuilder builder = LettuceClientConfiguration.builder()
                .commandTimeout(Duration.ofSeconds(10));

        // enable SSL if requested
        LettuceClientConfiguration clientConfig;
        if (useSsl) {
            clientConfig = builder.useSsl().build();
        } else {
            clientConfig = builder.build();
        }

        return new LettuceConnectionFactory(serverConfig, clientConfig);
    }
}
