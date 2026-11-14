package com.pcm.productcodemanager.integration;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pcm.productcodemanager.dto.request.CreateProductRequest;
import com.pcm.productcodemanager.dto.request.LoginRequest;
import com.pcm.productcodemanager.dto.request.BarcodeLookupRequest;
import com.pcm.productcodemanager.entity.User;
import com.pcm.productcodemanager.entity.enums.Role;
import com.pcm.productcodemanager.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.hamcrest.Matchers.greaterThanOrEqualTo;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.notNullValue;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
public class ProductLifecycleIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    private static String jwtToken;
    private static String createdProductId;

    @BeforeEach
    void setupAdminUser() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = User.builder()
                    .username("admin")
                    .fullName("System Administrator")
                    .passwordHash(passwordEncoder.encode("Admin@123"))
                    .role(Role.ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
        }
    }

    @Test
    @Order(1)
    @DisplayName("IT-01: Unauthorized request without JWT returns 401")
    void test01_unauthorizedAccess() throws Exception {
        mockMvc.perform(get("/api/v1/products"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @Order(2)
    @DisplayName("IT-02: Admin login returns 200 and valid JWT token")
    void test02_adminLogin() throws Exception {
        LoginRequest loginRequest = new LoginRequest("admin", "Admin@123");

        MvcResult result = mockMvc.perform(post("/api/v1/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.accessToken", notNullValue()))
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        jwtToken = root.path("data").path("accessToken").asText();
    }

    @Test
    @Order(3)
    @DisplayName("IT-03: Create product with valid 6-digit code and EAN-13 returns 201")
    void test03_createProductSuccess() throws Exception {
        CreateProductRequest request = CreateProductRequest.builder()
                .productCode("880001")
                .name("Integration Test Product Alpha")
                .barcode("8938800010016")
                .description("Automated E2E product test")
                .build();

        MvcResult result = mockMvc.perform(post("/api/v1/products")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.productCode", is("880001")))
                .andExpect(jsonPath("$.data.barcode", is("8938800010016")))
                .andReturn();

        JsonNode root = objectMapper.readTree(result.getResponse().getContentAsString());
        createdProductId = root.path("data").path("id").asText();
    }

    @Test
    @Order(4)
    @DisplayName("IT-04: Conflict on duplicate 6-digit product code returns 409")
    void test04_duplicateProductCodeConflict() throws Exception {
        CreateProductRequest request = CreateProductRequest.builder()
                .productCode("880001")
                .name("Duplicate Code Product")
                .barcode("8938800010023")
                .build();

        mockMvc.perform(post("/api/v1/products")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @Order(5)
    @DisplayName("IT-05: Conflict on duplicate EAN-13 barcode returns 409")
    void test05_duplicateBarcodeConflict() throws Exception {
        CreateProductRequest request = CreateProductRequest.builder()
                .productCode("880002")
                .name("Duplicate Barcode Product")
                .barcode("8938800010016")
                .build();

        mockMvc.perform(post("/api/v1/products")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @Order(6)
    @DisplayName("IT-06: Barcode with invalid Modulo-10 checksum returns 400 Bad Request")
    void test06_invalidChecksumRejected() throws Exception {
        CreateProductRequest request = CreateProductRequest.builder()
                .productCode("880003")
                .name("Invalid Checksum Product")
                .barcode("8938800010012")
                .build();

        mockMvc.perform(post("/api/v1/products")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success", is(false)));
    }

    @Test
    @Order(7)
    @DisplayName("IT-07: Lookup existing barcode returns 200, found=true and product details")
    void test07_lookupBarcodeFound() throws Exception {
        BarcodeLookupRequest request = new BarcodeLookupRequest();
        request.setBarcode("8938800010016");
        request.setDeviceInfo("Integration Test Runner");

        mockMvc.perform(post("/api/v1/barcodes/lookup")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("FOUND")))
                .andExpect(jsonPath("$.data.product.productCode", is("880001")));
    }

    @Test
    @Order(8)
    @DisplayName("IT-08: Lookup unmapped barcode returns 200 and status NOT_FOUND")
    void test08_lookupBarcodeNotFound() throws Exception {
        BarcodeLookupRequest request = new BarcodeLookupRequest();
        request.setBarcode("8939999999991");
        request.setDeviceInfo("Integration Test Runner");

        mockMvc.perform(post("/api/v1/barcodes/lookup")
                        .header("Authorization", "Bearer " + jwtToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.status", is("NOT_FOUND")));
    }

    @Test
    @Order(9)
    @DisplayName("IT-09: Scan histories endpoint returns audit logs of both scan lookups")
    void test09_verifyScanHistoriesRecorded() throws Exception {
        mockMvc.perform(get("/api/v1/scan-histories?page=0&size=10")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.content", hasSize(greaterThanOrEqualTo(2))));
    }

    @Test
    @Order(10)
    @DisplayName("IT-10: Dashboard metrics reflect active products and recorded scans")
    void test10_verifyDashboardMetrics() throws Exception {
        mockMvc.perform(get("/api/v1/dashboard/stats")
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)))
                .andExpect(jsonPath("$.data.totalProducts", greaterThanOrEqualTo(1)))
                .andExpect(jsonPath("$.data.totalScans", greaterThanOrEqualTo(2)));
    }

    @Test
    @Order(11)
    @DisplayName("IT-11: Soft archive product removes active status and frees barcode mapping")
    void test11_archiveProduct() throws Exception {
        mockMvc.perform(delete("/api/v1/products/" + createdProductId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success", is(true)));

        mockMvc.perform(get("/api/v1/products/" + createdProductId)
                        .header("Authorization", "Bearer " + jwtToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.status", is("ARCHIVED")));
    }
}
