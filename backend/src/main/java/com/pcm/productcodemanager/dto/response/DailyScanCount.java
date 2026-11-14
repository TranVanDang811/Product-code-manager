package com.pcm.productcodemanager.dto.response;

import com.fasterxml.jackson.annotation.JsonFormat;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Schema(description = "Scan statistics aggregated by date")
public class DailyScanCount {

    @JsonFormat(pattern = "yyyy-MM-dd")
    @Schema(description = "Date of aggregation", example = "2026-11-13")
    private LocalDate date;

    @Schema(description = "Total scans on this date", example = "120")
    private long total;

    @Schema(description = "Total FOUND scans on this date", example = "105")
    private long found;

    @Schema(description = "Total NOT_FOUND scans on this date", example = "10")
    private long notFound;

    @Schema(description = "Total INVALID scans on this date", example = "5")
    private long invalid;
}

