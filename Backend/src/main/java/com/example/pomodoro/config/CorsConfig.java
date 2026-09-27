package com.example.pomodoro.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

// By default, browsers block a webpage from calling an API on a different
// "origin" (different domain/port) unless the server explicitly allows it.
// Since our frontend (opened as a file, or served on a different port) and
// our backend (running on localhost:8080) are technically different origins,
// we need this configuration or the browser will block every request.
//
// NOTE: allowing "*" (any origin) is fine for a local student project, but
// in a real production app you'd list only the exact frontend URL(s) allowed.
@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("*")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*");
    }
}
