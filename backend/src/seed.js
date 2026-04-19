import bcrypt from 'bcryptjs';
import { pool } from './db.js';

const ADMIN_ID = '00000000-0000-0000-0000-000000000001';
const CLIENT_ID = '00000000-0000-0000-0000-000000000002';

const categories = [
  { id: 'robes', name: 'Robes', slug: 'robes', description: 'Collection de robes élégantes et modernes', image: '/images/Robes.jpg', parentId: null, order: 1 },
  { id: 'abaya', name: 'Abaya', slug: 'abaya', description: 'Abayas traditionnelles et contemporaines', image: '/images/Abaya.jpg', parentId: null, order: 2 },
  { id: 'vetements-femme', name: 'Vêtements Femme', slug: 'vetements-femme', description: 'Mode féminine élégante', image: '/images/WomensFashion.jpg', parentId: null, order: 3 },
  { id: 'robe-femme', name: 'Robe Femme', slug: 'robe-femme', description: 'Robes pour toutes occasions', image: '/images/Dress.jpg', parentId: 'vetements-femme', order: 1 },
  { id: 'gloss', name: 'Gloss', slug: 'gloss', description: 'Gloss et cosmétiques pour les lèvres', image: '/images/Gloss.jpg', parentId: null, order: 4 },
  { id: 'sacs', name: 'Sacs', slug: 'sacs', description: 'Sacs à main et accessoires', image: '/images/Handbags.jpg', parentId: null, order: 5 },
  { id: 'chaussures', name: 'Chaussures', slug: 'chaussures', description: 'Chaussures élégantes pour femmes', image: '/images/WomenShoes.jpg', parentId: null, order: 6 },
];

const options = [
  { id: 'size', name: 'Taille', type: 'button', order: 1 },
  { id: 'color', name: 'Couleur', type: 'color', order: 2 },
];

const optionValues = [
  { id: 'size-s', optionId: 'size', value: 'S', displayValue: 'S', colorHex: null, order: 1 },
  { id: 'size-m', optionId: 'size', value: 'M', displayValue: 'M', colorHex: null, order: 2 },
  { id: 'size-l', optionId: 'size', value: 'L', displayValue: 'L', colorHex: null, order: 3 },
  { id: 'size-xl', optionId: 'size', value: 'XL', displayValue: 'XL', colorHex: null, order: 4 },

  { id: 'color-black', optionId: 'color', value: 'Noir', displayValue: 'Noir', colorHex: '#000000', order: 1 },
  { id: 'color-white', optionId: 'color', value: 'Blanc', displayValue: 'Blanc', colorHex: '#FFFFFF', order: 2 },
  { id: 'color-gold', optionId: 'color', value: 'Or', displayValue: 'Or', colorHex: '#D4AF37', order: 3 },
  { id: 'color-rose', optionId: 'color', value: 'Rose', displayValue: 'Rose', colorHex: '#E91E63', order: 4 },
];

