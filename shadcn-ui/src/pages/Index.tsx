import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { ArrowRight, Sparkles, TrendingUp, Star } from 'lucide-react';
import ProductCard from '@/components/ProductCard';
import CategoryCard from '@/components/CategoryCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getMainCategories } from '@/lib/categories-data';
import { getFeaturedProducts, getNewArrivals } from '@/lib/products-data-v2';

export default function Index() {
  const mainCategories = getMainCategories();
  const featuredProducts = getFeaturedProducts().slice(0, 4);
  const newArrivals = getNewArrivals().slice(0, 4);

  return (
    <div className="bg-white">
      <Helmet>
        <title>Samani World — Boutique Mode Féminine Luxe à Dakar, Sénégal</title>
        <meta name="description" content="Boutique de mode féminine luxueuse à Dakar. Robes, abayas, sacs, chaussures et accessoires. Livraison partout au Sénégal. Paiement à la livraison, Wave, Orange Money." />
        <link rel="canonical" href="https://samaniworld.com/" />
      </Helmet>

      {/* Hero Section */}
      <section className="relative bg-black overflow-hidden" style={{ height: '600px' }}>
        <div className="absolute inset-0">
          <img
            src="/assets/hero-sanii-world.jpg"
            alt="Collection de mode féminine Samani World — robes et abayas élégantes à Dakar"
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.6 }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex items-center">
          <div className="max-w-2xl text-white">
            <div className="mb-4 inline-block px-4 py-2 bg-[#D4AF37] text-black font-semibold rounded">
              Nouvelle Collection
            </div>
            <h1 className="text-6xl font-bold mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
              Élégance Intemporelle
            </h1>
            <p className="text-xl mb-8 text-gray-200">
              Découvrez notre collection exclusive de mode féminine luxueuse et raffinée
            </p>
            <div className="flex gap-4">
              <Link to="/products">
                <Button size="lg" className="bg-white text-black hover:bg-gray-100">
                  Découvrir la Collection
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link to="/category/robes">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
                  Voir les Robes
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
              Nos Collections
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explorez nos catégories soigneusement sélectionnées pour sublimer votre style
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mainCategories.map((category) => (
              <CategoryCard key={category.id} category={category} />
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Star className="h-6 w-6 text-[#D4AF37]" />
                <h2 className="text-4xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Produits Vedettes
                </h2>
              </div>
              <p className="text-gray-600">Nos pièces les plus populaires</p>
            </div>
            <Link to="/products?filter=featured">
              <Button variant="outline" className="hidden md:flex">
                Voir Tout
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

      {/* New Arrivals */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-12">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-6 w-6 text-[#E91E63]" />
                <h2 className="text-4xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
                  Nouveautés
                </h2>
              </div>
              <p className="text-gray-600">Les dernières arrivées de notre collection</p>
            </div>
            <Link to="/products?filter=new">
              <Button variant="outline" className="hidden md:flex">
                Voir Tout
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {newArrivals.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-black text-white">
        <div className="container mx-auto px-4 text-center">
          <TrendingUp className="h-16 w-16 text-[#D4AF37] mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
            Rejoignez Samani World
          </h2>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Inscrivez-vous pour recevoir nos offres exclusives et être informé des nouvelles collections
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Votre email"
              className="bg-white text-black"
            />
            <Button className="bg-[#D4AF37] text-black hover:bg-[#C19B2F]">
              S'inscrire
            </Button>
          </div>
        </div>
      </section>

    </div>
  );
}