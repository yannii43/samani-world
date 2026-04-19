// backend/src/server.js
import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import catalogRouter from "./routes/catalog.js";
import ordersRouter from "./routes/orders.js";
import authRouter from "./routes/auth.js";
import trackingRouter from "./routes/tracking.js";
import adminRouter from "./routes/admin.js";
import clientRouter from "./routes/client.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ✅ Health
app.get("/", (_req, res) => {
  res.json({ ok: true, name: "Samani API", status: "running" });
});

// ✅ Fichiers uploadés (images produits)
const uploadDir = path.resolve(process.env.UPLOAD_DIR || "uploads");
app.use("/uploads", express.static(uploadDir));

// ✅ ROUTES
app.use("/api", catalogRouter);
app.use("/api", ordersRouter);
app.use("/api", authRouter);
app.use("/api", trackingRouter);
app.use("/api/admin", adminRouter);
app.use("/api", clientRouter);

// ✅ NOT_FOUND à la FIN
app.use((_req, res) => {
  res.status(404).json({ ok: false, error: "NOT_FOUND" });
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ API running on http://localhost:${PORT}`);
});
