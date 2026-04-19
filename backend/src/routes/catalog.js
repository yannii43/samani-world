import { Router } from 'express';
import { pool } from '../db.js';

const router = Router();

router.get('/categories', async (_req, res) => {
  const [rows] = await pool.execute(
    `SELECT id,name,slug,description,image,parent_id,sort_order,is_active,created_at
     FROM categories
     WHERE is_active=1
     ORDER BY (parent_id IS NOT NULL), parent_id, sort_order`
  );

  const byId = new Map();
  const main = [];

  for (const r of rows) {
    byId.set(r.id, {
      id: r.id,
      name: r.name,
      slug: r.slug,
      description: r.description ?? null,
      image: r.image ?? null,
      parentId: r.parent_id ?? null,
      order: r.sort_order ?? 0,
      isActive: !!r.is_active,
      createdAt: r.created_at,
      children: [],
    });
  }

  for (const node of byId.values()) {
    if (node.parentId && byId.has(node.parentId)) {
      byId.get(node.parentId).children.push(node);
    } else {
      main.push(node);
    }
  }

  return res.json({ ok: true, categories: main });
});

router.get('/options', async (_req, res) => {
  const [opts] = await pool.execute(
    `SELECT id,name,type,sort_order FROM product_options ORDER BY sort_order`
  );
  const [vals] = await pool.execute(
    `SELECT id,option_id,value,display_value,color_hex,sort_order
     FROM product_option_values
     ORDER BY option_id, sort_order`
  );

  return res.json({
    ok: true,
    options: opts.map((o) => ({
      id: o.id,
      name: o.name,
      type: o.type,
      order: o.sort_order ?? 0,
    })),
    values: vals.map((v) => ({
      id: v.id,
      optionId: v.option_id,
      value: v.value,
      displayValue: v.display_value ?? null,
      colorHex: v.color_hex ?? null,
      order: v.sort_order ?? 0,
    })),
  });
});

router.get('/products', async (req, res) => {
  const q            = req.query.q            ? String(req.query.q).trim()            : null;
  const categoryId   = req.query.categoryId   ? String(req.query.categoryId)           : null;
  const categorySlug = req.query.categorySlug ? String(req.query.categorySlug).trim()  : null;
  const filter       = req.query.filter       ? String(req.query.filter)               : null;
  const limit        = Math.min(parseInt(req.query.limit) || 100, 200);

  // Résoudre categorySlug → categoryId si besoin
  let resolvedCategoryId = categoryId;
  if (!resolvedCategoryId && categorySlug) {
    const [catRows] = await pool.execute(
      'SELECT id FROM categories WHERE slug = ? LIMIT 1', [categorySlug]
    );
    resolvedCategoryId = catRows?.[0]?.id || null;
  }

  const conditions = ['p.is_active = 1'];
  const params = [];

  if (resolvedCategoryId) {
    conditions.push('(p.category_id = ? OR p.sub_category_id = ?)');
    params.push(resolvedCategoryId, resolvedCategoryId);
  }
  if (q) {
    conditions.push('(p.name LIKE ? OR p.description LIKE ?)');
    params.push(`%${q}%`, `%${q}%`);
  }
  if (filter === 'new')      { conditions.push('p.is_new_arrival = 1'); }
  if (filter === 'featured') { conditions.push('p.is_featured = 1'); }

  const where = conditions.join(' AND ');
  params.push(limit);

  const [products] = await pool.query(
    `SELECT p.id, p.name, p.slug, p.description, p.category_id, p.sub_category_id,
            p.base_price, p.cover_image, p.gallery_json,
            p.is_featured, p.is_new_arrival, p.is_best_seller, p.is_active,
            p.created_at, p.updated_at
     FROM products p
     WHERE ${where}
     ORDER BY p.created_at DESC
     LIMIT ?`,
    params
  );

  const productIds = products.map((p) => p.id);
  if (productIds.length === 0) {
    return res.json({ ok: true, products: [] });
  }

  const [variants] = await pool.query(
    `SELECT id,product_id,sku,price,stock,is_active
     FROM product_variants
     WHERE is_active=1 AND product_id IN (?)`,
    [productIds]
  );

  const variantIds = variants.map((v) => v.id);

  let vov = [];
  if (variantIds.length) {
    const [rows] = await pool.query(
      `SELECT variant_id, option_id, value_id
       FROM variant_option_values
       WHERE variant_id IN (?)`,
      [variantIds]
    );
    vov = rows;
  }

  const optionValuesByVariant = new Map();
  for (const r of vov) {
    if (!optionValuesByVariant.has(r.variant_id)) optionValuesByVariant.set(r.variant_id, []);
    optionValuesByVariant.get(r.variant_id).push({ optionId: r.option_id, valueId: r.value_id });
  }

  const variantsByProduct = new Map();
  for (const v of variants) {
    const item = {
      id: v.id,
      productId: v.product_id,
      sku: v.sku,
      price: v.price ?? null,
      stock: v.stock ?? 0,
      isActive: !!v.is_active,
      optionValues: optionValuesByVariant.get(v.id) ?? [],
    };
    if (!variantsByProduct.has(v.product_id)) variantsByProduct.set(v.product_id, []);
    variantsByProduct.get(v.product_id).push(item);
  }

  const out = products.map((p) => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    categoryId: p.category_id,
    subCategoryId: p.sub_category_id ?? null,
    basePrice: p.base_price,
    coverImage: p.cover_image ?? null,
    gallery: (() => {
      try {
        return p.gallery_json ? JSON.parse(p.gallery_json) : [];
      } catch {
        return [];
      }
    })(),
    isFeatured: !!p.is_featured,
    isNewArrival: !!p.is_new_arrival,
    isBestSeller: !!p.is_best_seller,
    isActive: !!p.is_active,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    variants: variantsByProduct.get(p.id) ?? [],
  }));

  return res.json({ ok: true, products: out });
});

