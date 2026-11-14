package com.pcm.productcodemanager.service;

import com.pcm.productcodemanager.dto.request.AssignBarcodeRequest;
import com.pcm.productcodemanager.dto.response.BarcodeLookupResponse;
import com.pcm.productcodemanager.dto.response.ProductResponse;

import java.util.UUID;

public interface BarcodeService {

    BarcodeLookupResponse lookupBarcode(String barcode, String deviceInfo, String ipAddress);

    ProductResponse assignBarcode(AssignBarcodeRequest request);

    ProductResponse removeBarcode(UUID productId);
}

