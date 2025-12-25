import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice, type Product } from '@/lib/products-data';
import { toast } from 'sonner';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((state) => state.addItem);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product);
    toast.success('Produit ajouté au panier!');
  };

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-gray-200">
        <CardContent className="p-0">
          <div className="relative aspect-square overflow-hidden bg-gray-100">
            <img
              src={product.image}
              alt={product.name}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {product.featured && (
              <Badge className="absolute top-2 left-2 bg-[#FCD116] text-black hover:bg-[#FCD116]">
                Vedette
              </Badge>
            )}
            {!product.inStock && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <Badge variant="destructive">Rupture de stock</Badge>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col items-start gap-2 p-4">
          <h3 className="font-semibold text-gray-900 line-clamp-2 min-h-[3rem]">
            {product.name}
          </h3>
          <div className="flex items-center justify-between w-full">
            <span className="text-2xl font-bold text-[#00A86B]">
              {formatPrice(product.price)}
            </span>
            <Button
              size="icon"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className="bg-[#00A86B] hover:bg-[#008f5d] text-white"
            >
              <ShoppingCart className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}