import { Link } from 'react-router-dom';
import { Package, ShoppingCart, Users, DollarSign, Layers, Settings } from 'lucide-react';
import Header from '@/components/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { products } from '@/lib/products-data';
import { getOrders } from '@/lib/orders-data';
import { categories } from '@/lib/categories-data';
import { formatPrice } from '@/lib/products-data';

export default function AdminDashboard() {
  const orders = getOrders();

  const totalRevenue = orders
    .filter((o) => o.paymentStatus === 'paid')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const pendingOrders = orders.filter((o) => o.orderStatus === 'pending').length;

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
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="border-0 shadow-md">
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

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Commandes en Attente
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-[#E91E63]" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pendingOrders}</div>
              <p className="text-xs text-gray-600 mt-1">
                À traiter
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Commandes
              </CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{orders.length}</div>
              <p className="text-xs text-gray-600 mt-1">
                Toutes périodes
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Revenu Total
              </CardTitle>
              <DollarSign className="h-4 w-4 text-green-600" />
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
                <CardTitle>Paiements</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-600 mb-4">
                Gérez les paiements et factures
              </p>
              <Button className="w-full bg-green-600 hover:bg-green-700" disabled>
                Bientôt Disponible
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-md hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-600 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Livraison</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="text-gray-600 mb-4">
                Configurez les options de livraison
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