import { useEffect, useState } from 'react';
import { TrendingUp } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

type Stats = { totalProducts: number; totalOrders: number; revenue: number; totalCustomers: number; pendingOrders: number };
type TopProduct = { name: string; totalSold: number; revenue: number };
type RecentOrder = { id: string; orderNumber: string; customerName: string; total: number; orderStatus: string; createdAt: string };

function fmt(n: number) { return n.toLocaleString('fr-FR') + ' FCFA'; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); }

const statusLabels: Record<string, string> = {
  confirmed: 'Confirmée', preparing: 'Préparation', ready: 'Prête',
  delivering: 'En livraison', delivered: 'Livrée', incident: 'Incident',
};

export default function AdminSales() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/stats', { credentials: 'include' })
      .then((r) => r.json())
      .then((data) => {
        if (data?.ok) {
          setStats(data.stats);
          setTopProducts(data.topProducts || []);
          setRecentOrders(data.recentOrders || []);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Récapitulatif des ventes</h1>
          <p className="text-gray-500 mt-1">Aperçu global des performances de la boutique</p>
        </div>

        {/* KPIs */}
        {loading ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-24" />)}</div>
        ) : stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Chiffre d\'affaires', value: fmt(stats.revenue), color: 'text-green-600' },
              { label: 'Commandes', value: stats.totalOrders, color: 'text-blue-600' },
              { label: 'Produits actifs', value: stats.totalProducts, color: 'text-purple-600' },
              { label: 'Clients', value: stats.totalCustomers, color: 'text-orange-600' },
            ].map(({ label, value, color }) => (
              <Card key={label}>
                <CardContent className="p-5">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">{label}</p>
                  <p className={`text-2xl font-bold ${color}`}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top produits */}
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5" /> Top 5 produits</CardTitle></CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="px-6 pb-4 space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-10" />)}</div>
              ) : topProducts.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">Aucune vente enregistrée</p>
              ) : (
                <div className="divide-y">
                  {topProducts.map((p, i) => (
                    <div key={i} className="flex items-center justify-between px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-black text-gray-100 w-8 shrink-0">{i + 1}</span>
                        <div>
                          <p className="font-medium">{p.name}</p>
                          <p className="text-xs text-gray-400">{p.totalSold} unités vendues</p>
                        </div>
                      </div>
                      <p className="font-bold text-sm">{fmt(p.revenue)}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Toutes les commandes récentes */}
          <Card>
            <CardHeader><CardTitle>Dernières commandes</CardTitle></CardHeader>
            <CardContent className="p-0">
              {loading ? (
                <div className="px-6 pb-4 space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-10" />)}</div>
              ) : recentOrders.length === 0 ? (
                <p className="text-center text-gray-400 py-8 text-sm">Aucune commande</p>
              ) : (
                <div className="divide-y max-h-80 overflow-y-auto">
                  {recentOrders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between px-6 py-3 text-sm">
                      <div>
                        <p className="font-medium">#{o.orderNumber}</p>
                        <p className="text-xs text-gray-400">{o.customerName} · {fmtDate(o.createdAt)}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{fmt(o.total)}</p>
                        <p className="text-xs text-gray-400">{statusLabels[o.orderStatus] || o.orderStatus}</p>
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
