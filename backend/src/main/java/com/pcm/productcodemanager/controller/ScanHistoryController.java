package com.pcm.productcodemanager.controller;

import com.pcm.productcodemanager.common.ApiResponse;
import com.pcm.productcodemanager.common.PageResponse;
import com.pcm.productcodemanager.dto.response.ScanHistoryResponse;
import com.pcm.productcodemanager.entity.enums.ScanStatus;
import com.pcm.productcodemanager.service.ScanHistoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/scan-histories")
@RequiredArgsConstructor
@Tag(name = "Scan History", description = "Endpoints for auditing and querying scan history records")
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
public class ScanHistoryController {

    private final ScanHistoryService scanHistoryService;

    @GetMapping
    @Operation(summary = "Search scan histories", description = "Query paginated scan history entries filtered optionally by status and barcode substring")
    public ResponseEntity<ApiResponse<PageResponse<ScanHistoryResponse>>> getScanHistories(
            @RequestParam(required = false) ScanStatus status,
            @RequestParam(required = false) String barcode,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "scannedAt") String sortBy,
            @RequestParam(defaultValue = "desc") String direction
    ) {
        Sort sort = direction.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        PageResponse<ScanHistoryResponse> response = scanHistoryService.getScanHistories(status, barcode, pageable);
        return ResponseEntity.ok(ApiResponse.success("Scan histories retrieved successfully", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get scan history by ID", description = "Fetch detailed information for a specific scan history entry")
    public ResponseEntity<ApiResponse<ScanHistoryResponse>> getScanHistoryById(@PathVariable UUID id) {
        ScanHistoryResponse response = scanHistoryService.getScanHistoryById(id);
        return ResponseEntity.ok(ApiResponse.success("Scan history details retrieved successfully", response));
    }
}
