import type { Product, ProductVariant } from '@/lib/types';

const API_URL = '';

type ApiOk<T> = { ok: true } & T;

async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Accept: 'application/json' },
  });

  const data = (await res.json()) as any;

  if (!res.ok || data?.ok === false) {
    const msg = data?.error || `HTTP_${res.status}`;
    throw new Error(msg);
  }
  return data as T;
}

const parseGallery = (g: any): string[] => {
  if (!g) return [];
  if (Array.isArray(g)) return g;
  if (typeof g === 'string') {
    try {
      const parsed = JSON.parse(g);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }
  return [];
};

const normalizeVariant = (v: any): ProductVariant => ({
  id: v.id,
  productId: v.productId ?? v.product_id,
  sku: v.sku,
  optionValues: Array.isArray(v.optionValues)
    ? v.optionValues
    : Array.isArray(v.option_values)
    ? v.option_values
    : [],
  price: v.price ?? undefined,
  stock: Number(v.stock ?? 0),
  isActive: Boolean(v.isActive ?? v.is_active ?? true),
});

const normalizeProduct = (p: any): Product & { variants: ProductVariant[] } => ({
  id: p.id,
  name: p.name,
  slug: p.slug,
  description: p.description,
  categoryId: p.categoryId ?? p.category_id,
  subCategoryId: p.subCategoryId ?? p.sub_category_id ?? null,
  basePrice: Number(p.basePrice ?? p.base_price ?? 0),
  coverImage: p.coverImage ?? p.cover_image ?? '',
  gallery: parseGallery(p.gallery),
  isFeatured: Boolean(p.isFeatured ?? p.is_featured ?? false),
  isNewArrival: Boolean(p.isNewArrival ?? p.is_new_arrival ?? false),
  isBestSeller: Boolean(p.isBestSeller ?? p.is_best_seller ?? false),
  isActive: Boolean(p.isActive ?? p.is_active ?? true),
  createdAt: p.createdAt ?? p.created_at ?? new Date().toISOString(),
  updatedAt: p.updatedAt ?? p.updated_at ?? new Date().toISOString(),
  variants: Array.isArray(p.variants) ? p.variants.map(normalizeVariant) : [],
});

export async function fetchProducts() {
  const data = await apiGet<ApiOk<{ products: any[] }>>('/products');
  return data.products.map(normalizeProduct);
}

export async function fetchProductBySlugOrId(slugOrId: string) {
  const data = await apiGet<ApiOk<{ product: any }>>(
    `/products/${encodeURIComponent(slugOrId)}`
  );
  return normalizeProduct(data.product);
}