// Get product by SLUG (ex: /products/slug/robe-elegante-noire)
router.get('/products/slug/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const [pRows] = await pool.execute('SELECT * FROM products WHERE slug = ? LIMIT 1', [slug]);
    const raw = pRows?.[0];
    if (!raw) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });

    const parseGallery = (g) => {
      if (!g) return [];
      if (Array.isArray(g)) return g;
      if (typeof g === 'string') {
        try {
          return JSON.parse(g);
        } catch {
          return [];
        }
      }
      return [];
    };

    const product = {
      id: raw.id,
      name: raw.name,
      slug: raw.slug,
      description: raw.description,
      categoryId: raw.category_id ?? raw.categoryId,
      subCategoryId: raw.sub_category_id ?? raw.subCategoryId ?? null,
      basePrice: raw.base_price ?? raw.basePrice,
      coverImage: raw.cover_image ?? raw.coverImage,
      gallery: parseGallery(raw.gallery_json),
      isFeatured: Boolean(raw.is_featured ?? raw.isFeatured),
      isNewArrival: Boolean(raw.is_new_arrival ?? raw.isNewArrival),
      isBestSeller: Boolean(raw.is_best_seller ?? raw.isBestSeller),
      isActive: (raw.is_active ?? raw.isActive) ? Boolean(raw.is_active ?? raw.isActive) : true,
      createdAt: raw.created_at ?? raw.createdAt,
      updatedAt: raw.updated_at ?? raw.updatedAt,
      variants: [],
    };

    let vRows = [];
    const [rows] = await pool.execute('SELECT * FROM product_variants WHERE product_id = ?', [product.id]);
    vRows = rows || [];

    const variants = [];
    for (const v of vRows) {
      const isActive = v.is_active ?? v.isActive;
      if (isActive === 0 || isActive === false) continue;

      const variant = {
        id: v.id,
        productId: v.product_id ?? v.productId ?? product.id,
        sku: v.sku,
        price: v.price ?? null,
        stock: v.stock ?? 0,
        isActive: true,
        optionValues: [],
      };

      const [ovRows] = await pool.execute(
        'SELECT * FROM variant_option_values WHERE variant_id = ? ORDER BY option_id',
        [variant.id]
      );

      variant.optionValues = (ovRows || []).map((ov) => ({
        optionId: ov.option_id ?? ov.optionId,
        valueId: ov.value_id ?? ov.valueId,
      }));

      variants.push(variant);
    }

    product.variants = variants;

    return res.json({ ok: true, product });
  } catch (e) {
    console.error('GET /products/slug/:slug failed', e?.message || e);
    return res.status(500).json({ ok: false, error: 'SERVER_ERROR' });
  }
});

// ✅ IMPORTANT : /products/:id accepte id OU slug ET charge les variantes avec le VRAI productId
router.get('/products/:id', async (req, res) => {
  const idOrSlug = String(req.params.id);

  const [rows] = await pool.execute(
    `SELECT id,name,slug,description,category_id,sub_category_id,base_price,cover_image,gallery_json,
            is_featured,is_new_arrival,is_best_seller,is_active,created_at,updated_at
     FROM products
     WHERE id=? OR slug=? LIMIT 1`,
    [idOrSlug, idOrSlug]
  );

  const p = rows?.[0];
  if (!p) return res.status(404).json({ ok: false, error: 'NOT_FOUND' });

  // ✅ c'est ça le fix : on utilise le vrai ID DB
  const productId = p.id;

  const [variants] = await pool.execute(
    `SELECT id,product_id,sku,price,stock,is_active
     FROM product_variants
     WHERE product_id=? AND is_active=1`,
    [productId]
  );

  const vIds = (variants || []).map((v) => v.id);

  let vov = [];
  if (vIds.length) {
    const [rows2] = await pool.query(
      `SELECT variant_id, option_id, value_id
       FROM variant_option_values
       WHERE variant_id IN (?)`,
      [vIds]
    );
    vov = rows2;
  }

  const optionValuesByVariant = new Map();
  for (const r of vov) {
    if (!optionValuesByVariant.has(r.variant_id)) optionValuesByVariant.set(r.variant_id, []);
    optionValuesByVariant.get(r.variant_id).push({ optionId: r.option_id, valueId: r.value_id });
  }

  const product = {
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description,
    categoryId: p.category_id,
    subCategoryId: p.sub_category_id ?? null,
    basePrice: p.base_price,
    coverImage: p.cover_image ?? null,
    gallery: (() => {
      try {
        return p.gallery_json ? JSON.parse(p.gallery_json) : [];
      } catch {
        return [];
      }
    })(),
    isFeatured: !!p.is_featured,
    isNewArrival: !!p.is_new_arrival,
    isBestSeller: !!p.is_best_seller,
    isActive: !!p.is_active,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
    variants: (variants || []).map((v) => ({
      id: v.id,
      productId: v.product_id,
      sku: v.sku,
      price: v.price ?? null,
      stock: v.stock ?? 0,
      isActive: !!v.is_active,
      optionValues: optionValuesByVariant.get(v.id) ?? [],
    })),
  };

  return res.json({ ok: true, product });
});

export default router;
