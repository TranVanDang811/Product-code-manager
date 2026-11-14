package com.pcm.productcodemanager.service;

import com.pcm.productcodemanager.dto.request.AssignBarcodeRequest;
import com.pcm.productcodemanager.dto.response.BarcodeLookupResponse;
import com.pcm.productcodemanager.dto.response.ProductResponse;
import com.pcm.productcodemanager.entity.Product;
import com.pcm.productcodemanager.entity.ProductBarcode;
import com.pcm.productcodemanager.entity.ScanHistory;
import com.pcm.productcodemanager.entity.enums.ProductStatus;
import com.pcm.productcodemanager.entity.enums.ScanStatus;
import com.pcm.productcodemanager.exception.DuplicateResourceException;
import com.pcm.productcodemanager.mapper.ProductMapper;
import com.pcm.productcodemanager.repository.ProductBarcodeRepository;
import com.pcm.productcodemanager.repository.ProductRepository;
import com.pcm.productcodemanager.repository.ScanHistoryRepository;
import com.pcm.productcodemanager.repository.UserRepository;
import com.pcm.productcodemanager.service.impl.BarcodeServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BarcodeServiceTest {

    @Mock
    private ProductBarcodeRepository productBarcodeRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ScanHistoryRepository scanHistoryRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductMapper productMapper;

    @InjectMocks
    private BarcodeServiceImpl barcodeService;

    private Product product;
    private ProductBarcode productBarcode;
    private ProductResponse productResponse;

    @BeforeEach
    void setUp() {
        UUID productId = UUID.randomUUID();
        product = Product.builder()
                .id(productId)
                .productCode("001234")
                .name("Stabilo Boss")
                .status(ProductStatus.ACTIVE)
                .build();

        productBarcode = ProductBarcode.builder()
                .id(UUID.randomUUID())
                .product(product)
                .barcode("4006381333931")
                .build();
        product.setBarcode(productBarcode);

        productResponse = ProductResponse.builder()
                .id(productId)
                .productCode("001234")
                .name("Stabilo Boss")
                .barcode("4006381333931")
                .build();
    }

    @Test
    @DisplayName("Lookup valid registered barcode - Should return FOUND and log history (BR-18)")
    void testLookupBarcodeFound() {
        when(productBarcodeRepository.findByBarcode("4006381333931")).thenReturn(Optional.of(productBarcode));
        when(productMapper.toProductResponse(product)).thenReturn(productResponse);

        BarcodeLookupResponse response = barcodeService.lookupBarcode("4006381333931", "Chrome", "127.0.0.1");

        assertNotNull(response);
        assertEquals(ScanStatus.FOUND, response.getStatus());
        assertNotNull(response.getProduct());
        assertEquals("001234", response.getProduct().getProductCode());
        verify(scanHistoryRepository).save(any(ScanHistory.class));
    }

    @Test
    @DisplayName("Lookup valid unregistered barcode - Should return NOT_FOUND and log history (BR-19)")
    void testLookupBarcodeNotFound() {
        when(productBarcodeRepository.findByBarcode("8938505974019")).thenReturn(Optional.empty());

        BarcodeLookupResponse response = barcodeService.lookupBarcode("8938505974019", "Expo Camera", "192.168.1.1");

        assertNotNull(response);
        assertEquals(ScanStatus.NOT_FOUND, response.getStatus());
        assertNull(response.getProduct());
        verify(scanHistoryRepository).save(any(ScanHistory.class));
    }

    @Test
    @DisplayName("Lookup malformed / bad checksum barcode - Should return INVALID and log history (BR-20)")
    void testLookupBarcodeInvalid() {
        BarcodeLookupResponse response = barcodeService.lookupBarcode("12345ABC", "Camera", "10.0.0.1");

        assertNotNull(response);
        assertEquals(ScanStatus.INVALID, response.getStatus());
        assertNull(response.getProduct());
        verify(scanHistoryRepository).save(any(ScanHistory.class));
    }

    @Test
    @DisplayName("Assign barcode to product successfully (BR-05, BR-08)")
    void testAssignBarcodeSuccess() {
        UUID productId = product.getId();
        AssignBarcodeRequest request = AssignBarcodeRequest.builder()
                .productId(productId)
                .barcode("8938505974019")
                .build();

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productBarcodeRepository.findByBarcode("8938505974019")).thenReturn(Optional.empty());
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toProductResponse(product)).thenReturn(productResponse);

        ProductResponse response = barcodeService.assignBarcode(request);

        assertNotNull(response);
        verify(productRepository).save(product);
    }

    @Test
    @DisplayName("Assign barcode already taken by another product - Should throw DuplicateResourceException (BR-08, BR-09)")
    void testAssignBarcodeDuplicate() {
        UUID otherProductId = UUID.randomUUID();
        Product otherProduct = Product.builder().id(otherProductId).build();
        ProductBarcode existingBarcode = ProductBarcode.builder()
                .product(otherProduct)
                .barcode("4006381333931")
                .build();

        AssignBarcodeRequest request = AssignBarcodeRequest.builder()
                .productId(product.getId())
                .barcode("4006381333931")
                .build();

        when(productRepository.findById(product.getId())).thenReturn(Optional.of(product));
        when(productBarcodeRepository.findByBarcode("4006381333931")).thenReturn(Optional.of(existingBarcode));

        assertThrows(DuplicateResourceException.class, () -> barcodeService.assignBarcode(request));
    }
}

