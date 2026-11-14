package com.pcm.productcodemanager.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Authentication response containing JWT token and user profile")
public class LoginResponse {

    @Schema(description = "JWT Access Token")
    private String accessToken;

    @Builder.Default
    @Schema(description = "Token Type", example = "Bearer")
    private String tokenType = "Bearer";

    @Schema(description = "Token expiration duration in milliseconds")
    private long expiresIn;

    @Schema(description = "Authenticated user profile")
    private UserResponse user;
}

