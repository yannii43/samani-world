// backend/src/routes/client.js
// Routes accessibles aux clients connectés
import { Router } from 'express';
import crypto from 'crypto';
import { pool } from '../db.js';
import { authRequired, authOptional } from '../middlewares/auth.js';

const router = Router();

// ── COUPON VALIDATION (public) ────────────────────────────────────────────────

// GET /api/coupons/validate?code=XXX&orderAmount=50000
router.get('/coupons/validate', async (req, res) => {
  const code = String(req.query.code || '').toUpperCase().trim();
  const orderAmount = Number(req.query.orderAmount) || 0;

  if (!code) return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'code requis' });

  try {
    const [rows] = await pool.query(
      `SELECT id, code, type, value, min_order_amount AS minOrderAmount, max_uses AS maxUses, used_count AS usedCount, expires_at AS expiresAt
       FROM coupons WHERE code = ? AND is_active = 1 LIMIT 1`,
      [code]
    );

    if (!rows.length) return res.status(404).json({ ok: false, error: 'INVALID_CODE', message: 'Code promo invalide' });
    const c = rows[0];

    if (c.expiresAt && new Date(c.expiresAt) < new Date()) {
      return res.status(400).json({ ok: false, error: 'EXPIRED', message: 'Code promo expiré' });
    }
    if (c.maxUses !== null && c.usedCount >= c.maxUses) {
      return res.status(400).json({ ok: false, error: 'MAX_USES', message: 'Nombre d\'utilisations maximum atteint' });
    }
    if (c.minOrderAmount && orderAmount < c.minOrderAmount) {
      return res.status(400).json({
        ok: false, error: 'MIN_AMOUNT',
        message: `Montant minimum de commande requis : ${c.minOrderAmount.toLocaleString('fr-FR')} FCFA`,
      });
    }

    const discount = c.type === 'percent'
      ? Math.round(orderAmount * (c.value / 100))
      : Math.round(c.value);

    return res.json({ ok: true, coupon: { code: c.code, type: c.type, value: c.value, discount } });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// ── MES COMMANDES (client connecté) ──────────────────────────────────────────

// GET /api/my/orders
router.get('/my/orders', authRequired, async (req, res) => {
  try {
    const [orders] = await pool.query(
      `SELECT
        id,
        order_number AS orderNumber,
        total,
        order_status AS orderStatus,
        payment_status AS paymentStatus,
        created_at AS createdAt,
        shipping_method AS shippingMethod
       FROM orders
       WHERE customer_email = ?
       ORDER BY created_at DESC
       LIMIT 50`,
      [req.user.email]
    );
    return res.json({ ok: true, orders });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// ── WISHLIST (client connecté) ────────────────────────────────────────────────

// GET /api/wishlist
router.get('/wishlist', authRequired, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.name, p.slug, p.base_price AS basePrice, p.cover_image AS coverImage
       FROM wishlists w JOIN products p ON p.id = w.product_id
       WHERE w.user_id = ? ORDER BY w.created_at DESC`,
      [req.user.id]
    );
    return res.json({ ok: true, products: rows });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// POST /api/wishlist  { productId }
router.post('/wishlist', authRequired, async (req, res) => {
  const { productId } = req.body || {};
  if (!productId) return res.status(400).json({ ok: false, error: 'BAD_REQUEST' });

  try {
    await pool.query(
      `INSERT IGNORE INTO wishlists (id, user_id, product_id) VALUES (?, ?, ?)`,
      [crypto.randomUUID(), req.user.id, productId]
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// DELETE /api/wishlist/:productId
router.delete('/wishlist/:productId', authRequired, async (req, res) => {
  try {
    await pool.query(
      `DELETE FROM wishlists WHERE user_id = ? AND product_id = ?`,
      [req.user.id, req.params.productId]
    );
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// ── REVIEWS (client connecté) ─────────────────────────────────────────────────

// GET /api/products/:id/reviews (public)
router.get('/products/:productId/reviews', authOptional, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.rating, r.comment, r.created_at AS createdAt,
              u.name AS userName
       FROM reviews r LEFT JOIN users u ON u.id = r.user_id
       WHERE r.product_id = ? AND r.status = 'approved'
       ORDER BY r.created_at DESC LIMIT 50`,
      [req.params.productId]
    );
    const [[{ avg }]] = await pool.query(
      `SELECT ROUND(AVG(rating), 1) AS avg FROM reviews WHERE product_id = ? AND status = 'approved'`,
      [req.params.productId]
    );
    return res.json({ ok: true, reviews: rows, avgRating: avg || null });
  } catch {
    return res.json({ ok: true, reviews: [], avgRating: null });
  }
});

// POST /api/products/:id/reviews
router.post('/products/:productId/reviews', authRequired, async (req, res) => {
  const { rating, comment } = req.body || {};
  if (!rating || rating < 1 || rating > 5) {
    return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'rating entre 1 et 5 requis' });
  }
  try {
    await pool.query(
      `INSERT INTO reviews (id, product_id, user_id, rating, comment, status) VALUES (UUID(), ?, ?, ?, ?, 'pending')`,
      [req.params.productId, req.user.id, Number(rating), comment || null]
    );
    return res.status(201).json({ ok: true, message: 'Avis soumis, en attente de modération' });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

export default router;