const products = [
  {
    id: 'prod-1',
    name: 'Robe Élégante Noire',
    slug: 'robe-elegante-noire',
    description: 'Robe élégante en tissu premium, parfaite pour toutes occasions. Coupe moderne et confortable avec finitions soignées.',
    categoryId: 'robes',
    subCategoryId: null,
    basePrice: 45000,
    coverImage: '/assets/category-robes_variant_1.jpg',
    gallery: ['/assets/category-robes_variant_2.jpg','/assets/category-robe-femme_variant_1.jpg'],
    isFeatured: 1, isNewArrival: 1, isBestSeller: 0, isActive: 1,
  },
  {
    id: 'prod-2',
    name: 'Abaya Brodée Or',
    slug: 'abaya-brodee-or',
    description: 'Abaya luxueuse avec broderies dorées, tissu fluide et confortable. Design élégant et moderne.',
    categoryId: 'abaya',
    subCategoryId: null,
    basePrice: 65000,
    coverImage: '/assets/category-abaya_variant_1.jpg',
    gallery: ['/assets/category-abaya_variant_2.jpg'],
    isFeatured: 1, isNewArrival: 0, isBestSeller: 1, isActive: 1,
  },
  {
    id: 'prod-3',
    name: 'Sac à Main Luxe Noir',
    slug: 'sac-main-luxe-noir',
    description: 'Sac à main en cuir véritable avec détails dorés. Spacieux et élégant, parfait pour le quotidien.',
    categoryId: 'sacs',
    subCategoryId: null,
    basePrice: 35000,
    coverImage: '/assets/category-sacs_variant_1.jpg',
    gallery: ['/assets/category-sacs_variant_2.jpg'],
    isFeatured: 1, isNewArrival: 1, isBestSeller: 0, isActive: 1,
  },
  {
    id: 'prod-4',
    name: 'Escarpins Élégants',
    slug: 'escarpins-elegants',
    description: 'Chaussures à talons élégantes, confortables et raffinées. Parfaites pour les occasions spéciales.',
    categoryId: 'chaussures',
    subCategoryId: null,
    basePrice: 28000,
    coverImage: '/assets/category-chaussures_variant_1.jpg',
    gallery: ['/assets/category-chaussures_variant_2.jpg'],
    isFeatured: 0, isNewArrival: 1, isBestSeller: 0, isActive: 1,
  },
  {
    id: 'prod-5',
    name: 'Gloss Luxe Rose',
    slug: 'gloss-luxe-rose',
    description: 'Gloss hydratant longue tenue avec finition brillante. Formule enrichie en vitamines.',
    categoryId: 'gloss',
    subCategoryId: null,
    basePrice: 8000,
    coverImage: '/assets/category-gloss_variant_1.jpg',
    gallery: ['/assets/category-gloss_variant_2.jpg'],
    isFeatured: 0, isNewArrival: 1, isBestSeller: 1, isActive: 1,
  },
  {
    id: 'prod-6',
    name: 'Ensemble Vêtements Femme',
    slug: 'ensemble-vetements-femme',
    description: 'Ensemble deux pièces élégant et confortable. Idéal pour un look chic et décontracté.',
    categoryId: 'vetements-femme',
    subCategoryId: 'robe-femme',
    basePrice: 52000,
    coverImage: '/assets/category-vetements-femme_variant_1.jpg',
    gallery: ['/assets/category-vetements-femme_variant_2.jpg'],
    isFeatured: 1, isNewArrival: 0, isBestSeller: 1, isActive: 1,
  },
];

