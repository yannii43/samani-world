import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShoppingCart, Heart, ArrowLeft, Share2 } from 'lucide-react';
import Header from '@/components/Header';
import VariantSelector from '@/components/VariantSelector';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/cart-store';
import { getProductBySlug, getProductsByCategory, getVariantPrice, formatPrice } from '@/lib/products-data-v2';
import { getCategoryById } from '@/lib/categories-data';
import type { ProductVariant } from '@/lib/types';
import { toast } from 'sonner';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const addToCart = useCartStore((state) => state.addItem);
  
  const product = getProductBySlug(id || '');
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Produit non trouvé</h1>
          <Link to="/products">
            <Button>Retour aux produits</Button>
          </Link>
        </div>
      </div>
    );
  }

  const category = getCategoryById(product.categoryId);
  const relatedProducts = getProductsByCategory(product.categoryId)
    .filter((p) => p.id !== product.id)
    .slice(0, 4);

  const currentPrice = selectedVariant ? getVariantPrice(product, selectedVariant) : product.basePrice;
  const canAddToCart = selectedVariant && selectedVariant.stock > 0;

  const handleAddToCart = () => {
    if (!selectedVariant) {
      toast.error('Veuillez sélectionner une variante');
      return;
    }

    if (selectedVariant.stock < quantity) {
      toast.error('Stock insuffisant');
      return;
    }

    addToCart({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      variantDetails: selectedVariant.optionValues
        .map((ov) => ov.valueId.split('-')[1]?.toUpperCase())
        .join(' / ') || 'Standard',
      price: currentPrice,
      quantity,
      coverImage: product.coverImage,
      stock: selectedVariant.stock,
    });

    toast.success('Produit ajouté au panier!');
  };

  const images = product.gallery.length > 0 ? product.gallery : [product.coverImage];

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm text-gray-600 mb-8">
          <Link to="/" className="hover:text-black">Accueil</Link>
          <span>/</span>
          <Link to="/products" className="hover:text-black">Produits</Link>
          {category && (
            <>
              <span>/</span>
              <Link to={`/category/${category.slug}`} className="hover:text-black">
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-black">{product.name}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Images Gallery */}
          <div className="space-y-4">
            <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
              <img
                src={images[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover"
              />
              {product.isNewArrival && (
                <Badge className="absolute top-4 right-4 bg-[#E91E63] text-white">
                  Nouveau
                </Badge>
              )}
              {product.isBestSeller && (
                <Badge className="absolute top-4 left-4 bg-[#D4AF37] text-black">
                  Best-seller
                </Badge>
              )}
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square bg-gray-100 rounded-lg overflow-hidden border-2 transition-all ${
                      selectedImageIndex === index
                        ? 'border-black'
                        : 'border-transparent hover:border-gray-300'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
                {product.name}
              </h1>
              <div className="flex items-baseline gap-4 mb-4">
                <p className="text-4xl font-bold">
                  {formatPrice(currentPrice)}
                </p>
              </div>
              <div className="flex gap-2 mb-6">
                {product.isFeatured && (
                  <Badge className="bg-black text-white">Vedette</Badge>
                )}
                {product.isNewArrival && (
                  <Badge className="bg-[#E91E63] text-white">Nouveau</Badge>
                )}
                {product.isBestSeller && (
                  <Badge className="bg-[#D4AF37] text-black">Best-seller</Badge>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-600 leading-relaxed">{product.description}</p>
            </div>

            <Separator />

            {/* Variant Selector */}
            <VariantSelector
              product={product}
              selectedVariant={selectedVariant}
              onVariantChange={setSelectedVariant}
            />

            <Separator />

            {/* Quantity */}
            <div>
              <Label className="text-base font-semibold mb-3 block">Quantité</Label>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded-lg">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center font-semibold">{quantity}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setQuantity(quantity + 1)}
                    disabled={!selectedVariant || quantity >= selectedVariant.stock}
                  >
                    +
                  </Button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full bg-black hover:bg-gray-900 text-white"
                onClick={handleAddToCart}
                disabled={!canAddToCart}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {canAddToCart ? 'Ajouter au Panier' : 'Sélectionner une variante'}
              </Button>
              <div className="flex gap-3">
                <Button variant="outline" size="lg" className="flex-1">
                  <Heart className="mr-2 h-5 w-5" />
                  Wishlist
                </Button>
                <Button variant="outline" size="lg" className="flex-1">
                  <Share2 className="mr-2 h-5 w-5" />
                  Partager
                </Button>
              </div>
            </div>

            <Separator />

            {/* Additional Info */}
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Catégorie:</span>
                <Link
                  to={`/category/${category?.slug}`}
                  className="font-medium hover:text-[#D4AF37]"
                >
                  {category?.name}
                </Link>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">SKU:</span>
                <span className="font-medium">{selectedVariant?.sku || 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <section className="py-12 border-t">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
                Produits Similaires
              </h2>
              <Link to={`/category/${category?.slug}`}>
                <Button variant="outline">
                  Voir Plus
                  <ArrowLeft className="ml-2 h-4 w-4 rotate-180" />
                </Button>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function Label({ children, className }: { children: React.ReactNode; className?: string }) {
  return <label className={className}>{children}</label>;
}