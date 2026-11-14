package com.pcm.productcodemanager.repository;

import com.pcm.productcodemanager.entity.Product;
import com.pcm.productcodemanager.entity.enums.ProductStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ProductRepository extends JpaRepository<Product, UUID> {

    Optional<Product> findByProductCode(String productCode);

    boolean existsByProductCode(String productCode);

    Page<Product> findByStatus(ProductStatus status, Pageable pageable);

    @Query("SELECT p FROM Product p WHERE " +
           "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR p.productCode LIKE CONCAT('%', :keyword, '%')) " +
           "AND (:status IS NULL OR p.status = :status)")
    Page<Product> searchProducts(@Param("keyword") String keyword,
                                @Param("status") ProductStatus status,
                                Pageable pageable);

    long countByStatus(ProductStatus status);
}

