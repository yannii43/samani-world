import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Package, LogOut } from 'lucide-react';
import Header from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useAuthStore } from '@/lib/auth-store';
import { getOrdersByUserId } from '@/lib/orders-data';
import { formatPrice } from '@/lib/products-data';
import { toast } from 'sonner';

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    address: '',
  });

  const userOrders = user ? getOrdersByUserId(user.id) : [];

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
    toast.success('Profil mis à jour!');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('Déconnexion réussie');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500';
      case 'confirmed':
        return 'bg-blue-500';
      case 'pending':
        return 'bg-yellow-500';
      case 'cancelled':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'Livrée';
      case 'confirmed':
        return 'Confirmée';
      case 'pending':
        return 'En attente';
      case 'cancelled':
        return 'Annulée';
      default:
        return status;
    }
  };

  if (!user) {
    navigate('/login');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Mon Compte</h1>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="text-red-600 border-red-600 hover:bg-red-50"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>

        <Tabs defaultValue="profile" className="space-y-6">
          <TabsList>
            <TabsTrigger value="profile">
              <User className="mr-2 h-4 w-4" />
              Profil
            </TabsTrigger>
            <TabsTrigger value="orders">
              <Package className="mr-2 h-4 w-4" />
              Mes Commandes
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" value={user.email} disabled />
                </div>

                <div>
                  <Label htmlFor="name">Nom complet</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                    disabled={!isEditing}
                  />
                </div>

                <div className="flex gap-2">
                  {isEditing ? (
                    <>
                      <Button
                        onClick={handleSave}
                        className="bg-[#00A86B] hover:bg-[#008f5d]"
                      >
                        Enregistrer
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setIsEditing(false);
                          setFormData({
                            name: user.name,
                            phone: user.phone || '',
                            address: '',
                          });
                        }}
                      >
                        Annuler
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={() => setIsEditing(true)}
                      className="bg-[#00A86B] hover:bg-[#008f5d]"
                    >
                      Modifier
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <div className="space-y-4">
              {userOrders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-600">Vous n'avez pas encore de commandes</p>
                  </CardContent>
                </Card>
              ) : (
                userOrders.map((order) => (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg">
                          Commande #{order.id}
                        </CardTitle>
                        <Badge className={getStatusColor(order.orderStatus)}>
                          {getStatusText(order.orderStatus)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })}
                      </p>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        {order.items.map((item, index) => (
                          <div key={index} className="flex justify-between text-sm">
                            <span className="text-gray-600">
                              {item.productName} x{item.quantity}
                            </span>
                            <span className="font-medium">
                              {formatPrice(item.price * item.quantity)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <Separator />

                      <div className="flex justify-between items-center">
                        <span className="font-semibold">Total</span>
                        <span className="text-xl font-bold text-[#00A86B]">
                          {formatPrice(order.totalAmount)}
                        </span>
                      </div>

                      <div className="text-sm text-gray-600">
                        <p>
                          <strong>Paiement:</strong>{' '}
                          {order.paymentMethod === 'cash'
                            ? 'À la livraison'
                            : 'Mobile Money'}{' '}
                          -{' '}
                          {order.paymentStatus === 'paid' ? 'Payé' : 'En attente'}
                        </p>
                        <p>
                          <strong>Livraison:</strong> {order.customerAddress}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}