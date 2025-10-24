package com.khojdu.backend.config;

import com.khojdu.backend.security.JwtAuthenticationEntryPoint;
import com.khojdu.backend.security.JwtAuthenticationFilter;
import com.khojdu.backend.security.CustomUserDetailsService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final CustomUserDetailsService customUserDetailsService;
    private final JwtAuthenticationEntryPoint jwtAuthenticationEntryPoint;
    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder(12);
    }

    // Build a DaoAuthenticationProvider but do NOT expose it as a global @Bean.
    // This avoids the Spring warning that a global AuthenticationProvider prevents
    // UserDetailsService auto-configuration. The provider will be registered only
    // with the SecurityFilterChain and with a local AuthenticationManager.
    @SuppressWarnings("deprecation")
    private DaoAuthenticationProvider buildAuthenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(customUserDetailsService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    // Provide an AuthenticationManager that uses the locally built provider.
    // This keeps an AuthenticationManager bean available without registering a
    // global AuthenticationProvider bean in the ApplicationContext.
    @Bean
    public AuthenticationManager authenticationManager() {
        return new ProviderManager(buildAuthenticationProvider());
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .exceptionHandling(exception -> exception.authenticationEntryPoint(jwtAuthenticationEntryPoint))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(authz -> authz
                        // Public endpoints
                        .requestMatchers(
                                "/auth/**",
                                "/properties/search",
                                "/properties/public/**",
                                "/amenities",
                                "/swagger-ui/**",
                                "/api-docs/**",
                                "/actuator/**",
                                "/uploads/**"
                        ).permitAll()

                        // Admin only endpoints
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/complaints/admin/**").hasRole("ADMIN")
                        .requestMatchers("/users/admin/**").hasRole("ADMIN")

                        // Landlord endpoints
                        .requestMatchers("/properties/landlord/**").hasAnyRole("LANDLORD", "ADMIN")
                        .requestMatchers("/verification/**").hasAnyRole("LANDLORD", "ADMIN")

                        // Authenticated endpoints
                        .anyRequest().authenticated()
                );

        // register the locally-built provider with this HttpSecurity instance
        http.authenticationProvider(buildAuthenticationProvider());
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of(
                "http://localhost:3000",
                "https://khojdu.com",
                "https://*.khojdu.com"
        ));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}
