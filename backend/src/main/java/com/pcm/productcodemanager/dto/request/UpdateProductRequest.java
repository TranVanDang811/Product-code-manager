package com.pcm.productcodemanager.dto.request;

import com.pcm.productcodemanager.entity.enums.ProductStatus;
import com.pcm.productcodemanager.validation.ValidEan13;
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
@Schema(description = "Product update payload")
public class UpdateProductRequest {

    @NotBlank(message = "Product name cannot be blank")
    @Size(max = 150, message = "Product name cannot exceed 150 characters")
    @Schema(description = "Updated product display name", example = "Bút dạ quang Stabilo Boss Pastel Yellow")
    private String name;

    @Schema(description = "Updated product description", example = "Phiên bản màu pastel mới")
    private String description;

    @ValidEan13
    @Schema(description = "Optional updated 13-digit EAN-13 barcode", example = "4006381333931")
    private String barcode;

    @Schema(description = "Updated product status", example = "ACTIVE")
    private ProductStatus status;
}

