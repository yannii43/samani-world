import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Search, Eye, ImagePlus } from 'lucide-react';
import ImageUpload from '@/components/ImageUpload';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Link } from 'react-router-dom';

type Product = {
  id: string; name: string; slug: string; description: string | null;
  categoryId: string; basePrice: number; coverImage: string | null;
  isFeatured: boolean; isNewArrival: boolean; isBestSeller: boolean; isActive: boolean;
};
type Category = { id: string; name: string; slug: string };

const empty = (): Omit<Product, 'id' | 'slug'> => ({
  name: '', description: '', categoryId: '', basePrice: 0,
  coverImage: null, isFeatured: false, isNewArrival: false, isBestSeller: false, isActive: true,
});

function fmt(n: number) { return n.toLocaleString('fr-FR') + ' FCFA'; }

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState(empty());
  const [saving, setSaving] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [pr, cr] = await Promise.all([
        fetch('/api/products', { credentials: 'include' }).then((r) => r.json()),
        fetch('/api/categories', { credentials: 'include' }).then((r) => r.json()),
      ]);
      setProducts(pr.products || []);
      setCategories(cr.categories || []);
    } catch {
      toast.error('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(empty());
    setDialogOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, description: p.description || '', categoryId: p.categoryId,
      basePrice: p.basePrice, coverImage: p.coverImage,
      isFeatured: p.isFeatured, isNewArrival: p.isNewArrival,
      isBestSeller: p.isBestSeller, isActive: p.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.categoryId || !form.basePrice) {
      toast.error('Nom, catégorie et prix sont requis');
      return;
    }
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/admin/products/${editing.id}` : '/api/admin/products';
      const res = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success(editing ? 'Produit modifié' : 'Produit créé');
        setDialogOpen(false);
        load();
      } else {
        toast.error(data.message || 'Erreur');
      }
    } catch { toast.error('Erreur réseau'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/products/${deleteTarget.id}`, {
        method: 'DELETE', credentials: 'include',
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('Produit désactivé');
        setDeleteTarget(null);
        load();
      } else { toast.error(data.message || 'Erreur'); }
    } catch { toast.error('Erreur réseau'); }
    finally { setDeleting(false); }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Produits</h1>
            <p className="text-gray-500 mt-1">{products.length} produit(s) au total</p>
          </div>
          <Button className="bg-black hover:bg-gray-900" onClick={openCreate}>
            <Plus className="mr-2 h-4 w-4" /> Ajouter un produit
          </Button>
        </div>

        {/* Recherche */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            className="pl-10"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Tableau */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                      <th className="text-left p-4 w-16">Image</th>
                      <th className="text-left p-4">Nom</th>
                      <th className="text-left p-4">Prix</th>
                      <th className="text-left p-4 hidden md:table-cell">Catégorie</th>
                      <th className="text-left p-4 hidden lg:table-cell">Tags</th>
                      <th className="text-left p-4">Statut</th>
                      <th className="text-right p-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-gray-400">
                          Aucun produit trouvé
                        </td>
                      </tr>
                    ) : (
                      filtered.map((p) => (
                        <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                          <td className="p-4">
                            {p.coverImage ? (
                              <img src={p.coverImage} alt={p.name} className="h-12 w-12 object-cover rounded-lg" />
                            ) : (
                              <div className="h-12 w-12 bg-gray-100 rounded-lg flex items-center justify-center">
                                <ImagePlus className="h-4 w-4 text-gray-400" />
                              </div>
                            )}
                          </td>
                          <td className="p-4">
                            <p className="font-medium">{p.name}</p>
                            <p className="text-xs text-gray-400">{p.slug}</p>
                          </td>
                          <td className="p-4 font-semibold whitespace-nowrap">{fmt(p.basePrice)}</td>
                          <td className="p-4 hidden md:table-cell">
                            {categories.find((c) => c.id === p.categoryId)?.name || p.categoryId}
                          </td>
                          <td className="p-4 hidden lg:table-cell">
                            <div className="flex gap-1 flex-wrap">
                              {p.isFeatured && <Badge className="text-xs bg-yellow-100 text-yellow-800 border-0">Vedette</Badge>}
                              {p.isNewArrival && <Badge className="text-xs bg-blue-100 text-blue-800 border-0">Nouveau</Badge>}
                              {p.isBestSeller && <Badge className="text-xs bg-green-100 text-green-800 border-0">Best-seller</Badge>}
                            </div>
                          </td>
                          <td className="p-4">
                            <Badge className={`text-xs border-0 ${p.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                              {p.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" asChild>
                                <Link to={`/product/${p.slug}`} target="_blank"><Eye className="h-4 w-4" /></Link>
                              </Button>
                              <Button variant="ghost" size="icon" onClick={() => openEdit(p)}>
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget(p)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ── Dialog Ajout/Édition ──────────────────────────────────────── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? 'Modifier le produit' : 'Ajouter un produit'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label>Nom du produit *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Robe Élégante Noire" />
              </div>

              <div>
                <Label>Catégorie *</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choisir une catégorie" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Prix de base (FCFA) *</Label>
                <Input type="number" min="0" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: Number(e.target.value) })} />
              </div>

              <div className="col-span-2">
                <Label>Description</Label>
                <Textarea rows={3} value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>

              {/* Image */}
              <div className="col-span-2">
                <ImageUpload
                  label="Image principale"
                  value={form.coverImage}
                  onChange={(url) => setForm({ ...form, coverImage: url })}
                />
              </div>

              {/* Toggles */}
              <div className="col-span-2 grid grid-cols-2 gap-4">
                {[
                  { key: 'isFeatured', label: 'Produit vedette' },
                  { key: 'isNewArrival', label: 'Nouveauté' },
                  { key: 'isBestSeller', label: 'Best-seller' },
                  { key: 'isActive', label: 'Actif (visible)' },
                ].map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between p-3 border rounded-lg">
                    <Label className="cursor-pointer">{label}</Label>
                    <Switch
                      checked={!!(form as any)[key]}
                      onCheckedChange={(v) => setForm({ ...form, [key]: v })}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button className="bg-black hover:bg-gray-900" onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer le produit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── AlertDialog Suppression ──────────────────────────────────── */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver ce produit ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le produit <strong>{deleteTarget?.name}</strong> sera masqué de la boutique.
              Cette action est réversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete} disabled={deleting}>
              {deleting ? 'Suppression...' : 'Désactiver'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
