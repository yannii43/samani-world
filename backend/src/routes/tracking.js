// backend/src/routes/tracking.js
import express from "express";
import { pool } from "../db.js";
import { authOptional, authRequired, adminOnly } from "../middlewares/auth.js";

const router = express.Router();

const STATUSES = ["confirmed", "preparing", "ready", "handover", "delivering", "delivered", "incident"];
const STATUSES_SET = new Set(STATUSES);

// ordre (pour valider les transitions)
const STATUS_INDEX = Object.fromEntries(STATUSES.map((s, i) => [s, i]));

// règle transitions (simple + robuste)
function isAllowedTransition(from, to) {
  // si pas de from (aucun event), on autorise seulement confirmed ou incident
  if (!from) return to === "confirmed" || to === "incident";

  // incident peut arriver à tout moment
  if (to === "incident") return true;

  // delivered est final (après delivered, rien sauf incident)
  if (from === "delivered") return false;

  // normal: autoriser progression ou même statut (même statut sera filtré par anti-doublon)
  return STATUS_INDEX[to] >= STATUS_INDEX[from];
}

async function getLastEvent(orderId) {
  const [rows] = await pool.query(
    `SELECT id, status, note, created_at AS createdAt
     FROM tracking_events
     WHERE order_id = ?
     ORDER BY created_at DESC
     LIMIT 1`,
    [orderId]
  );
  return rows?.[0] || null;
}

async function recomputeOrderStatus(orderId) {
  const last = await getLastEvent(orderId);
  const newStatus = last?.status || "pending"; // fallback si plus aucun event
  await pool.query(`UPDATE orders SET order_status = ? WHERE id = ?`, [newStatus, orderId]);
  return newStatus;
}

// ---------------- PUBLIC TRACKING ----------------
// POST /api/track  { orderNumber, phone }
router.post("/track", authOptional, async (req, res) => {
  try {
    const orderNumber = String(req.body?.orderNumber || "").trim();
    const phone = String(req.body?.phone || "").trim();

    if (!orderNumber || !phone) {
      return res.status(400).json({
        ok: false,
        error: "BAD_REQUEST",
        message: "orderNumber et phone requis.",
      });
    }

    const [[order]] = await pool.query(
      `SELECT
        id,
        order_number AS orderNumber,
        customer_name AS customerName,
        customer_phone AS customerPhone,
        shipping_method AS shippingMethod,
        shipping_address AS shippingAddress,
        payment_status AS paymentStatus,
        order_status AS orderStatus,
        created_at AS createdAt
       FROM orders
       WHERE order_number = ? AND customer_phone = ?
       LIMIT 1`,
      [orderNumber, phone]
    );

    if (!order) {
      return res.status(404).json({ ok: false, error: "NOT_FOUND", message: "Commande introuvable." });
    }

    const [events] = await pool.query(
      `SELECT
        id,
        status,
        note,
        created_at AS createdAt
       FROM tracking_events
       WHERE order_id = ?
       ORDER BY created_at ASC`,
      [order.id]
    );

    return res.json({ ok: true, order, events: events || [] });
  } catch (e) {
    console.error("POST /api/track", e?.message || e);
    return res.status(500).json({ ok: false, error: "DB_ERROR" });
  }
});

// ---------------- ADMIN: GET ORDER + EVENTS ----------------
// GET /api/admin/tracking/:orderId
router.get("/admin/tracking/:orderId", authRequired, adminOnly, async (req, res) => {
  try {
    const orderId = String(req.params?.orderId || "").trim();
    if (!orderId) {
      return res.status(400).json({ ok: false, error: "BAD_REQUEST", message: "orderId requis." });
    }

    const [[order]] = await pool.query(
      `SELECT
        id,
        order_number AS orderNumber,
        customer_name AS customerName,
        customer_email AS customerEmail,
        customer_phone AS customerPhone,
        shipping_method AS shippingMethod,
        shipping_address AS shippingAddress,
        shipping_cost AS shippingCost,
        subtotal,
        discount,
        total,
        payment_method AS paymentMethod,
        payment_status AS paymentStatus,
        order_status AS orderStatus,
        created_at AS createdAt
       FROM orders
       WHERE id = ?
       LIMIT 1`,
      [orderId]
    );

    if (!order) return res.status(404).json({ ok: false, error: "ORDER_NOT_FOUND" });

    const [events] = await pool.query(
      `SELECT id, status, note, created_at AS createdAt
       FROM tracking_events
       WHERE order_id = ?
       ORDER BY created_at ASC`,
      [orderId]
    );

    return res.json({ ok: true, order, events: events || [] });
  } catch (e) {
    console.error("GET /api/admin/tracking/:orderId", e?.message || e);
    return res.status(500).json({ ok: false, error: "DB_ERROR" });
  }
});

