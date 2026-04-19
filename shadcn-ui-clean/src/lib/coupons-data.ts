import type { Coupon } from './types';

// ============================================
// SAMANI WORLD - Coupons Data
// ============================================

export const coupons: Coupon[] = [
  {
    id: 'welcome10',
    code: 'WELCOME10',
    type: 'percentage',
    value: 10,
    minPurchase: 50000,
    maxDiscount: 10000,
    validFrom: '2024-01-01T00:00:00Z',
    validTo: '2025-12-31T23:59:59Z',
    usageLimit: 100,
    usageCount: 0,
    isActive: true,
  },
  {
    id: 'summer2024',
    code: 'SUMMER2024',
    type: 'fixed',
    value: 5000,
    minPurchase: 30000,
    validFrom: '2024-06-01T00:00:00Z',
    validTo: '2024-09-30T23:59:59Z',
    usageLimit: 50,
    usageCount: 0,
    isActive: true,
  },
];

export const validateCoupon = (code: string, subtotal: number): { valid: boolean; discount: number; message: string } => {
  const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase() && c.isActive);
  
  if (!coupon) {
    return { valid: false, discount: 0, message: 'Code promo invalide' };
  }
  
  const now = new Date();
  const validFrom = new Date(coupon.validFrom);
  const validTo = new Date(coupon.validTo);
  
  if (now < validFrom || now > validTo) {
    return { valid: false, discount: 0, message: 'Code promo expiré' };
  }
  
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return { valid: false, discount: 0, message: 'Code promo épuisé' };
  }
  
  if (coupon.minPurchase && subtotal < coupon.minPurchase) {
    return { 
      valid: false, 
      discount: 0, 
      message: `Montant minimum ${coupon.minPurchase.toLocaleString('fr-FR')} FCFA requis` 
    };
  }
  
  let discount = 0;
  if (coupon.type === 'percentage') {
    discount = (subtotal * coupon.value) / 100;
    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
  } else {
    discount = coupon.value;
  }
  
  return { 
    valid: true, 
    discount: Math.floor(discount), 
    message: `Réduction de ${discount.toLocaleString('fr-FR')} FCFA appliquée` 
  };
};

export const applyCoupon = (code: string): void => {
  const coupon = coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
  if (coupon) {
    coupon.usageCount++;
  }
};

export const getAllCoupons = (): Coupon[] => {
  return coupons;
};

export const getCouponByCode = (code: string): Coupon | undefined => {
  return coupons.find((c) => c.code.toUpperCase() === code.toUpperCase());
};