const variants = [
  // prod-1
  { id: 'var-1-1', productId: 'prod-1', sku: 'ROBE-NOIR-S-NOIR', price: null, stock: 10, isActive: 1, optionValues: [{optionId:'size', valueId:'size-s'},{optionId:'color', valueId:'color-black'}] },
  { id: 'var-1-2', productId: 'prod-1', sku: 'ROBE-NOIR-M-NOIR', price: null, stock: 15, isActive: 1, optionValues: [{optionId:'size', valueId:'size-m'},{optionId:'color', valueId:'color-black'}] },
  { id: 'var-1-3', productId: 'prod-1', sku: 'ROBE-NOIR-L-NOIR', price: null, stock: 12, isActive: 1, optionValues: [{optionId:'size', valueId:'size-l'},{optionId:'color', valueId:'color-black'}] },
  { id: 'var-1-4', productId: 'prod-1', sku: 'ROBE-NOIR-XL-NOIR', price: null, stock: 8, isActive: 1, optionValues: [{optionId:'size', valueId:'size-xl'},{optionId:'color', valueId:'color-black'}] },
  { id: 'var-1-5', productId: 'prod-1', sku: 'ROBE-NOIR-S-BLANC', price: null, stock: 5, isActive: 1, optionValues: [{optionId:'size', valueId:'size-s'},{optionId:'color', valueId:'color-white'}] },
  { id: 'var-1-6', productId: 'prod-1', sku: 'ROBE-NOIR-M-BLANC', price: null, stock: 8, isActive: 1, optionValues: [{optionId:'size', valueId:'size-m'},{optionId:'color', valueId:'color-white'}] },

  // prod-2
  { id: 'var-2-1', productId: 'prod-2', sku: 'ABAYA-OR-S', price: null, stock: 6, isActive: 1, optionValues: [{optionId:'size', valueId:'size-s'}] },
  { id: 'var-2-2', productId: 'prod-2', sku: 'ABAYA-OR-M', price: null, stock: 10, isActive: 1, optionValues: [{optionId:'size', valueId:'size-m'}] },
  { id: 'var-2-3', productId: 'prod-2', sku: 'ABAYA-OR-L', price: null, stock: 8, isActive: 1, optionValues: [{optionId:'size', valueId:'size-l'}] },
  { id: 'var-2-4', productId: 'prod-2', sku: 'ABAYA-OR-XL', price: null, stock: 5, isActive: 1, optionValues: [{optionId:'size', valueId:'size-xl'}] },

  // prod-3
  { id: 'var-3-1', productId: 'prod-3', sku: 'SAC-NOIR-UNIQUE', price: null, stock: 20, isActive: 1, optionValues: [] },

  // prod-4
  { id: 'var-4-1', productId: 'prod-4', sku: 'ESCARPIN-36', price: null, stock: 5, isActive: 1, optionValues: [{optionId:'size', valueId:'size-s'}] },
  { id: 'var-4-2', productId: 'prod-4', sku: 'ESCARPIN-38', price: null, stock: 8, isActive: 1, optionValues: [{optionId:'size', valueId:'size-m'}] },
  { id: 'var-4-3', productId: 'prod-4', sku: 'ESCARPIN-40', price: null, stock: 6, isActive: 1, optionValues: [{optionId:'size', valueId:'size-l'}] },

  // prod-5
  { id: 'var-5-1', productId: 'prod-5', sku: 'GLOSS-ROSE-UNIQUE', price: null, stock: 50, isActive: 1, optionValues: [] },

  // prod-6
  { id: 'var-6-1', productId: 'prod-6', sku: 'ENSEMBLE-S-NOIR', price: null, stock: 7, isActive: 1, optionValues: [{optionId:'size', valueId:'size-s'},{optionId:'color', valueId:'color-black'}] },
  { id: 'var-6-2', productId: 'prod-6', sku: 'ENSEMBLE-M-NOIR', price: null, stock: 12, isActive: 1, optionValues: [{optionId:'size', valueId:'size-m'},{optionId:'color', valueId:'color-black'}] },
  { id: 'var-6-3', productId: 'prod-6', sku: 'ENSEMBLE-L-ROSE', price: 55000, stock: 5, isActive: 1, optionValues: [{optionId:'size', valueId:'size-l'},{optionId:'color', valueId:'color-rose'}] },
];

const upsert = async (conn, sql, params) => conn.query(sql, params);

