import { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, Heart, LogOut, ChevronRight, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { useAuthStore } from '@/lib/auth-store';

type ApiOrder = {
  id: string;
  orderNumber: string;
  total: number;
  orderStatus: string;
  paymentStatus: string;
  createdAt: string;
  shippingMethod: string;
};

const statusLabel: Record<string, { label: string; color: string }> = {
  confirmed:  { label: 'Confirmée',    color: 'bg-blue-100 text-blue-800' },
  preparing:  { label: 'En préparation', color: 'bg-yellow-100 text-yellow-800' },
  ready:      { label: 'Prête',         color: 'bg-purple-100 text-purple-800' },
  delivering: { label: 'En livraison',  color: 'bg-orange-100 text-orange-800' },
  delivered:  { label: 'Livrée',        color: 'bg-green-100 text-green-800' },
  incident:   { label: 'Incident',      color: 'bg-red-100 text-red-800' },
  pending:    { label: 'En attente',    color: 'bg-gray-100 text-gray-700' },
};

function formatPrice(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function Account() {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [orders, setOrders] = useState<ApiOrder[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  useEffect(() => {
    fetch('/api/my/orders', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok) setOrders(data.orders || []);
      })
      .catch(() => {})
      .finally(() => setLoadingOrders(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="container mx-auto px-4 py-10 max-w-4xl">
      {/* En-tête */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
            Mon compte
          </h1>
          <p className="text-gray-500 mt-1">Bienvenue, {user?.name}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          Déconnexion
        </Button>
      </div>

      <Tabs defaultValue="orders">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Commandes
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profil
          </TabsTrigger>
          <TabsTrigger value="wishlist" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Favoris
          </TabsTrigger>
        </TabsList>

        {/* ── Commandes ─────────────────────────────────── */}
        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Mes commandes</CardTitle>
            </CardHeader>
            <CardContent>
              {loadingOrders ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">Aucune commande pour le moment</p>
                  <Button asChild className="bg-black hover:bg-gray-900">
                    <Link to="/products">Découvrir nos produits</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {orders.map((order) => {
                    const s = statusLabel[order.orderStatus] ?? statusLabel.pending;
                    const isTrackable = ['confirmed','preparing','ready','handover','delivering'].includes(order.orderStatus);
                    return (
                      <div key={order.id} className="border rounded-lg hover:border-gray-300 transition-colors">
                        <Link
                          to={`/order-confirmation/${order.id}`}
                          className="flex items-center justify-between p-4 group"
                        >
                          <div className="space-y-1">
                            <p className="font-semibold text-sm">#{order.orderNumber}</p>
                            <p className="text-xs text-gray-500">{formatDate(order.createdAt)}</p>
                            <Badge className={`text-xs ${s.color} border-0`}>{s.label}</Badge>
                          </div>
                          <div className="flex items-center gap-3">
                            <p className="font-bold text-sm">{formatPrice(order.total)}</p>
                            <ChevronRight className="h-4 w-4 text-gray-400 group-hover:text-black transition-colors" />
                          </div>
                        </Link>
                        {isTrackable && (
                          <div className="px-4 pb-3 pt-0">
                            <Link
                              to={`/track?orderNumber=${order.orderNumber}`}
                              className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1.5 rounded-md border border-black text-black hover:bg-black hover:text-white transition-colors"
                            >
                              <MapPin className="h-3.5 w-3.5" />
                              Suivre ma commande
                            </Link>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Profil ──────────────────────────────────────── */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>Informations personnelles</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Nom</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              <Separator />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              {user?.phone && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Téléphone</p>
                    <p className="font-medium">{user.phone}</p>
                  </div>
                </>
              )}
              <Separator />
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">Membre depuis</p>
                <p className="font-medium">{user?.createdAt ? formatDate(user.createdAt) : '—'}</p>
              </div>
              <Separator />
              <Button variant="outline" className="w-full" disabled>
                Modifier mes informations (bientôt disponible)
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Favoris ─────────────────────────────────────── */}
        <TabsContent value="wishlist">
          <Card>
            <CardHeader>
              <CardTitle>Mes favoris</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <Heart className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-4">Votre liste de favoris est vide</p>
                <Button asChild className="bg-black hover:bg-gray-900">
                  <Link to="/products">Découvrir nos produits</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
