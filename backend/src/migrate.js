// backend/src/migrate.js
// Ajoute les tables manquantes pour la V1 (idempotent — CREATE TABLE IF NOT EXISTS)
import "dotenv/config";
import { pool } from "./db.js";

const migrations = [
  // ── Coupons ──────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS coupons (
    id            VARCHAR(36) PRIMARY KEY,
    code          VARCHAR(50) NOT NULL UNIQUE,
    type          ENUM('percent','fixed') NOT NULL,
    value         DECIMAL(10,2) NOT NULL,
    min_order_amount DECIMAL(10,2) DEFAULT NULL,
    max_uses      INT DEFAULT NULL,
    used_count    INT NOT NULL DEFAULT 0,
    expires_at    DATETIME DEFAULT NULL,
    is_active     TINYINT(1) NOT NULL DEFAULT 1,
    created_at    DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_code (code),
    INDEX idx_active (is_active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // ── Wishlist ──────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS wishlists (
    id         VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    user_id    VARCHAR(36) NOT NULL,
    product_id VARCHAR(36) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_user_product (user_id, product_id),
    INDEX idx_user (user_id),
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // ── Reviews ───────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS reviews (
    id         VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
    product_id VARCHAR(36) NOT NULL,
    user_id    VARCHAR(36) DEFAULT NULL,
    rating     TINYINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT DEFAULT NULL,
    status     ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_product (product_id),
    INDEX idx_status  (status),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id)    REFERENCES users(id)    ON DELETE SET NULL
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`,

  // ── Colonne coupon_used dans orders (si absent) ────────────────────────────
  // (la table orders existe déjà, on ajoute la colonne coupon_discount si manquante)
  `ALTER TABLE orders ADD COLUMN IF NOT EXISTS coupon_discount DECIMAL(10,2) NOT NULL DEFAULT 0`,
];

async function run() {
  const conn = await pool.getConnection();
  let ok = 0;
  let failed = 0;
  try {
    for (const sql of migrations) {
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
    console.log(`\nMigration terminée : ${ok} OK, ${failed} erreurs`);
  } finally {
    conn.release();
    pool.end();
  }
}

run();
