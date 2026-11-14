package com.pcm.productcodemanager.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Aggregated system statistics for Admin Dashboard")
public class DashboardStatsResponse {

    @Schema(description = "Total products in database", example = "150")
    private long totalProducts;

    @Schema(description = "Total active products", example = "140")
    private long activeProducts;

    @Schema(description = "Total inactive products", example = "5")
    private long inactiveProducts;

    @Schema(description = "Total archived products", example = "5")
    private long archivedProducts;

    @Schema(description = "Total scan lookups recorded", example = "1250")
    private long totalScans;

    @Schema(description = "Total successful FOUND scans", example = "1100")
    private long foundScans;

    @Schema(description = "Total NOT_FOUND scans", example = "100")
    private long notFoundScans;

    @Schema(description = "Total INVALID scans (malformed / checksum failed)", example = "50")
    private long invalidScans;

    @Schema(description = "Percentage of scans that successfully found a product", example = "88.0")
    private double foundRate;

    @Schema(description = "Daily breakdown of scans for the past 7 days")
    private List<DailyScanCount> dailyScanStats;

    @Schema(description = "Most recent 10 scan operations")
    private List<ScanHistoryResponse> recentScans;
}

