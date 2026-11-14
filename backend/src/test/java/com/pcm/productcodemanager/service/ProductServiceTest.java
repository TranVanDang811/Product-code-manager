package com.pcm.productcodemanager.service;

import com.pcm.productcodemanager.common.PageResponse;
import com.pcm.productcodemanager.dto.request.CreateProductRequest;
import com.pcm.productcodemanager.dto.response.ProductResponse;
import com.pcm.productcodemanager.entity.Product;
import com.pcm.productcodemanager.entity.ProductBarcode;
import com.pcm.productcodemanager.entity.enums.ProductStatus;
import com.pcm.productcodemanager.exception.DuplicateResourceException;
import com.pcm.productcodemanager.exception.ResourceNotFoundException;
import com.pcm.productcodemanager.mapper.ProductMapper;
import com.pcm.productcodemanager.repository.ProductBarcodeRepository;
import com.pcm.productcodemanager.repository.ProductRepository;
import com.pcm.productcodemanager.repository.UserRepository;
import com.pcm.productcodemanager.service.impl.ProductServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.mock.web.MockMultipartFile;

import java.util.Collections;
import java.util.HashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ProductServiceTest {

    @Mock
    private ProductRepository productRepository;

    @Mock
    private ProductBarcodeRepository productBarcodeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProductMapper productMapper;

    @Mock
    private CloudinaryService cloudinaryService;

    @InjectMocks
    private ProductServiceImpl productService;

    private UUID productId;
    private Product product;
    private ProductResponse productResponse;

    @BeforeEach
    void setUp() {
        productId = UUID.randomUUID();
        product = Product.builder()
                .id(productId)
                .productCode("001234")
                .name("Sản phẩm mẫu 001234")
                .description("Mô tả chi tiết")
                .status(ProductStatus.ACTIVE)
                .build();

        ProductBarcode barcode = ProductBarcode.builder()
                .id(UUID.randomUUID())
                .product(product)
                .barcode("4006381333931")
                .build();
        product.setBarcode(barcode);

        productResponse = ProductResponse.builder()
                .id(productId)
                .productCode("001234")
                .name("Sản phẩm mẫu 001234")
                .barcode("4006381333931")
                .status(ProductStatus.ACTIVE)
                .build();
    }

    @Test
    @DisplayName("Should create product with leading zeros code and EAN-13 barcode (BR-01, BR-03, BR-05)")
    void testCreateProductSuccess() {
        CreateProductRequest request = CreateProductRequest.builder()
                .productCode("001234")
                .name("Sản phẩm mẫu 001234")
                .description("Mô tả chi tiết")
                .barcode("4006381333931")
                .status(ProductStatus.ACTIVE)
                .build();

        when(productRepository.existsByProductCode("001234")).thenReturn(false);
        when(productBarcodeRepository.existsByBarcode("4006381333931")).thenReturn(false);
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toProductResponse(product)).thenReturn(productResponse);

        ProductResponse response = productService.createProduct(request);

        assertNotNull(response);
        assertEquals("001234", response.getProductCode());
        assertEquals("4006381333931", response.getBarcode());
        verify(productRepository).save(any(Product.class));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when product code already exists (BR-04)")
    void testCreateProductDuplicateCode() {
        CreateProductRequest request = CreateProductRequest.builder()
                .productCode("001234")
                .name("Sản phẩm trùng mã")
                .build();

        when(productRepository.existsByProductCode("001234")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> productService.createProduct(request));
    }

    @Test
    @DisplayName("Should throw DuplicateResourceException when barcode already exists (BR-08, BR-09)")
    void testCreateProductDuplicateBarcode() {
        CreateProductRequest request = CreateProductRequest.builder()
                .productCode("999999")
                .name("Sản phẩm khác")
                .barcode("4006381333931")
                .build();

        when(productRepository.existsByProductCode("999999")).thenReturn(false);
        when(productBarcodeRepository.existsByBarcode("4006381333931")).thenReturn(true);

        assertThrows(DuplicateResourceException.class, () -> productService.createProduct(request));
    }

    @Test
    @DisplayName("Should throw ResourceNotFoundException when product does not exist")
    void testGetProductByIdNotFound() {
        UUID nonExistentId = UUID.randomUUID();
        when(productRepository.findById(nonExistentId)).thenReturn(Optional.empty());

        assertThrows(ResourceNotFoundException.class, () -> productService.getProductById(nonExistentId));
    }

    @Test
    @DisplayName("Should update product status to ARCHIVED instead of physical delete (BR-17)")
    void testArchiveProduct() {
        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProductResponse archivedResponse = ProductResponse.builder()
                .id(productId)
                .productCode("001234")
                .status(ProductStatus.ARCHIVED)
                .build();
        when(productMapper.toProductResponse(any(Product.class))).thenReturn(archivedResponse);

        ProductResponse result = productService.archiveProduct(productId);

        assertNotNull(result);
        assertEquals(ProductStatus.ARCHIVED, result.getStatus());
        assertEquals(ProductStatus.ARCHIVED, product.getStatus());
        verify(productRepository).save(product);
    }

    @Test
    @DisplayName("Should paginate and filter products")
    void testGetProductsPagination() {
        Page<Product> page = new PageImpl<>(Collections.singletonList(product));
        when(productRepository.searchProducts(eq("001234"), eq(ProductStatus.ACTIVE), any(Pageable.class)))
                .thenReturn(page);
        when(productMapper.toProductResponseList(any())).thenReturn(Collections.singletonList(productResponse));

        PageResponse<ProductResponse> result = productService.getProducts(0, 10, "001234", ProductStatus.ACTIVE, "createdAt", "desc");

        assertNotNull(result);
        assertEquals(1, result.getContent().size());
        assertEquals("001234", result.getContent().get(0).getProductCode());
    }

    @Test
    @DisplayName("Should upload product image, store URL and public ID, and remove old asset (BR-10, BR-11, BR-12)")
    void testUploadProductImageSuccess() {
        product.setImagePublicId("products/old_image_id");
        MockMultipartFile file = new MockMultipartFile(
                "file", "avatar.jpg", "image/jpeg", "image bytes".getBytes()
        );

        Map<String, String> uploadResult = new HashMap<>();
        uploadResult.put("secure_url", "https://res.cloudinary.com/dltv44gle/image/upload/v1/products/avatar.jpg");
        uploadResult.put("public_id", "products/new_avatar_id");

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(cloudinaryService.uploadImage(file, "products")).thenReturn(uploadResult);
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toProductResponse(product)).thenReturn(productResponse);

        ProductResponse response = productService.uploadProductImage(productId, file);

        assertNotNull(response);
        verify(cloudinaryService).deleteImage("products/old_image_id");
        verify(cloudinaryService).uploadImage(file, "products");
        verify(productRepository).save(product);
        assertEquals("https://res.cloudinary.com/dltv44gle/image/upload/v1/products/avatar.jpg", product.getImageUrl());
        assertEquals("products/new_avatar_id", product.getImagePublicId());
    }

    @Test
    @DisplayName("Should delete product image from Cloudinary and clear DB fields")
    void testDeleteProductImageSuccess() {
        product.setImageUrl("https://res.cloudinary.com/dltv44gle/image/upload/v1/products/avatar.jpg");
        product.setImagePublicId("products/avatar_id");

        when(productRepository.findById(productId)).thenReturn(Optional.of(product));
        when(productRepository.save(any(Product.class))).thenReturn(product);
        when(productMapper.toProductResponse(product)).thenReturn(productResponse);

        ProductResponse response = productService.deleteProductImage(productId);

        assertNotNull(response);
        verify(cloudinaryService).deleteImage("products/avatar_id");
        assertNull(product.getImageUrl());
        assertNull(product.getImagePublicId());
    }
}
