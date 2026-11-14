package com.pcm.productcodemanager.controller;

import com.pcm.productcodemanager.dto.response.DailyScanCount;
import com.pcm.productcodemanager.dto.response.DashboardStatsResponse;
import com.pcm.productcodemanager.service.DashboardService;
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

import java.time.LocalDate;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
class DashboardControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockitoBean
    private DashboardService dashboardService;

    @Test
    @DisplayName("GET /api/v1/dashboard/stats - Should return aggregate statistics")
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void testGetDashboardStats() throws Exception {
        DashboardStatsResponse stats = DashboardStatsResponse.builder()
                .totalProducts(50L)
                .activeProducts(45L)
                .inactiveProducts(3L)
                .archivedProducts(2L)
                .totalScans(100L)
                .foundScans(90L)
                .notFoundScans(7L)
                .invalidScans(3L)
                .foundRate(90.0)
                .dailyScanStats(List.of(
                        DailyScanCount.builder()
                                .date(LocalDate.now())
                                .total(10)
                                .found(9)
                                .notFound(1)
                                .invalid(0)
                                .build()
                ))
                .recentScans(List.of())
                .build();

        when(dashboardService.getDashboardStats()).thenReturn(stats);

        mockMvc.perform(get("/api/v1/dashboard/stats")
                        .accept(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true))
                .andExpect(jsonPath("$.data.totalProducts").value(50))
                .andExpect(jsonPath("$.data.activeProducts").value(45))
                .andExpect(jsonPath("$.data.totalScans").value(100))
                .andExpect(jsonPath("$.data.foundRate").value(90.0))
                .andExpect(jsonPath("$.data.dailyScanStats[0].total").value(10));
    }
}

