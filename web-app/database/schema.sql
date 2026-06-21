-- MyEduConnect Sdn Bhd - Database Schema
USE myeduconnect;
SET FOREIGN_KEY_CHECKS = 0;
SET SQL_MODE = 'STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- DOMAIN 1: Users & Authentication

CREATE TABLE IF NOT EXISTS roles (
    id          TINYINT      UNSIGNED NOT NULL AUTO_INCREMENT,
    name        VARCHAR(20)  NOT NULL,
    description VARCHAR(100) NOT NULL DEFAULT '',
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_roles_name (name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS users (
    id             INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    role_id        TINYINT      UNSIGNED NOT NULL DEFAULT 3,
    email          VARCHAR(150) NOT NULL,
    username       VARCHAR(50)  NOT NULL,
    password_hash  VARCHAR(255) NOT NULL, 
    created_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at     DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_users_email    (email),
    UNIQUE KEY uq_users_username (username),
    CONSTRAINT fk_users_role FOREIGN KEY (role_id) REFERENCES roles (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


CREATE TABLE IF NOT EXISTS user_profiles (
    id           INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id      INT          UNSIGNED NOT NULL,
    full_name    VARCHAR(120) NOT NULL DEFAULT '',
    bio          TEXT,                                           -- [VULN-V2] raw HTML allowed
    phone        VARCHAR(20)           DEFAULT NULL,
    avatar_url   VARCHAR(255)          DEFAULT NULL,
    institution  VARCHAR(150)          DEFAULT NULL,
    created_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_user_profiles_user (user_id),
    CONSTRAINT fk_profiles_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS password_reset_tokens (
    id         INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id    INT          UNSIGNED NOT NULL,
    token      VARCHAR(64)  NOT NULL,
    expires_at DATETIME     NOT NULL,
    used       TINYINT(1)   NOT NULL DEFAULT 0,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_reset_tokens_token (token),
    CONSTRAINT fk_reset_tokens_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOMAIN 2: Course Catalogue

CREATE TABLE IF NOT EXISTS categories (
    id          SMALLINT     UNSIGNED NOT NULL AUTO_INCREMENT,
    name        VARCHAR(80)  NOT NULL,
    slug        VARCHAR(80)  NOT NULL,
    description VARCHAR(255)          DEFAULT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_categories_slug (slug)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS courses (
    id            INT           UNSIGNED NOT NULL AUTO_INCREMENT,
    category_id   SMALLINT      UNSIGNED NOT NULL,
    instructor_id INT           UNSIGNED NOT NULL,
    title         VARCHAR(200)  NOT NULL,
    slug          VARCHAR(200)  NOT NULL,
    description   TEXT                   DEFAULT NULL,
    price         DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    thumbnail_url VARCHAR(255)           DEFAULT NULL,
    level         ENUM('beginner','intermediate','advanced') NOT NULL DEFAULT 'beginner',
    duration_hrs  SMALLINT      UNSIGNED NOT NULL DEFAULT 0,
    is_published  TINYINT(1)    NOT NULL DEFAULT 0,
    created_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_courses_slug   (slug),
    INDEX idx_courses_category   (category_id),
    INDEX idx_courses_instructor (instructor_id),
    INDEX idx_courses_published  (is_published),
    CONSTRAINT fk_courses_category   FOREIGN KEY (category_id)   REFERENCES categories (id),
    CONSTRAINT fk_courses_instructor FOREIGN KEY (instructor_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_materials (
    id            INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    course_id     INT          UNSIGNED NOT NULL,
    title         VARCHAR(200) NOT NULL,
    material_type ENUM('video','document','quiz','link') NOT NULL DEFAULT 'document',
    content_url   VARCHAR(500)          DEFAULT NULL,
    order_index   SMALLINT     UNSIGNED NOT NULL DEFAULT 0,
    is_free       TINYINT(1)   NOT NULL DEFAULT 0,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_materials_course (course_id),
    CONSTRAINT fk_materials_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS course_reviews (
    id         INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    course_id  INT          UNSIGNED NOT NULL,
    user_id    INT          UNSIGNED NOT NULL,
    rating     TINYINT      UNSIGNED NOT NULL DEFAULT 5,
    comment    TEXT                   DEFAULT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_reviews_user_course (user_id, course_id),
    INDEX idx_reviews_course (course_id),
    CONSTRAINT fk_reviews_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE,
    CONSTRAINT fk_reviews_user  FOREIGN KEY (user_id)   REFERENCES users (id)   ON DELETE CASCADE,
    CONSTRAINT chk_rating CHECK (rating BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOMAIN 3: Enrolments

CREATE TABLE IF NOT EXISTS enrolments (
    id           INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id      INT          UNSIGNED NOT NULL,
    course_id    INT          UNSIGNED NOT NULL,
    status       ENUM('active','completed','cancelled') NOT NULL DEFAULT 'active',
    progress_pct TINYINT      UNSIGNED NOT NULL DEFAULT 0,
    enrolled_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME              DEFAULT NULL,
    PRIMARY KEY (id),                                           -- [VULN-V3] IDOR via this id
    UNIQUE KEY uq_enrolments_user_course (user_id, course_id),
    INDEX idx_enrolments_user   (user_id),
    INDEX idx_enrolments_course (course_id),
    CONSTRAINT fk_enrolments_user   FOREIGN KEY (user_id)   REFERENCES users (id)   ON DELETE CASCADE,
    CONSTRAINT fk_enrolments_course FOREIGN KEY (course_id) REFERENCES courses (id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOMAIN 4: Payments (Mock Workflow)

CREATE TABLE IF NOT EXISTS payments (
    id              INT           UNSIGNED NOT NULL AUTO_INCREMENT,
    user_id         INT           UNSIGNED NOT NULL,
    course_id       INT           UNSIGNED NOT NULL,
    amount          DECIMAL(10,2) NOT NULL,
    currency        CHAR(3)       NOT NULL DEFAULT 'MYR',
    status          ENUM('pending','completed','failed','refunded') NOT NULL DEFAULT 'pending',
    payment_method  ENUM('credit_card','online_banking','e_wallet') NOT NULL DEFAULT 'credit_card',
    transaction_ref VARCHAR(64)           DEFAULT NULL,
    card_last_four  CHAR(4)               DEFAULT NULL,
    created_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_payments_user   (user_id),
    INDEX idx_payments_course (course_id),
    INDEX idx_payments_status (status),
    CONSTRAINT fk_payments_user   FOREIGN KEY (user_id)   REFERENCES users (id),
    CONSTRAINT fk_payments_course FOREIGN KEY (course_id) REFERENCES courses (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOMAIN 5: Admin & Audit

CREATE TABLE IF NOT EXISTS announcements (
    id         INT          UNSIGNED NOT NULL AUTO_INCREMENT,
    admin_id   INT          UNSIGNED NOT NULL,
    title      VARCHAR(200) NOT NULL,
    body       TEXT         NOT NULL,
    is_active  TINYINT(1)   NOT NULL DEFAULT 1,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_announcements_admin (admin_id),
    CONSTRAINT fk_announcements_admin FOREIGN KEY (admin_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id          BIGINT       UNSIGNED NOT NULL AUTO_INCREMENT,
    admin_id    INT          UNSIGNED NOT NULL,
    action      VARCHAR(80)  NOT NULL,
    target_type VARCHAR(40)  NOT NULL,
    target_id   INT          UNSIGNED DEFAULT NULL,
    detail      JSON                  DEFAULT NULL,
    ip_address  VARCHAR(45)           DEFAULT NULL,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_audit_admin  (admin_id),
    INDEX idx_audit_action (action),
    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES users (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DOMAIN 6: Runtime System Config (powers the SECURE_MODE toggle)

CREATE TABLE IF NOT EXISTS system_config (
    config_key   VARCHAR(64)  NOT NULL,
    config_value VARCHAR(255) NOT NULL,
    updated_at   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (config_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;
