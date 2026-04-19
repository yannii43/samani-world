// src/db.js
import mysql from "mysql2/promise";
import "dotenv/config";

export const pool = mysql.createPool({
  host: process.env.DB_HOST || "127.0.0.1",
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "samani_world",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ✅ Si ailleurs tu fais "import db from './db.js'"
export default pool;
