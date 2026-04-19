import { useEffect, useState } from 'react';
import { Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type Coupon = { id: string; code: string; type: 'percent' | 'fixed'; value: number; minOrderAmount: number | null; maxUses: number | null; usedCount: number; expiresAt: string | null; isActive: boolean; createdAt: string };

const emptyForm = () => ({ code: '', type: 'percent' as 'percent' | 'fixed', value: '', minOrderAmount: '', maxUses: '', expiresAt: '' });

function fmt(n: number) { return n.toLocaleString('fr-FR'); }

export default function AdminPromotions() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetch('/api/admin/coupons', { credentials: 'include' }).then((r) => r.json());
      setCoupons(data.coupons || []);
    } catch { toast.error('Erreur'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSave = async () => {
    if (!form.code || !form.value) { toast.error('Code et valeur requis'); return; }
    setSaving(true);
    try {
      const res = await fetch('/api/admin/coupons', {
        method: 'POST', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code, type: form.type, value: Number(form.value),
          minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : null,
          maxUses: form.maxUses ? Number(form.maxUses) : null,
          expiresAt: form.expiresAt || null,
        }),
      });
      const data = await res.json();
      if (data.ok) { toast.success('Code promo créé'); setDialogOpen(false); setForm(emptyForm()); load(); }
      else toast.error(data.message || 'Erreur');
    } catch { toast.error('Erreur réseau'); }
    finally { setSaving(false); }
  };

  const toggleActive = async (c: Coupon) => {
    try {
      await fetch(`/api/admin/coupons/${c.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !c.isActive }),
      });
      load();
    } catch { toast.error('Erreur'); }
  };

  const handleDelete = async (c: Coupon) => {
    if (!confirm(`Supprimer le code ${c.code} ?`)) return;
    try {
      await fetch(`/api/admin/coupons/${c.id}`, { method: 'DELETE', credentials: 'include' });
      toast.success('Code supprimé');
      load();
    } catch { toast.error('Erreur'); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Promotions</h1>
            <p className="text-gray-500 mt-1">{coupons.length} code(s) promo</p>
          </div>
          <Button className="bg-black hover:bg-gray-900" onClick={() => setDialogOpen(true)}><Plus className="mr-2 h-4 w-4" /> Nouveau code</Button>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : (
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left p-4">Code</th>
                <th className="text-left p-4">Réduction</th>
                <th className="text-left p-4 hidden md:table-cell">Utilisations</th>
                <th className="text-left p-4 hidden md:table-cell">Expiration</th>
                <th className="text-left p-4">Statut</th>
                <th className="text-right p-4">Actions</th>
              </tr></thead>
              <tbody className="divide-y">
                {coupons.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-12 text-gray-400">Aucun code promo</td></tr>
                ) : coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-gray-50">
                    <td className="p-4 font-mono font-bold">{c.code}</td>
                    <td className="p-4">
                      {c.type === 'percent' ? `${c.value}%` : `${fmt(c.value)} FCFA`}
                      {c.minOrderAmount && <span className="text-xs text-gray-400 block">Min: {fmt(c.minOrderAmount)} FCFA</span>}
                    </td>
                    <td className="p-4 hidden md:table-cell">
                      {c.usedCount}{c.maxUses ? ` / ${c.maxUses}` : ''}
                    </td>
                    <td className="p-4 hidden md:table-cell text-xs text-gray-500">
                      {c.expiresAt ? new Date(c.expiresAt).toLocaleDateString('fr-FR') : '—'}
                    </td>
                    <td className="p-4">
                      <Badge className={`text-xs border-0 ${c.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                        {c.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="icon" onClick={() => toggleActive(c)}>
                          {c.isActive ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-gray-400" />}
                        </Button>
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(c)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent></Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nouveau code promo</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Code *</Label><Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="EX: PROMO20" /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Type *</Label>
                <Select value={form.type} onValueChange={(v: 'percent' | 'fixed') => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percent">Pourcentage (%)</SelectItem>
                    <SelectItem value="fixed">Montant fixe (FCFA)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Valeur *</Label><Input type="number" min="0" value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} placeholder={form.type === 'percent' ? '20' : '5000'} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div><Label>Montant min (FCFA)</Label><Input type="number" min="0" value={form.minOrderAmount} onChange={(e) => setForm({ ...form, minOrderAmount: e.target.value })} placeholder="0" /></div>
              <div><Label>Nb. max utilisations</Label><Input type="number" min="0" value={form.maxUses} onChange={(e) => setForm({ ...form, maxUses: e.target.value })} placeholder="Illimité" /></div>
            </div>
            <div><Label>Date d'expiration</Label><Input type="date" value={form.expiresAt} onChange={(e) => setForm({ ...form, expiresAt: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button className="bg-black hover:bg-gray-900" onClick={handleSave} disabled={saving}>{saving ? 'Création...' : 'Créer le code'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
