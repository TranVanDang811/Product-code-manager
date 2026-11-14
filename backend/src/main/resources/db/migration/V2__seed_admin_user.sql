-- ============================================================================
-- Migration: V2__seed_admin_user.sql
-- Description: Seed initial default ADMIN account
-- Author: Senior Software Architect
-- Database: product_code_manager (MySQL 8.4+)
-- Default Credentials:
--   Username: admin
--   Default Password: Admin@123 (BCrypt cost 10: $2a$10$X86ZJ1vBvW3x7hW1vT0a0eN7K8Z6v5d4e3f2g1h0i9j8k7l6m5n4o)
-- ============================================================================

INSERT INTO users (
    id,
    username,
    password_hash,
    full_name,
    role,
    is_active,
    created_at,
    updated_at
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'admin',
    '$2a$10$zbgnYUEaqBW6xeWS7ngv7O/9EVqFjB7.z0uYAwuasPWexgnI7.NK2',
    'System Administrator',
    'ADMIN',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
) ON DUPLICATE KEY UPDATE
    updated_at = CURRENT_TIMESTAMP;

