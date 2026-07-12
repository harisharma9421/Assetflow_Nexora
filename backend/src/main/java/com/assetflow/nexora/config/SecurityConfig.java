package com.assetflow.nexora.config;

import com.assetflow.nexora.security.JwtAuthenticationFilter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private static final String ADMIN = "ADMIN";
    private static final String ASSET_MANAGER = "ASSET_MANAGER";
    private static final String DEPARTMENT_HEAD = "DEPARTMENT_HEAD";
    private static final String EMPLOYEE = "EMPLOYEE";

    private static final String[] PUBLIC_ENDPOINTS = {
            "/api/health",
            "/api/version",
            "/api/auth/signup",
            "/api/auth/login",
            "/api/auth/forgot-password",
            "/api/auth/reset-password",
            "/v3/api-docs/**",
            "/swagger-ui/**",
            "/swagger-ui.html"
    };

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(PUBLIC_ENDPOINTS).permitAll()
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/api/admin/**").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.POST, "/api/departments/**").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.PUT, "/api/departments/**").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.PATCH, "/api/departments/**").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.POST, "/api/asset-categories/**").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.PUT, "/api/asset-categories/**").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.PATCH, "/api/asset-categories/**").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.DELETE, "/api/category-fields/**").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.PATCH, "/api/users/**").hasRole(ADMIN)
                        .requestMatchers(HttpMethod.POST, "/api/assets/**").hasAnyRole(ADMIN, ASSET_MANAGER)
                        .requestMatchers(HttpMethod.PUT, "/api/assets/**").hasAnyRole(ADMIN, ASSET_MANAGER)
                        .requestMatchers(HttpMethod.PATCH, "/api/assets/**").hasAnyRole(ADMIN, ASSET_MANAGER)
                        .requestMatchers("/api/allocations/**").hasAnyRole(ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD)
                        .requestMatchers("/api/transfers/**").hasAnyRole(ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD, EMPLOYEE)
                        .requestMatchers("/api/bookings/**").hasAnyRole(ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD, EMPLOYEE)
                        .requestMatchers("/api/resources/**").hasAnyRole(ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD, EMPLOYEE)
                        .requestMatchers("/api/maintenance-requests/**").hasAnyRole(ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD, EMPLOYEE)
                        .requestMatchers("/api/audit-cycles/**").hasAnyRole(ADMIN, ASSET_MANAGER)
                        .requestMatchers("/api/audit-cycle-assets/**").hasAnyRole(ADMIN, ASSET_MANAGER, EMPLOYEE)
                        .requestMatchers("/api/discrepancy-reports/**").hasAnyRole(ADMIN, ASSET_MANAGER)
                        .requestMatchers("/api/dashboard/**").hasAnyRole(ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD, EMPLOYEE)
                        .requestMatchers("/api/reports/**").hasAnyRole(ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD)
                        .requestMatchers("/api/exports/**").hasAnyRole(ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD)
                        .requestMatchers("/api/notifications/**").hasAnyRole(ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD, EMPLOYEE)
                        .requestMatchers("/api/activity-logs/**").hasAnyRole(ADMIN, ASSET_MANAGER, DEPARTMENT_HEAD)
                        .anyRequest().authenticated())
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public UserDetailsService userDetailsService() {
        return username -> {
            throw new UsernameNotFoundException("Authentication is handled by JWT tokens");
        };
    }
}
