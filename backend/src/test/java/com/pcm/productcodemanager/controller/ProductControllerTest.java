package com.pcm.productcodemanager.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.pcm.productcodemanager.dto.request.CreateProductRequest;
import com.pcm.productcodemanager.dto.response.ProductResponse;
import com.pcm.productcodemanager.entity.enums.ProductStatus;
import com.pcm.productcodemanager.service.ProductService;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@WithMockUser(username = "admin", roles = {"ADMIN"})
class ProductControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockitoBean
    private ProductService productService;

    @Test
    @DisplayName("POST /api/v1/products - Should create product when valid 6-digit code and EAN-13 provided")
    void testCreateProductSuccess() throws Exception {
        UUID productId = UUID.randomUUID();
        CreateProductRequest request = CreateProductRequest.builder()
                .productCode("001234")
                .name("Test Product")
                .barcode("4006381333931")
                .status(ProductStatus.ACTIVE)
                .build();

        ProductResponse response = ProductResponse.builder()
                .id(productId)
                .productCode("001234")
                .name("Test Product")
                .barcode("4006381333931")
                .status(ProductStatus.ACTIVE)
                .build();

        when(productService.createProduct(any(CreateProductRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.productCode").value("001234"))
                .andExpect(jsonPath("$.data.barcode").value("4006381333931"));
    }

    @Test
    @DisplayName("POST /api/v1/products - Should reject invalid 5-digit code")
    void testCreateProductInvalidCode() throws Exception {
        CreateProductRequest request = CreateProductRequest.builder()
                .productCode("12345") // Only 5 digits
                .name("Test Product")
                .build();

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("POST /api/v1/products - Should reject barcode with bad checksum")
    void testCreateProductInvalidBarcodeChecksum() throws Exception {
        CreateProductRequest request = CreateProductRequest.builder()
                .productCode("001234")
                .name("Test Product")
                .barcode("8938505974015") // Checksum is 9, provided 5
                .build();

        mockMvc.perform(post("/api/v1/products")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @DisplayName("DELETE /api/v1/products/{id} - Should archive product instead of physical delete (BR-17)")
    void testArchiveProduct() throws Exception {
        UUID productId = UUID.randomUUID();
        ProductResponse response = ProductResponse.builder()
                .id(productId)
                .productCode("001234")
                .name("Test Product")
                .status(ProductStatus.ARCHIVED)
                .build();

        when(productService.archiveProduct(productId)).thenReturn(response);

        mockMvc.perform(delete("/api/v1/products/{id}", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.status").value("ARCHIVED"));
    }

    @Test
    @DisplayName("POST /api/v1/products/{id}/image - Should upload product avatar image (BR-10, BR-11)")
    void testUploadProductImage() throws Exception {
        UUID productId = UUID.randomUUID();
        MockMultipartFile file = new MockMultipartFile(
                "file", "test.jpg", "image/jpeg", "image bytes".getBytes()
        );

        ProductResponse response = ProductResponse.builder()
                .id(productId)
                .productCode("001234")
                .name("Test Product")
                .imageUrl("https://res.cloudinary.com/dltv44gle/image/upload/v1/products/test.jpg")
                .imagePublicId("products/test")
                .build();

        when(productService.uploadProductImage(eq(productId), any())).thenReturn(response);

        mockMvc.perform(multipart("/api/v1/products/{id}/image", productId)
                        .file(file))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.imageUrl").value("https://res.cloudinary.com/dltv44gle/image/upload/v1/products/test.jpg"));
    }

    @Test
    @DisplayName("DELETE /api/v1/products/{id}/image - Should delete product avatar image")
    void testDeleteProductImage() throws Exception {
        UUID productId = UUID.randomUUID();
        ProductResponse response = ProductResponse.builder()
                .id(productId)
                .productCode("001234")
                .imageUrl(null)
                .imagePublicId(null)
                .build();

        when(productService.deleteProductImage(productId)).thenReturn(response);

        mockMvc.perform(delete("/api/v1/products/{id}/image", productId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.imageUrl").doesNotExist());
    }
}
