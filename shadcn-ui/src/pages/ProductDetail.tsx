import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, ShoppingCart, Package, Truck } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useCartStore } from '@/lib/cart-store';
import { products, formatPrice } from '@/lib/products-data';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const addItem = useCartStore((state) => state.addItem);

  const product = products.find((p) => p.id === id);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Produit non trouvé
          </h1>
          <Link to="/products">
            <Button className="bg-[#00A86B] hover:bg-[#008f5d]">
              Retour aux produits
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleAddToCart = () => {
    addItem(product);
    toast.success('Produit ajouté au panier!');
  };

  const handleBuyNow = () => {
    addItem(product);
    navigate('/cart');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate(-1)}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Product Image */}
          <div className="relative aspect-square rounded-lg overflow-hidden bg-white">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            {product.featured && (
              <Badge className="absolute top-4 left-4 bg-[#FCD116] text-black hover:bg-[#FCD116]">
                Produit Vedette
              </Badge>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <Badge
                variant="outline"
                className="text-[#00A86B] border-[#00A86B]"
              >
                {product.category === 'electronics'
                  ? 'Électronique'
                  : product.category === 'fashion'
                  ? 'Mode'
                  : 'Maison'}
              </Badge>
            </div>

            <div className="text-4xl font-bold text-[#00A86B]">
              {formatPrice(product.price)}
            </div>

            <p className="text-gray-600 text-lg leading-relaxed">
              {product.description}
            </p>

            {product.inStock ? (
              <div className="flex items-center gap-2 text-green-600">
                <Package className="h-5 w-5" />
                <span className="font-medium">En stock</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-red-600">
                <Package className="h-5 w-5" />
                <span className="font-medium">Rupture de stock</span>
              </div>
            )}

            <div className="flex gap-4">
              <Button
                size="lg"
                onClick={handleAddToCart}
                disabled={!product.inStock}
                className="flex-1 bg-white text-[#00A86B] border-2 border-[#00A86B] hover:bg-[#00A86B] hover:text-white"
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                Ajouter au panier
              </Button>
              <Button
                size="lg"
                onClick={handleBuyNow}
                disabled={!product.inStock}
                className="flex-1 bg-[#00A86B] hover:bg-[#008f5d] text-white"
              >
                Acheter maintenant
              </Button>
            </div>

            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-[#00A86B] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Livraison à Dakar
                    </h3>
                    <p className="text-sm text-gray-600">
                      Livraison rapide dans toute la ville de Dakar sous 24-48h
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Package className="h-5 w-5 text-[#00A86B] mt-1" />
                  <div>
                    <h3 className="font-semibold text-gray-900">
                      Garantie Qualité
                    </h3>
                    <p className="text-sm text-gray-600">
                      Produits authentiques avec garantie
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}