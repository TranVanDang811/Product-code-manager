package com.pcm.productcodemanager.repository;

import com.pcm.productcodemanager.entity.ScanHistory;
import com.pcm.productcodemanager.entity.enums.ScanStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface ScanHistoryRepository extends JpaRepository<ScanHistory, UUID> {

    Page<ScanHistory> findAllByOrderByScannedAtDesc(Pageable pageable);

    Page<ScanHistory> findByStatusOrderByScannedAtDesc(ScanStatus status, Pageable pageable);

    @Query("SELECT s FROM ScanHistory s WHERE " +
           "(:status IS NULL OR s.status = :status) AND " +
           "(:barcode IS NULL OR s.barcodeScanned LIKE CONCAT('%', :barcode, '%')) " +
           "ORDER BY s.scannedAt DESC")
    Page<ScanHistory> searchHistory(@Param("status") ScanStatus status,
                                    @Param("barcode") String barcode,
                                    Pageable pageable);

    long countByStatus(ScanStatus status);

    List<ScanHistory> findTop10ByOrderByScannedAtDesc();

    @Query("SELECT s FROM ScanHistory s WHERE s.scannedAt >= :since ORDER BY s.scannedAt ASC")
    List<ScanHistory> findScansSince(@Param("since") LocalDateTime since);
}
