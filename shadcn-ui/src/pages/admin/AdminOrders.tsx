import { useEffect, useState } from 'react';
import { Search, RefreshCw, ChevronDown } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

type Order = {
  id: string; orderNumber: string; customerName: string; customerEmail: string;
  customerPhone: string; shippingMethod: string; shippingCost: number;
  subtotal: number; total: number; paymentMethod: string;
  paymentStatus: string; orderStatus: string; createdAt: string;
};
type OrderItem = { productId: string; productName: string; quantity: number; unitPrice: number; coverImage: string | null; variantDetails: string | null };

const orderStatuses = [
  { value: 'confirmed', label: 'Confirmée', color: 'bg-blue-100 text-blue-800' },
  { value: 'preparing', label: 'Préparation', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'ready', label: 'Prête', color: 'bg-purple-100 text-purple-800' },
  { value: 'delivering', label: 'En livraison', color: 'bg-orange-100 text-orange-800' },
  { value: 'delivered', label: 'Livrée', color: 'bg-green-100 text-green-800' },
  { value: 'incident', label: 'Incident', color: 'bg-red-100 text-red-800' },
];
const paymentStatuses = [
  { value: 'pending', label: 'En attente' },
  { value: 'paid', label: 'Payé' },
  { value: 'failed', label: 'Échoué' },
  { value: 'refunded', label: 'Remboursé' },
];

const orderStatusMap = Object.fromEntries(orderStatuses.map((s) => [s.value, s]));
const paymentStatusLabels: Record<string, string> = { pending: 'En attente', paid: 'Payé', failed: 'Échoué', refunded: 'Remboursé' };
const shippingLabels: Record<string, string> = { dakar: 'Dakar', 'hors-dakar': 'Hors Dakar', 'click-collect': 'Click & Collect' };

