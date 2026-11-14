package com.pcm.productcodemanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pcm.productcodemanager.common.PageResponse;
import com.pcm.productcodemanager.dto.response.ScanHistoryResponse;
import com.pcm.productcodemanager.entity.enums.ScanStatus;
import com.pcm.productcodemanager.service.ScanHistoryService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class ScanHistoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ScanHistoryService scanHistoryService;

    @Test
    @DisplayName("GET /api/v1/scan-histories - Should return paged scan history")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testGetScanHistories() throws Exception {
        UUID id = UUID.randomUUID();
        ScanHistoryResponse response = ScanHistoryResponse.builder()
                .id(id)
                .barcodeScanned("4006381333931")
                .status(ScanStatus.FOUND)
                .productCode("001234")
                .productName("Stabilo Boss Highlighter")
                .scannedAt(LocalDateTime.now())
                .build();

        PageResponse<ScanHistoryResponse> pageResponse = PageResponse.<ScanHistoryResponse>builder()
                .content(List.of(response))
                .pageNumber(0)
                .pageSize(10)
                .totalElements(1)
                .totalPages(1)
                .isLast(true)
                .build();

        when(scanHistoryService.getScanHistories(eq(ScanStatus.FOUND), eq("4006"), any())).thenReturn(pageResponse);

        mockMvc.perform(get("/api/v1/scan-histories")
                        .param("status", "FOUND")
                        .param("barcode", "4006")
                        .param("page", "0")
                        .param("size", "10")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.content[0].barcodeScanned").value("4006381333931"))
                .andExpect(jsonPath("$.data.content[0].status").value("FOUND"))
                .andExpect(jsonPath("$.data.content[0].productCode").value("001234"));
    }

    @Test
    @DisplayName("GET /api/v1/scan-histories/{id} - Should return scan history detail")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testGetScanHistoryById() throws Exception {
        UUID id = UUID.randomUUID();
        ScanHistoryResponse response = ScanHistoryResponse.builder()
                .id(id)
                .barcodeScanned("4006381333931")
                .status(ScanStatus.FOUND)
                .productCode("001234")
                .productName("Stabilo Boss Highlighter")
                .scannedAt(LocalDateTime.now())
                .build();

        when(scanHistoryService.getScanHistoryById(id)).thenReturn(response);

        mockMvc.perform(get("/api/v1/scan-histories/{id}", id)
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.id").value(id.toString()))
                .andExpect(jsonPath("$.data.barcodeScanned").value("4006381333931"));
    }
}

