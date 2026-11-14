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
@Schema(description = "Barcode lookup request payload from Web or Mobile scanner")
public class BarcodeLookupRequest {

    @NotBlank(message = "Barcode string cannot be blank")
    @Schema(description = "Scanned barcode string (EAN-13 format or raw scanner input)", example = "4006381333931", requiredMode = Schema.RequiredMode.REQUIRED)
    private String barcode;

    @Schema(description = "Optional client device/platform info", example = "Expo Camera (iOS 17.4)")
    private String deviceInfo;
}

