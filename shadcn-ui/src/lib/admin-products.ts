import { products as initialProducts, type Product } from './products-data';

const adminProducts = [...initialProducts];

export const getAdminProducts = () => adminProducts;

export const addProduct = (product: Product) => {
  adminProducts.push(product);
  return product;
};

export const updateProduct = (productId: string, updates: Partial<Product>) => {
  const index = adminProducts.findIndex((p) => p.id === productId);
  if (index !== -1) {
    adminProducts[index] = { ...adminProducts[index], ...updates };
    return adminProducts[index];
  }
  return null;
};

export const deleteProduct = (productId: string) => {
  const index = adminProducts.findIndex((p) => p.id === productId);
  if (index !== -1) {
    adminProducts.splice(index, 1);
    return true;
  }
  return false;
};

export const syncProducts = () => {
  return adminProducts;
};