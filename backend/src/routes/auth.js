// backend/src/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../db.js";

const router = express.Router();

const COOKIE_NAME = "samani_token";
const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "7d" });
}

function setAuthCookie(res, token) {
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: false, // local
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// POST /api/auth/register
router.post("/auth/register", async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body || {};

    const name = String(fullName || "").trim();
    const em = String(email || "").trim().toLowerCase();
    const ph = String(phone || "").trim();
    const pw = String(password || "");

    if (!name || !em || !pw) {
      return res.status(400).json({
        ok: false,
        error: "BAD_REQUEST",
        message: "fullName, email, password requis.",
      });
    }

    const [exists] = await pool.query(
      `SELECT id FROM users WHERE email = ? OR (phone IS NOT NULL AND phone = ?) LIMIT 1`,
      [em, ph]
    );
    if (exists?.length) {
      return res.status(409).json({
        ok: false,
        error: "ALREADY_EXISTS",
        message: "Email ou téléphone déjà utilisé.",
      });
    }

    const id = crypto.randomUUID(); // UUID v4 string (36 chars)
    const password_hash = await bcrypt.hash(pw, 10);

    await pool.query(
      `INSERT INTO users (id, email, password_hash, name, role, phone)
       VALUES (?, ?, ?, ?, 'client', ?)`,
      [id, em, password_hash, name, ph || null]
    );

    const token = signToken({ id, role: "client" });
    setAuthCookie(res, token);

    return res.status(201).json({
      ok: true,
      user: { id, role: "client", fullName: name, email: em, phone: ph || null },
    });
  } catch (e) {
    console.error("POST /api/auth/register", e?.message || e);
    return res.status(500).json({ ok: false, error: "DB_ERROR" });
  }
});

// POST /api/auth/login
router.post("/auth/login", async (req, res) => {
  try {
    const { emailOrPhone, password } = req.body || {};
    const ident = String(emailOrPhone || "").trim().toLowerCase();
    const pw = String(password || "");

    if (!ident || !pw) {
      return res.status(400).json({
        ok: false,
        error: "BAD_REQUEST",
        message: "emailOrPhone et password requis.",
      });
    }

    const [rows] = await pool.query(
      `SELECT id, role, name, email, phone, password_hash
       FROM users
       WHERE email = ? OR (phone IS NOT NULL AND phone = ?)
       LIMIT 1`,
      [ident, ident]
    );

    const u = rows?.[0];
    if (!u) return res.status(401).json({ ok: false, error: "INVALID_LOGIN" });

    const ok = await bcrypt.compare(pw, u.password_hash);
    if (!ok) return res.status(401).json({ ok: false, error: "INVALID_LOGIN" });

    const token = signToken({ id: u.id, role: u.role });
    setAuthCookie(res, token);

    return res.json({
      ok: true,
      user: { id: u.id, role: u.role, fullName: u.name, email: u.email, phone: u.phone || null },
    });
  } catch (e) {
    console.error("POST /api/auth/login", e?.message || e);
    return res.status(500).json({ ok: false, error: "DB_ERROR" });
  }
});

// POST /api/auth/logout
router.post("/auth/logout", (_req, res) => {
  res.clearCookie(COOKIE_NAME);
  return res.json({ ok: true });
});

// GET /api/auth/me
router.get("/auth/me", async (req, res) => {
  try {
    const token = req.cookies?.[COOKIE_NAME];
    if (!token) return res.json({ ok: true, user: null });

    const payload = jwt.verify(token, JWT_SECRET);
    const userId = payload?.id;

    const [rows] = await pool.query(
      `SELECT id, role, name, email, phone FROM users WHERE id = ? LIMIT 1`,
      [userId]
    );

    const u = rows?.[0];
    if (!u) return res.json({ ok: true, user: null });

    return res.json({
      ok: true,
      user: { id: u.id, role: u.role, fullName: u.name, email: u.email, phone: u.phone || null },
    });
  } catch {
    return res.json({ ok: true, user: null });
  }
});

export default router;
