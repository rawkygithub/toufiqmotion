-- Toufiq Motion Blog — MySQL 8 / MariaDB Schema (utf8mb4)
-- Engineered for Hostinger Shared & Premium Hosting (InnoDB)

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `password_hash` VARCHAR(255) NOT NULL,
  `role` VARCHAR(64) NOT NULL DEFAULT 'admin',
  `avatar` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `categories` (
  `id` VARCHAR(64) PRIMARY KEY,
  `name` VARCHAR(191) NOT NULL UNIQUE,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `description` TEXT,
  `icon` VARCHAR(64) DEFAULT 'Compass',
  `image` TEXT,
  `subcategories_json` LONGTEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `articles` (
  `id` VARCHAR(64) PRIMARY KEY,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `title` VARCHAR(500) NOT NULL,
  `excerpt` TEXT NOT NULL,
  `category` VARCHAR(191) NOT NULL,
  `subcategory` VARCHAR(191) NOT NULL,
  `date` VARCHAR(64) NOT NULL,
  `read_time` VARCHAR(64) NOT NULL,
  `image` TEXT NOT NULL,
  `featured` TINYINT(1) DEFAULT 0,
  `trending_rank` INT NULL,
  `author_name` VARCHAR(191) NOT NULL,
  `author_avatar` TEXT NOT NULL,
  `author_role` VARCHAR(191) NOT NULL,
  `quote` TEXT,
  `tags_json` LONGTEXT NOT NULL,
  `content_json` LONGTEXT NOT NULL,
  `html_content` LONGTEXT,
  `focus_keyword` VARCHAR(255),
  `meta_title` VARCHAR(500),
  `meta_description` TEXT,
  `canonical_url` VARCHAR(500),
  `no_index` TINYINT(1) DEFAULT 0,
  `og_image` TEXT,
  `seo_score` INT DEFAULT 85,
  `readability_score` INT DEFAULT 90,
  `views_count` INT DEFAULT 0,
  `likes_count` INT DEFAULT 0,
  `has_affiliate_links` TINYINT(1) DEFAULT 0,
  `affiliate_disclosure_custom` TEXT,
  `published` TINYINT(1) DEFAULT 1,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_articles_category` (`category`),
  INDEX `idx_articles_created_at` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `comments` (
  `id` VARCHAR(64) PRIMARY KEY,
  `article_id` VARCHAR(64) NOT NULL,
  `author_name` VARCHAR(191) NOT NULL,
  `author_email` VARCHAR(191),
  `content` TEXT NOT NULL,
  `status` VARCHAR(32) DEFAULT 'approved',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_comments_article_id` (`article_id`),
  CONSTRAINT `fk_comments_article` FOREIGN KEY (`article_id`) REFERENCES `articles`(`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `newsletter_subscribers` (
  `id` VARCHAR(64) PRIMARY KEY,
  `email` VARCHAR(191) NOT NULL UNIQUE,
  `name` VARCHAR(191),
  `source` VARCHAR(64) DEFAULT 'footer',
  `status` VARCHAR(32) DEFAULT 'active',
  `subscribed_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `inquiries` (
  `id` VARCHAR(64) PRIMARY KEY,
  `type` VARCHAR(64) NOT NULL,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `company` VARCHAR(191),
  `subject` VARCHAR(255),
  `project_type` VARCHAR(191),
  `message` TEXT NOT NULL,
  `status` VARCHAR(32) DEFAULT 'new',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `seo_redirects` (
  `id` VARCHAR(64) PRIMARY KEY,
  `source_path` VARCHAR(191) NOT NULL UNIQUE,
  `target_path` VARCHAR(500) NOT NULL,
  `redirect_code` INT DEFAULT 301,
  `hits_count` INT DEFAULT 0,
  `notes` TEXT,
  `last_accessed` DATETIME NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `seo_crawl_errors` (
  `id` VARCHAR(64) PRIMARY KEY,
  `path` VARCHAR(191) NOT NULL UNIQUE,
  `hits_count` INT DEFAULT 1,
  `referer` TEXT,
  `user_agent` TEXT,
  `ip` VARCHAR(64),
  `status` VARCHAR(32) DEFAULT 'active',
  `last_detected` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `seo_settings` (
  `key` VARCHAR(128) PRIMARY KEY,
  `value` LONGTEXT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `seo_search_queries` (
  `id` VARCHAR(64) PRIMARY KEY,
  `query` VARCHAR(191) NOT NULL UNIQUE,
  `clicks` INT DEFAULT 0,
  `impressions` INT DEFAULT 0,
  `ctr` DOUBLE DEFAULT 0.0,
  `position` DOUBLE DEFAULT 1.0,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `seo_indexing_logs` (
  `id` VARCHAR(64) PRIMARY KEY,
  `url` VARCHAR(500) NOT NULL,
  `engine` VARCHAR(128) NOT NULL,
  `action` VARCHAR(64) NOT NULL,
  `response_status` INT DEFAULT 200,
  `message` TEXT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `site_settings` (
  `key` VARCHAR(128) PRIMARY KEY,
  `value` LONGTEXT NOT NULL,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `media` (
  `id` VARCHAR(64) PRIMARY KEY,
  `filename` VARCHAR(255) NOT NULL,
  `original_name` VARCHAR(255) NOT NULL,
  `url` TEXT NOT NULL,
  `mimetype` VARCHAR(128) NOT NULL,
  `size` INT NOT NULL,
  `width` INT NULL,
  `height` INT NULL,
  `alt_text` TEXT,
  `title` VARCHAR(255) DEFAULT '',
  `caption` TEXT,
  `is_optimized` TINYINT(1) DEFAULT 0,
  `original_size` INT NULL,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_media_created` (`created_at`),
  INDEX `idx_media_mimetype` (`mimetype`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `pages` (
  `id` VARCHAR(64) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `excerpt` TEXT,
  `status` VARCHAR(32) NOT NULL DEFAULT 'published',
  `featured_image` TEXT,
  `template` VARCHAR(64) DEFAULT 'custom',
  `blocks_json` LONGTEXT NOT NULL,
  `meta_title` VARCHAR(500) DEFAULT '',
  `meta_description` TEXT,
  `focus_keyword` VARCHAR(255) DEFAULT '',
  `canonical_url` VARCHAR(500) DEFAULT '',
  `no_index` TINYINT(1) DEFAULT 0,
  `seo_score` INT DEFAULT 85,
  `is_system` TINYINT(1) DEFAULT 0,
  `views` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_pages_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `affiliate_links` (
  `id` VARCHAR(64) PRIMARY KEY,
  `title` VARCHAR(255) NOT NULL,
  `slug` VARCHAR(191) NOT NULL UNIQUE,
  `target_url` TEXT NOT NULL,
  `merchant` VARCHAR(128) NOT NULL DEFAULT 'Amazon',
  `category` VARCHAR(128) DEFAULT 'Gear',
  `price` VARCHAR(64) DEFAULT '',
  `rating` DECIMAL(3,2) DEFAULT 4.90,
  `badge` VARCHAR(128) DEFAULT 'Editor''s Choice',
  `image_url` TEXT,
  `description` TEXT,
  `pros_json` LONGTEXT,
  `cons_json` LONGTEXT,
  `button_text` VARCHAR(191) DEFAULT 'Check Price on Amazon',
  `secondary_url` TEXT,
  `secondary_button_text` VARCHAR(191) DEFAULT '',
  `clicks_count` INT DEFAULT 0,
  `last_clicked_at` DATETIME NULL,
  `is_active` TINYINT(1) DEFAULT 1,
  `rel_tags` VARCHAR(191) DEFAULT 'nofollow sponsored noopener',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_affiliate_merchant` (`merchant`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS `affiliate_clicks` (
  `id` VARCHAR(64) PRIMARY KEY,
  `link_id` VARCHAR(64) NOT NULL,
  `slug` VARCHAR(191) NOT NULL,
  `merchant` VARCHAR(128),
  `referer` TEXT,
  `user_agent` TEXT,
  `ip` VARCHAR(64),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_aff_clicks_slug` (`slug`),
  INDEX `idx_aff_clicks_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET FOREIGN_KEY_CHECKS = 1;

