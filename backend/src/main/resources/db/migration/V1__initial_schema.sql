-- ============================================================================
-- Migration: V1__initial_schema.sql
-- Description: Create initial schema for Product Code Manager
-- Author: Senior Software Architect
-- Database: product_code_manager (MySQL 8.4+)
-- ============================================================================

-- ----------------------------------------------------------------------------
-- Table: users
-- Purpose: Quản lý tài khoản quản trị hệ thống (Single ADMIN account)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id CHAR(36) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ADMIN',
    is_active TINYINT(1) NOT NULL DEFAULT 1,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_users PRIMARY KEY (id),
    CONSTRAINT uk_users_username UNIQUE (username),
    CONSTRAINT chk_users_role CHECK (role IN ('ADMIN')),
    CONSTRAINT chk_users_is_active CHECK (is_active IN (0, 1))
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

-- ----------------------------------------------------------------------------
-- Table: products
-- Purpose: Quản lý danh mục sản phẩm, mã 6 chữ số nội bộ, ảnh Cloudinary
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS products (
    id CHAR(36) NOT NULL,
    product_code CHAR(6) NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT NULL,
    image_url VARCHAR(500) NULL,
    image_public_id VARCHAR(255) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_by CHAR(36) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_products PRIMARY KEY (id),
    CONSTRAINT uk_products_product_code UNIQUE (product_code),
    CONSTRAINT chk_products_product_code CHECK (product_code REGEXP '^[0-9]{6}$'),
    CONSTRAINT chk_products_status CHECK (status IN ('ACTIVE', 'INACTIVE', 'ARCHIVED')),
    CONSTRAINT fk_products_created_by FOREIGN KEY (created_by)
        REFERENCES users (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_products_status ON products (status);
CREATE INDEX idx_products_created_at ON products (created_at DESC);

-- ----------------------------------------------------------------------------
-- Table: product_barcodes
-- Purpose: Ánh xạ quan hệ 1-1 giữa sản phẩm và mã vạch chuẩn EAN-13
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS product_barcodes (
    id CHAR(36) NOT NULL,
    product_id CHAR(36) NOT NULL,
    barcode CHAR(13) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT pk_product_barcodes PRIMARY KEY (id),
    CONSTRAINT uk_product_barcodes_product_id UNIQUE (product_id),
    CONSTRAINT uk_product_barcodes_barcode UNIQUE (barcode),
    CONSTRAINT chk_product_barcodes_barcode CHECK (barcode REGEXP '^[0-9]{13}$'),
    CONSTRAINT fk_product_barcodes_product FOREIGN KEY (product_id)
        REFERENCES products (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_product_barcodes_barcode ON product_barcodes (barcode);

-- ----------------------------------------------------------------------------
-- Table: scan_histories
-- Purpose: Ghi nhận lịch sử tra cứu mã vạch từ Web và Mobile
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scan_histories (
    id CHAR(36) NOT NULL,
    barcode_scanned VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL,
    product_id CHAR(36) NULL,
    scanned_by CHAR(36) NULL,
    device_info VARCHAR(255) NULL,
    ip_address VARCHAR(45) NULL,
    notes VARCHAR(255) NULL,
    scanned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT pk_scan_histories PRIMARY KEY (id),
    CONSTRAINT chk_scan_histories_status CHECK (status IN ('FOUND', 'NOT_FOUND', 'INVALID')),
    CONSTRAINT fk_scan_histories_product FOREIGN KEY (product_id)
        REFERENCES products (id)
        ON DELETE RESTRICT
        ON UPDATE CASCADE,
    CONSTRAINT fk_scan_histories_user FOREIGN KEY (scanned_by)
        REFERENCES users (id)
        ON DELETE SET NULL
        ON UPDATE CASCADE
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;

CREATE INDEX idx_scan_histories_barcode ON scan_histories (barcode_scanned);
CREATE INDEX idx_scan_histories_product_id ON scan_histories (product_id);
CREATE INDEX idx_scan_histories_status ON scan_histories (status);
CREATE INDEX idx_scan_histories_scanned_at ON scan_histories (scanned_at DESC);