const main = async () => {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Users
    const adminHash = await bcrypt.hash('SaniiAdmin2024!', 10);
    const clientHash = await bcrypt.hash('client123', 10);

    await upsert(conn,
      `INSERT INTO users (id,email,password_hash,name,role,phone)
       VALUES (:id,:email,:ph,:name,:role,:phone)
       ON DUPLICATE KEY UPDATE email=VALUES(email), password_hash=VALUES(password_hash), name=VALUES(name), role=VALUES(role), phone=VALUES(phone)`,
      { id: ADMIN_ID, email: 'admin@saniiworld.com', ph: adminHash, name: 'Administrateur Samani World', role: 'admin', phone: null }
    );

    await upsert(conn,
      `INSERT INTO users (id,email,password_hash,name,role,phone)
       VALUES (:id,:email,:ph,:name,:role,:phone)
       ON DUPLICATE KEY UPDATE email=VALUES(email), password_hash=VALUES(password_hash), name=VALUES(name), role=VALUES(role), phone=VALUES(phone)`,
      { id: CLIENT_ID, email: 'client@example.com', ph: clientHash, name: 'Client Test', role: 'client', phone: '+221 77 123 45 67' }
    );

    // Categories
    for (const c of categories) {
      await upsert(conn,
        `INSERT INTO categories (id,name,slug,description,image,parent_id,sort_order,is_active)
         VALUES (:id,:name,:slug,:description,:image,:parent_id,:sort_order,1)
         ON DUPLICATE KEY UPDATE name=VALUES(name), slug=VALUES(slug), description=VALUES(description), image=VALUES(image), parent_id=VALUES(parent_id), sort_order=VALUES(sort_order), is_active=1`,
        {
          id: c.id, name: c.name, slug: c.slug, description: c.description, image: c.image,
          parent_id: c.parentId, sort_order: c.order
        }
      );
    }

    // Options
    for (const o of options) {
      await upsert(conn,
        `INSERT INTO product_options (id,name,type,sort_order)
         VALUES (:id,:name,:type,:sort_order)
         ON DUPLICATE KEY UPDATE name=VALUES(name), type=VALUES(type), sort_order=VALUES(sort_order)`,
        { id: o.id, name: o.name, type: o.type, sort_order: o.order }
      );
    }

    // Option values
    for (const v of optionValues) {
      await upsert(conn,
        `INSERT INTO product_option_values (id,option_id,value,display_value,color_hex,sort_order)
         VALUES (:id,:option_id,:value,:display_value,:color_hex,:sort_order)
         ON DUPLICATE KEY UPDATE option_id=VALUES(option_id), value=VALUES(value), display_value=VALUES(display_value), color_hex=VALUES(color_hex), sort_order=VALUES(sort_order)`,
        {
          id: v.id, option_id: v.optionId, value: v.value,
          display_value: v.displayValue, color_hex: v.colorHex, sort_order: v.order
        }
      );
    }

    // Products
    for (const p of products) {
      await upsert(conn,
        `INSERT INTO products (id,name,slug,description,category_id,sub_category_id,base_price,cover_image,gallery_json,is_featured,is_new_arrival,is_best_seller,is_active)
         VALUES (:id,:name,:slug,:description,:category_id,:sub_category_id,:base_price,:cover_image,:gallery_json,:is_featured,:is_new_arrival,:is_best_seller,:is_active)
         ON DUPLICATE KEY UPDATE name=VALUES(name), slug=VALUES(slug), description=VALUES(description),
           category_id=VALUES(category_id), sub_category_id=VALUES(sub_category_id), base_price=VALUES(base_price),
           cover_image=VALUES(cover_image), gallery_json=VALUES(gallery_json),
           is_featured=VALUES(is_featured), is_new_arrival=VALUES(is_new_arrival), is_best_seller=VALUES(is_best_seller), is_active=VALUES(is_active)`,
        {
          id: p.id, name: p.name, slug: p.slug, description: p.description,
          category_id: p.categoryId, sub_category_id: p.subCategoryId,
          base_price: p.basePrice, cover_image: p.coverImage,
          gallery_json: JSON.stringify(p.gallery),
          is_featured: p.isFeatured, is_new_arrival: p.isNewArrival, is_best_seller: p.isBestSeller, is_active: p.isActive
        }
      );
    }

    // Variants + variant option values
    for (const v of variants) {
      await upsert(conn,
        `INSERT INTO product_variants (id,product_id,sku,price,stock,is_active)
         VALUES (:id,:product_id,:sku,:price,:stock,:is_active)
         ON DUPLICATE KEY UPDATE product_id=VALUES(product_id), sku=VALUES(sku), price=VALUES(price), stock=VALUES(stock), is_active=VALUES(is_active)`,
        { id: v.id, product_id: v.productId, sku: v.sku, price: v.price, stock: v.stock, is_active: v.isActive }
      );

      // clean then re-insert links (simple + safe)
      await conn.query(`DELETE FROM variant_option_values WHERE variant_id = :vid`, { vid: v.id });

      for (const ov of v.optionValues) {
        await upsert(conn,
          `INSERT INTO variant_option_values (variant_id, option_id, value_id)
           VALUES (:variant_id,:option_id,:value_id)`,
          { variant_id: v.id, option_id: ov.optionId, value_id: ov.valueId }
        );
      }
    }

    await conn.commit();

    const [[c1]] = await conn.query(`SELECT COUNT(*) AS n FROM categories`);
    const [[c2]] = await conn.query(`SELECT COUNT(*) AS n FROM products`);
    const [[c3]] = await conn.query(`SELECT COUNT(*) AS n FROM product_variants`);
    const [[c4]] = await conn.query(`SELECT COUNT(*) AS n FROM users`);
    console.log('SEED OK ✅', { categories: c1.n, products: c2.n, variants: c3.n, users: c4.n });
  } catch (e) {
    await conn.rollback();
    console.error('SEED FAILED ❌', e?.message || e);
    process.exitCode = 1;
  } finally {
    conn.release();
  }
};

main();
