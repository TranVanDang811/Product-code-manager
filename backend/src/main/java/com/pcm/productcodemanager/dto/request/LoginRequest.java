package com.pcm.productcodemanager.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
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
@Schema(description = "Admin login credentials request")
public class LoginRequest {

    @NotBlank(message = "Username cannot be blank")
    @Schema(description = "Admin username", example = "admin")
    private String username;

    @NotBlank(message = "Password cannot be blank")
    @Schema(description = "Admin password", example = "Admin@123")
    private String password;
}

