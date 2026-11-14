package com.pcm.productcodemanager.mapper;

import com.pcm.productcodemanager.dto.response.ScanHistoryResponse;
import com.pcm.productcodemanager.entity.ScanHistory;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface ScanHistoryMapper {

    @Mapping(target = "productId", source = "product.id")
    @Mapping(target = "productCode", source = "product.productCode")
    @Mapping(target = "productName", source = "product.name")
    @Mapping(target = "productImageUrl", source = "product.imageUrl")
    @Mapping(target = "scannedByUsername", source = "scannedBy.username")
    ScanHistoryResponse toResponse(ScanHistory scanHistory);
}

