package com.pcm.productcodemanager.service.impl;

import com.pcm.productcodemanager.common.PageResponse;
import com.pcm.productcodemanager.dto.request.CreateProductRequest;
import com.pcm.productcodemanager.dto.request.UpdateProductRequest;
import com.pcm.productcodemanager.dto.response.ProductResponse;
import com.pcm.productcodemanager.entity.Product;
import com.pcm.productcodemanager.entity.ProductBarcode;
import com.pcm.productcodemanager.entity.User;
import com.pcm.productcodemanager.entity.enums.ProductStatus;
import com.pcm.productcodemanager.exception.DuplicateResourceException;
import com.pcm.productcodemanager.exception.ResourceNotFoundException;
import com.pcm.productcodemanager.mapper.ProductMapper;
import com.pcm.productcodemanager.repository.ProductBarcodeRepository;
import com.pcm.productcodemanager.repository.ProductRepository;
import com.pcm.productcodemanager.repository.UserRepository;
import com.pcm.productcodemanager.security.UserPrincipal;
import com.pcm.productcodemanager.service.CloudinaryService;
import com.pcm.productcodemanager.service.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ProductBarcodeRepository productBarcodeRepository;
    private final UserRepository userRepository;
    private final ProductMapper productMapper;
    private final CloudinaryService cloudinaryService;

    @Override
    @Transactional
    public ProductResponse createProduct(CreateProductRequest request) {
        log.info("Creating product with code: {}", request.getProductCode());

        // BR-04: Mã nội bộ không được trùng
        if (productRepository.existsByProductCode(request.getProductCode())) {
            throw new DuplicateResourceException("Product", "productCode", request.getProductCode());
        }

        // BR-08, BR-09: Barcode không được trùng
        if (StringUtils.hasText(request.getBarcode())) {
            String trimmedBarcode = request.getBarcode().trim();
            if (productBarcodeRepository.existsByBarcode(trimmedBarcode)) {
                throw new DuplicateResourceException("ProductBarcode", "barcode", trimmedBarcode);
            }
        }

        User currentUser = resolveCurrentUser();

        Product product = Product.builder()
                .productCode(request.getProductCode().trim())
                .name(request.getName().trim())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : ProductStatus.ACTIVE)
                .createdBy(currentUser)
                .build();

        // BR-05: Mỗi sản phẩm chỉ có 1 barcode EAN-13 (1-1 relationship)
        if (StringUtils.hasText(request.getBarcode())) {
            ProductBarcode barcode = ProductBarcode.builder()
                    .product(product)
                    .barcode(request.getBarcode().trim())
                    .build();
            product.setBarcode(barcode);
        }

        Product savedProduct = productRepository.save(product);
        log.info("Product created successfully with ID: {}", savedProduct.getId());

        return productMapper.toProductResponse(savedProduct);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<ProductResponse> getProducts(
            int page, int size, String keyword, ProductStatus status, String sortBy, String sortDir
    ) {
        Sort sort = sortDir.equalsIgnoreCase("asc") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);

        String trimmedKeyword = StringUtils.hasText(keyword) ? keyword.trim() : null;
        Page<Product> productPage = productRepository.searchProducts(trimmedKeyword, status, pageable);

        List<ProductResponse> responses = productMapper.toProductResponseList(productPage.getContent());

        return PageResponse.<ProductResponse>builder()
                .content(responses)
                .pageNumber(productPage.getNumber())
                .pageSize(productPage.getSize())
                .totalElements(productPage.getTotalElements())
                .totalPages(productPage.getTotalPages())
                .isLast(productPage.isLast())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductById(UUID id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));
        return productMapper.toProductResponse(product);
    }

    @Override
    @Transactional(readOnly = true)
    public ProductResponse getProductByCode(String productCode) {
        Product product = productRepository.findByProductCode(productCode)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "productCode", productCode));
        return productMapper.toProductResponse(product);
    }

    @Override
    @Transactional
    public ProductResponse updateProduct(UUID id, UpdateProductRequest request) {
        log.info("Updating product with ID: {}", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setName(request.getName().trim());
        product.setDescription(request.getDescription());

        if (request.getStatus() != null) {
            product.setStatus(request.getStatus());
        }

        // Cập nhật barcode nếu có
        if (StringUtils.hasText(request.getBarcode())) {
            String newBarcode = request.getBarcode().trim();
            ProductBarcode currentBarcode = product.getBarcode();

            if (currentBarcode != null) {
                if (!currentBarcode.getBarcode().equals(newBarcode)) {
                    Optional<ProductBarcode> existing = productBarcodeRepository.findByBarcode(newBarcode);
                    if (existing.isPresent() && !existing.get().getProduct().getId().equals(id)) {
                        throw new DuplicateResourceException("ProductBarcode", "barcode", newBarcode);
                    }
                    currentBarcode.setBarcode(newBarcode);
                }
            } else {
                if (productBarcodeRepository.existsByBarcode(newBarcode)) {
                    throw new DuplicateResourceException("ProductBarcode", "barcode", newBarcode);
                }
                ProductBarcode barcode = ProductBarcode.builder()
                        .product(product)
                        .barcode(newBarcode)
                        .build();
                product.setBarcode(barcode);
            }
        }

        Product updatedProduct = productRepository.save(product);
        log.info("Product updated successfully with ID: {}", id);
        return productMapper.toProductResponse(updatedProduct);
    }

    @Override
    @Transactional
    public ProductResponse updateProductStatus(UUID id, ProductStatus status) {
        log.info("Updating product {} status to {}", id, status);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        product.setStatus(status);
        Product savedProduct = productRepository.save(product);
        return productMapper.toProductResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse archiveProduct(UUID id) {
        log.info("Archiving product with ID: {} (Soft-delete BR-17)", id);

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", id));

        // BR-17: Sản phẩm được ARCHIVED thay vì xóa vật lý
        product.setStatus(ProductStatus.ARCHIVED);
        Product archivedProduct = productRepository.save(product);

        log.info("Product {} successfully marked as ARCHIVED", id);
        return productMapper.toProductResponse(archivedProduct);
    }

    @Override
    @Transactional
    public ProductResponse uploadProductImage(UUID productId, MultipartFile file) {
        log.info("Uploading avatar image for product ID: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        // Nếu sản phẩm đã có ảnh trước đó, xóa ảnh cũ trên Cloudinary để tiết kiệm dung lượng
        if (StringUtils.hasText(product.getImagePublicId())) {
            cloudinaryService.deleteImage(product.getImagePublicId());
        }

        // Tải ảnh mới lên Cloudinary
        Map<String, String> uploadResult = cloudinaryService.uploadImage(file, "products");

        // BR-11, BR-12: Lưu image_url và image_public_id vào database
        product.setImageUrl(uploadResult.get("secure_url"));
        product.setImagePublicId(uploadResult.get("public_id"));

        Product savedProduct = productRepository.save(product);
        log.info("Product image successfully updated for ID: {}", productId);

        return productMapper.toProductResponse(savedProduct);
    }

    @Override
    @Transactional
    public ProductResponse deleteProductImage(UUID productId) {
        log.info("Deleting avatar image for product ID: {}", productId);

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Product", "id", productId));

        if (StringUtils.hasText(product.getImagePublicId())) {
            cloudinaryService.deleteImage(product.getImagePublicId());
        }

        product.setImageUrl(null);
        product.setImagePublicId(null);

        Product savedProduct = productRepository.save(product);
        log.info("Product image successfully cleared for ID: {}", productId);

        return productMapper.toProductResponse(savedProduct);
    }

    private User resolveCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof UserPrincipal principal) {
            return userRepository.findById(principal.getId()).orElse(null);
        }
        return null;
    }
}
