// Script de création des tables principales (idempotent)
import "dotenv/config";
import { pool } from "./db.js";

const tables = [
  `CREATE TABLE IF NOT EXISTS users (
    id            VARCHAR(36)  PRIMARY KEY,
    email         VARCHAR(191) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    name          VARCHAR(191) NOT NULL,
    role          ENUM('admin','client') NOT NULL DEFAULT 'client',
    phone         VARCHAR(50)  DEFAULT NULL,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_email (email)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS categories (
    id          VARCHAR(36)  PRIMARY KEY,
    name        VARCHAR(191) NOT NULL,
    slug        VARCHAR(191) NOT NULL UNIQUE,
    description TEXT         DEFAULT NULL,
    image       VARCHAR(500) DEFAULT NULL,
    parent_id   VARCHAR(36)  DEFAULT NULL,
    sort_order  INT          NOT NULL DEFAULT 0,
    is_active   TINYINT(1)  NOT NULL DEFAULT 1,
    created_at  DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_parent (parent_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS product_options (
    id         VARCHAR(36)  PRIMARY KEY,
    name       VARCHAR(191) NOT NULL,
    type       VARCHAR(50)  NOT NULL DEFAULT 'button',
    sort_order INT          NOT NULL DEFAULT 0
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS product_option_values (
    id            VARCHAR(36)  PRIMARY KEY,
    option_id     VARCHAR(36)  NOT NULL,
    value         VARCHAR(191) NOT NULL,
    display_value VARCHAR(191) NOT NULL,
    color_hex     VARCHAR(20)  DEFAULT NULL,
    sort_order    INT          NOT NULL DEFAULT 0,
    INDEX idx_option (option_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS products (
    id             VARCHAR(36)    PRIMARY KEY,
    name           VARCHAR(191)   NOT NULL,
    slug           VARCHAR(191)   NOT NULL UNIQUE,
    description    TEXT           DEFAULT NULL,
    category_id    VARCHAR(36)    NOT NULL,
    sub_category_id VARCHAR(36)   DEFAULT NULL,
    base_price     DECIMAL(10,2)  NOT NULL,
    cover_image    VARCHAR(500)   DEFAULT NULL,
    gallery_json   JSON           DEFAULT NULL,
    is_featured    TINYINT(1)     NOT NULL DEFAULT 0,
    is_new_arrival TINYINT(1)     NOT NULL DEFAULT 0,
    is_best_seller TINYINT(1)     NOT NULL DEFAULT 0,
    is_active      TINYINT(1)     NOT NULL DEFAULT 1,
    created_at     DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_slug (slug),
    INDEX idx_category (category_id),
    INDEX idx_active (is_active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS product_variants (
    id         VARCHAR(36)   PRIMARY KEY,
    product_id VARCHAR(36)   NOT NULL,
    sku        VARCHAR(100)  DEFAULT NULL,
    price      DECIMAL(10,2) DEFAULT NULL,
    stock      INT           NOT NULL DEFAULT 0,
    is_active  TINYINT(1)   NOT NULL DEFAULT 1,
    created_at DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product (product_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS variant_option_values (
    variant_id VARCHAR(36) NOT NULL,
    option_id  VARCHAR(36) NOT NULL,
    value_id   VARCHAR(36) NOT NULL,
    PRIMARY KEY (variant_id, option_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS orders (
    id               VARCHAR(36)    PRIMARY KEY,
    order_number     VARCHAR(50)    NOT NULL UNIQUE,
    user_id          VARCHAR(36)    DEFAULT NULL,
    subtotal         DECIMAL(10,2)  NOT NULL,
    shipping_cost    DECIMAL(10,2)  NOT NULL DEFAULT 0,
    discount         DECIMAL(10,2)  NOT NULL DEFAULT 0,
    coupon_discount  DECIMAL(10,2)  NOT NULL DEFAULT 0,
    total            DECIMAL(10,2)  NOT NULL,
    payment_status   ENUM('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
    order_status     ENUM('pending','confirmed','processing','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
    customer_name    VARCHAR(191)   NOT NULL,
    customer_email   VARCHAR(191)   DEFAULT NULL,
    customer_phone   VARCHAR(50)    NOT NULL,
    shipping_method  VARCHAR(50)    DEFAULT NULL,
    shipping_address TEXT           DEFAULT NULL,
    notes            TEXT           DEFAULT NULL,
    created_at       DATETIME       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_number (order_number),
    INDEX idx_user (user_id),
    INDEX idx_status (order_status)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS order_items (
    id          VARCHAR(36)   PRIMARY KEY,
    order_id    VARCHAR(36)   NOT NULL,
    product_id  VARCHAR(36)   NOT NULL,
    variant_id  VARCHAR(36)   DEFAULT NULL,
    name        VARCHAR(191)  NOT NULL,
    price       DECIMAL(10,2) NOT NULL,
    quantity    INT           NOT NULL DEFAULT 1,
    options     TEXT          DEFAULT NULL,
    INDEX idx_order (order_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS tracking_events (
    id         VARCHAR(36)  PRIMARY KEY DEFAULT (UUID()),
    order_id   VARCHAR(36)  NOT NULL,
    status     VARCHAR(100) NOT NULL,
    message    TEXT         DEFAULT NULL,
    created_at DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order (order_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  `CREATE TABLE IF NOT EXISTS coupons (
    id               VARCHAR(36)   PRIMARY KEY,
    code             VARCHAR(50)   NOT NULL UNIQUE,
    type             ENUM('percent','fixed') NOT NULL,
    value            DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT NULL,
    max_uses         INT           DEFAULT NULL,
    used_count       INT           NOT NULL DEFAULT 0,
    expires_at       DATETIME      DEFAULT NULL,
    is_active        TINYINT(1)   NOT NULL DEFAULT 1,
    created_at       DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,
];

async function run() {
  const conn = await pool.getConnection();
  let ok = 0, failed = 0;
  try {
    for (const sql of tables) {
      const preview = sql.trim().split('\n')[0].slice(0, 70);
      try {
        await conn.query(sql);
        console.log(`✅ ${preview}`);
        ok++;
      } catch (e) {
        console.warn(`⚠️  ${preview}\n   → ${e.message}`);
        failed++;
      }
    }
    console.log(`\nSetup terminé : ${ok} tables OK, ${failed} erreurs`);
  } finally {
    conn.release();
    pool.end();
  }
}

run();
