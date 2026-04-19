import express from "express";
import cors from "cors";

import catalogRouter from "./routes/catalog.js";
import ordersRouter from "./routes/orders.js";

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());

// ✅ Health
app.get("/", (_req, res) => {
  res.json({ ok: true, name: "Samani API", status: "running" });
});

// ✅ ROUTES (AVANT le NOT_FOUND)
app.use("/", catalogRouter);
app.use("/", ordersRouter);
// --- GET ORDER BY ID ---------------------------------------------------------
app.get("/orders/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const [rows] = await db.query(
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

    const [items] = await db.query(
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
    return res.status(500).json({ ok: false, error: "SERVER_ERROR" });
  }
});

// ✅ NOT_FOUND à la FIN
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "NOT_FOUND" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
