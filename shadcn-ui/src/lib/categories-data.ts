import type { Category } from './types';

// ============================================
// SANII WORLD - Categories Data
// ============================================

export const categories: Category[] = [
  {
    id: 'robes',
    name: 'Robes',
    slug: 'robes',
    description: 'Collection de robes élégantes et modernes',
    image: '/images/Robes.jpg',
    parentId: undefined,
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'abaya',
    name: 'Abaya',
    slug: 'abaya',
    description: 'Abayas traditionnelles et contemporaines',
    image: '/images/Abaya.jpg',
    parentId: undefined,
    order: 2,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'vetements-femme',
    name: 'Vêtements Femme',
    slug: 'vetements-femme',
    description: 'Mode féminine élégante',
    image: '/images/WomensFashion.jpg',
    parentId: undefined,
    order: 3,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'robe-femme',
    name: 'Robe Femme',
    slug: 'robe-femme',
    description: 'Robes pour toutes occasions',
    image: '/images/Dress.jpg',
    parentId: 'vetements-femme', // Sous-catégorie
    order: 1,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'gloss',
    name: 'Gloss',
    slug: 'gloss',
    description: 'Gloss et cosmétiques pour les lèvres',
    image: '/images/Gloss.jpg',
    parentId: undefined,
    order: 4,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'sacs',
    name: 'Sacs',
    slug: 'sacs',
    description: 'Sacs à main et accessoires',
    image: '/images/Handbags.jpg',
    parentId: undefined,
    order: 5,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: 'chaussures',
    name: 'Chaussures',
    slug: 'chaussures',
    description: 'Chaussures élégantes pour femmes',
    image: '/images/WomenShoes.jpg',
    parentId: undefined,
    order: 6,
    isActive: true,
    createdAt: new Date().toISOString(),
  },
];

// Helper functions
export const getMainCategories = (): Category[] => {
  return categories.filter((cat) => !cat.parentId && cat.isActive);
};

export const getSubCategories = (parentId: string): Category[] => {
  return categories.filter((cat) => cat.parentId === parentId && cat.isActive);
};

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return categories.find((cat) => cat.slug === slug);
};

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find((cat) => cat.id === id);
};

export const getAllCategories = (): Category[] => {
  return categories.filter((cat) => cat.isActive);
};

// Category tree for admin
export interface CategoryTree extends Category {
  children?: CategoryTree[];
}

export const getCategoryTree = (): CategoryTree[] => {
  const mainCats = getMainCategories();
  return mainCats.map((cat) => ({
    ...cat,
    children: getSubCategories(cat.id).map((sub) => ({
      ...sub,
      children: [],
    })),
  }));
};