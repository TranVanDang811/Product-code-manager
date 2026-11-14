package com.pcm.productcodemanager.service.impl;

import com.pcm.productcodemanager.common.PageResponse;
import com.pcm.productcodemanager.dto.response.ScanHistoryResponse;
import com.pcm.productcodemanager.entity.ScanHistory;
import com.pcm.productcodemanager.entity.enums.ScanStatus;
import com.pcm.productcodemanager.exception.ErrorCode;
import com.pcm.productcodemanager.exception.ResourceNotFoundException;
import com.pcm.productcodemanager.mapper.ScanHistoryMapper;
import com.pcm.productcodemanager.repository.ScanHistoryRepository;
import com.pcm.productcodemanager.service.ScanHistoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScanHistoryServiceImpl implements ScanHistoryService {

    private final ScanHistoryRepository scanHistoryRepository;
    private final ScanHistoryMapper scanHistoryMapper;

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ScanHistoryResponse> getScanHistories(ScanStatus status, String barcode, Pageable pageable) {
        log.debug("Fetching scan histories with status: {}, barcode: {}, pageable: {}", status, barcode, pageable);
        Page<ScanHistory> page = scanHistoryRepository.searchHistory(status, barcode, pageable);
        Page<ScanHistoryResponse> responsePage = page.map(scanHistoryMapper::toResponse);
        return PageResponse.from(responsePage);
    }

    @Override
    @Transactional(readOnly = true)
    public ScanHistoryResponse getScanHistoryById(UUID id) {
        log.debug("Fetching scan history by id: {}", id);
        ScanHistory history = scanHistoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("ScanHistory", "id", id));
        return scanHistoryMapper.toResponse(history);
    }
}
