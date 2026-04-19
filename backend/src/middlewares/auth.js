// backend/src/middlewares/auth.js
import jwt from "jsonwebtoken";

export const COOKIE_NAME = "samani_token";
export const JWT_SECRET = process.env.JWT_SECRET || "dev_secret_change_me";

function parseCookieHeader(cookieHeader) {
  // "a=b; c=d" -> { a: "b", c: "d" }
  const out = {};
  if (!cookieHeader) return out;

  const parts = String(cookieHeader).split(";");
  for (const p of parts) {
    const [k, ...rest] = p.trim().split("=");
    if (!k) continue;
    out[k] = decodeURIComponent(rest.join("=") || "");
  }
  return out;
}

function readToken(req) {
  // 1) cookie-parser
  const t1 = req.cookies?.[COOKIE_NAME];
  if (t1) return t1;

  // 2) fallback: header Cookie brut
  const raw = req.headers?.cookie;
  const parsed = parseCookieHeader(raw);
  const t2 = parsed[COOKIE_NAME];
  if (t2) return t2;

  // 3) Authorization: Bearer
  const auth = req.headers?.authorization || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  if (m?.[1]) return m[1];

  return null;
}

function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function authOptional(req, _res, next) {
  const token = readToken(req);
  if (!token) return next();

  const payload = verifyToken(token);
  if (!payload) return next();

  req.user = payload; // { id, role, iat, exp }
  return next();
}

export function authRequired(req, res, next) {
  const token = readToken(req);

  // ✅ Debug opt-in (ne s'active que si tu envoies le header)
  const debug = String(req.headers["x-debug-auth"] || "") === "1";

  if (!token) {
    if (debug) {
      return res.status(401).json({
        ok: false,
        error: "UNAUTHORIZED",
        debug: {
          hasCookieParser: Boolean(req.cookies),
          cookieToken: req.cookies?.[COOKIE_NAME] ? "YES" : "NO",
          rawCookieHeader: req.headers?.cookie || null,
          authHeader: req.headers?.authorization || null,
        },
      });
    }
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  }

  const payload = verifyToken(token);
  if (!payload) {
    if (debug) {
      return res.status(401).json({
        ok: false,
        error: "UNAUTHORIZED",
        debug: {
          tokenStartsWith: String(token).slice(0, 20) + "...",
          jwtSecretMode: process.env.JWT_SECRET ? "ENV" : "DEFAULT",
        },
      });
    }
    return res.status(401).json({ ok: false, error: "UNAUTHORIZED" });
  }

  req.user = payload;
  return next();
}


export function adminOnly(req, res, next) {
  const role = String(req.user?.role || "").toLowerCase();
  if (role !== "admin" && role !== "superadmin") {
    return res.status(403).json({ ok: false, error: "FORBIDDEN" });
  }
  return next();
}
