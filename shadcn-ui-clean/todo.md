# Site E-commerce Dakar - Plan de Développement

## Directives de Design

### Références de Design (Inspiration Principale)
- **Jumia.sn**: E-commerce leader au Sénégal, design adapté au marché local
- **Style**: Modern E-commerce + Couleurs vives africaines + Mobile-First

### Palette de Couleurs
- Primaire: #00A86B (Vert émeraude - couleur du drapeau sénégalais)
- Secondaire: #FCD116 (Jaune doré - accent chaleureux)
- Arrière-plan: #FFFFFF (Blanc - clarté)
- Cartes/Sections: #F8F9FA (Gris très clair)
- Texte: #212529 (Noir charbon), #6C757D (Gris moyen - secondaire)
- Erreur/Promo: #DC3545 (Rouge vif)

### Typographie
- Heading1: Inter font-weight 700 (36px)
- Heading2: Inter font-weight 600 (28px)
- Heading3: Inter font-weight 600 (20px)
- Body/Normal: Inter font-weight 400 (16px)
- Body/Emphasis: Inter font-weight 600 (16px)
- Prix: Inter font-weight 700 (24px)

### Styles des Composants Clés
- **Boutons**: Fond vert (#00A86B), texte blanc, 8px arrondi, hover: assombrir 10%
- **Cartes Produits**: Fond blanc, bordure 1px #E9ECEF, 12px arrondi, ombre légère
- **Badges Prix**: Fond jaune (#FCD116), texte noir, 4px arrondi
- **Formulaires**: Bordure grise, focus: bordure verte

### Mise en Page & Espacement
- Section Hero: 500px hauteur avec image de Dakar
- Grille Produits: 4 colonnes desktop, 2 tablette, 1 mobile, 20px gaps
- Padding sections: 60px vertical
- Hover carte: Élévation 4px avec ombre douce, transition 200ms

### Images à Générer
1. **hero-dakar-marketplace.jpg** - Marché coloré de Dakar avec vendeurs et produits, ambiance vibrante (Style: photorealistic, bright daylight)
2. **category-electronics.jpg** - Électronique moderne (smartphones, laptops) sur fond blanc (Style: product photography, clean)
3. **category-fashion.jpg** - Vêtements africains colorés et modernes (Style: fashion photography, vibrant)
4. **category-home.jpg** - Articles de maison et décoration (Style: lifestyle photography, warm)
5. **delivery-dakar.jpg** - Livreur sur moto à Dakar, ville en arrière-plan (Style: photorealistic, action shot)
6. **logo-shop.png** - Logo de boutique avec éléments sénégalais (Style: vector-style, modern, transparent background)

---

## Tâches de Développement

### 1. Configuration & Structure
- [x] Template initialisé
- [ ] Créer todo.md avec directives de design
- [ ] Générer toutes les images nécessaires
- [ ] Mettre à jour index.html avec titre et meta

### 2. Composants Réutilisables
- [ ] ProductCard.tsx - Carte produit avec image, titre, prix FCFA, bouton
- [ ] CategoryCard.tsx - Carte catégorie avec image et nom
- [ ] CartItem.tsx - Item du panier avec quantité ajustable
- [ ] Header.tsx - En-tête avec logo, navigation, icône panier

### 3. Pages Principales
- [ ] src/pages/Index.tsx - Page d'accueil (hero, catégories, produits vedette)
- [ ] src/pages/Products.tsx - Catalogue avec filtres
- [ ] src/pages/ProductDetail.tsx - Détail produit
- [ ] src/pages/Cart.tsx - Panier d'achat
- [ ] src/pages/Checkout.tsx - Formulaire de commande
- [ ] src/pages/About.tsx - À propos et infos livraison

### 4. Gestion d'État
- [ ] src/lib/cart-store.ts - Store pour le panier (Zustand ou Context)
- [ ] src/lib/products-data.ts - Données produits (mock data)

### 5. Routing
- [ ] Mettre à jour App.tsx avec toutes les routes

### 6. Styling & Responsive
- [ ] Appliquer le système de design
- [ ] Animations et effets hover
- [ ] Tests responsive (mobile, tablette, desktop)

### 7. Tests Finaux
- [ ] Lint check
- [ ] Build check
- [ ] Test navigation complète
- [ ] Validation UI