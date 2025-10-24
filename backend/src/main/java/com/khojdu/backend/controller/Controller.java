package com.khojdu.backend.controller;

import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
//@RequestMapping()
@RequiredArgsConstructor
@Tag(name = "Test", description = "Test  endpoints")
public class Controller {
    @GetMapping("/health")
    public Map<String, String> healthCheck() {
        // Return a simple map; Spring Boot will serialize it to JSON: { "status": "UP" }
        return Map.of("status", "UP");
    }

}
