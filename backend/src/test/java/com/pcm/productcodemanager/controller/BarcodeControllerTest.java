package com.pcm.productcodemanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pcm.productcodemanager.dto.request.AssignBarcodeRequest;
import com.pcm.productcodemanager.dto.request.BarcodeLookupRequest;
import com.pcm.productcodemanager.dto.response.BarcodeLookupResponse;
import com.pcm.productcodemanager.dto.response.ProductResponse;
import com.pcm.productcodemanager.entity.enums.ScanStatus;
import com.pcm.productcodemanager.service.BarcodeService;
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
import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class BarcodeControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private BarcodeService barcodeService;

    @Test
    @DisplayName("POST /api/v1/barcodes/lookup - Should successfully lookup barcode without authentication (Public)")
    void testLookupBarcodePublic() throws Exception {
        BarcodeLookupRequest request = BarcodeLookupRequest.builder()
                .barcode("4006381333931")
                .deviceInfo("Chrome 122")
                .build();

        ProductResponse productResponse = ProductResponse.builder()
                .id(UUID.randomUUID())
                .productCode("001234")
                .name("Stabilo Boss")
                .barcode("4006381333931")
                .build();

        BarcodeLookupResponse lookupResponse = BarcodeLookupResponse.builder()
                .status(ScanStatus.FOUND)
                .barcodeScanned("4006381333931")
                .product(productResponse)
                .message("Tìm thấy sản phẩm")
                .scannedAt(LocalDateTime.now())
                .build();

        when(barcodeService.lookupBarcode(eq("4006381333931"), eq("Chrome 122"), any()))
                .thenReturn(lookupResponse);

        mockMvc.perform(post("/api/v1/barcodes/lookup")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("FOUND"))
                .andExpect(jsonPath("$.data.product.productCode").value("001234"));
    }

    @Test
    @DisplayName("GET /api/v1/barcodes/lookup/{barcode} - Should successfully lookup via GET (Public)")
    void testLookupBarcodeGet() throws Exception {
        BarcodeLookupResponse lookupResponse = BarcodeLookupResponse.builder()
                .status(ScanStatus.NOT_FOUND)
                .barcodeScanned("8938505974019")
                .product(null)
                .message("Không tìm thấy sản phẩm")
                .scannedAt(LocalDateTime.now())
                .build();

        when(barcodeService.lookupBarcode(eq("8938505974019"), any(), any()))
                .thenReturn(lookupResponse);

        mockMvc.perform(get("/api/v1/barcodes/lookup/{barcode}", "8938505974019"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("NOT_FOUND"));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    @DisplayName("POST /api/v1/barcodes/assign - Should assign barcode with ADMIN authorization")
    void testAssignBarcodeAdmin() throws Exception {
        UUID productId = UUID.randomUUID();
        AssignBarcodeRequest request = AssignBarcodeRequest.builder()
                .productId(productId)
                .barcode("4006381333931")
                .build();

        ProductResponse productResponse = ProductResponse.builder()
                .id(productId)
                .productCode("001234")
                .barcode("4006381333931")
                .build();

        when(barcodeService.assignBarcode(any(AssignBarcodeRequest.class))).thenReturn(productResponse);

        mockMvc.perform(post("/api/v1/barcodes/assign")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.barcode").value("4006381333931"));
    }
}

