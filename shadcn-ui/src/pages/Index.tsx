import { Link } from 'react-router-dom';
import { ArrowRight, Package, Truck, Shield } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/Header';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { products, categories } from '@/lib/products-data';

export default function Index() {
  const featuredProducts = products.filter((p) => p.featured);

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative h-[500px] overflow-hidden">
        <img
          src="/assets/hero-dakar-marketplace.jpg"
          alt="Marché de Dakar"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40 flex items-center">
          <div className="container mx-auto px-4">
            <div className="max-w-2xl text-white">
              <h1 className="text-5xl font-bold mb-4">
                Bienvenue sur DakarShop
              </h1>
              <p className="text-xl mb-8">
                Votre boutique en ligne à Dakar. Livraison rapide dans toute la ville.
              </p>
              <Link to="/products">
                <Button
                  size="lg"
                  className="bg-[#00A86B] hover:bg-[#008f5d] text-white text-lg px-8"
                >
                  Découvrir nos produits
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#00A86B]/10 flex items-center justify-center">
                <Package className="h-6 w-6 text-[#00A86B]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Large Sélection</h3>
                <p className="text-sm text-gray-600">Des milliers de produits</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#00A86B]/10 flex items-center justify-center">
                <Truck className="h-6 w-6 text-[#00A86B]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Livraison Rapide</h3>
                <p className="text-sm text-gray-600">Dans tout Dakar</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-full bg-[#00A86B]/10 flex items-center justify-center">
                <Shield className="h-6 w-6 text-[#00A86B]" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Paiement Sécurisé</h3>
                <p className="text-sm text-gray-600">100% sécurisé</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            Catégories Populaires
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {categories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Produits en Vedette
            </h2>
            <Link to="/products">
              <Button variant="outline" className="border-[#00A86B] text-[#00A86B] hover:bg-[#00A86B] hover:text-white">
                Voir tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">DakarShop</h3>
              <p className="text-gray-400">
                Votre boutique en ligne de confiance à Dakar
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Liens Rapides</h4>
              <ul className="space-y-2 text-gray-400">
                <li>
                  <Link to="/products" className="hover:text-white transition-colors">
                    Produits
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="hover:text-white transition-colors">
                    À Propos
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Dakar, Sénégal</li>
                <li>+221 XX XXX XX XX</li>
                <li>contact@dakarshop.sn</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DakarShop. Tous droits réservés.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}