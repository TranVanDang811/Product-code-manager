package com.pcm.productcodemanager.controller;

import com.pcm.productcodemanager.common.ApiResponse;
import com.pcm.productcodemanager.common.AppConstants;
import com.pcm.productcodemanager.common.PageResponse;
import com.pcm.productcodemanager.dto.request.CreateProductRequest;
import com.pcm.productcodemanager.dto.request.UpdateProductRequest;
import com.pcm.productcodemanager.dto.request.UpdateProductStatusRequest;
import com.pcm.productcodemanager.dto.response.ProductResponse;
import com.pcm.productcodemanager.entity.enums.ProductStatus;
import com.pcm.productcodemanager.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/v1/products")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Product Management", description = "Endpoints for managing products, codes, images, and lifecycle statuses")
public class ProductController {

    private final ProductService productService;

    @PostMapping
    @Operation(summary = "Create a new product", description = "Create a product with mandatory unique 6-digit internal code and optional initial EAN-13 barcode")
    public ResponseEntity<ApiResponse<ProductResponse>> createProduct(@Valid @RequestBody CreateProductRequest request) {
        ProductResponse response = productService.createProduct(request);
        return new ResponseEntity<>(ApiResponse.success("Product created successfully", response), HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get paginated product list", description = "Search, filter by status, and paginate products")
    public ResponseEntity<ApiResponse<PageResponse<ProductResponse>>> getProducts(
            @Parameter(description = "Page number (0-indexed)")
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_NUMBER) int page,
            @Parameter(description = "Page size")
            @RequestParam(defaultValue = AppConstants.DEFAULT_PAGE_SIZE) int size,
            @Parameter(description = "Search keyword (matches name or product code)")
            @RequestParam(required = false) String keyword,
            @Parameter(description = "Filter by product status")
            @RequestParam(required = false) ProductStatus status,
            @Parameter(description = "Sort field")
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_BY) String sortBy,
            @Parameter(description = "Sort direction (asc/desc)")
            @RequestParam(defaultValue = AppConstants.DEFAULT_SORT_DIRECTION) String sortDir
    ) {
        PageResponse<ProductResponse> response = productService.getProducts(page, size, keyword, status, sortBy, sortDir);
        return ResponseEntity.ok(ApiResponse.success("Retrieved product list", response));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID", description = "Retrieve detailed information of a product by UUID")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductById(@PathVariable UUID id) {
        ProductResponse response = productService.getProductById(id);
        return ResponseEntity.ok(ApiResponse.success("Retrieved product details", response));
    }

    @GetMapping("/code/{productCode}")
    @Operation(summary = "Get product by 6-digit code", description = "Retrieve product details by exact 6-digit internal code")
    public ResponseEntity<ApiResponse<ProductResponse>> getProductByCode(@PathVariable String productCode) {
        ProductResponse response = productService.getProductByCode(productCode);
        return ResponseEntity.ok(ApiResponse.success("Retrieved product by code", response));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update product details", description = "Update name, description, barcode, and status of an existing product")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProduct(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductRequest request
    ) {
        ProductResponse response = productService.updateProduct(id, request);
        return ResponseEntity.ok(ApiResponse.success("Product updated successfully", response));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Update product status", description = "Update lifecycle status (ACTIVE, INACTIVE, ARCHIVED)")
    public ResponseEntity<ApiResponse<ProductResponse>> updateProductStatus(
            @PathVariable UUID id,
            @Valid @RequestBody UpdateProductStatusRequest request
    ) {
        ProductResponse response = productService.updateProductStatus(id, request.getStatus());
        return ResponseEntity.ok(ApiResponse.success("Product status updated successfully", response));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Archive product (Soft Delete)", description = "Mark product status as ARCHIVED to preserve scan history integrity per BR-17")
    public ResponseEntity<ApiResponse<ProductResponse>> archiveProduct(@PathVariable UUID id) {
        ProductResponse response = productService.archiveProduct(id);
        return ResponseEntity.ok(ApiResponse.success("Product successfully archived", response));
    }

    @PostMapping(value = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Upload product avatar image to Cloudinary", description = "Uploads an image (JPEG, PNG, WEBP max 5MB) to Cloudinary CDN, updates product imageUrl and imagePublicId, and removes old image asset")
    public ResponseEntity<ApiResponse<ProductResponse>> uploadProductImage(
            @PathVariable UUID id,
            @Parameter(description = "Image file (JPEG, PNG, WEBP max 5MB)", content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE, schema = @Schema(type = "string", format = "binary")))
            @RequestParam("file") MultipartFile file
    ) {
        ProductResponse response = productService.uploadProductImage(id, file);
        return ResponseEntity.ok(ApiResponse.success("Product avatar image uploaded successfully", response));
    }

    @DeleteMapping("/{id}/image")
    @Operation(summary = "Delete product avatar image", description = "Removes image asset from Cloudinary CDN and clears image fields in database")
    public ResponseEntity<ApiResponse<ProductResponse>> deleteProductImage(@PathVariable UUID id) {
        ProductResponse response = productService.deleteProductImage(id);
        return ResponseEntity.ok(ApiResponse.success("Product avatar image removed successfully", response));
    }
}
