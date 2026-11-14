package com.pcm.productcodemanager.service.impl;

import com.pcm.productcodemanager.dto.request.AssignBarcodeRequest;
import com.pcm.productcodemanager.dto.response.BarcodeLookupResponse;
import com.pcm.productcodemanager.dto.response.ProductResponse;
import com.pcm.productcodemanager.entity.Product;
import com.pcm.productcodemanager.entity.ProductBarcode;
import com.pcm.productcodemanager.entity.ScanHistory;
import com.pcm.productcodemanager.entity.User;
import com.pcm.productcodemanager.entity.enums.ScanStatus;
import com.pcm.productcodemanager.exception.DuplicateResourceException;
import com.pcm.productcodemanager.exception.ResourceNotFoundException;
import com.pcm.productcodemanager.mapper.ProductMapper;
import com.pcm.productcodemanager.repository.ProductBarcodeRepository;
import com.pcm.productcodemanager.repository.ProductRepository;
import com.pcm.productcodemanager.repository.ScanHistoryRepository;
import com.pcm.productcodemanager.repository.UserRepository;
import com.pcm.productcodemanager.security.UserPrincipal;
import com.pcm.productcodemanager.service.BarcodeService;
import com.pcm.productcodemanager.validation.Ean13Validator;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class BarcodeServiceImpl implements BarcodeService {

    private final ProductBarcodeRepository productBarcodeRepository;
    private final ProductRepository productRepository;
    private final ScanHistoryRepository scanHistoryRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;

    @Override
    @Transactional
    public BarcodeLookupResponse lookupBarcode(String barcode, String deviceInfo, String ipAddress) {
        LocalDateTime now = LocalDateTime.now();
        String rawBarcode = StringUtils.hasText(barcode) ? barcode.trim() : "";
        User currentUser = resolveCurrentUser();

        log.info("Processing barcode lookup for: '{}' from IP: {}", rawBarcode, ipAddress);

        // BR-06, BR-07, BR-20: Kiểm tra tính hợp lệ của định dạng và checksum EAN-13
        if (!Ean13Validator.isValidEan13(rawBarcode)) {
            log.warn("Invalid EAN-13 barcode format or checksum: '{}'", rawBarcode);

            ScanHistory invalidHistory = ScanHistory.builder()
                    .barcodeScanned(rawBarcode)
                    .status(ScanStatus.INVALID)
                    .product(null)
                    .scannedBy(currentUser)
                    .deviceInfo(deviceInfo)
                    .ipAddress(ipAddress)
                    .notes("Mã không đúng định dạng 13 chữ số hoặc sai Checksum EAN-13")
                    .scannedAt(now)
                    .build();
            scanHistoryRepository.save(invalidHistory);

            return BarcodeLookupResponse.builder()
                    .status(ScanStatus.INVALID)
                    .barcodeScanned(rawBarcode)
                    .product(null)
                    .message("Mã vạch không đúng định dạng chuẩn 13 chữ số EAN-13 hoặc sai checksum")
                    .scannedAt(now)
                    .build();
        }

        // BR-18, BR-19: Tra cứu mã vạch trong cơ sở dữ liệu
        Optional<ProductBarcode> barcodeOpt = productBarcodeRepository.findByBarcode(rawBarcode);

        if (barcodeOpt.isEmpty()) {
            log.info("Barcode '{}' is valid EAN-13 but not found in database", rawBarcode);

            ScanHistory notFoundHistory = ScanHistory.builder()
                    .barcodeScanned(rawBarcode)
                    .status(ScanStatus.NOT_FOUND)
                    .product(null)
                    .scannedBy(currentUser)
                    .deviceInfo(deviceInfo)
                    .ipAddress(ipAddress)
                    .notes("Mã vạch hợp lệ nhưng chưa tồn tại trong hệ thống")
                    .scannedAt(now)
                    .build();
            scanHistoryRepository.save(notFoundHistory);

            return BarcodeLookupResponse.builder()
                    .status(ScanStatus.NOT_FOUND)
                    .barcodeScanned(rawBarcode)
                    .product(null)
                    .message("Không tìm thấy sản phẩm tương ứng với mã vạch này trong hệ thống")
                    .scannedAt(now)
                    .build();
        }

        ProductBarcode productBarcode = barcodeOpt.get();
        Product product = productBarcode.getProduct();

        // Ghi nhận lịch sử quét thành công FOUND
        ScanHistory foundHistory = ScanHistory.builder()
                .barcodeScanned(rawBarcode)
                .status(ScanStatus.FOUND)
                .product(product)
                .scannedBy(currentUser)
                .deviceInfo(deviceInfo)
                .ipAddress(ipAddress)
                .notes("Tìm thấy sản phẩm mã nội bộ " + product.getProductCode())
                .scannedAt(now)
                .build();
        scanHistoryRepository.save(foundHistory);

        log.info("Barcode '{}' matched product '{}' ({})", rawBarcode, product.getName(), product.getProductCode());

        return BarcodeLookupResponse.builder()
                .status(ScanStatus.FOUND)
                .barcodeScanned(rawBarcode)
                .product(productMapper.toProductResponse(product))
                .message("Tìm thấy thông tin sản phẩm thành công")
                .scannedAt(now)
                .build();
    }

    @Override
    @Transactional
    public ProductResponse assignBarcode(AssignBarcodeRequest request) {
        UUID productId = request.getProductId();
        String barcode = request.getBarcode().trim();
        log.info("Assigning barcode '{}' to product ID: {}", barcode, productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        // BR-08, BR-09: Kiểm tra xem barcode có thuộc về sản phẩm nào khác không
        Optional<ProductBarcode> existingBarcodeOpt = productBarcodeRepository.findByBarcode(barcode);
        if (existingBarcodeOpt.isPresent() && !existingBarcodeOpt.get().getProduct().getId().equals(productId)) {
            throw new DuplicateResourceException("ProductBarcode", "barcode", barcode);
        }

        ProductBarcode currentBarcode = product.getBarcode();
        if (currentBarcode != null) {
            currentBarcode.setBarcode(barcode);
        } else {
            ProductBarcode newBarcode = ProductBarcode.builder()
                    .product(product)
                    .barcode(barcode)
                    .build();
            product.setBarcode(newBarcode);
        }

        Product savedProduct = productRepository.save(product);
        return productMapper.toProductResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse removeBarcode(UUID productId) {
        log.info("Removing barcode from product ID: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (product.getBarcode() != null) {
            product.setBarcode(null);
            Product savedProduct = productRepository.save(product);
            return productMapper.toProductResponse(savedProduct);
        }

        return productMapper.toProductResponse(product);
    }

    private User resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return userRepository.findById(principal.getId()).orElse(null);
        }
        return null;
    }
}

