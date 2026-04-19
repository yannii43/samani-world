import { useEffect, useState } from 'react';
import { Heart, ShoppingCart, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/auth-store';
import { cart } from '@/lib/cart';
import { toast } from 'sonner';

type WishProduct = { id: string; name: string; slug: string; basePrice: number; coverImage: string | null };

function fmt(n: number) { return n.toLocaleString('fr-FR') + ' FCFA'; }
function resolveImage(src?: string | null) {
  if (!src) return '/assets/placeholder.jpg';
  if (src.startsWith('http') || src.startsWith('/assets') || src.startsWith('/images')) return src;
  if (src.startsWith('/uploads')) return `http://localhost:4000${src}`;
  return src;
}

export default function Wishlist() {
  const { isAuthenticated } = useAuthStore();
  const [products, setProducts] = useState<WishProduct[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    if (!isAuthenticated) { setLoading(false); return; }
    try {
      const data = await fetch('/api/wishlist', { credentials: 'include' }).then((r) => r.json());
      setProducts(data.products || []);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, [isAuthenticated]);

  const remove = async (productId: string) => {
    try {
      await fetch(`/api/wishlist/${productId}`, { method: 'DELETE', credentials: 'include' });
      setProducts((prev) => prev.filter((p) => p.id !== productId));
      toast.success('Retiré des favoris');
    } catch { toast.error('Erreur'); }
  };

  if (!isAuthenticated) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Heart className="h-12 w-12 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Mes favoris</h1>
        <p className="text-gray-500 mb-6">Connectez-vous pour accéder à votre liste de favoris.</p>
        <Button asChild className="bg-black hover:bg-gray-900"><Link to="/login">Se connecter</Link></Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      <div className="flex items-center gap-3 mb-8">
        <Heart className="h-6 w-6 fill-black" />
        <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Mes favoris</h1>
        {!loading && <span className="text-gray-400 text-sm">({products.length})</span>}
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <Card key={i} className="overflow-hidden">
              <Skeleton className="h-48 w-full rounded-none" />
              <CardContent className="p-3 space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-16 w-16 mx-auto text-gray-200 mb-4" />
          <p className="text-gray-400 text-lg mb-6">Votre liste de favoris est vide</p>
          <Button asChild className="bg-black hover:bg-gray-900">
            <Link to="/products">Découvrir nos produits</Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <Card key={p.id} className="overflow-hidden group">
                <Link to={`/product/${p.slug}`}>
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <img src={resolveImage(p.coverImage)} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                    <button
                      className="absolute top-2 right-2 h-8 w-8 bg-white rounded-full flex items-center justify-center shadow hover:bg-red-50 transition-colors"
                      onClick={(e) => { e.preventDefault(); remove(p.id); }}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </button>
                  </div>
                </Link>
                <CardContent className="p-3">
                  <Link to={`/product/${p.slug}`}>
                    <p className="font-semibold text-sm line-clamp-2 hover:underline mb-1">{p.name}</p>
                    <p className="font-bold text-sm">{fmt(p.basePrice)}</p>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button asChild variant="outline">
              <Link to="/products">Continuer mes achats</Link>
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