function fmt(n: number) { return n.toLocaleString('fr-FR') + ' FCFA'; }
function fmtDate(d: string) { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const [selected, setSelected] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const [statusDialog, setStatusDialog] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPayment, setNewPayment] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetch('/api/orders', { credentials: 'include' }).then((r) => r.json());
      setOrders(data.orders || []);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openDetail = async (order: Order) => {
    setSelected(order);
    setItems([]);
    setLoadingDetail(true);
    try {
      const data = await fetch(`/api/orders/${order.id}`, { credentials: 'include' }).then((r) => r.json());
      setItems(data.items || []);
    } catch { toast.error('Erreur chargement détail'); }
    finally { setLoadingDetail(false); }
  };

  const openStatusDialog = () => {
    if (!selected) return;
    setNewStatus(selected.orderStatus);
    setNewPayment(selected.paymentStatus);
    setStatusNote('');
    setStatusDialog(true);
  };

  const handleUpdateStatus = async () => {
    if (!selected) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`/api/admin/orders/${selected.id}/status`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderStatus: newStatus, paymentStatus: newPayment, note: statusNote || undefined }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('Statut mis à jour');
        setStatusDialog(false);
        setSelected({ ...selected, orderStatus: newStatus, paymentStatus: newPayment });
        load();
      } else { toast.error(data.message || 'Erreur'); }
    } catch { toast.error('Erreur réseau'); }
    finally { setUpdatingStatus(false); }
  };

  const filtered = orders.filter((o) => {
    const matchSearch = !search || o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.customerName.toLowerCase().includes(search.toLowerCase()) || o.customerPhone.includes(search);
    const matchStatus = filterStatus === 'all' || o.orderStatus === filterStatus;
    return matchSearch && matchStatus;
  });

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Commandes</h1>
            <p className="text-gray-500 mt-1">{orders.length} commande(s) au total</p>
          </div>
          <Button variant="outline" onClick={load}><RefreshCw className="mr-2 h-4 w-4" /> Rafraîchir</Button>
        </div>

        {/* Filtres */}
        <div className="flex gap-3 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input className="pl-10" placeholder="N° commande, nom, téléphone..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-44"><SelectValue placeholder="Tous les statuts" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              {orderStatuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        {/* Tableau */}
        {loading ? (
          <div className="space-y-3">{[1,2,3,4,5].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : (
          <Card><CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead><tr className="border-b bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                  <th className="text-left p-4">Commande</th>
                  <th className="text-left p-4">Client</th>
                  <th className="text-left p-4 hidden md:table-cell">Total</th>
                  <th className="text-left p-4 hidden md:table-cell">Paiement</th>
                  <th className="text-left p-4">Statut</th>
                  <th className="text-left p-4 hidden lg:table-cell">Date</th>
                  <th className="text-right p-4">Actions</th>
                </tr></thead>
                <tbody className="divide-y">
                  {filtered.length === 0 ? (
                    <tr><td colSpan={7} className="text-center py-12 text-gray-400">Aucune commande</td></tr>
                  ) : filtered.map((o) => {
                    const s = orderStatusMap[o.orderStatus];
                    return (
                      <tr key={o.id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => openDetail(o)}>
                        <td className="p-4">
                          <p className="font-semibold">#{o.orderNumber}</p>
                          <p className="text-xs text-gray-400">{shippingLabels[o.shippingMethod] || o.shippingMethod}</p>
                        </td>
                        <td className="p-4">
                          <p className="font-medium">{o.customerName}</p>
                          <p className="text-xs text-gray-400">{o.customerPhone}</p>
                        </td>
                        <td className="p-4 font-bold hidden md:table-cell">{fmt(o.total)}</td>
                        <td className="p-4 hidden md:table-cell">
                          <span className={`text-xs px-2 py-1 rounded-full ${o.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' : o.paymentStatus === 'failed' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-700'}`}>
                            {paymentStatusLabels[o.paymentStatus] || o.paymentStatus}
                          </span>
                        </td>
                        <td className="p-4">
                          <Badge className={`text-xs border-0 ${s?.color || 'bg-gray-100 text-gray-700'}`}>
                            {s?.label || o.orderStatus}
                          </Badge>
                        </td>
                        <td className="p-4 text-xs text-gray-400 hidden lg:table-cell">{fmtDate(o.createdAt)}</td>
                        <td className="p-4 text-right">
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(o); }}>
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent></Card>
        )}
      </div>

      {/* ── Détail commande ──────────────────────────────────────────── */}
      <Dialog open={!!selected} onOpenChange={(o) => { if (!o) setSelected(null); }}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle>Commande #{selected.orderNumber}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-2">
                {/* Infos client */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><span className="text-gray-500">Client :</span> <strong>{selected.customerName}</strong></div>
                  <div><span className="text-gray-500">Tél :</span> {selected.customerPhone}</div>
                  <div><span className="text-gray-500">Email :</span> {selected.customerEmail}</div>
                  <div><span className="text-gray-500">Livraison :</span> {shippingLabels[selected.shippingMethod] || selected.shippingMethod}</div>
                  <div><span className="text-gray-500">Paiement :</span> {paymentStatusLabels[selected.paymentStatus] || selected.paymentStatus}</div>
                  <div><span className="text-gray-500">Date :</span> {fmtDate(selected.createdAt)}</div>
                </div>

                {/* Articles */}
                <div>
                  <p className="font-semibold mb-2">Articles</p>
                  {loadingDetail ? (
                    <div className="space-y-2">{[1,2].map((i) => <Skeleton key={i} className="h-12" />)}</div>
                  ) : (
                    <div className="space-y-2">
                      {items.map((item, i) => (
                        <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          {item.coverImage && <img src={item.coverImage} alt={item.productName} className="h-10 w-10 object-cover rounded" />}
                          <div className="flex-1">
                            <p className="text-sm font-medium">{item.productName}</p>
                            <p className="text-xs text-gray-400">Qté: {item.quantity} · {fmt(item.unitPrice)}</p>
                          </div>
                          <p className="font-semibold text-sm">{fmt(item.quantity * item.unitPrice)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Totaux */}
                <div className="border-t pt-3 space-y-1 text-sm">
                  <div className="flex justify-between"><span className="text-gray-500">Sous-total</span><span>{fmt(selected.subtotal)}</span></div>
                  <div className="flex justify-between"><span className="text-gray-500">Livraison</span><span>{fmt(selected.shippingCost)}</span></div>
                  <div className="flex justify-between font-bold text-base"><span>Total</span><span>{fmt(selected.total)}</span></div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setSelected(null)}>Fermer</Button>
                <Button className="bg-black hover:bg-gray-900" onClick={openStatusDialog}>Changer le statut</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* ── Dialog changement statut ──────────────────────────────── */}
      <Dialog open={statusDialog} onOpenChange={setStatusDialog}>
        <DialogContent>
          <DialogHeader><DialogTitle>Changer le statut de la commande</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <Label>Statut commande</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {orderStatuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Statut paiement</Label>
              <Select value={newPayment} onValueChange={setNewPayment}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {paymentStatuses.map((s) => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Note (optionnel)</Label>
              <Textarea rows={2} value={statusNote} onChange={(e) => setStatusNote(e.target.value)} placeholder="Message pour le suivi..." />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog(false)}>Annuler</Button>
            <Button className="bg-black hover:bg-gray-900" onClick={handleUpdateStatus} disabled={updatingStatus}>
              {updatingStatus ? 'Mise à jour...' : 'Confirmer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
