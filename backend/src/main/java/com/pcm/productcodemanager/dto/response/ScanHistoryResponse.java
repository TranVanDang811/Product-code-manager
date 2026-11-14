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
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Scan history record response")
public class ScanHistoryResponse {

    @Schema(description = "Scan history unique identifier")
    private UUID id;

    @Schema(description = "Scanned barcode input string", example = "4006381333931")
    private String barcodeScanned;

    @Schema(description = "Scan lookup outcome status (FOUND, NOT_FOUND, INVALID)", example = "FOUND")
    private ScanStatus status;

    @Schema(description = "Associated product ID if FOUND")
    private UUID productId;

    @Schema(description = "Associated product 6-digit internal code if FOUND", example = "001234")
    private String productCode;

    @Schema(description = "Associated product name if FOUND", example = "Bút dạ quang Stabilo Boss")
    private String productName;

    @Schema(description = "Associated product image URL if available")
    private String productImageUrl;

    @Schema(description = "Username of the admin who performed the scan if logged in")
    private String scannedByUsername;

    @Schema(description = "Device or platform information of the client scanner")
    private String deviceInfo;

    @Schema(description = "IP address of the client scanner")
    private String ipAddress;

    @Schema(description = "Diagnostic notes or error reason")
    private String notes;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    @Schema(description = "Timestamp when the scan occurred")
    private LocalDateTime scannedAt;
}

