import { useParams, Link } from 'react-router-dom';
import { CheckCircle, Package, Truck, Home, ArrowRight } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { getOrderById } from '@/lib/orders-data';
import { formatPrice } from '@/lib/products-data-v2';
import { shippingMethods } from '@/lib/shipping-data';

export default function OrderConfirmation() {
  const { orderId } = useParams<{ orderId: string }>();
  const order = getOrderById(orderId || '');

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-3xl font-bold mb-4">Commande non trouvée</h1>
          <Link to="/products">
            <Button>Retour aux produits</Button>
          </Link>
        </div>
      </div>
    );
  }

  const shippingMethod = shippingMethods.find((m) => m.id === order.shippingMethod);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        {/* Success Message */}
        <Card className="max-w-2xl mx-auto mb-8 border-green-200 bg-green-50">
          <CardContent className="pt-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
              Commande confirmée !
            </h1>
            <p className="text-gray-600 mb-4">
              Merci pour votre commande. Un email de confirmation a été envoyé à{' '}
              <strong>{order.shippingInfo.email}</strong>
            </p>
            <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-lg">
              <span className="text-gray-600">Numéro de commande:</span>
              <span className="font-bold text-lg">#{order.orderNumber}</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Order Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Package className="mr-2 h-5 w-5" />
                  Statut de la commande
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <Badge
                    className={
                      order.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : order.status === 'confirmed'
                        ? 'bg-blue-100 text-blue-800'
                        : order.status === 'shipped'
                        ? 'bg-purple-100 text-purple-800'
                        : order.status === 'delivered'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-red-100 text-red-800'
                    }
                  >
                    {order.status === 'pending' && 'En attente'}
                    {order.status === 'confirmed' && 'Confirmée'}
                    {order.status === 'shipped' && 'Expédiée'}
                    {order.status === 'delivered' && 'Livrée'}
                    {order.status === 'cancelled' && 'Annulée'}
                  </Badge>
                  <p className="text-sm text-gray-600">
                    Commande passée le{' '}
                    {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Items */}
            <Card>
              <CardHeader>
                <CardTitle>Articles commandés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index}>
                    <div className="flex gap-4">
                      <img
                        src={item.coverImage}
                        alt={item.productName}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{item.productName}</p>
                        {item.variantDetails && (
                          <p className="text-sm text-gray-600">{item.variantDetails}</p>
                        )}
                        <p className="text-sm text-gray-600 mt-1">
                          Quantité: {item.quantity}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{formatPrice(item.price)}</p>
                        <p className="text-sm text-gray-600">
                          Total: {formatPrice(item.price * item.quantity)}
                        </p>
                      </div>
                    </div>
                    {index < order.items.length - 1 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Shipping Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  Informations de livraison
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600">Nom</p>
                  <p className="font-semibold">{order.shippingInfo.fullName}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-semibold">{order.shippingInfo.email}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Téléphone</p>
                  <p className="font-semibold">{order.shippingInfo.phone}</p>
                </div>
                {order.shippingMethod !== 'click-collect' && order.shippingInfo.address && (
                  <div>
                    <p className="text-sm text-gray-600">Adresse</p>
                    <p className="font-semibold">
                      {order.shippingInfo.address}
                      {order.shippingInfo.city && `, ${order.shippingInfo.city}`}
                      {order.shippingInfo.postalCode && ` ${order.shippingInfo.postalCode}`}
                    </p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray-600">Mode de livraison</p>
                  <p className="font-semibold">{shippingMethod?.name}</p>
                  <p className="text-sm text-gray-500">{shippingMethod?.estimatedDays}</p>
                </div>
                {order.shippingInfo.notes && (
                  <div>
                    <p className="text-sm text-gray-600">Notes</p>
                    <p className="font-semibold">{order.shippingInfo.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Résumé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-gray-600">
                    <span>Sous-total</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Livraison</span>
                    <span>
                      {order.shippingCost === 0
                        ? 'Gratuit'
                        : formatPrice(order.shippingCost)}
                    </span>
                  </div>
                  {order.discount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Réduction</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  {order.couponCode && (
                    <div className="text-sm text-gray-600">
                      Code promo: <strong>{order.couponCode}</strong>
                    </div>
                  )}
                </div>

                <Separator />

                <div className="flex justify-between text-xl font-bold">
                  <span>Total</span>
                  <span>{formatPrice(order.total)}</span>
                </div>

                <Separator />

                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Mode de paiement</span>
                    <span className="font-semibold">
                      {order.paymentMethod === 'cash'
                        ? 'Paiement à la livraison'
                        : 'Carte bancaire'}
                    </span>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <Link to="/account/orders">
                    <Button variant="outline" className="w-full">
                      <Package className="mr-2 h-4 w-4" />
                      Voir mes commandes
                    </Button>
                  </Link>
                  <Link to="/products">
                    <Button className="w-full bg-black hover:bg-gray-900">
                      <Home className="mr-2 h-4 w-4" />
                      Continuer mes achats
                    </Button>
                  </Link>
                </div>

                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 text-center">
                    Besoin d'aide ? Contactez-nous au<br />
                    <strong>+221 XX XXX XX XX</strong>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Next Steps */}
        <Card className="max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle>Prochaines étapes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="font-semibold">Commande reçue</p>
                  <p className="text-sm text-gray-600">
                    Nous avons bien reçu votre commande et nous la préparons
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Package className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold">Préparation</p>
                  <p className="text-sm text-gray-600">
                    Votre commande sera préparée dans les prochaines 24h
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
                  <Truck className="h-5 w-5 text-gray-600" />
                </div>
                <div>
                  <p className="font-semibold">Expédition</p>
                  <p className="text-sm text-gray-600">
                    {shippingMethod?.estimatedDays}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}