// ---------------- ADMIN: ADD TRACKING EVENT ----------------
// POST /api/admin/tracking/event { orderId, status, note }
router.post("/admin/tracking/event", authRequired, adminOnly, async (req, res) => {
  try {
    const orderId = String(req.body?.orderId || "").trim();
    const status = String(req.body?.status || "").trim();
    const note = req.body?.note ? String(req.body.note).trim() : null;

    if (!orderId || !status) {
      return res.status(400).json({ ok: false, error: "BAD_REQUEST", message: "orderId et status requis." });
    }
    if (!STATUSES_SET.has(status)) {
      return res.status(400).json({ ok: false, error: "BAD_STATUS", message: "Status invalide." });
    }

    const [[o]] = await pool.query(`SELECT id FROM orders WHERE id = ? LIMIT 1`, [orderId]);
    if (!o) return res.status(404).json({ ok: false, error: "ORDER_NOT_FOUND" });

    const last = await getLastEvent(orderId);

    // anti-doublon
    if (last?.status === status) {
      return res.json({ ok: true, skipped: true, reason: "SAME_AS_LAST_STATUS", last });
    }

    // transition logique
    if (!isAllowedTransition(last?.status || null, status)) {
      return res.status(400).json({
        ok: false,
        error: "BAD_FLOW",
        message: `Transition invalide: ${last?.status || "NONE"} -> ${status}`,
        last,
      });
    }

    // create event
    await pool.query(
      `INSERT INTO tracking_events (id, order_id, status, note, created_at)
       VALUES (UUID(), ?, ?, ?, NOW())`,
      [orderId, status, note]
    );

    const orderStatus = await recomputeOrderStatus(orderId);

    const created = await getLastEvent(orderId);
    return res.json({ ok: true, skipped: false, created, orderStatus });
  } catch (e) {
    console.error("POST /api/admin/tracking/event", e?.message || e);
    return res.status(500).json({ ok: false, error: "DB_ERROR" });
  }
});

// ---------------- ADMIN: PATCH EVENT NOTE ----------------
// PATCH /api/admin/tracking/event/:eventId { note }
router.patch("/admin/tracking/event/:eventId", authRequired, adminOnly, async (req, res) => {
  try {
    const eventId = String(req.params?.eventId || "").trim();
    const note = req.body?.note !== undefined ? String(req.body.note).trim() : null;

    if (!eventId) return res.status(400).json({ ok: false, error: "BAD_REQUEST", message: "eventId requis." });

    const [[ev]] = await pool.query(
      `SELECT id, order_id AS orderId, status, note, created_at AS createdAt
       FROM tracking_events WHERE id = ? LIMIT 1`,
      [eventId]
    );
    if (!ev) return res.status(404).json({ ok: false, error: "EVENT_NOT_FOUND" });

    await pool.query(`UPDATE tracking_events SET note = ? WHERE id = ?`, [note, eventId]);

    const [rows] = await pool.query(
      `SELECT id, order_id AS orderId, status, note, created_at AS createdAt
       FROM tracking_events WHERE id = ? LIMIT 1`,
      [eventId]
    );

    const orderStatus = await recomputeOrderStatus(ev.orderId);
    return res.json({ ok: true, updated: rows?.[0], orderStatus });
  } catch (e) {
    console.error("PATCH /api/admin/tracking/event/:eventId", e?.message || e);
    return res.status(500).json({ ok: false, error: "DB_ERROR" });
  }
});

// ---------------- ADMIN: DELETE EVENT ----------------
// DELETE /api/admin/tracking/event/:eventId
router.delete("/admin/tracking/event/:eventId", authRequired, adminOnly, async (req, res) => {
  try {
    const eventId = String(req.params?.eventId || "").trim();
    if (!eventId) return res.status(400).json({ ok: false, error: "BAD_REQUEST", message: "eventId requis." });

    const [[ev]] = await pool.query(`SELECT id, order_id AS orderId FROM tracking_events WHERE id = ? LIMIT 1`, [
      eventId,
    ]);
    if (!ev) return res.status(404).json({ ok: false, error: "EVENT_NOT_FOUND" });

    await pool.query(`DELETE FROM tracking_events WHERE id = ?`, [eventId]);

    const orderStatus = await recomputeOrderStatus(ev.orderId);
    return res.json({ ok: true, deleted: true, orderStatus });
  } catch (e) {
    console.error("DELETE /api/admin/tracking/event/:eventId", e?.message || e);
    return res.status(500).json({ ok: false, error: "DB_ERROR" });
  }
});

// ---------------- CUSTOMER: MY ORDERS ----------------
// GET /api/my/orders
router.get("/my/orders", authRequired, async (req, res) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });

    const [[u]] = await pool.query(`SELECT email, phone FROM users WHERE id = ? LIMIT 1`, [userId]);
    if (!u) return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });

    const [orders] = await pool.query(
      `SELECT
        id,
        order_number AS orderNumber,
        subtotal,
        shipping_cost AS shippingCost,
        discount,
        total,
        payment_status AS paymentStatus,
        order_status AS orderStatus,
        shipping_method AS shippingMethod,
        shipping_address AS shippingAddress,
        created_at AS createdAt
      FROM orders
      WHERE customer_email = ? OR customer_phone = ?
      ORDER BY created_at DESC
      LIMIT 100`,
      [u.email, u.phone]
    );

    return res.json({ ok: true, orders: orders || [] });
  } catch (e) {
    console.error("GET /api/my/orders", e?.message || e);
    return res.status(500).json({ ok: false, error: "DB_ERROR" });
  }
});

export default router;
