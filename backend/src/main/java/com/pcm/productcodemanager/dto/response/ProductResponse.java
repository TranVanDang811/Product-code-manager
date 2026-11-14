package com.pcm.productcodemanager.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.pcm.productcodemanager.entity.enums.ProductStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Product details response")
public class ProductResponse {

    @Schema(description = "Product unique identifier")
    private UUID id;

    @Schema(description = "Internal 6-digit product code", example = "001234")
    private String productCode;

    @Schema(description = "Product display name")
    private String name;

    @Schema(description = "Product description")
    private String description;

    @Schema(description = "Cloudinary image secure URL")
    private String imageUrl;

    @Schema(description = "Cloudinary asset public ID")
    private String imagePublicId;

    @Schema(description = "Current lifecycle status (ACTIVE, INACTIVE, ARCHIVED)")
    private ProductStatus status;

    @Schema(description = "Associated 13-digit EAN-13 barcode", example = "4006381333931")
    private String barcode;

    @Schema(description = "Admin who created the product")
    private UserResponse createdBy;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Creation timestamp")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Last update timestamp")
    private LocalDateTime updatedAt;
}

