package com.pcm.productcodemanager.controller;

import com.pcm.productcodemanager.common.ApiResponse;
import com.pcm.productcodemanager.dto.request.AssignBarcodeRequest;
import com.pcm.productcodemanager.dto.request.BarcodeLookupRequest;
import com.pcm.productcodemanager.dto.response.BarcodeLookupResponse;
import com.pcm.productcodemanager.dto.response.ProductResponse;
import com.pcm.productcodemanager.service.BarcodeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/barcodes")
@RequiredArgsConstructor
@Tag(name = "Barcode Management & Lookup", description = "Endpoints for EAN-13 barcode scanning, lookup, assignment and unlinking")
public class BarcodeController {

    private final BarcodeService barcodeService;

    @PostMapping("/lookup")
    @Operation(summary = "Lookup product by scanned barcode (Public)", description = "Public endpoint for Web & Mobile camera scanning. Automatically logs scan history with FOUND, NOT_FOUND, or INVALID status")
    public ResponseEntity<ApiResponse<BarcodeLookupResponse>> lookupBarcode(
            @Valid @RequestBody BarcodeLookupRequest request,
            HttpServletRequest httpRequest
    ) {
        String ipAddress = extractClientIp(httpRequest);
        BarcodeLookupResponse response = barcodeService.lookupBarcode(
                request.getBarcode(),
                request.getDeviceInfo(),
                ipAddress
        );
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @GetMapping("/lookup/{barcode}")
    @Operation(summary = "Lookup product by barcode path variable (Public)", description = "Convenience GET endpoint for rapid barcode queries")
    public ResponseEntity<ApiResponse<BarcodeLookupResponse>> lookupBarcodeGet(
            @PathVariable String barcode,
            HttpServletRequest httpRequest
    ) {
        String ipAddress = extractClientIp(httpRequest);
        String deviceInfo = httpRequest.getHeader("User-Agent");
        BarcodeLookupResponse response = barcodeService.lookupBarcode(barcode, deviceInfo, ipAddress);
        return ResponseEntity.ok(ApiResponse.success(response.getMessage(), response));
    }

    @PostMapping("/assign")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Assign or update barcode for a product (Admin only)", description = "Binds an EAN-13 barcode to a product (ensures 1-to-1 relationship)")
    public ResponseEntity<ApiResponse<ProductResponse>> assignBarcode(@Valid @RequestBody AssignBarcodeRequest request) {
        ProductResponse response = barcodeService.assignBarcode(request);
        return ResponseEntity.ok(ApiResponse.success("Barcode assigned successfully", response));
    }

    @DeleteMapping("/{productId}")
    @SecurityRequirement(name = "bearerAuth")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Unlink barcode from product (Admin only)", description = "Removes the barcode mapping from a product")
    public ResponseEntity<ApiResponse<ProductResponse>> removeBarcode(@PathVariable UUID productId) {
        ProductResponse response = barcodeService.removeBarcode(productId);
        return ResponseEntity.ok(ApiResponse.success("Barcode unlinked successfully", response));
    }

    private String extractClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null || xfHeader.isEmpty() || !xfHeader.contains(",")) {
            return xfHeader != null && !xfHeader.isEmpty() ? xfHeader : request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }
}

