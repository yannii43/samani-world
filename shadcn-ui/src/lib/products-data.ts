export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  inStock: boolean;
  featured?: boolean;
}

export const categories = [
  {
    id: 'electronics',
    name: 'Électronique',
    image: '/assets/category-electronics.jpg',
  },
  {
    id: 'fashion',
    name: 'Mode',
    image: '/assets/category-fashion.jpg',
  },
  {
    id: 'home',
    name: 'Maison',
    image: '/assets/category-home.jpg',
  },
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Smartphone Samsung Galaxy A54',
    price: 185000,
    category: 'electronics',
    image: '/assets/category-electronics_variant_1.jpg',
    description: 'Smartphone 5G avec écran AMOLED 6.4", 128GB de stockage, appareil photo 50MP',
    inStock: true,
    featured: true,
  },
  {
    id: '2',
    name: 'Laptop HP 15"',
    price: 425000,
    category: 'electronics',
    image: '/assets/category-electronics_variant_2.jpg',
    description: 'Ordinateur portable Intel Core i5, 8GB RAM, 512GB SSD, Windows 11',
    inStock: true,
    featured: true,
  },
  {
    id: '3',
    name: 'Écouteurs Bluetooth JBL',
    price: 35000,
    category: 'electronics',
    image: '/assets/category-electronics_variant_3.jpg',
    description: 'Écouteurs sans fil avec réduction de bruit, autonomie 24h',
    inStock: true,
  },
  {
    id: '4',
    name: 'Boubou Traditionnel Homme',
    price: 45000,
    category: 'fashion',
    image: '/assets/category-fashion_variant_1.jpg',
    description: 'Boubou brodé en bazin riche, taille M-XXL disponible',
    inStock: true,
    featured: true,
  },
  {
    id: '5',
    name: 'Robe Africaine Femme',
    price: 38000,
    category: 'fashion',
    image: '/assets/category-fashion_variant_2.jpg',
    description: 'Robe en wax avec motifs traditionnels, coupe moderne',
    inStock: true,
  },
  {
    id: '6',
    name: 'Ensemble Dashiki',
    price: 28000,
    category: 'fashion',
    image: '/assets/category-fashion_variant_3.jpg',
    description: 'Ensemble dashiki coloré, confortable et élégant',
    inStock: true,
  },
  {
    id: '7',
    name: 'Set de Cuisine 12 Pièces',
    price: 65000,
    category: 'home',
    image: '/assets/category-home_variant_1.jpg',
    description: 'Casseroles et poêles antiadhésives, qualité premium',
    inStock: true,
  },
  {
    id: '8',
    name: 'Lampe Décorative LED',
    price: 22000,
    category: 'home',
    image: '/assets/category-home_variant_2.jpg',
    description: 'Lampe moderne avec contrôle de luminosité, design africain',
    inStock: true,
    featured: true,
  },
  {
    id: '9',
    name: 'Coussin Décoratif Wax',
    price: 12000,
    category: 'home',
    image: '/assets/category-home_variant_3.jpg',
    description: 'Coussin en tissu wax, motifs traditionnels, 45x45cm',
    inStock: true,
  },
];

export const formatPrice = (price: number): string => {
  return `${price.toLocaleString('fr-FR')} FCFA`;
};