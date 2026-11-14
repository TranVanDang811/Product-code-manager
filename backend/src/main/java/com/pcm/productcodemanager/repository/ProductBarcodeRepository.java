package com.pcm.productcodemanager.repository;

import com.pcm.productcodemanager.entity.ProductBarcode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductBarcodeRepository extends JpaRepository<ProductBarcode, UUID> {

    Optional<ProductBarcode> findByBarcode(String barcode);

    boolean existsByBarcode(String barcode);

    Optional<ProductBarcode> findByProductId(UUID productId);

    boolean existsByProductId(UUID productId);
}

