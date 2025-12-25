import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, MapPin, Heart, LogOut } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/lib/auth-store';
import { getOrdersByUserId } from '@/lib/orders-data';
import { formatPrice } from '@/lib/products-data-v2';

export default function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [activeTab, setActiveTab] = useState('orders');

  if (!user) {
    navigate('/login');
    return null;
  }

  const orders = getOrdersByUserId(user.id);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-4xl font-bold mb-2" style={{ fontFamily: '"Playfair Display", serif' }}>
                Mon Compte
              </h1>
              <p className="text-gray-600">Bienvenue, {user.name}</p>
            </div>
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              Déconnexion
            </Button>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4 mb-8">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                Commandes
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profil
              </TabsTrigger>
              <TabsTrigger value="addresses" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                Adresses
              </TabsTrigger>
              <TabsTrigger value="wishlist" className="flex items-center gap-2">
                <Heart className="h-4 w-4" />
                Wishlist
              </TabsTrigger>
            </TabsList>

            {/* Orders Tab */}
            <TabsContent value="orders">
              <Card>
                <CardHeader>
                  <CardTitle>Mes Commandes</CardTitle>
                </CardHeader>
                <CardContent>
                  {orders.length === 0 ? (
                    <div className="text-center py-12">
                      <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 mb-4">Aucune commande pour le moment</p>
                      <Button onClick={() => navigate('/products')}>
                        Découvrir nos produits
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {orders.map((order) => (
                        <div key={order.id} className="border rounded-lg p-4 hover:border-black transition-colors">
                          <div className="flex items-start justify-between mb-4">
                            <div>
                              <p className="font-semibold text-lg">
                                Commande #{order.orderNumber}
                              </p>
                              <p className="text-sm text-gray-600">
                                {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                                  day: 'numeric',
                                  month: 'long',
                                  year: 'numeric',
                                })}
                              </p>
                            </div>
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
                          </div>

                          <div className="space-y-2 mb-4">
                            {order.items.slice(0, 2).map((item, index) => (
                              <div key={index} className="flex gap-3">
                                <img
                                  src={item.coverImage}
                                  alt={item.productName}
                                  className="w-12 h-12 object-cover rounded"
                                />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold line-clamp-1">
                                    {item.productName}
                                  </p>
                                  <p className="text-xs text-gray-600">
                                    Quantité: {item.quantity}
                                  </p>
                                </div>
                              </div>
                            ))}
                            {order.items.length > 2 && (
                              <p className="text-sm text-gray-600">
                                +{order.items.length - 2} autre(s) article(s)
                              </p>
                            )}
                          </div>

                          <Separator className="my-4" />

                          <div className="flex items-center justify-between">
                            <p className="text-lg font-bold">
                              Total: {formatPrice(order.total)}
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => navigate(`/order-confirmation/${order.id}`)}
                            >
                              Voir les détails
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>Informations Personnelles</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">Nom</p>
                    <p className="font-semibold">{user.name}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{user.email}</p>
                  </div>
                  <Separator />
                  <div>
                    <p className="text-sm text-gray-600">Rôle</p>
                    <Badge>{user.role === 'admin' ? 'Administrateur' : 'Client'}</Badge>
                  </div>
                  <Separator />
                  <Button variant="outline" className="w-full">
                    Modifier mes informations
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Addresses Tab */}
            <TabsContent value="addresses">
              <Card>
                <CardHeader>
                  <CardTitle>Mes Adresses</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Aucune adresse enregistrée</p>
                    <Button>Ajouter une adresse</Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Wishlist Tab */}
            <TabsContent value="wishlist">
              <Card>
                <CardHeader>
                  <CardTitle>Ma Wishlist</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Votre wishlist est vide</p>
                    <Button onClick={() => navigate('/products')}>
                      Découvrir nos produits
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}