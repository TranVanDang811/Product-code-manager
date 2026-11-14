package com.pcm.productcodemanager.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.pcm.productcodemanager.entity.enums.ScanStatus;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Barcode lookup result and scan audit payload")
public class BarcodeLookupResponse {

    @Schema(description = "Lookup status (FOUND, NOT_FOUND, INVALID)", example = "FOUND")
    private ScanStatus status;

    @Schema(description = "Raw scanned barcode received", example = "4006381333931")
    private String barcodeScanned;

    @Schema(description = "Mapped product details (null if NOT_FOUND or INVALID)")
    private ProductResponse product;

    @Schema(description = "Human-readable diagnostic status message")
    private String message;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Timestamp when scan occurred")
    private LocalDateTime scannedAt;
}

