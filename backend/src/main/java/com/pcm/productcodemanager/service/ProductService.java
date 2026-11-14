package com.pcm.productcodemanager.service;

import com.pcm.productcodemanager.common.PageResponse;
import com.pcm.productcodemanager.dto.request.CreateProductRequest;
import com.pcm.productcodemanager.dto.request.UpdateProductRequest;
import com.pcm.productcodemanager.dto.response.ProductResponse;
import com.pcm.productcodemanager.entity.enums.ProductStatus;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

public interface ProductService {

    ProductResponse createProduct(CreateProductRequest request);

    PageResponse<ProductResponse> getProducts(int page, int size, String keyword, ProductStatus status, String sortBy, String sortDir);

    ProductResponse getProductById(UUID id);

    ProductResponse getProductByCode(String productCode);

    ProductResponse updateProduct(UUID id, UpdateProductRequest request);

    ProductResponse updateProductStatus(UUID id, ProductStatus status);

    ProductResponse archiveProduct(UUID id);

    ProductResponse uploadProductImage(UUID productId, MultipartFile file);

    ProductResponse deleteProductImage(UUID productId);
}
