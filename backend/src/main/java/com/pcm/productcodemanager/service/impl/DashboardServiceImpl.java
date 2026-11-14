package com.pcm.productcodemanager.service.impl;

import com.pcm.productcodemanager.dto.response.DailyScanCount;
import com.pcm.productcodemanager.dto.response.DashboardStatsResponse;
import com.pcm.productcodemanager.dto.response.ScanHistoryResponse;
import com.pcm.productcodemanager.entity.ScanHistory;
import com.pcm.productcodemanager.entity.enums.ProductStatus;
import com.pcm.productcodemanager.entity.enums.ScanStatus;
import com.pcm.productcodemanager.mapper.ScanHistoryMapper;
import com.pcm.productcodemanager.repository.ProductRepository;
import com.pcm.productcodemanager.repository.ScanHistoryRepository;
import com.pcm.productcodemanager.service.DashboardService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class DashboardServiceImpl implements DashboardService {

    private final ProductRepository productRepository;
    private final ScanHistoryRepository scanHistoryRepository;
    private final ScanHistoryMapper scanHistoryMapper;

    @Override
    @Transactional(readOnly = true)
    public DashboardStatsResponse getDashboardStats() {
        log.debug("Generating dashboard aggregate statistics");

        // 1. Product counts
        long totalProducts = productRepository.count();
        long activeProducts = productRepository.countByStatus(ProductStatus.ACTIVE);
        long inactiveProducts = productRepository.countByStatus(ProductStatus.INACTIVE);
        long archivedProducts = productRepository.countByStatus(ProductStatus.ARCHIVED);

        // 2. Scan totals
        long totalScans = scanHistoryRepository.count();
        long foundScans = scanHistoryRepository.countByStatus(ScanStatus.FOUND);
        long notFoundScans = scanHistoryRepository.countByStatus(ScanStatus.NOT_FOUND);
        long invalidScans = scanHistoryRepository.countByStatus(ScanStatus.INVALID);

        double foundRate = totalScans > 0
                ? Math.round(((double) foundScans / totalScans * 100.0) * 10.0) / 10.0
                : 0.0;

        // 3. Past 7 days scan breakdown
        LocalDate today = LocalDate.now();
        LocalDate sevenDaysAgo = today.minusDays(6);
        LocalDateTime rangeStart = sevenDaysAgo.atStartOfDay();

        List<ScanHistory> pastWeekScans = scanHistoryRepository.findScansSince(rangeStart);

        Map<LocalDate, List<ScanHistory>> scansByDate = pastWeekScans.stream()
                .filter(s -> s.getScannedAt() != null)
                .collect(Collectors.groupingBy(s -> s.getScannedAt().toLocalDate()));

        List<DailyScanCount> dailyStats = new ArrayList<>(7);
        for (int i = 0; i < 7; i++) {
            LocalDate currentDay = sevenDaysAgo.plusDays(i);
            List<ScanHistory> dayScans = scansByDate.getOrDefault(currentDay, List.of());

            long dayTotal = dayScans.size();
            long dayFound = dayScans.stream().filter(s -> s.getStatus() == ScanStatus.FOUND).count();
            long dayNotFound = dayScans.stream().filter(s -> s.getStatus() == ScanStatus.NOT_FOUND).count();
            long dayInvalid = dayScans.stream().filter(s -> s.getStatus() == ScanStatus.INVALID).count();

            dailyStats.add(DailyScanCount.builder()
                    .date(currentDay)
                    .total(dayTotal)
                    .found(dayFound)
                    .notFound(dayNotFound)
                    .invalid(dayInvalid)
                    .build());
        }

        // 4. Most recent 10 scans
        List<ScanHistoryResponse> recentScans = scanHistoryRepository.findTop10ByOrderByScannedAtDesc().stream()
                .map(scanHistoryMapper::toResponse)
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalProducts(totalProducts)
                .activeProducts(activeProducts)
                .inactiveProducts(inactiveProducts)
                .archivedProducts(archivedProducts)
                .totalScans(totalScans)
                .foundScans(foundScans)
                .notFoundScans(notFoundScans)
                .invalidScans(invalidScans)
                .foundRate(foundRate)
                .dailyScanStats(dailyStats)
                .recentScans(recentScans)
                .build();
    }
}

