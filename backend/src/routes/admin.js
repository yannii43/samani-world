// backend/src/routes/admin.js
import { Router } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { pool } from '../db.js';
import { authRequired, adminOnly } from '../middlewares/auth.js';

const router = Router();

// Tous les endpoints admin nécessitent une auth + rôle admin
router.use(authRequired, adminOnly);

// ── UPLOAD ──────────────────────────────────────────────────────────────────

const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: (Number(process.env.MAX_FILE_SIZE_MB) || 5) * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Seules les images sont acceptées'));
  },
});

// POST /api/admin/upload
router.post('/upload', upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ ok: false, error: 'NO_FILE' });
  const url = `/uploads/${req.file.filename}`;
  return res.json({ ok: true, url });
});

// ── STATS ────────────────────────────────────────────────────────────────────

// GET /api/admin/stats
router.get('/stats', async (_req, res) => {
  try {
    const [[{ totalProducts }]] = await pool.query(`SELECT COUNT(*) AS totalProducts FROM products WHERE is_active = 1`);
    const [[{ totalOrders }]] = await pool.query(`SELECT COUNT(*) AS totalOrders FROM orders`);
    const [[{ revenue }]] = await pool.query(`SELECT COALESCE(SUM(total), 0) AS revenue FROM orders WHERE order_status NOT IN ('incident')`);
    const [[{ totalCustomers }]] = await pool.query(`SELECT COUNT(*) AS totalCustomers FROM users WHERE role = 'client'`);
    const [[{ pendingOrders }]] = await pool.query(`SELECT COUNT(*) AS pendingOrders FROM orders WHERE order_status IN ('confirmed', 'preparing', 'ready', 'handover')`);

    const [recentOrders] = await pool.query(
      `SELECT id, order_number AS orderNumber, customer_name AS customerName, total, order_status AS orderStatus, created_at AS createdAt
       FROM orders ORDER BY created_at DESC LIMIT 10`
    );

    const [topProducts] = await pool.query(
      `SELECT p.name, SUM(oi.quantity) AS totalSold, SUM(oi.quantity * oi.price) AS revenue
       FROM order_items oi JOIN products p ON p.id = oi.product_id
       GROUP BY oi.product_id, p.name ORDER BY totalSold DESC LIMIT 5`
    );

    return res.json({
      ok: true,
      stats: { totalProducts, totalOrders, revenue, totalCustomers, pendingOrders },
      recentOrders,
      topProducts,
    });
  } catch (err) {
    console.error('GET /admin/stats error:', err);
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// ── PRODUCTS ADMIN ───────────────────────────────────────────────────────────

function slugify(str) {
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// POST /api/admin/products
router.post('/products', async (req, res) => {
  const {
    name, description, categoryId, subCategoryId,
    basePrice, coverImage, gallery, isFeatured, isNewArrival, isBestSeller,
  } = req.body || {};

  if (!name || !categoryId || !basePrice) {
    return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'name, categoryId, basePrice requis' });
  }

  const id = crypto.randomUUID();
  let slug = slugify(name);
  // Assurer unicité du slug
  const [existing] = await pool.query(`SELECT id FROM products WHERE slug = ?`, [slug]);
  if (existing.length) slug = `${slug}-${Date.now()}`;

  try {
    await pool.query(
      `INSERT INTO products (id,name,slug,description,category_id,sub_category_id,base_price,cover_image,gallery_json,is_featured,is_new_arrival,is_best_seller,is_active)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?,1)`,
      [
        id, name, slug, description || null, categoryId, subCategoryId || null,
        Number(basePrice), coverImage || null,
        JSON.stringify(gallery || []),
        isFeatured ? 1 : 0, isNewArrival ? 1 : 0, isBestSeller ? 1 : 0,
      ]
    );
    return res.status(201).json({ ok: true, id, slug });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// PUT /api/admin/products/:id
router.put('/products/:id', async (req, res) => {
  const { id } = req.params;
  const {
    name, description, categoryId, subCategoryId,
    basePrice, coverImage, gallery, isFeatured, isNewArrival, isBestSeller, isActive,
  } = req.body || {};

  const fields = [];
  const values = [];

  if (name !== undefined) { fields.push('name = ?'); values.push(name); }
  if (description !== undefined) { fields.push('description = ?'); values.push(description); }
  if (categoryId !== undefined) { fields.push('category_id = ?'); values.push(categoryId); }
  if (subCategoryId !== undefined) { fields.push('sub_category_id = ?'); values.push(subCategoryId || null); }
  if (basePrice !== undefined) { fields.push('base_price = ?'); values.push(Number(basePrice)); }
  if (coverImage !== undefined) { fields.push('cover_image = ?'); values.push(coverImage); }
  if (gallery !== undefined) { fields.push('gallery_json = ?'); values.push(JSON.stringify(gallery)); }
  if (isFeatured !== undefined) { fields.push('is_featured = ?'); values.push(isFeatured ? 1 : 0); }
  if (isNewArrival !== undefined) { fields.push('is_new_arrival = ?'); values.push(isNewArrival ? 1 : 0); }
  if (isBestSeller !== undefined) { fields.push('is_best_seller = ?'); values.push(isBestSeller ? 1 : 0); }
  if (isActive !== undefined) { fields.push('is_active = ?'); values.push(isActive ? 1 : 0); }
  fields.push('updated_at = NOW()');

  if (fields.length === 1) {
    return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'Aucun champ à modifier' });
  }

  try {
    const [result] = await pool.query(
      `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// DELETE /api/admin/products/:id  (soft delete)
router.delete('/products/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE products SET is_active = 0, updated_at = NOW() WHERE id = ?`,
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// ── VARIANTS ─────────────────────────────────────────────────────────────────

// POST /api/admin/products/:productId/variants
router.post('/products/:productId/variants', async (req, res) => {
  const { productId } = req.params;
  const { sku, price, stock, optionValues } = req.body || {};

  if (!sku) return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'sku requis' });

  const id = crypto.randomUUID();
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    await conn.query(
      `INSERT INTO product_variants (id, product_id, sku, price, stock, is_active) VALUES (?,?,?,?,?,1)`,
      [id, productId, sku, price ?? null, Number(stock) || 0]
    );
    for (const ov of (optionValues || [])) {
      await conn.query(
        `INSERT INTO variant_option_values (variant_id, option_id, value_id) VALUES (?,?,?)`,
        [id, ov.optionId, ov.valueId]
      );
    }
    await conn.commit();
    return res.status(201).json({ ok: true, id });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  } finally {
    conn.release();
  }
});

// PATCH /api/admin/variants/:id  (stock / price)
router.patch('/variants/:id', async (req, res) => {
  const { id } = req.params;
  const { stock, price, isActive } = req.body || {};

  const fields = [];
  const values = [];
  if (stock !== undefined) { fields.push('stock = ?'); values.push(Number(stock)); }
  if (price !== undefined) { fields.push('price = ?'); values.push(price === null ? null : Number(price)); }
  if (isActive !== undefined) { fields.push('is_active = ?'); values.push(isActive ? 1 : 0); }

  if (!fields.length) return res.status(400).json({ ok: false, error: 'BAD_REQUEST' });

  try {
    const [result] = await pool.query(
      `UPDATE product_variants SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// ── CATEGORIES ADMIN ─────────────────────────────────────────────────────────

// POST /api/admin/categories
router.post('/categories', async (req, res) => {
  const { name, description, image, parentId, sortOrder } = req.body || {};
  if (!name) return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'name requis' });

  const id = crypto.randomUUID();
  let slug = slugify(name);
  const [ex] = await pool.query(`SELECT id FROM categories WHERE slug = ?`, [slug]);
  if (ex.length) slug = `${slug}-${Date.now()}`;

  try {
    await pool.query(
      `INSERT INTO categories (id, name, slug, description, image, parent_id, sort_order, is_active) VALUES (?,?,?,?,?,?,?,1)`,
      [id, name, slug, description || null, image || null, parentId || null, sortOrder || 0]
    );
    return res.status(201).json({ ok: true, id, slug });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// PUT /api/admin/categories/:id
router.put('/categories/:id', async (req, res) => {
  const { id } = req.params;
  const { name, description, image, parentId, sortOrder, isActive } = req.body || {};

  const fields = [];
  const values = [];
  if (name !== undefined) { fields.push('name = ?'); values.push(name); }
  if (description !== undefined) { fields.push('description = ?'); values.push(description); }
  if (image !== undefined) { fields.push('image = ?'); values.push(image); }
  if (parentId !== undefined) { fields.push('parent_id = ?'); values.push(parentId || null); }
  if (sortOrder !== undefined) { fields.push('sort_order = ?'); values.push(Number(sortOrder)); }
  if (isActive !== undefined) { fields.push('is_active = ?'); values.push(isActive ? 1 : 0); }

  if (!fields.length) return res.status(400).json({ ok: false, error: 'BAD_REQUEST' });

  try {
    const [result] = await pool.query(
      `UPDATE categories SET ${fields.join(', ')} WHERE id = ?`,
      [...values, id]
    );
    if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// DELETE /api/admin/categories/:id  (soft delete)
router.delete('/categories/:id', async (req, res) => {
  try {
    const [result] = await pool.query(
      `UPDATE categories SET is_active = 0 WHERE id = ?`,
      [req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// ── ORDERS ADMIN ──────────────────────────────────────────────────────────────

const VALID_ORDER_STATUSES = ['confirmed', 'preparing', 'ready', 'handover', 'delivering', 'delivered', 'incident'];
const VALID_PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'refunded'];

// PATCH /api/admin/orders/:id/status
router.patch('/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { orderStatus, paymentStatus, note } = req.body || {};

  if (orderStatus && !VALID_ORDER_STATUSES.includes(orderStatus)) {
    return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: `orderStatus invalide. Valeurs: ${VALID_ORDER_STATUSES.join(', ')}` });
  }
  if (paymentStatus && !VALID_PAYMENT_STATUSES.includes(paymentStatus)) {
    return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: `paymentStatus invalide.` });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const fields = [];
    const values = [];
    if (orderStatus) { fields.push('order_status = ?'); values.push(orderStatus); }
    if (paymentStatus) { fields.push('payment_status = ?'); values.push(paymentStatus); }

    if (fields.length) {
      const [result] = await conn.query(
        `UPDATE orders SET ${fields.join(', ')} WHERE id = ?`,
        [...values, id]
      );
      if (!result.affectedRows) {
        await conn.rollback();
        return res.status(404).json({ ok: false, error: 'ORDER_NOT_FOUND' });
      }
    }

    // Créer un tracking event si orderStatus change
    if (orderStatus) {
      await conn.query(
        `INSERT INTO tracking_events (id, order_id, status, message, created_at) VALUES (UUID(), ?, ?, ?, NOW())`,
        [id, orderStatus, note || null]
      );
    }

    await conn.commit();
    return res.json({ ok: true });
  } catch (err) {
    await conn.rollback();
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  } finally {
    conn.release();
  }
});

// ── CUSTOMERS ADMIN ───────────────────────────────────────────────────────────

// GET /api/admin/customers
router.get('/customers', async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 50, 100);
  const offset = Number(req.query.offset) || 0;
  const q = req.query.q ? `%${req.query.q}%` : null;

  try {
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) AS total FROM users WHERE role = 'client' ${q ? 'AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)' : ''}`,
      q ? [q, q, q] : []
    );

    const [customers] = await pool.query(
      `SELECT id, name, email, phone, created_at AS createdAt,
              (SELECT COUNT(*) FROM orders WHERE customer_email = users.email) AS orderCount,
              (SELECT COALESCE(SUM(total), 0) FROM orders WHERE customer_email = users.email AND order_status != 'incident') AS totalSpent
       FROM users WHERE role = 'client'
       ${q ? 'AND (name LIKE ? OR email LIKE ? OR phone LIKE ?)' : ''}
       ORDER BY created_at DESC LIMIT ? OFFSET ?`,
      q ? [q, q, q, limit, offset] : [limit, offset]
    );

    return res.json({ ok: true, total, customers });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// GET /api/admin/customers/:id
router.get('/customers/:id', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, name, email, phone, role, created_at AS createdAt FROM users WHERE id = ? LIMIT 1`,
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });
    const customer = rows[0];

    const [orders] = await pool.query(
      `SELECT id, order_number AS orderNumber, total, order_status AS orderStatus, created_at AS createdAt
       FROM orders WHERE customer_email = ? ORDER BY created_at DESC LIMIT 20`,
      [customer.email]
    );

    return res.json({ ok: true, customer, orders });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// ── PROMOTIONS (COUPONS) ──────────────────────────────────────────────────────

// GET /api/admin/coupons
router.get('/coupons', async (_req, res) => {
  try {
    const [coupons] = await pool.query(
      `SELECT id, code, type, value, min_order_amount AS minOrderAmount,
              max_uses AS maxUses, used_count AS usedCount,
              expires_at AS expiresAt, is_active AS isActive, created_at AS createdAt
       FROM coupons ORDER BY created_at DESC`
    );
    return res.json({ ok: true, coupons });
  } catch (err) {
    // Table n'existe peut-être pas encore
    return res.json({ ok: true, coupons: [] });
  }
});

// POST /api/admin/coupons
router.post('/coupons', async (req, res) => {
  const { code, type, value, minOrderAmount, maxUses, expiresAt } = req.body || {};
  if (!code || !type || value === undefined) {
    return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'code, type, value requis' });
  }
  if (!['percent', 'fixed'].includes(type)) {
    return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'type: percent | fixed' });
  }

  const id = crypto.randomUUID();
  try {
    await pool.query(
      `INSERT INTO coupons (id, code, type, value, min_order_amount, max_uses, used_count, expires_at, is_active)
       VALUES (?, ?, ?, ?, ?, ?, 0, ?, 1)`,
      [id, code.toUpperCase(), type, Number(value), minOrderAmount || null, maxUses || null, expiresAt || null]
    );
    return res.status(201).json({ ok: true, id });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') {
      return res.status(409).json({ ok: false, error: 'DUPLICATE', message: 'Code promo déjà existant' });
    }
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// PUT /api/admin/coupons/:id
router.put('/coupons/:id', async (req, res) => {
  const { id } = req.params;
  const { isActive, maxUses, expiresAt } = req.body || {};

  const fields = [];
  const values = [];
  if (isActive !== undefined) { fields.push('is_active = ?'); values.push(isActive ? 1 : 0); }
  if (maxUses !== undefined) { fields.push('max_uses = ?'); values.push(maxUses || null); }
  if (expiresAt !== undefined) { fields.push('expires_at = ?'); values.push(expiresAt || null); }

  if (!fields.length) return res.status(400).json({ ok: false, error: 'BAD_REQUEST' });

  try {
    await pool.query(`UPDATE coupons SET ${fields.join(', ')} WHERE id = ?`, [...values, id]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// DELETE /api/admin/coupons/:id
router.delete('/coupons/:id', async (req, res) => {
  try {
    await pool.query(`DELETE FROM coupons WHERE id = ?`, [req.params.id]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

// ── REVIEWS ───────────────────────────────────────────────────────────────────

// GET /api/admin/reviews
router.get('/reviews', async (req, res) => {
  const status = req.query.status || 'pending';
  try {
    const [reviews] = await pool.query(
      `SELECT r.id, r.product_id AS productId, p.name AS productName,
              r.user_id AS userId, u.name AS userName,
              r.rating, r.comment, r.status, r.created_at AS createdAt
       FROM reviews r
       JOIN products p ON p.id = r.product_id
       LEFT JOIN users u ON u.id = r.user_id
       WHERE r.status = ? ORDER BY r.created_at DESC LIMIT 50`,
      [status]
    );
    return res.json({ ok: true, reviews });
  } catch {
    return res.json({ ok: true, reviews: [] });
  }
});

// PATCH /api/admin/reviews/:id
router.patch('/reviews/:id', async (req, res) => {
  const { status } = req.body || {};
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({ ok: false, error: 'BAD_REQUEST', message: 'status: approved | rejected' });
  }
  try {
    await pool.query(`UPDATE reviews SET status = ? WHERE id = ?`, [status, req.params.id]);
    return res.json({ ok: true });
  } catch (err) {
    return res.status(500).json({ ok: false, error: 'DB_ERROR', message: err?.message });
  }
});

export default router;
