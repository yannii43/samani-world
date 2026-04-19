import { useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, FolderOpen } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import ImageUpload from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

type Category = { id: string; name: string; slug: string; description: string | null; image: string | null; parentId: string | null; order: number; isActive: boolean; children: Category[] };

const emptyForm = () => ({ name: '', description: '', image: null as string | null, parentId: '' });

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flat, setFlat] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Category | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetch('/api/categories', { credentials: 'include' }).then((r) => r.json());
      setCategories(data.categories || []);
      const f: Category[] = [];
      const flatten = (cats: Category[]) => {
        for (const c of cats) { f.push(c); if (c.children?.length) flatten(c.children); }
      };
      flatten(data.categories || []);
      setFlat(f);
    } catch { toast.error('Erreur de chargement'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditing(null); setForm(emptyForm()); setDialogOpen(true); };
  const openEdit = (c: Category) => {
    setEditing(c);
    setForm({ name: c.name, description: c.description || '', image: c.image || null, parentId: c.parentId || '' });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error('Nom requis'); return; }
    setSaving(true);
    try {
      const method = editing ? 'PUT' : 'POST';
      const url = editing ? `/api/admin/categories/${editing.id}` : '/api/admin/categories';
      const res = await fetch(url, {
        method, credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, parentId: form.parentId || null }),
      });
      const data = await res.json();
      if (data.ok) { toast.success(editing ? 'Catégorie modifiée' : 'Catégorie créée'); setDialogOpen(false); load(); }
      else toast.error(data.message || 'Erreur');
    } catch { toast.error('Erreur réseau'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const data = await fetch(`/api/admin/categories/${deleteTarget.id}`, { method: 'DELETE', credentials: 'include' }).then((r) => r.json());
      if (data.ok) { toast.success('Catégorie désactivée'); setDeleteTarget(null); load(); }
      else toast.error(data.message || 'Erreur');
    } catch { toast.error('Erreur réseau'); }
    finally { setDeleting(false); }
  };

  const resolveImg = (src?: string | null) => {
    if (!src) return null;
    if (src.startsWith('/uploads')) return `http://localhost:4000${src}`;
    return src;
  };

  const renderRow = (cat: Category, depth = 0) => (
    <>
      <tr key={cat.id} className="border-b hover:bg-gray-50 transition-colors">
        <td className="p-3 w-14">
          {resolveImg(cat.image) ? (
            <img src={resolveImg(cat.image)!} alt={cat.name} className="h-10 w-10 object-cover rounded-lg" />
          ) : (
            <div className="h-10 w-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <FolderOpen className="h-4 w-4 text-gray-400" />
            </div>
          )}
        </td>
        <td className="p-4">
          <div style={{ paddingLeft: depth * 20 }} className="flex items-center gap-2">
            {depth > 0 && <span className="text-gray-300 text-xs">└</span>}
            <div>
              <p className="font-medium">{cat.name}</p>
              <p className="text-xs text-gray-400">{cat.slug}{cat.children?.length ? ` · ${cat.children.length} sous-catégorie(s)` : ''}</p>
            </div>
          </div>
        </td>
        <td className="p-4 text-sm text-gray-500 hidden md:table-cell">{cat.description || '—'}</td>
        <td className="p-4">
          <Badge className={`text-xs border-0 ${cat.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
            {cat.isActive ? 'Active' : 'Inactive'}
          </Badge>
        </td>
        <td className="p-4 text-right">
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="icon" title="Ajouter une sous-catégorie" onClick={() => {
              setEditing(null);
              setForm({ ...emptyForm(), parentId: cat.id });
              setDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 text-gray-400" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => openEdit(cat)}><Pencil className="h-4 w-4" /></Button>
            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => setDeleteTarget(cat)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </td>
      </tr>
      {cat.children?.map((child) => renderRow(child, depth + 1))}
    </>
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Catégories</h1>
            <p className="text-gray-500 mt-1">{flat.length} catégorie(s)</p>
          </div>
          <Button className="bg-black hover:bg-gray-900" onClick={openCreate}><Plus className="mr-2 h-4 w-4" /> Ajouter</Button>
        </div>

        {loading ? (
          <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
        ) : (
          <Card><CardContent className="p-0">
            <table className="w-full text-sm">
              <thead><tr className="border-b bg-gray-50 text-gray-500 text-xs uppercase tracking-wide">
                <th className="text-left p-3 w-14">Image</th>
                <th className="text-left p-4">Nom</th>
                <th className="text-left p-4 hidden md:table-cell">Description</th>
                <th className="text-left p-4">Statut</th>
                <th className="text-right p-4">Actions</th>
              </tr></thead>
              <tbody>{categories.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-12 text-gray-400">Aucune catégorie</td></tr>
              ) : categories.map((c) => renderRow(c))}</tbody>
            </table>
          </CardContent></Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editing ? 'Modifier la catégorie' : form.parentId ? 'Nouvelle sous-catégorie' : 'Nouvelle catégorie'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div><Label>Nom *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ex: Robes, Abayas…" /></div>
            <div><Label>Description</Label><Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Description courte (optionnel)" /></div>

            <ImageUpload
              label="Image de la catégorie"
              value={form.image}
              onChange={(url) => setForm({ ...form, image: url })}
            />

            <div>
              <Label>Catégorie parente</Label>
              <p className="text-xs text-gray-400 mb-1">Laisser vide pour une catégorie principale</p>
              <Select value={form.parentId || 'none'} onValueChange={(v) => setForm({ ...form, parentId: v === 'none' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Aucune (catégorie principale)" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">— Catégorie principale —</SelectItem>
                  {flat.filter((c) => c.id !== editing?.id && !c.parentId).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button className="bg-black hover:bg-gray-900" onClick={handleSave} disabled={saving}>
              {saving ? 'Enregistrement...' : editing ? 'Enregistrer' : 'Créer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => { if (!o) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Désactiver cette catégorie ?</AlertDialogTitle>
            <AlertDialogDescription>La catégorie <strong>{deleteTarget?.name}</strong> sera masquée. Les produits associés restent inchangés.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={handleDelete} disabled={deleting}>{deleting ? '...' : 'Désactiver'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AdminLayout>
  );
}
