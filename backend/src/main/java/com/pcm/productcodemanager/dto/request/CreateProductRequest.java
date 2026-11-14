package com.pcm.productcodemanager.dto.request;

import com.pcm.productcodemanager.entity.enums.ProductStatus;
import com.pcm.productcodemanager.validation.ValidEan13;
import com.pcm.productcodemanager.validation.ValidProductCode;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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
@Schema(description = "Product creation payload")
public class CreateProductRequest {

    @ValidProductCode
    @Schema(description = "Internal 6-digit product code (leading zeros allowed)", example = "001234", requiredMode = Schema.RequiredMode.REQUIRED)
    private String productCode;

    @NotBlank(message = "Product name cannot be blank")
    @Size(max = 150, message = "Product name cannot exceed 150 characters")
    @Schema(description = "Product display name", example = "Bút dạ quang Stabilo Boss Yellow", requiredMode = Schema.RequiredMode.REQUIRED)
    private String name;

    @Schema(description = "Detailed product description", example = "Mực dạ quang chất lượng cao, chống khô mực 4 giờ")
    private String description;

    @ValidEan13
    @Schema(description = "Optional initial 13-digit EAN-13 barcode", example = "4006381333931")
    private String barcode;

    @Builder.Default
    @Schema(description = "Initial status (ACTIVE, INACTIVE)", example = "ACTIVE")
    private ProductStatus status = ProductStatus.ACTIVE;
}

