import type { Product, ProductVariant } from './types';

// ============================================
// SANII WORLD - Products with Variants
// ============================================

export const products: Product[] = [
  {
    id: 'prod-1',
    name: 'Robe Élégante Noire',
    slug: 'robe-elegante-noire',
    description: 'Robe élégante en tissu premium, parfaite pour toutes occasions. Coupe moderne et confortable avec finitions soignées.',
    categoryId: 'robes',
    subCategoryId: undefined,
    basePrice: 45000,
    coverImage: '/assets/category-robes_variant_1.jpg',
    gallery: [
      '/assets/category-robes_variant_2.jpg',
      '/assets/category-robe-femme_variant_1.jpg',
    ],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isActive: true,
    createdAt: new Date('2024-12-01').toISOString(),
    updatedAt: new Date('2024-12-01').toISOString(),
  },
  {
    id: 'prod-2',
    name: 'Abaya Brodée Or',
    slug: 'abaya-brodee-or',
    description: 'Abaya luxueuse avec broderies dorées, tissu fluide et confortable. Design élégant et moderne.',
    categoryId: 'abaya',
    subCategoryId: undefined,
    basePrice: 65000,
    coverImage: '/assets/category-abaya_variant_1.jpg',
    gallery: ['/assets/category-abaya_variant_2.jpg'],
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isActive: true,
    createdAt: new Date('2024-11-15').toISOString(),
    updatedAt: new Date('2024-11-15').toISOString(),
  },
  {
    id: 'prod-3',
    name: 'Sac à Main Luxe Noir',
    slug: 'sac-main-luxe-noir',
    description: 'Sac à main en cuir véritable avec détails dorés. Spacieux et élégant, parfait pour le quotidien.',
    categoryId: 'sacs',
    subCategoryId: undefined,
    basePrice: 35000,
    coverImage: '/assets/category-sacs_variant_1.jpg',
    gallery: ['/assets/category-sacs_variant_2.jpg'],
    isFeatured: true,
    isNewArrival: true,
    isBestSeller: false,
    isActive: true,
    createdAt: new Date('2024-12-10').toISOString(),
    updatedAt: new Date('2024-12-10').toISOString(),
  },
  {
    id: 'prod-4',
    name: 'Escarpins Élégants',
    slug: 'escarpins-elegants',
    description: 'Chaussures à talons élégantes, confortables et raffinées. Parfaites pour les occasions spéciales.',
    categoryId: 'chaussures',
    subCategoryId: undefined,
    basePrice: 28000,
    coverImage: '/assets/category-chaussures_variant_1.jpg',
    gallery: ['/assets/category-chaussures_variant_2.jpg'],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: false,
    isActive: true,
    createdAt: new Date('2024-12-05').toISOString(),
    updatedAt: new Date('2024-12-05').toISOString(),
  },
  {
    id: 'prod-5',
    name: 'Gloss Luxe Rose',
    slug: 'gloss-luxe-rose',
    description: 'Gloss hydratant longue tenue avec finition brillante. Formule enrichie en vitamines.',
    categoryId: 'gloss',
    subCategoryId: undefined,
    basePrice: 8000,
    coverImage: '/assets/category-gloss_variant_1.jpg',
    gallery: ['/assets/category-gloss_variant_2.jpg'],
    isFeatured: false,
    isNewArrival: true,
    isBestSeller: true,
    isActive: true,
    createdAt: new Date('2024-12-12').toISOString(),
    updatedAt: new Date('2024-12-12').toISOString(),
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
    isFeatured: true,
    isNewArrival: false,
    isBestSeller: true,
    isActive: true,
    createdAt: new Date('2024-11-20').toISOString(),
    updatedAt: new Date('2024-11-20').toISOString(),
  },
];

