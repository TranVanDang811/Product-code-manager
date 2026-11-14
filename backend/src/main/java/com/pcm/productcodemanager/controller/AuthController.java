package com.pcm.productcodemanager.controller;

import com.pcm.productcodemanager.common.ApiResponse;
import com.pcm.productcodemanager.dto.request.LoginRequest;
import com.pcm.productcodemanager.dto.response.LoginResponse;
import com.pcm.productcodemanager.dto.response.UserResponse;
import com.pcm.productcodemanager.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Admin authentication and user session management")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    @Operation(summary = "Admin Login", description = "Authenticate administrator with username and password, returns JWT token")
    public ResponseEntity<ApiResponse<LoginResponse>> login(@Valid @RequestBody LoginRequest request) {
        LoginResponse response = authService.login(request);
        return ResponseEntity.ok(ApiResponse.success("Login successful", response));
    }

    @GetMapping("/me")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Get current authenticated admin profile", description = "Returns profile of the currently logged-in admin")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        UserResponse response = authService.getCurrentUser();
        return ResponseEntity.ok(ApiResponse.success("Retrieved current user profile", response));
    }

    @PostMapping("/logout")
    @SecurityRequirement(name = "bearerAuth")
    @Operation(summary = "Admin Logout", description = "Clear current session authentication")
    public ResponseEntity<ApiResponse<Void>> logout() {
        SecurityContextHolder.clearContext();
        return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
    }
}

