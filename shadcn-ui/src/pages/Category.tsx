import { useParams, Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/Header';
import Products from './Products';
import { Button } from '@/components/ui/button';
import { getCategoryBySlug } from '@/lib/categories-data';

export default function Category() {
  const { slug } = useParams<{ slug: string }>();
  const category = getCategoryBySlug(slug || '');

  if (!category) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Catégorie non trouvée</h1>
          <Link to="/products">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Retour aux produits
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Category Header */}
      <div className="relative h-[300px] bg-black overflow-hidden mb-8">
        <div className="absolute inset-0">
          <img
            src={category.image}
            alt={category.name}
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
        </div>
        <div className="relative container mx-auto px-4 h-full flex flex-col justify-end pb-12">
          <Link to="/products" className="text-white/80 hover:text-white mb-4 inline-flex items-center">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Retour aux produits
          </Link>
          <h1 className="text-5xl font-bold text-white mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xl text-white/90 max-w-2xl">
              {category.description}
            </p>
          )}
        </div>
      </div>

      {/* Reuse Products component with category filter */}
      <Products />
    </div>
  );
}