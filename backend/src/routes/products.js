import express from "express";
import { pool } from "../db.js";

const router = express.Router();

/** Helpers */
async function tableExists(tableName) {
  const [r] = await pool.query(
    `SELECT 1 as ok
     FROM information_schema.tables
     WHERE table_schema = DATABASE() AND table_name = ?
     LIMIT 1`,
    [tableName]
  );
  return !!r?.length;
}

async function columnExists(tableName, columnName) {
  const [r] = await pool.query(
    `SELECT 1 as ok
     FROM information_schema.columns
     WHERE table_schema = DATABASE()
       AND table_name = ?
       AND column_name = ?
     LIMIT 1`,
    [tableName, columnName]
  );
  return !!r?.length;
}

async function pickExistingTable(candidates) {
  for (const t of candidates) {
    if (await tableExists(t)) return t;
  }
  return null;
}

/**
 * GET /api/products
 * Query:
 *  - limit, offset
 *  - q (name/slug)
 *  - categorySlug (ex: robes, abaya…)
 *  - filter=new
 *
 * Response: { ok, total, limit, offset, products: [] }
 */
router.get("/products", async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit || "24", 10), 200);
    const offset = Math.max(parseInt(req.query.offset || "0", 10), 0);

    const q = (req.query.q || "").toString().trim();
    const categorySlug = (req.query.categorySlug || "").toString().trim().toLowerCase();
    const filter = (req.query.filter || "").toString().trim().toLowerCase();

    const productsTable = await pickExistingTable(["Product", "products"]);
    const categoriesTable = await pickExistingTable(["Category", "categories"]);
    const variantsTable = await pickExistingTable(["ProductVariant", "product_variants"]);

    if (!productsTable) return res.status(500).json({ ok: false, error: "PRODUCTS_TABLE_NOT_FOUND" });

    const hasImageUrl = await columnExists(productsTable, "imageUrl");
    const hasBasePrice = await columnExists(productsTable, "basePrice");
    const priceCol = hasBasePrice ? "basePrice" : "price";

    const where = [];
    const params = [];

    if (q) {
      where.push(`(p.name LIKE ? OR p.slug LIKE ?)`);
      const like = `%${q}%`;
      params.push(like, like);
    }

    // categorySlug -> categoryId
    if (categorySlug && categoriesTable) {
      const [catRows] = await pool.query(
        `SELECT id FROM \`${categoriesTable}\` WHERE slug = ? LIMIT 1`,
        [categorySlug]
      );
      const categoryId = catRows?.[0]?.id || null;

      if (!categoryId) {
        return res.json({ ok: true, total: 0, limit, offset, products: [] });
      }

      where.push(`p.categoryId = ?`);
      params.push(categoryId);
    }

    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

    const orderBy = filter === "new" ? "p.createdAt DESC" : "p.createdAt DESC";

    // total
    const [countRows] = await pool.query(
      `SELECT COUNT(*) as total FROM \`${productsTable}\` p ${whereSql}`,
      params
    );
    const total = Number(countRows?.[0]?.total || 0);

    // ---- rows ----
    // On récupère aussi:
    // - imageUrl (si existe)
    // - defaultVariantId (si table variants existe) : MIN(v.id) => première variante
    const selectImage = hasImageUrl ? "p.imageUrl AS imageUrl" : "NULL AS imageUrl";

    let joinVariant = "";
    let selectVariant = "NULL AS defaultVariantId";
    let groupBy = "";

    if (variantsTable) {
      joinVariant = `LEFT JOIN \`${variantsTable}\` v ON v.productId = p.id`;
      selectVariant = `MIN(v.id) AS defaultVariantId`;
      groupBy = `GROUP BY p.id`;
    }

    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.status,
        p.name,
        p.slug,
        p.description,
        p.categoryId,
        p.${priceCol} AS basePrice,
        p.currency,
        p.isFeatured,
        p.createdAt,
        ${selectImage},
        ${selectVariant}
      FROM \`${productsTable}\` p
      ${joinVariant}
      ${whereSql}
      ${groupBy}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?
      `,
      [...params, limit, offset]
    );

    const products = (rows || []).map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      description: p.description,
      price: Number(p.basePrice || 0),
      currency: p.currency || "XOF",
      status: p.status,
      isFeatured: !!p.isFeatured,
      categoryId: p.categoryId,
      createdAt: p.createdAt,
      image: p.imageUrl || null,
      defaultVariantId: p.defaultVariantId || null,
    }));

    return res.json({ ok: true, total, limit, offset, products });
  } catch (e) {
    console.error("GET /api/products DB_ERROR", e?.message || e);
    return res.status(500).json({ ok: false, error: "DB_ERROR" });
  }
});

/**
 * GET /api/products/:slugOrId
 */
router.get("/products/:slugOrId", async (req, res) => {
  try {
    const slugOrId = (req.params.slugOrId || "").toString().trim();
    if (!slugOrId) return res.status(400).json({ ok: false, error: "BAD_REQUEST" });

    const productsTable = await pickExistingTable(["Product", "products"]);
    const variantsTable = await pickExistingTable(["ProductVariant", "product_variants"]);
    if (!productsTable) return res.status(500).json({ ok: false, error: "PRODUCTS_TABLE_NOT_FOUND" });

    const hasImageUrl = await columnExists(productsTable, "imageUrl");
    const hasBasePrice = await columnExists(productsTable, "basePrice");
    const priceCol = hasBasePrice ? "basePrice" : "price";

    const selectImage = hasImageUrl ? "p.imageUrl AS imageUrl" : "NULL AS imageUrl";

    // Product
    const [rows] = await pool.query(
      `
      SELECT
        p.id,
        p.status,
        p.name,
        p.slug,
        p.description,
        p.categoryId,
        p.${priceCol} AS basePrice,
        p.currency,
        p.isFeatured,
        p.createdAt,
        ${selectImage}
      FROM \`${productsTable}\` p
      WHERE p.id = ? OR p.slug = ?
      LIMIT 1
      `,
      [slugOrId, slugOrId]
    );

    const p = rows?.[0];
    if (!p) return res.status(404).json({ ok: false, error: "NOT_FOUND" });

    // Variants (optionnel mais utile)
    let variants = [];
    if (variantsTable) {
      const [vRows] = await pool.query(
        `
        SELECT id, productId, sku, name, color, size, material, price, compareAt
        FROM \`${variantsTable}\`
        WHERE productId = ?
        ORDER BY createdAt ASC
        `,
        [p.id]
      );
      variants = vRows || [];
    }

    return res.json({
      ok: true,
      product: {
        id: p.id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        price: Number(p.basePrice || 0),
        currency: p.currency || "XOF",
        status: p.status,
        isFeatured: !!p.isFeatured,
        categoryId: p.categoryId,
        createdAt: p.createdAt,
        image: p.imageUrl || null,
      },
      variants,
    });
  } catch (e) {
    console.error("GET /api/products/:slugOrId DB_ERROR", e?.message || e);
    return res.status(500).json({ ok: false, error: "DB_ERROR" });
  }
});

export default router;
