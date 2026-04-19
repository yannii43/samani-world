import { useEffect, useState } from 'react';
import { Search, Eye, ChevronRight } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';

type Customer = { id: string; name: string; email: string; phone: string | null; createdAt: string; orderCount: number; totalSpent: number };
type Order = { id: string; orderNumber: string; total: number; orderStatus: string; createdAt: string };

const statusLabels: Record<string, { label: string; color: string }> = {
  confirmed: { label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  delivering: { label: 'En livraison', color: 'bg-orange-100 text-orange-800' },
  delivered: { label: 'Livrée', color: 'bg-green-100 text-green-800' },
  incident: { label: 'Incident', color: 'bg-red-100 text-red-800' },
  pending: { label: 'En attente', color: 'bg-gray-100 text-gray-700' },
};

function fmt(n: number) { return n.toLocaleString('fr-FR') + ' FCFA'; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<{ customer: Customer; orders: Order[] } | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const load = async (q?: string) => {
    setLoading(true);
    try {
      const url = `/api/admin/customers${q ? `?q=${encodeURIComponent(q)}` : ''}`;
      const data = await fetch(url, { credentials: 'include' }).then((r) => r.json());
      setCustomers(data.customers || []);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (c: Customer) => {
    setLoadingDetail(true);
    try {
      const data = await fetch(`/api/admin/customers/${c.id}`, { credentials: 'include' }).then((r) => r.json());
      setSelected({ customer: data.customer, orders: data.orders || [] });
    } catch { toast.error('Erreur'); }
    finally { setLoadingDetail(false); }
  };

  let searchTimeout: ReturnType<typeof setTimeout>;
  const handleSearch = (v: string) => {
    setSearch(v);
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => load(v), 400);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Clients</h1>
          <p className="text-gray-500 mt-1">{customers.length} client(s)</p>
        </div>

        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input className="pl-10" placeholder="Nom, email, téléphone..." value={search} onChange={(e) => handleSearch(e.target.value)} />
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3,4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : (
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left p-4">Client</th>
                <th className="text-left p-4 hidden md:table-cell">Téléphone</th>
                <th className="text-left p-4">Commandes</th>
                <th className="text-left p-4 hidden md:table-cell">Total dépensé</th>
                <th className="text-left p-4 hidden lg:table-cell">Membre depuis</th>
                <th className="text-right p-4">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {customers.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucun client</td></tr>
                ) : customers.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4">
                      <p className="font-medium">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.email}</p>
                    </td>
                    <td className="p-4 hidden md:table-cell text-sm text-gray-600">{c.phone || '—'}</td>
                    <td className="p-4"><Badge className="bg-gray-100 text-gray-800 border-0">{c.orderCount}</Badge></td>
                    <td className="p-4 hidden md:table-cell font-semibold">{fmt(c.totalSpent)}</td>
                    <td className="p-4 hidden lg:table-cell text-xs text-gray-400">{fmtDate(c.createdAt)}</td>
                    <td className="p-4 text-right">
                      <Button variant="ghost" size="icon" onClick={() => openDetail(c)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader><DialogTitle>{selected.customer.name}</DialogTitle></DialogHeader>
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div><span className="text-gray-500">Email :</span><br />{selected.customer.email}</div>
                  <div><span className="text-gray-500">Téléphone :</span><br />{selected.customer.phone || '—'}</div>
                  <div><span className="text-gray-500">Commandes :</span><br /><strong>{selected.orders.length}</strong></div>
                  <div><span className="text-gray-500">Total dépensé :</span><br /><strong>{fmt(selected.orders.reduce((s, o) => s + o.total, 0))}</strong></div>
                </div>
                <div>
                  <p className="font-semibold mb-2">Historique des commandes</p>
                  {selected.orders.length === 0 ? (
                    <p className="text-gray-400 text-center py-4">Aucune commande</p>
                  ) : (
                    <div className="space-y-2">
                      {selected.orders.map((o) => {
                        const s = statusLabels[o.orderStatus] ?? statusLabels.pending;
                        return (
                          <div key={o.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div>
                              <p className="font-medium">#{o.orderNumber}</p>
                              <p className="text-xs text-gray-400">{fmtDate(o.createdAt)}</p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Badge className={`text-xs border-0 ${s.color}`}>{s.label}</Badge>
                              <span className="font-semibold">{fmt(o.total)}</span>
                              <ChevronRight className="h-3 w-3 text-gray-400" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
