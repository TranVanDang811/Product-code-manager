package com.pcm.productcodemanager.service;

import com.pcm.productcodemanager.dto.response.DashboardStatsResponse;
import com.pcm.productcodemanager.dto.response.ScanHistoryResponse;
import com.pcm.productcodemanager.entity.ScanHistory;
import com.pcm.productcodemanager.entity.enums.ProductStatus;
import com.pcm.productcodemanager.entity.enums.ScanStatus;
import com.pcm.productcodemanager.mapper.ScanHistoryMapper;
import com.pcm.productcodemanager.repository.ProductRepository;
import com.pcm.productcodemanager.repository.ScanHistoryRepository;
import com.pcm.productcodemanager.service.impl.DashboardServiceImpl;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class DashboardServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ScanHistoryRepository scanHistoryRepository;

    @Mock
    private ScanHistoryMapper scanHistoryMapper;

    @InjectMocks
    private DashboardServiceImpl dashboardService;

    @Test
    @DisplayName("getDashboardStats - Should return accurate aggregated statistics")
    void testGetDashboardStats_Success() {
        // Mock product counts
        when(productRepository.count()).thenReturn(100L);
        when(productRepository.countByStatus(ProductStatus.ACTIVE)).thenReturn(80L);
        when(productRepository.countByStatus(ProductStatus.INACTIVE)).thenReturn(15L);
        when(productRepository.countByStatus(ProductStatus.ARCHIVED)).thenReturn(5L);

        // Mock scan counts
        when(scanHistoryRepository.count()).thenReturn(200L);
        when(scanHistoryRepository.countByStatus(ScanStatus.FOUND)).thenReturn(150L);
        when(scanHistoryRepository.countByStatus(ScanStatus.NOT_FOUND)).thenReturn(30L);
        when(scanHistoryRepository.countByStatus(ScanStatus.INVALID)).thenReturn(20L);

        // Mock 7-day scans
        ScanHistory todayFound = ScanHistory.builder()
                .barcodeScanned("4006381333931")
                .status(ScanStatus.FOUND)
                .scannedAt(LocalDateTime.now())
                .build();
        ScanHistory todayInvalid = ScanHistory.builder()
                .barcodeScanned("12345")
                .status(ScanStatus.INVALID)
                .scannedAt(LocalDateTime.now())
                .build();

        when(scanHistoryRepository.findScansSince(any(LocalDateTime.class)))
                .thenReturn(List.of(todayFound, todayInvalid));

        // Mock recent 10 scans
        ScanHistory recent1 = ScanHistory.builder()
                .barcodeScanned("4006381333931")
                .status(ScanStatus.FOUND)
                .scannedAt(LocalDateTime.now())
                .build();
        recent1.setId(UUID.randomUUID());

        when(scanHistoryRepository.findTop10ByOrderByScannedAtDesc()).thenReturn(List.of(recent1));
        when(scanHistoryMapper.toResponse(recent1)).thenReturn(ScanHistoryResponse.builder()
                .id(recent1.getId())
                .barcodeScanned(recent1.getBarcodeScanned())
                .status(recent1.getStatus())
                .scannedAt(recent1.getScannedAt())
                .build());

        DashboardStatsResponse response = dashboardService.getDashboardStats();

        assertThat(response).isNotNull();
        assertThat(response.getTotalProducts()).isEqualTo(100L);
        assertThat(response.getActiveProducts()).isEqualTo(80L);
        assertThat(response.getInactiveProducts()).isEqualTo(15L);
        assertThat(response.getArchivedProducts()).isEqualTo(5L);

        assertThat(response.getTotalScans()).isEqualTo(200L);
        assertThat(response.getFoundScans()).isEqualTo(150L);
        assertThat(response.getNotFoundScans()).isEqualTo(30L);
        assertThat(response.getInvalidScans()).isEqualTo(20L);
        assertThat(response.getFoundRate()).isEqualTo(75.0); // 150/200 * 100

        assertThat(response.getDailyScanStats()).hasSize(7);
        assertThat(response.getRecentScans()).hasSize(1);
    }

    @Test
    @DisplayName("getDashboardStats - When total scans is zero, foundRate should be 0.0")
    void testGetDashboardStats_ZeroScans() {
        when(productRepository.count()).thenReturn(0L);
        when(productRepository.countByStatus(ProductStatus.ACTIVE)).thenReturn(0L);
        when(productRepository.countByStatus(ProductStatus.INACTIVE)).thenReturn(0L);
        when(productRepository.countByStatus(ProductStatus.ARCHIVED)).thenReturn(0L);

        when(scanHistoryRepository.count()).thenReturn(0L);
        when(scanHistoryRepository.countByStatus(ScanStatus.FOUND)).thenReturn(0L);
        when(scanHistoryRepository.countByStatus(ScanStatus.NOT_FOUND)).thenReturn(0L);
        when(scanHistoryRepository.countByStatus(ScanStatus.INVALID)).thenReturn(0L);

        when(scanHistoryRepository.findScansSince(any(LocalDateTime.class))).thenReturn(List.of());
        when(scanHistoryRepository.findTop10ByOrderByScannedAtDesc()).thenReturn(List.of());

        DashboardStatsResponse response = dashboardService.getDashboardStats();

        assertThat(response).isNotNull();
        assertThat(response.getTotalScans()).isEqualTo(0L);
        assertThat(response.getFoundRate()).isEqualTo(0.0);
        assertThat(response.getDailyScanStats()).hasSize(7);
        assertThat(response.getRecentScans()).isEmpty();
    }
}

