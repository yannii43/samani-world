// backend/src/routes/orders.js
import { Router } from "express";
import { pool } from "../db.js";
import crypto from "crypto";

const router = Router();

// Helpers ---------------------------------------------------------
function makeOrderNumber() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `ORD-${y}${m}${day}-${rand}`;
}

function shippingCostFromMethod(method) {
  if (method === "click-collect") return 0;
  if (method === "dakar") return 2000;
  if (method === "hors-dakar") return 5000;
  return null;
}

// ✅ GET /api/orders ------------------------------------------------
router.get("/orders", async (_req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT
        id,
        order_number AS orderNumber,
        subtotal,
        shipping_cost AS shippingCost,
        discount,
        total,
        payment_status AS paymentStatus,
        order_status AS orderStatus,
        customer_name AS customerName,
        customer_email AS customerEmail,
        customer_phone AS customerPhone,
        shipping_method AS shippingMethod,
        shipping_address AS shippingAddress,
        created_at AS createdAt
      FROM orders
      ORDER BY created_at DESC
      LIMIT 50`
    );

    return res.json({ ok: true, orders: rows });
  } catch (err) {
    console.error("GET /orders error:", err);
    return res.status(500).json({ ok: false, error: "DB_ERROR", message: err?.message });
  }
});

// ✅ GET /api/orders/:id -------------------------------------------
router.get("/orders/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await pool.query(
      `SELECT 
        id,
        order_number AS orderNumber,
        subtotal,
        shipping_cost AS shippingCost,
        discount,
        total,
        payment_status AS paymentStatus,
        order_status AS orderStatus,
        customer_name AS customerName,
        customer_email AS customerEmail,
        customer_phone AS customerPhone,
        shipping_method AS shippingMethod,
        shipping_address AS shippingAddress,
        created_at AS createdAt
      FROM orders
      WHERE id = ?
      LIMIT 1`,
      [id]
    );

    if (!rows || rows.length === 0) {
      return res.status(404).json({ ok: false, error: "ORDER_NOT_FOUND" });
    }

    const order = rows[0];

    const [items] = await pool.query(
      `SELECT
        product_id AS productId,
        variant_id AS variantId,
        quantity,
        price AS unitPrice,
        product_name AS productName,
        variant_details AS variantDetails,
        cover_image AS coverImage
      FROM order_items
      WHERE order_id = ?
      ORDER BY id ASC`,
      [id]
    );

    return res.json({ ok: true, order, items });
  } catch (err) {
    console.error("GET /orders/:id error:", err);
    return res.status(500).json({ ok: false, error: "DB_ERROR", message: err?.message });
  }
});

// ✅ POST /api/orders ----------------------------------------------
router.post("/orders", async (req, res) => {
  const {
    customerName,
    customerEmail,
    customerPhone,
    shippingMethod,
    shippingAddress,
    paymentMethod,
    items,
    notes,
  } = req.body || {};

  if (!customerName || !customerEmail || !customerPhone) {
    return res.status(400).json({
      ok: false,
      error: "BAD_REQUEST",
      message: "customerName, customerEmail, customerPhone requis",
    });
  }
  if (!shippingMethod || !shippingAddress) {
    return res.status(400).json({
      ok: false,
      error: "BAD_REQUEST",
      message: "shippingMethod + shippingAddress requis",
    });
  }
  if (!paymentMethod) {
    return res.status(400).json({
      ok: false,
      error: "BAD_REQUEST",
      message: "paymentMethod requis",
    });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      ok: false,
      error: "BAD_REQUEST",
      message: "items doit être un tableau non vide",
    });
  }

  const shipCost = shippingCostFromMethod(shippingMethod);
  if (shipCost === null) {
    return res.status(400).json({
      ok: false,
      error: "BAD_REQUEST",
      message: "shippingMethod invalide (click-collect | dakar | hors-dakar)",
    });
  }

  if (!["online", "on-delivery"].includes(paymentMethod)) {
    return res.status(400).json({
      ok: false,
      error: "BAD_REQUEST",
      message: "paymentMethod invalide (online | on-delivery)",
    });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // 1) Vérifier chaque item (produit + variante)
    const resolved = [];
    let subtotal = 0;

    for (const it of items) {
      const productId = it?.productId;
      const variantId = it?.variantId; // ✅ dans ton front tu forces variantId
      const quantity = Number(it?.quantity || 0);

      if (!productId || !variantId || !Number.isFinite(quantity) || quantity <= 0) {
        await conn.rollback();
        return res.status(400).json({
          ok: false,
          error: "BAD_REQUEST",
          message: "Chaque item doit avoir productId + variantId + quantity > 0",
        });
      }

      // Produit
      const [pRows] = await conn.query(
        `SELECT id, name, base_price AS basePrice, cover_image AS coverImage
         FROM products
         WHERE id = ?
         LIMIT 1`,
        [productId]
      );

      if (!pRows || pRows.length === 0) {
        await conn.rollback();
        return res.status(400).json({
          ok: false,
          error: "BAD_REQUEST",
          message: `Produit introuvable: ${productId}`,
        });
      }

      const product = pRows[0];

      // Variante
      const [vRows] = await conn.query(
        `SELECT id, product_id AS productId, price
         FROM product_variants
         WHERE id = ?
         LIMIT 1`,
        [variantId]
      );

      if (!vRows || vRows.length === 0) {
        await conn.rollback();
        return res.status(400).json({
          ok: false,
          error: "BAD_REQUEST",
          message: `Variante introuvable: ${variantId}`,
        });
      }

      const variant = vRows[0];

      if (variant.productId !== productId) {
        await conn.rollback();
        return res.status(400).json({
          ok: false,
          error: "BAD_REQUEST",
          message: "Produit/variante invalide (la variante n'appartient pas au produit).",
        });
      }

      let unitPrice = Number(product.basePrice || 0);
      if (variant.price !== null && variant.price !== undefined) unitPrice = Number(variant.price);

      const variantDetails = "STANDARD"; // tu enrichiras après (taille/couleur)
      const lineTotal = unitPrice * quantity;

      subtotal += lineTotal;

      resolved.push({
        productId,
        variantId,
        quantity,
        unitPrice,
        productName: product.name,
        variantDetails,
        coverImage: product.coverImage || null,
      });
    }

    // 2) Insert order
    const orderId = crypto.randomUUID();
    const orderNumber = makeOrderNumber();
    const discount = 0;
    const total = subtotal + shipCost - discount;

    // ✅ On met direct order_status = confirmed (pas pending)
    await conn.query(
      `INSERT INTO orders (
        id,
        order_number,
        customer_name,
        customer_email,
        customer_phone,
        shipping_method,
        shipping_address,
        shipping_cost,
        subtotal,
        discount,
        total,
        payment_method,
        payment_status,
        order_status,
        coupon_code,
        notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        orderId,
        orderNumber,
        customerName,
        customerEmail,
        customerPhone,
        shippingMethod,
        shippingAddress,
        shipCost,
        subtotal,
        discount,
        total,
        paymentMethod,
        "pending",
        "confirmed",
        null,
        notes || null,
      ]
    );

    // 3) Insert items
    for (const it of resolved) {
      await conn.query(
        `INSERT INTO order_items (
          id,
          order_id,
          product_id,
          variant_id,
          quantity,
          price,
          product_name,
          variant_details,
          cover_image
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          crypto.randomUUID(),
          orderId,
          it.productId,
          it.variantId,
          it.quantity,
          it.unitPrice,
          it.productName,
          it.variantDetails,
          it.coverImage,
        ]
      );
    }

    // ✅ 4) Auto tracking event: confirmed
    await conn.query(
      `INSERT INTO tracking_events (id, order_id, status, note, created_at)
       VALUES (UUID(), ?, 'confirmed', 'Commande confirmée', NOW())`,
      [orderId]
    );
    await conn.query(`UPDATE orders SET order_status = 'confirmed' WHERE id = ?`, [orderId]);

    await conn.commit();

    return res.status(201).json({
      ok: true,
      orderId,
      orderNumber,
      subtotal,
      shippingCost: shipCost,
      discount,
      total,
    });
  } catch (err) {
    await conn.rollback();
    console.error("POST /orders DB_ERROR", err);
    return res.status(500).json({ ok: false, error: "DB_ERROR", message: err?.message });
  } finally {
    conn.release();
  }
});

export default router;
