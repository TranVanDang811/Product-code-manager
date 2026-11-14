package com.pcm.productcodemanager.controller;

import com.pcm.productcodemanager.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/health")
@Tag(name = "Health Check", description = "System health check and smoke testing endpoint")
public class HealthController {

    @GetMapping
    @Operation(summary = "Check backend service status", description = "Returns system health, active profile, and server timestamp")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getHealthStatus() {
        Map<String, Object> status = Map.of(
                "status", "UP",
                "service", "product-code-manager-backend",
                "version", "1.0.0",
                "timestamp", LocalDateTime.now().toString()
        );
        return ResponseEntity.ok(ApiResponse.success("Service is running properly", status));
    }
}

