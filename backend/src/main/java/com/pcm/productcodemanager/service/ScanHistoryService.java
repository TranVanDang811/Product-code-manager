package com.pcm.productcodemanager.service;

import com.pcm.productcodemanager.common.PageResponse;
import com.pcm.productcodemanager.dto.response.ScanHistoryResponse;
import com.pcm.productcodemanager.entity.enums.ScanStatus;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface ScanHistoryService {

    PageResponse<ScanHistoryResponse> getScanHistories(ScanStatus status, String barcode, Pageable pageable);

    ScanHistoryResponse getScanHistoryById(UUID id);
}

