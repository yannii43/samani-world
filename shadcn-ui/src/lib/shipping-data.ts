import type { ShippingConfig } from './types';

// ============================================
// SANII WORLD - Shipping Configuration
// ============================================

export const shippingConfigs: ShippingConfig[] = [
  {
    id: 'click-collect',
    method: 'click-collect',
    name: 'Click & Collect',
    description: 'Retrait gratuit en boutique',
    cost: 0,
    estimatedDays: 'Disponible immédiatement',
    isActive: true,
  },
  {
    id: 'dakar',
    method: 'dakar',
    name: 'Livraison Dakar',
    description: 'Livraison à domicile dans Dakar',
    cost: 2000,
    estimatedDays: '1-2 jours ouvrables',
    isActive: true,
  },
  {
    id: 'hors-dakar',
    method: 'hors-dakar',
    name: 'Livraison Hors Dakar',
    description: 'Livraison dans les autres régions du Sénégal',
    cost: 5000,
    estimatedDays: '3-5 jours ouvrables',
    isActive: true,
  },
];

export const getShippingConfig = (method: string): ShippingConfig | undefined => {
  return shippingConfigs.find((config) => config.method === method && config.isActive);
};

export const getAllShippingConfigs = (): ShippingConfig[] => {
  return shippingConfigs.filter((config) => config.isActive);
};

export const calculateShippingCost = (method: string): number => {
  const config = getShippingConfig(method);
  return config ? config.cost : 0;
};