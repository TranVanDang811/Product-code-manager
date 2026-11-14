package com.pcm.productcodemanager.dto.request;

import com.pcm.productcodemanager.validation.ValidEan13;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
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
@Schema(description = "Barcode assignment payload (Admin only)")
public class AssignBarcodeRequest {

    @NotNull(message = "Product ID cannot be null")
    @Schema(description = "Unique ID of the product to bind barcode to", requiredMode = Schema.RequiredMode.REQUIRED)
    private UUID productId;

    @ValidEan13
    @NotNull(message = "Barcode cannot be null")
    @Schema(description = "13-digit EAN-13 barcode with valid checksum", example = "4006381333931", requiredMode = Schema.RequiredMode.REQUIRED)
    private String barcode;
}

