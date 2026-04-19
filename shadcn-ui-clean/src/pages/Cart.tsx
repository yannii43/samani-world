import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/cart-store';
import { formatPrice } from '@/lib/products-data-v2';

export default function Cart() {
  const { items, removeItem, updateQuantity, getTotalItems, getSubtotal } = useCartStore();

  const subtotal = getSubtotal();
  const totalItems = getTotalItems();

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16">
          <Card className="max-w-md mx-auto text-center py-12">
            <CardContent>
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2">Votre panier est vide</h2>
              <p className="text-gray-600 mb-6">
                Découvrez notre collection et ajoutez des produits à votre panier
              </p>
              <Link to="/products">
                <Button size="lg">
                  Découvrir nos produits
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: '"Playfair Display", serif' }}>
          Panier ({totalItems} article{totalItems > 1 ? 's' : ''})
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardContent className="p-6">
                  <div className="flex gap-4">
                    {/* Product Image */}
                    <Link
                      to={`/product/${item.productId}`}
                      className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded-lg overflow-hidden"
                    >
                      <img
                        src={item.coverImage}
                        alt={item.productName}
                        className="w-full h-full object-cover hover:scale-110 transition-transform duration-300"
                      />
                    </Link>

                    {/* Product Info */}
                    <div className="flex-1 min-w-0">
                      <Link
                        to={`/product/${item.productId}`}
                        className="font-semibold text-lg hover:text-[#D4AF37] transition-colors line-clamp-2"
                      >
                        {item.productName}
                      </Link>
                      {item.variantDetails && (
                        <p className="text-sm text-gray-600 mt-1">
                          {item.variantDetails}
                        </p>
                      )}
                      <p className="text-xl font-bold mt-2">
                        {formatPrice(item.price)}
                      </p>
                      {item.stock < 5 && item.stock > 0 && (
                        <p className="text-sm text-amber-600 mt-1">
                          Plus que {item.stock} en stock
                        </p>
                      )}
                    </div>

                    {/* Quantity Controls */}
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center border rounded-lg">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-12 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-lg font-bold mt-2">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Résumé de la commande</h2>

                <div className="space-y-3 mb-4">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total ({totalItems} articles)</span>
                    <span className="font-semibold">{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span className="text-sm">Calculée à l'étape suivante</span>
                  </div>
                </div>

                <Separator className="my-4" />

                <div className="flex justify-between text-lg font-bold mb-6">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>

                <Link to="/checkout">
                  <Button size="lg" className="w-full bg-black hover:bg-gray-900">
                    Passer la commande
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>

                <Link to="/products">
                  <Button variant="outline" size="lg" className="w-full mt-3">
                    Continuer mes achats
                  </Button>
                </Link>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    Paiement sécurisé • Livraison rapide
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}