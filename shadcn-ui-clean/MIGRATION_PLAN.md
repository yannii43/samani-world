# Sanii World - Plan de Migration V1

## 🎯 Objectif
Transformer le site e-commerce "DakarShop" existant en "Sanii World" - boutique de luxe minimaliste.

## 🎨 Design System
- **Nom**: Sanii World
- **Style**: Luxe minimaliste
- **Couleurs**:
  - Principales: Noir (#000000) / Blanc (#FFFFFF)
  - Accents: Or (#D4AF37) / Rose (#E91E63)
- **Logos**: 
  - `/public/brand/logo.png` (logo SW)
  - `/public/brand/logo-text.png` (texte SAMANI_WORLD)

## 📊 État Actuel (Audit)

### Structure Existante
```
✅ Components: Header, ProductCard, CategoryCard, CartItem, ProtectedRoute
✅ Pages Client: Index, Products, ProductDetail, Cart, Checkout, Profile, Login, Register, About
✅ Pages Admin: Dashboard, Products, Orders
✅ Stores: auth-store, cart-store, admin-products, orders-data
✅ Data: products-data (mock data avec 9 produits)
```

### Limitations Actuelles
❌ Pas de système de variantes (taille, couleur)
❌ Pas de sous-catégories
❌ Pas de gestion de stock par variante
❌ Pas de tracking de livraison
❌ Pas de système de retours/échanges
❌ Pas de wishlist
❌ Pas de coupons
❌ Catégories hardcodées (Electronics, Fashion, Home)
❌ Pas de galerie d'images produit
❌ Pas de recherche avancée
❌ Pas de filtres dynamiques

## 🗄️ Nouvelle Structure de Données

### Modèles à Créer (TypeScript Interfaces)

```typescript
// Categories & SubCategories
interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image: string;
  parentId?: string; // Pour sous-catégories
  order: number;
  isActive: boolean;
}

// Product Options (Taille, Couleur, Matière, etc.)
interface ProductOption {
  id: string;
  name: string; // "Taille", "Couleur", "Matière"
  type: 'select' | 'color' | 'button';
  order: number;
}

interface ProductOptionValue {
  id: string;
  optionId: string;
  value: string; // "S", "M", "L", "Noir", "Rose"
  displayValue?: string;
  colorHex?: string; // Pour type color
  order: number;
}

// Product avec variantes
interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  categoryId: string;
  subCategoryId?: string;
  basePrice: number;
  coverImage: string;
  gallery: string[];
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface ProductVariant {
  id: string;
  productId: string;
  sku: string;
  optionValues: { optionId: string; valueId: string }[];
  price?: number; // Override basePrice si différent
  stock: number;
  isActive: boolean;
}

// Inventory
interface InventoryLog {
  id: string;
  variantId: string;
  quantity: number;
  type: 'in' | 'out' | 'adjustment';
  reason: string;
  createdAt: string;
}

// Orders avec variantes
interface OrderItem {
  id: string;
  orderId: string;
  productId: string;
  variantId: string;
  quantity: number;
  price: number;
  productName: string;
  variantDetails: string; // "Taille: M, Couleur: Noir"
}

interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingMethod: 'click-collect' | 'dakar' | 'hors-dakar';
  shippingCost: number;
  subtotal: number;
  discount: number;
  total: number;
  paymentMethod: 'online' | 'on-delivery';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled';
  items: OrderItem[];
  couponCode?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Shipping & Tracking
interface ShippingConfig {
  id: string;
  method: 'click-collect' | 'dakar' | 'hors-dakar';
  name: string;
  description: string;
  cost: number;
  estimatedDays: string;
  isActive: boolean;
}

interface Shipment {
  id: string;
  orderId: string;
  trackingNumber: string;
  carrier?: string;
  status: 'pending' | 'in-transit' | 'delivered' | 'failed';
  createdAt: string;
  deliveredAt?: string;
}

interface TrackingEvent {
  id: string;
  shipmentId: string;
  status: string;
  description: string;
  location?: string;
  timestamp: string;
}

// Returns & Exchanges
interface ReturnRequest {
  id: string;
  orderId: string;
  userId: string;
  type: 'return' | 'exchange';
  reason: string;
  items: { orderItemId: string; quantity: number }[];
  status: 'requested' | 'approved' | 'rejected' | 'received' | 'refunded' | 'exchanged';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// Wishlist
interface WishlistItem {
  id: string;
  userId: string;
  productId: string;
  variantId?: string;
  createdAt: string;
}

// Coupons
interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase?: number;
  maxDiscount?: number;
  validFrom: string;
  validTo: string;
  usageLimit?: number;
  usageCount: number;
  isActive: boolean;
}

// Notifications
interface NotificationEvent {
  id: string;
  orderId: string;
  type: 'email' | 'whatsapp' | 'sms';
  event: 'order-confirmed' | 'preparing' | 'shipped' | 'delivered' | 'incident';
  recipient: string;
  message: string;
  status: 'pending' | 'sent' | 'failed';
  sentAt?: string;
  createdAt: string;
}
```

## 📝 Plan d'Implémentation

### Phase 1: Setup & Design System (Priorité: HAUTE)
- [x] Copier logos vers /public/brand/
- [ ] Créer theme.ts avec couleurs Sanii World
- [ ] Mettre à jour index.html (title, meta, favicon)
- [ ] Créer composant Logo
- [ ] Mettre à jour Header avec nouveau design
- [ ] Créer page d'accueil redesignée

### Phase 2: Nouvelle Structure de Données (Priorité: HAUTE)
- [ ] Créer types.ts avec toutes les interfaces
- [ ] Créer categories-data.ts avec catégories Sanii World:
  - Robes
  - Abaya
  - Vêtements femme (sous-cat: Robe femme)
  - Gloss
  - Sacs
  - Chaussure
- [ ] Créer options-data.ts (Taille: S/M/L/XL, Couleur: Noir/Blanc/Or/Rose)
- [ ] Mettre à jour products-data.ts avec variantes
- [ ] Créer inventory-data.ts
- [ ] Créer shipping-data.ts
- [ ] Créer coupons-data.ts

### Phase 3: Admin - Gestion Catégories (Priorité: HAUTE)
- [ ] Page /admin/categories
  - Liste catégories + sous-catégories (tree view)
  - Ajouter/Modifier/Supprimer catégorie
  - Drag & drop pour ordre
  - Upload image catégorie

### Phase 4: Admin - Gestion Options & Variantes (Priorité: HAUTE)
- [ ] Page /admin/options
  - Gérer options (Taille, Couleur, etc.)
  - Gérer valeurs d'options
- [ ] Mettre à jour /admin/products
  - Section variantes avec générateur de combinaisons
  - Stock par variante
  - Prix par variante (optionnel)
  - Galerie d'images (cover + gallery)

### Phase 5: Admin - Gestion Commandes Avancée (Priorité: HAUTE)
- [ ] Mettre à jour /admin/orders
  - Filtres (date, statut, paiement)
  - Détail commande avec variantes
  - Modifier statut (déclenche tracking)
  - Bouton "Imprimer bon de préparation"

### Phase 6: Admin - Gestion Paiements (Priorité: MOYENNE)
- [ ] Page /admin/payments
  - Liste paiements
  - Filtres (statut, date)
  - Lier à commande
  - Générer facture PDF

### Phase 7: Admin - Gestion Livraison (Priorité: MOYENNE)
- [ ] Page /admin/shipping
  - Configurer tarifs (Click & Collect, Dakar, Hors Dakar)
  - Gérer expéditions
  - Ajouter événements de tracking

### Phase 8: Admin - Gestion Retours (Priorité: MOYENNE)
- [ ] Page /admin/returns
  - Liste demandes retour/échange
  - Approuver/Refuser
  - Changer statut
  - Historique

### Phase 9: Front - Catalogue Amélioré (Priorité: HAUTE)
- [ ] Page d'accueil redesignée
  - Hero section luxe
  - Nouveautés
  - Best-sellers
  - Produits vedettes
- [ ] Page /categories
  - Grid de catégories
- [ ] Page /category/[slug]
  - Filtres dynamiques (prix, options disponibles, stock)
  - Tri (prix, nouveauté, popularité)
  - Recherche
- [ ] Mettre à jour ProductCard (badges, hover effects)

### Phase 10: Front - Page Produit avec Variantes (Priorité: HAUTE)
- [ ] Mettre à jour /product/[slug]
  - Galerie photos (cover + gallery avec zoom)
  - Sélecteurs variantes dynamiques
  - Affichage stock selon variante
  - Produits similaires
  - Bouton wishlist

### Phase 11: Front - Panier & Checkout Amélioré (Priorité: HAUTE)
- [ ] Mettre à jour /cart
  - Afficher détails variantes
  - Système de coupons
- [ ] Mettre à jour /checkout
  - Choix livraison avec tarifs
  - Paiement en ligne (placeholder)
  - Paiement sur place
  - Validation complète

### Phase 12: Front - Tracking Commande (Priorité: MOYENNE)
- [ ] Page /track-order
  - Recherche par numéro + email/téléphone
  - Timeline de statuts
  - Événements de tracking

### Phase 13: Front - Espace Client Amélioré (Priorité: MOYENNE)
- [ ] Mettre à jour /account
  - Mes commandes avec variantes
  - Suivi commandes
  - Wishlist
  - Adresses multiples
  - Demander retour/échange

### Phase 14: Front - Retours & Échanges (Priorité: BASSE)
- [ ] Page /returns/request
  - Formulaire demande
  - Sélection items
  - Upload photos
- [ ] Page /returns/[id]
  - Détail demande
  - Statut

### Phase 15: Notifications (Priorité: MOYENNE)
- [ ] Système de notifications
  - Email (console.log pour V1)
  - WhatsApp (lien wa.me)
  - Stocker dans NotificationEvent

### Phase 16: SEO & Performance (Priorité: BASSE)
- [ ] Meta tags par page
- [ ] Open Graph
- [ ] Optimisation images
- [ ] Lazy loading

### Phase 17: Sécurité & Qualité (Priorité: HAUTE)
- [ ] Protection routes admin
- [ ] Validation formulaires (zod)
- [ ] Pages 404/500 custom
- [ ] Error boundaries
- [ ] Logs

### Phase 18: Tests & Polish (Priorité: HAUTE)
- [ ] Tester tous les flows
- [ ] Corriger bugs
- [ ] Responsive design
- [ ] Accessibilité

## 🚀 Ordre d'Exécution Recommandé

1. **Setup Design** (Phase 1)
2. **Structure Données** (Phase 2)
3. **Admin Catégories** (Phase 3)
4. **Admin Variantes** (Phase 4)
5. **Front Catalogue** (Phase 9)
6. **Front Produit** (Phase 10)
7. **Front Panier/Checkout** (Phase 11)
8. **Admin Commandes** (Phase 5)
9. **Tracking** (Phase 12)
10. **Espace Client** (Phase 13)
11. **Autres fonctionnalités** (Phases restantes)

## 📦 Identifiants Admin Dev
```
Email: admin@saniiworld.com
Password: SaniiAdmin2024!
```

## ✅ Critères de Succès V1
- Toutes les pages accessibles sans 404
- Admin peut gérer catégories/sous-catégories
- Admin peut créer produits avec variantes flexibles
- Admin peut gérer stock par variante
- Client peut filtrer/rechercher produits
- Client peut sélectionner variantes et ajouter au panier
- Checkout complet avec choix livraison
- Tracking basique fonctionnel
- Design Sanii World appliqué partout
- Responsive mobile/tablet/desktop