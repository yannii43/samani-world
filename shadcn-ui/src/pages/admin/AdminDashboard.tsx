import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, ShoppingCart, TrendingUp, Users,
  Clock, ChevronRight, ArrowUpRight,
} from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

type Stats = {
  totalProducts: number;
  totalOrders: number;
  revenue: number;
  totalCustomers: number;
  pendingOrders: number;
};

type RecentOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  total: number;
  orderStatus: string;
  createdAt: string;
};

type TopProduct = {
  name: string;
  totalSold: number;
  revenue: number;
};

const statusColors: Record<string, string> = {
  confirmed:  'bg-blue-100 text-blue-800',
  preparing:  'bg-yellow-100 text-yellow-800',
  ready:      'bg-purple-100 text-purple-800',
  delivering: 'bg-orange-100 text-orange-800',
  delivered:  'bg-green-100 text-green-800',
  incident:   'bg-red-100 text-red-800',
  pending:    'bg-gray-100 text-gray-700',
};

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmée', preparing: 'Préparation', ready: 'Prête',
  delivering: 'En livraison', delivered: 'Livrée', incident: 'Incident', pending: 'En attente',
};

function fmt(n: number) {
  return n.toLocaleString('fr-FR') + ' FCFA';
}

function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: any; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <Card>
      <CardContent className="p-6 flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 mb-1">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
        </div>
        <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="h-6 w-6" />
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok) {
          setStats(data.stats);
          setRecentOrders(data.recentOrders || []);
          setTopProducts(data.topProducts || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const navCards = [
    { label: 'Produits', path: '/admin/products', icon: Package },
    { label: 'Commandes', path: '/admin/orders', icon: ShoppingCart },
    { label: 'Clients', path: '/admin/customers', icon: Users },
    { label: 'Promotions', path: '/admin/promotions', icon: TrendingUp },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* En-tête */}
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
            Dashboard
          </h1>
          <p className="text-gray-500 mt-1">Vue d'ensemble de votre boutique</p>
        </div>

        {/* KPIs */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KpiCard
              icon={TrendingUp} label="Chiffre d'affaires" color="bg-green-100 text-green-700"
              value={stats ? fmt(stats.revenue) : '—'}
            />
            <KpiCard
              icon={ShoppingCart} label="Commandes" color="bg-blue-100 text-blue-700"
              value={stats?.totalOrders ?? '—'}
              sub={stats ? `${stats.pendingOrders} en cours` : undefined}
            />
            <KpiCard
              icon={Package} label="Produits actifs" color="bg-purple-100 text-purple-700"
              value={stats?.totalProducts ?? '—'}
            />
            <KpiCard
              icon={Users} label="Clients" color="bg-orange-100 text-orange-700"
              value={stats?.totalCustomers ?? '—'}
            />
          </div>
        )}

        {/* Navigation rapide */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {navCards.map(({ label, path, icon: Icon }) => (
            <Link key={path} to={path}>
              <Card className="hover:border-black transition-colors cursor-pointer">
                <CardContent className="p-5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-500" />
                    <span className="font-medium text-sm">{label}</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-gray-400" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dernières commandes */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Dernières commandes</CardTitle>
              <Link to="/admin/orders" className="text-xs text-gray-500 hover:text-black flex items-center gap-1">
                Voir tout <ChevronRight className="h-3 w-3" />
              </Link>
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="px-6 pb-4 space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : recentOrders.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">Aucune commande</p>
              ) : (
                <div className="divide-y">
                  {recentOrders.slice(0, 8).map((o) => (
                    <Link
                      key={o.id}
                      to={`/admin/orders`}
                      className="flex items-center justify-between px-6 py-3 hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium">#{o.orderNumber}</p>
                        <p className="text-xs text-gray-400">{o.customerName}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge className={`text-xs border-0 ${statusColors[o.orderStatus] ?? statusColors.pending}`}>
                          {statusLabels[o.orderStatus] ?? o.orderStatus}
                        </Badge>
                        <span className="text-sm font-semibold">{fmt(o.total)}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Top produits */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <CardTitle className="text-base">Top produits vendus</CardTitle>
              <Clock className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="px-6 pb-4 space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10" />)}
                </div>
              ) : topProducts.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">Aucune vente enregistrée</p>
              ) : (
                <div className="divide-y">
                  {topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-3">
                      <div className="flex items-center gap-3">
                        <span className="text-lg font-bold text-gray-200 w-6">{i + 1}</span>
                        <p className="text-sm font-medium line-clamp-1">{p.name}</p>
                      </div>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-semibold">{fmt(p.revenue)}</p>
                        <p className="text-xs text-gray-400">{p.totalSold} vendus</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminLayout>
  );
}
