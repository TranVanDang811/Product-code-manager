package com.pcm.productcodemanager.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "User profile information response")
public class UserResponse {

    @Schema(description = "User unique identifier")
    private UUID id;

    @Schema(description = "Username")
    private String username;

    @Schema(description = "Full name")
    private String fullName;

    @Schema(description = "User role", example = "ADMIN")
    private String role;

    @Schema(description = "Active status flag")
    private Boolean isActive;
}

