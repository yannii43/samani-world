import type { ProductOption, ProductOptionValue } from './types';

// ============================================
// SANII WORLD - Product Options Data
// ============================================

export const productOptions: ProductOption[] = [
  {
    id: 'size',
    name: 'Taille',
    type: 'button',
    order: 1,
  },
  {
    id: 'color',
    name: 'Couleur',
    type: 'color',
    order: 2,
  },
];

export const productOptionValues: ProductOptionValue[] = [
  // Tailles
  {
    id: 'size-s',
    optionId: 'size',
    value: 'S',
    displayValue: 'S',
    order: 1,
  },
  {
    id: 'size-m',
    optionId: 'size',
    value: 'M',
    displayValue: 'M',
    order: 2,
  },
  {
    id: 'size-l',
    optionId: 'size',
    value: 'L',
    displayValue: 'L',
    order: 3,
  },
  {
    id: 'size-xl',
    optionId: 'size',
    value: 'XL',
    displayValue: 'XL',
    order: 4,
  },
  
  // Couleurs
  {
    id: 'color-black',
    optionId: 'color',
    value: 'Noir',
    displayValue: 'Noir',
    colorHex: '#000000',
    order: 1,
  },
  {
    id: 'color-white',
    optionId: 'color',
    value: 'Blanc',
    displayValue: 'Blanc',
    colorHex: '#FFFFFF',
    order: 2,
  },
  {
    id: 'color-gold',
    optionId: 'color',
    value: 'Or',
    displayValue: 'Or',
    colorHex: '#D4AF37',
    order: 3,
  },
  {
    id: 'color-rose',
    optionId: 'color',
    value: 'Rose',
    displayValue: 'Rose',
    colorHex: '#E91E63',
    order: 4,
  },
];

// Helper functions
export const getOptionById = (id: string): ProductOption | undefined => {
  return productOptions.find((opt) => opt.id === id);
};

export const getOptionValuesByOptionId = (optionId: string): ProductOptionValue[] => {
  return productOptionValues.filter((val) => val.optionId === optionId);
};

export const getOptionValueById = (id: string): ProductOptionValue | undefined => {
  return productOptionValues.find((val) => val.id === id);
};

export const getAllOptions = (): ProductOption[] => {
  return productOptions;
};

export const getAllOptionValues = (): ProductOptionValue[] => {
  return productOptionValues;
};