export const productVariants: ProductVariant[] = [
  // Robe Élégante Noire - Variantes
  {
    id: 'var-1-1',
    productId: 'prod-1',
    sku: 'ROBE-NOIR-S-NOIR',
    optionValues: [
      { optionId: 'size', valueId: 'size-s' },
      { optionId: 'color', valueId: 'color-black' },
    ],
    price: undefined, // Utilise basePrice
    stock: 10,
    isActive: true,
  },
  {
    id: 'var-1-2',
    productId: 'prod-1',
    sku: 'ROBE-NOIR-M-NOIR',
    optionValues: [
      { optionId: 'size', valueId: 'size-m' },
      { optionId: 'color', valueId: 'color-black' },
    ],
    price: undefined,
    stock: 15,
    isActive: true,
  },
  {
    id: 'var-1-3',
    productId: 'prod-1',
    sku: 'ROBE-NOIR-L-NOIR',
    optionValues: [
      { optionId: 'size', valueId: 'size-l' },
      { optionId: 'color', valueId: 'color-black' },
    ],
    price: undefined,
    stock: 12,
    isActive: true,
  },
  {
    id: 'var-1-4',
    productId: 'prod-1',
    sku: 'ROBE-NOIR-XL-NOIR',
    optionValues: [
      { optionId: 'size', valueId: 'size-xl' },
      { optionId: 'color', valueId: 'color-black' },
    ],
    price: undefined,
    stock: 8,
    isActive: true,
  },
  {
    id: 'var-1-5',
    productId: 'prod-1',
    sku: 'ROBE-NOIR-S-BLANC',
    optionValues: [
      { optionId: 'size', valueId: 'size-s' },
      { optionId: 'color', valueId: 'color-white' },
    ],
    price: undefined,
    stock: 5,
    isActive: true,
  },
  {
    id: 'var-1-6',
    productId: 'prod-1',
    sku: 'ROBE-NOIR-M-BLANC',
    optionValues: [
      { optionId: 'size', valueId: 'size-m' },
      { optionId: 'color', valueId: 'color-white' },
    ],
    price: undefined,
    stock: 8,
    isActive: true,
  },

  // Abaya Brodée Or - Variantes
  {
    id: 'var-2-1',
    productId: 'prod-2',
    sku: 'ABAYA-OR-S',
    optionValues: [
      { optionId: 'size', valueId: 'size-s' },
    ],
    price: undefined,
    stock: 6,
    isActive: true,
  },
  {
    id: 'var-2-2',
    productId: 'prod-2',
    sku: 'ABAYA-OR-M',
    optionValues: [
      { optionId: 'size', valueId: 'size-m' },
    ],
    price: undefined,
    stock: 10,
    isActive: true,
  },
  {
    id: 'var-2-3',
    productId: 'prod-2',
    sku: 'ABAYA-OR-L',
    optionValues: [
      { optionId: 'size', valueId: 'size-l' },
    ],
    price: undefined,
    stock: 8,
    isActive: true,
  },
  {
    id: 'var-2-4',
    productId: 'prod-2',
    sku: 'ABAYA-OR-XL',
    optionValues: [
      { optionId: 'size', valueId: 'size-xl' },
    ],
    price: undefined,
    stock: 5,
    isActive: true,
  },

  // Sac à Main - Pas de variantes, stock global
  {
    id: 'var-3-1',
    productId: 'prod-3',
    sku: 'SAC-NOIR-UNIQUE',
    optionValues: [],
    price: undefined,
    stock: 20,
    isActive: true,
  },

  // Escarpins - Variantes taille uniquement
  {
    id: 'var-4-1',
    productId: 'prod-4',
    sku: 'ESCARPIN-36',
    optionValues: [
      { optionId: 'size', valueId: 'size-s' }, // S = 36
    ],
    price: undefined,
    stock: 5,
    isActive: true,
  },
  {
    id: 'var-4-2',
    productId: 'prod-4',
    sku: 'ESCARPIN-38',
    optionValues: [
      { optionId: 'size', valueId: 'size-m' }, // M = 38
    ],
    price: undefined,
    stock: 8,
    isActive: true,
  },
  {
    id: 'var-4-3',
    productId: 'prod-4',
    sku: 'ESCARPIN-40',
    optionValues: [
      { optionId: 'size', valueId: 'size-l' }, // L = 40
    ],
    price: undefined,
    stock: 6,
    isActive: true,
  },

  // Gloss - Pas de variantes
  {
    id: 'var-5-1',
    productId: 'prod-5',
    sku: 'GLOSS-ROSE-UNIQUE',
    optionValues: [],
    price: undefined,
    stock: 50,
    isActive: true,
  },

  // Ensemble Vêtements - Variantes complètes
  {
    id: 'var-6-1',
    productId: 'prod-6',
    sku: 'ENSEMBLE-S-NOIR',
    optionValues: [
      { optionId: 'size', valueId: 'size-s' },
      { optionId: 'color', valueId: 'color-black' },
    ],
    price: undefined,
    stock: 7,
    isActive: true,
  },
  {
    id: 'var-6-2',
    productId: 'prod-6',
    sku: 'ENSEMBLE-M-NOIR',
    optionValues: [
      { optionId: 'size', valueId: 'size-m' },
      { optionId: 'color', valueId: 'color-black' },
    ],
    price: undefined,
    stock: 12,
    isActive: true,
  },
  {
    id: 'var-6-3',
    productId: 'prod-6',
    sku: 'ENSEMBLE-L-ROSE',
    optionValues: [
      { optionId: 'size', valueId: 'size-l' },
      { optionId: 'color', valueId: 'color-rose' },
    ],
    price: 55000, // Prix différent
    stock: 5,
    isActive: true,
  },
];

// Helper functions
export const getProductById = (id: string): Product | undefined => {
  return products.find((p) => p.id === id);
};

export const getProductBySlug = (slug: string): Product | undefined => {
  return products.find((p) => p.slug === slug);
};

export const getProductVariants = (productId: string): ProductVariant[] => {
  return productVariants.filter((v) => v.productId === productId && v.isActive);
};

export const getVariantById = (variantId: string): ProductVariant | undefined => {
  return productVariants.find((v) => v.id === variantId);
};

export const getProductsByCategory = (categoryId: string): Product[] => {
  return products.filter((p) => p.categoryId === categoryId && p.isActive);
};

export const getFeaturedProducts = (): Product[] => {
  return products.filter((p) => p.isFeatured && p.isActive);
};

export const getNewArrivals = (): Product[] => {
  return products.filter((p) => p.isNewArrival && p.isActive);
};

export const getBestSellers = (): Product[] => {
  return products.filter((p) => p.isBestSeller && p.isActive);
};

export const getTotalStock = (productId: string): number => {
  const variants = getProductVariants(productId);
  return variants.reduce((sum, v) => sum + v.stock, 0);
};

export const getVariantPrice = (product: Product, variant: ProductVariant): number => {
  return variant.price || product.basePrice;
};

export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('fr-FR')} FCFA`;
};

export const isProductInStock = (productId: string): boolean => {
  return getTotalStock(productId) > 0;
};

export const getVariantDisplayName = (variant: ProductVariant): string => {
  if (variant.optionValues.length === 0) return 'Standard';
  
  // This will be enhanced with actual option names
  return variant.optionValues
    .map((ov) => ov.valueId.split('-')[1]?.toUpperCase() || '')
    .join(' / ');
};