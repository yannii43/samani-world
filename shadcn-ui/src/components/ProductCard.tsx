import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import type { Product } from '@/lib/types';
import { formatPrice } from '@/lib/products-data-v2';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const variants = (product as any).variants ?? [];
  const totalStock = variants.length > 0
    ? variants.reduce((sum: number, v: any) => sum + (Number(v.stock) || 0), 0)
    : 1; // si pas de variantes chargées, on considère en stock
  const inStock = totalStock > 0;

  return (
    <Link to={`/product/${product.slug}`} className="group">
      <Card className="overflow-hidden border-0 shadow-md hover:shadow-xl transition-all duration-300 hover-lift">
        <div className="relative overflow-hidden bg-gray-100" style={{ height: '280px' }}>
          <img
            src={product.coverImage || '/assets/placeholder.jpg'}
            alt={product.name}
            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/placeholder.jpg'; }}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
          
          {/* Badges */}
          <div className="absolute top-3 right-3 flex flex-col gap-2">
            {product.isNewArrival && (
              <Badge className="bg-[#E91E63] text-white hover:bg-[#E91E63]">
                Nouveau
              </Badge>
            )}
            {product.isBestSeller && (
              <Badge className="bg-[#D4AF37] text-black hover:bg-[#D4AF37]">
                Best-seller
              </Badge>
            )}
            {product.isFeatured && (
              <Badge className="bg-black text-white hover:bg-black">
                Vedette
              </Badge>
            )}
          </div>

          {/* Out of stock overlay */}
          {!inStock && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
              <span className="text-white font-semibold text-lg">
                Rupture de stock
              </span>
            </div>
          )}
        </div>

        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-[#D4AF37] transition-colors">
            {product.name}
          </h3>
          <div className="flex items-baseline justify-between">
            <p className="text-2xl font-bold">
              {formatPrice(product.basePrice)}
            </p>
            {inStock && (
              <span className="text-xs text-gray-500">
                {totalStock} disponible{totalStock > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}