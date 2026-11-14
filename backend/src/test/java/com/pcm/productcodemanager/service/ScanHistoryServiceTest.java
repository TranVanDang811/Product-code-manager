package com.pcm.productcodemanager.service;

import com.pcm.productcodemanager.common.PageResponse;
import com.pcm.productcodemanager.dto.response.ScanHistoryResponse;
import com.pcm.productcodemanager.entity.Product;
import com.pcm.productcodemanager.entity.ScanHistory;
import com.pcm.productcodemanager.entity.enums.ScanStatus;
import com.pcm.productcodemanager.exception.ResourceNotFoundException;
import com.pcm.productcodemanager.mapper.ScanHistoryMapper;
import com.pcm.productcodemanager.repository.ScanHistoryRepository;
import com.pcm.productcodemanager.service.impl.ScanHistoryServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ScanHistoryServiceTest {

    @Mock
    private ScanHistoryRepository scanHistoryRepository;

    @Mock
    private ScanHistoryMapper scanHistoryMapper;

    @InjectMocks
    private ScanHistoryServiceImpl scanHistoryService;

    private ScanHistory sampleHistory;
    private ScanHistoryResponse sampleResponse;
    private UUID historyId;

    @BeforeEach
    void setUp() {
        historyId = UUID.randomUUID();
        Product product = Product.builder()
                .productCode("001234")
                .name("Stabilo Boss Highlighter")
                .build();
        product.setId(UUID.randomUUID());

        sampleHistory = ScanHistory.builder()
                .barcodeScanned("4006381333931")
                .status(ScanStatus.FOUND)
                .product(product)
                .scannedAt(LocalDateTime.now())
                .deviceInfo("Chrome 120 / Windows")
                .ipAddress("127.0.0.1")
                .build();
        sampleHistory.setId(historyId);

        sampleResponse = ScanHistoryResponse.builder()
                .id(historyId)
                .barcodeScanned("4006381333931")
                .status(ScanStatus.FOUND)
                .productId(product.getId())
                .productCode("001234")
                .productName("Stabilo Boss Highlighter")
                .deviceInfo("Chrome 120 / Windows")
                .ipAddress("127.0.0.1")
                .scannedAt(sampleHistory.getScannedAt())
                .build();
    }

    @Test
    @DisplayName("getScanHistories - Should return paged scan history responses")
    void testGetScanHistories() {
        Pageable pageable = PageRequest.of(0, 10);
        Page<ScanHistory> page = new PageImpl<>(List.of(sampleHistory), pageable, 1);

        when(scanHistoryRepository.searchHistory(eq(ScanStatus.FOUND), eq("4006"), eq(pageable))).thenReturn(page);
        when(scanHistoryMapper.toResponse(sampleHistory)).thenReturn(sampleResponse);

        PageResponse<ScanHistoryResponse> result = scanHistoryService.getScanHistories(ScanStatus.FOUND, "4006", pageable);

        assertThat(result).isNotNull();
        assertThat(result.getContent()).hasSize(1);
        assertThat(result.getContent().get(0).getBarcodeScanned()).isEqualTo("4006381333931");
        assertThat(result.getContent().get(0).getStatus()).isEqualTo(ScanStatus.FOUND);
        assertThat(result.getTotalElements()).isEqualTo(1);
    }

    @Test
    @DisplayName("getScanHistoryById - Success")
    void testGetScanHistoryById_Success() {
        when(scanHistoryRepository.findById(historyId)).thenReturn(Optional.of(sampleHistory));
        when(scanHistoryMapper.toResponse(sampleHistory)).thenReturn(sampleResponse);

        ScanHistoryResponse result = scanHistoryService.getScanHistoryById(historyId);

        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(historyId);
        assertThat(result.getProductCode()).isEqualTo("001234");
        verify(scanHistoryRepository).findById(historyId);
    }

    @Test
    @DisplayName("getScanHistoryById - Not Found throws ResourceNotFoundException")
    void testGetScanHistoryById_NotFound() {
        UUID unknownId = UUID.randomUUID();
        when(scanHistoryRepository.findById(unknownId)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> scanHistoryService.getScanHistoryById(unknownId))
                .isInstanceOf(ResourceNotFoundException.class)
                .hasMessageContaining("ScanHistory not found with id:");
    }
}
