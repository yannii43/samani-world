import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Check, CreditCard, Truck, MapPin } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { useCartStore } from '@/lib/cart-store';
import { useAuthStore } from '@/lib/auth-store';
import { formatPrice } from '@/lib/products-data-v2';
import { shippingMethods } from '@/lib/shipping-data';
import { coupons } from '@/lib/coupons-data';
import { addOrder } from '@/lib/orders-data';
import { toast } from 'sonner';

export default function Checkout() {
  const navigate = useNavigate();
  const { items, getSubtotal, clearCart } = useCartStore();
  const { user } = useAuthStore();

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [shippingMethod, setShippingMethod] = useState(shippingMethods[0].id);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card'>('cash');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<typeof coupons[0] | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [shippingInfo, setShippingInfo] = useState({
    fullName: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    notes: '',
  });

  const subtotal = getSubtotal();
  const selectedShipping = shippingMethods.find((m) => m.id === shippingMethod);
  const shippingCost = selectedShipping?.price || 0;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = (subtotal * appliedCoupon.value) / 100;
    } else {
      discount = appliedCoupon.value;
    }
  }

  const total = subtotal + shippingCost - discount;

  const handleApplyCoupon = () => {
    const coupon = coupons.find(
      (c) => c.code.toLowerCase() === couponCode.toLowerCase() && c.isActive
    );

    if (!coupon) {
      toast.error('Code promo invalide');
      return;
    }

    if (subtotal < coupon.minPurchase) {
      toast.error(`Montant minimum: ${formatPrice(coupon.minPurchase)}`);
      return;
    }

    setAppliedCoupon(coupon);
    toast.success(`Code promo "${coupon.code}" appliqué!`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    toast.success('Code promo retiré');
  };

  const validateShippingInfo = () => {
    if (!shippingInfo.fullName || !shippingInfo.email || !shippingInfo.phone) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return false;
    }

    if (shippingMethod !== 'click-collect' && !shippingInfo.address) {
      toast.error('Veuillez entrer votre adresse de livraison');
      return false;
    }

    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateShippingInfo()) return;

    setIsProcessing(true);

    try {
      // Simulate processing delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const order = addOrder({
        userId: user?.id || 'guest',
        items: items.map((item) => ({
          productId: item.productId,
          variantId: item.variantId,
          productName: item.productName,
          variantDetails: item.variantDetails,
          price: item.price,
          quantity: item.quantity,
          coverImage: item.coverImage,
        })),
        subtotal,
        shippingCost,
        discount,
        total,
        shippingMethod,
        paymentMethod,
        couponCode: appliedCoupon?.code,
        shippingInfo,
      });

      clearCart();
      toast.success('Commande passée avec succès!');
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      toast.error('Erreur lors de la commande. Veuillez réessayer.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Votre panier est vide</h1>
          <Link to="/products">
            <Button>Découvrir nos produits</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <Link to="/cart" className="inline-flex items-center text-gray-600 hover:text-black mb-6">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au panier
        </Link>

        <h1 className="text-4xl font-bold mb-8" style={{ fontFamily: '"Playfair Display", serif' }}>
          Finaliser la commande
        </h1>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step === 'shipping' ? 'bg-black text-white' : 'bg-green-600 text-white'
              }`}
            >
              {step === 'payment' ? <Check className="h-6 w-6" /> : '1'}
            </div>
            <span className="ml-3 font-semibold">Livraison</span>
          </div>
          <div className="w-24 h-1 bg-gray-300 mx-4" />
          <div className="flex items-center">
            <div
              className={`flex items-center justify-center w-10 h-10 rounded-full ${
                step === 'payment' ? 'bg-black text-white' : 'bg-gray-300 text-gray-600'
              }`}
            >
              2
            </div>
            <span className="ml-3 font-semibold">Paiement</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {step === 'shipping' && (
              <>
                {/* Shipping Information */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <MapPin className="mr-2 h-5 w-5" />
                      Informations de livraison
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="fullName">Nom complet *</Label>
                        <Input
                          id="fullName"
                          value={shippingInfo.fullName}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, fullName: e.target.value })
                          }
                          placeholder="Prénom Nom"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Téléphone *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          value={shippingInfo.phone}
                          onChange={(e) =>
                            setShippingInfo({ ...shippingInfo, phone: e.target.value })
                          }
                          placeholder="+221 XX XXX XX XX"
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={shippingInfo.email}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, email: e.target.value })
                        }
                        placeholder="email@example.com"
                      />
                    </div>

                    {shippingMethod !== 'click-collect' && (
                      <>
                        <div>
                          <Label htmlFor="address">Adresse *</Label>
                          <Input
                            id="address"
                            value={shippingInfo.address}
                            onChange={(e) =>
                              setShippingInfo({ ...shippingInfo, address: e.target.value })
                            }
                            placeholder="Rue, numéro"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="city">Ville</Label>
                            <Input
                              id="city"
                              value={shippingInfo.city}
                              onChange={(e) =>
                                setShippingInfo({ ...shippingInfo, city: e.target.value })
                              }
                              placeholder="Dakar"
                            />
                          </div>
                          <div>
                            <Label htmlFor="postalCode">Code postal</Label>
                            <Input
                              id="postalCode"
                              value={shippingInfo.postalCode}
                              onChange={(e) =>
                                setShippingInfo({ ...shippingInfo, postalCode: e.target.value })
                              }
                              placeholder="12345"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div>
                      <Label htmlFor="notes">Notes de commande (optionnel)</Label>
                      <Input
                        id="notes"
                        value={shippingInfo.notes}
                        onChange={(e) =>
                          setShippingInfo({ ...shippingInfo, notes: e.target.value })
                        }
                        placeholder="Instructions spéciales..."
                      />
                    </div>
                  </CardContent>
                </Card>

                {/* Shipping Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Truck className="mr-2 h-5 w-5" />
                      Mode de livraison
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={shippingMethod} onValueChange={setShippingMethod}>
                      {shippingMethods.map((method) => (
                        <div
                          key={method.id}
                          className="flex items-center space-x-3 p-4 border rounded-lg hover:border-black transition-colors cursor-pointer"
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <label htmlFor={method.id} className="flex-1 cursor-pointer">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-semibold">{method.name}</p>
                                <p className="text-sm text-gray-600">{method.description}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  Délai: {method.estimatedDays}
                                </p>
                              </div>
                              <p className="font-bold">
                                {method.price === 0 ? 'Gratuit' : formatPrice(method.price)}
                              </p>
                            </div>
                          </label>
                        </div>
                      ))}
                    </RadioGroup>
                  </CardContent>
                </Card>

                <Button
                  size="lg"
                  className="w-full bg-black hover:bg-gray-900"
                  onClick={() => {
                    if (validateShippingInfo()) {
                      setStep('payment');
                    }
                  }}
                >
                  Continuer vers le paiement
                </Button>
              </>
            )}

            {step === 'payment' && (
              <>
                {/* Payment Method */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Mode de paiement
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RadioGroup value={paymentMethod} onValueChange={(v) => setPaymentMethod(v as 'cash' | 'card')}>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg">
                        <RadioGroupItem value="cash" id="cash" />
                        <label htmlFor="cash" className="flex-1 cursor-pointer">
                          <p className="font-semibold">Paiement à la livraison</p>
                          <p className="text-sm text-gray-600">
                            Payez en espèces lors de la réception
                          </p>
                        </label>
                      </div>
                      <div className="flex items-center space-x-3 p-4 border rounded-lg opacity-50">
                        <RadioGroupItem value="card" id="card" disabled />
                        <label htmlFor="card" className="flex-1">
                          <p className="font-semibold">Carte bancaire</p>
                          <p className="text-sm text-gray-600">Bientôt disponible</p>
                        </label>
                      </div>
                    </RadioGroup>
                  </CardContent>
                </Card>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    onClick={() => setStep('shipping')}
                  >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Retour
                  </Button>
                  <Button
                    size="lg"
                    className="flex-1 bg-black hover:bg-gray-900"
                    onClick={handlePlaceOrder}
                    disabled={isProcessing}
                  >
                    {isProcessing ? 'Traitement...' : 'Confirmer la commande'}
                  </Button>
                </div>
              </>
            )}
          </div>

          {/* Order Summary Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Résumé de la commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3 max-h-[300px] overflow-y-auto">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      <img
                        src={item.coverImage}
                        alt={item.productName}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold line-clamp-1">
                          {item.productName}
                        </p>
                        {item.variantDetails && (
                          <p className="text-xs text-gray-600">{item.variantDetails}</p>
                        )}
                        <p className="text-sm">
                          {item.quantity} × {formatPrice(item.price)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <Separator />

                {/* Coupon */}
                <div>
                  <Label htmlFor="coupon">Code promo</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="CODE PROMO"
                      disabled={!!appliedCoupon}
                    />
                    {appliedCoupon ? (
                      <Button variant="outline" onClick={handleRemoveCoupon}>
                        Retirer
                      </Button>
                    ) : (
                      <Button onClick={handleApplyCoupon}>Appliquer</Button>
                    )}
                  </div>
                  {appliedCoupon && (
                    <p className="text-sm text-green-600 mt-2">
                      ✓ Code "{appliedCoupon.code}" appliqué
                    </p>
                  )}
                </div>

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{formatPrice(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span>
                      {shippingCost === 0 ? 'Gratuit' : formatPrice(shippingCost)}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction</span>
                      <span>-{formatPrice(discount)}</span>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}