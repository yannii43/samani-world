import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, DollarSign, Layers, Settings, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { products } from '@/lib/products-data-v2';
import { getOrders } from '@/lib/orders-data';
import { categories } from '@/lib/categories-data';
import { formatPrice } from '@/lib/products-data-v2';

export default function AdminDashboard() {
  const orders = getOrders();

  // Statistiques
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;
  const confirmedOrders = orders.filter((o) => o.orderStatus === 'confirmed').length;
  const deliveredOrders = orders.filter((o) => o.orderStatus === 'delivered').length;
  const cancelledOrders = orders.filter((o) => o.orderStatus === 'cancelled').length;

  // Commandes récentes (5 dernières)
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Produits en rupture de stock
  const lowStockProducts = products.filter((p) => {
    const totalStock = p.id ? 0 : 0; // Simplified for now
    return totalStock < 5;
  }).slice(0, 5);

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', className: 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100' },
      confirmed: { label: 'Confirmé', className: 'bg-blue-100 text-blue-800 hover:bg-blue-100' },
      delivered: { label: 'Livré', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      cancelled: { label: 'Annulé', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getPaymentBadge = (status: string) => {
    const statusConfig = {
      pending: { label: 'En attente', className: 'bg-orange-100 text-orange-800 hover:bg-orange-100' },
      paid: { label: 'Payé', className: 'bg-green-100 text-green-800 hover:bg-green-100' },
      cancelled: { label: 'Annulé', className: 'bg-red-100 text-red-800 hover:bg-red-100' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900" style={{ fontFamily: '"Playfair Display", serif' }}>
              Tableau de Bord Admin
            </h1>
            <p className="text-gray-600 mt-2">Bienvenue sur Samani World Admin</p>
          </div>
          <div className="flex gap-3">
            <Link to="/admin/orders">
              <Button className="bg-black hover:bg-gray-900">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Voir Commandes
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Produits
              </CardTitle>
              <Package className="h-4 w-4 text-[#D4AF37]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{products.length}</div>
              <p className="text-xs text-gray-600 mt-1">
                {categories.length} catégories
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Commandes en Attente
              </CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-gray-600 mt-1">
                À traiter rapidement
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Commandes
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-gray-600 mt-1">
                {confirmedOrders} confirmées, {deliveredOrders} livrées
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenu Total
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatPrice(totalRevenue)}
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Paiements confirmés
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">En attente</p>
                  <p className="text-2xl font-bold text-yellow-600">{pendingOrders}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Confirmées</p>
                  <p className="text-2xl font-bold text-blue-600">{confirmedOrders}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-blue-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Livrées</p>
                  <p className="text-2xl font-bold text-green-600">{deliveredOrders}</p>
                </div>
                <Package className="h-8 w-8 text-green-600 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Annulées</p>
                  <p className="text-2xl font-bold text-red-600">{cancelledOrders}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-600 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Orders */}
        <Card className="border-0 shadow-md mb-8">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-bold">Commandes Récentes</CardTitle>
              <Link to="/admin/orders">
                <Button variant="outline" size="sm">
                  Voir tout
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentOrders.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucune commande pour le moment</p>
            ) : (
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div
                    key={order.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-semibold">{order.orderNumber}</p>
                        {getStatusBadge(order.orderStatus)}
                        {getPaymentBadge(order.paymentStatus)}
                      </div>
                      <p className="text-sm text-gray-600">{order.customerName}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(order.createdAt).toLocaleDateString('fr-FR', {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{formatPrice(order.totalAmount)}</p>
                      <p className="text-xs text-gray-500">{order.items.length} article(s)</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-black rounded-lg">
                  <Layers className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Gestion des Catégories</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-600 mb-4">
                Gérez vos catégories et sous-catégories de produits
              </p>
              <Link to="/admin/categories">
                <Button className="w-full bg-black hover:bg-gray-900">
                  Gérer les Catégories
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#D4AF37] rounded-lg">
                  <Settings className="h-6 w-6 text-black" />
                </div>
                <CardTitle>Options Produits</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-600 mb-4">
                Configurez les options (Taille, Couleur, etc.)
              </p>
              <Link to="/admin/options">
                <Button className="w-full bg-[#D4AF37] text-black hover:bg-[#C19B2F]">
                  Gérer les Options
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-[#E91E63] rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Gestion des Produits</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-600 mb-4">
                Ajoutez et gérez vos produits avec variantes
              </p>
              <Link to="/admin/products">
                <Button className="w-full bg-[#E91E63] text-white hover:bg-[#D81B60]">
                  Gérer les Produits
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-600 rounded-lg">
                  <ShoppingCart className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Gestion des Commandes</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-600 mb-4">
                Suivez et gérez les commandes clients
              </p>
              <Link to="/admin/orders">
                <Button className="w-full bg-blue-600 hover:bg-blue-700">
                  Gérer les Commandes
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-green-600 rounded-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Rapports & Analyses</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-600 mb-4">
                Consultez les statistiques de vente
              </p>
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Revenu total:</span>
                  <span className="font-semibold">{formatPrice(totalRevenue)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Commandes payées:</span>
                  <span className="font-semibold">{orders.filter(o => o.paymentStatus === 'paid').length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Taux de livraison:</span>
                  <span className="font-semibold">
                    {orders.length > 0 ? Math.round((deliveredOrders / orders.length) * 100) : 0}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Clients</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-600 mb-4">
                Gérez votre base de clients
              </p>
              <Button className="w-full bg-purple-600 hover:bg-purple-700" disabled>
                Bientôt Disponible
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}