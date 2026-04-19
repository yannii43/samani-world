import { useEffect, useState } from 'react';
import { Save, RefreshCw } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import ImageUpload from '@/components/ImageUpload';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';

type Product = { id: string; name: string; slug: string; coverImage: string | null; isFeatured: boolean; isNewArrival: boolean };

export default function AdminContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  // Bannière (stockée localement pour la V1)
  const [banner, setBanner] = useState({
    title: 'Élégance & Raffinement',
    subtitle: 'Découvrez notre collection de mode féminine premium — robes, abayas, accessoires',
    cta: 'Découvrir la collection',
    image: null as string | null,
  });

  const load = async () => {
    setLoading(true);
    try {
      const data = await fetch('/api/products', { credentials: 'include' }).then((r) => r.json());
      setProducts(data.products || []);
    } catch { toast.error('Erreur'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const toggleFlag = async (product: Product, flag: 'isFeatured' | 'isNewArrival') => {
    setSaving(product.id + flag);
    try {
      const res = await fetch(`/api/admin/products/${product.id}`, {
        method: 'PUT', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ [flag]: !product[flag] }),
      });
      const data = await res.json();
      if (data.ok) {
        toast.success('Mis à jour');
        setProducts((prev) => prev.map((p) => p.id === product.id ? { ...p, [flag]: !p[flag] } : p));
      } else { toast.error(data.message || 'Erreur'); }
    } catch { toast.error('Erreur réseau'); }
    finally { setSaving(null); }
  };

  const featured = products.filter((p) => p.isFeatured);
  const newArrivals = products.filter((p) => p.isNewArrival);

  return (
    <AdminLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Contenu boutique</h1>
          <p className="text-gray-500 mt-1">Gérez la bannière, les produits vedettes et les nouveautés</p>
        </div>

        {/* Bannière */}
        <Card>
          <CardHeader><CardTitle>Bannière principale</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div><Label>Titre</Label><Input value={banner.title} onChange={(e) => setBanner({ ...banner, title: e.target.value })} /></div>
              <div><Label>Bouton CTA</Label><Input value={banner.cta} onChange={(e) => setBanner({ ...banner, cta: e.target.value })} /></div>
              <div className="md:col-span-2"><Label>Sous-titre</Label><Input value={banner.subtitle} onChange={(e) => setBanner({ ...banner, subtitle: e.target.value })} /></div>
              <div className="md:col-span-2">
                <ImageUpload
                  label="Image de fond (bannière)"
                  value={banner.image}
                  onChange={(url) => setBanner({ ...banner, image: url })}
                  hint="Image recommandée : 1920 × 600 px"
                />
              </div>
            </div>
            <Button className="bg-black hover:bg-gray-900" onClick={() => toast.success('Bannière sauvegardée (localStorage)')}>
              <Save className="mr-2 h-4 w-4" /> Sauvegarder la bannière
            </Button>
          </CardContent>
        </Card>

        {/* Produits vedettes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Produits vedettes</CardTitle>
              <p className="text-sm text-gray-500 mt-1">{featured.length} produit(s) actuellement en vedette</p>
            </div>
            <Button variant="outline" size="sm" onClick={load}><RefreshCw className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-2">{[1,2,3].map((i) => <Skeleton key={i} className="h-12" />)}</div>
            ) : (
              <div className="space-y-2">
                {products.map((p) => (
                  <div key={p.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      {p.coverImage && <img src={p.coverImage} alt={p.name} className="h-10 w-10 object-cover rounded" />}
                      <p className="text-sm font-medium">{p.name}</p>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500">Vedette</Label>
                        <Switch
                          checked={p.isFeatured}
                          disabled={saving === p.id + 'isFeatured'}
                          onCheckedChange={() => toggleFlag(p, 'isFeatured')}
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <Label className="text-xs text-gray-500">Nouveauté</Label>
                        <Switch
                          checked={p.isNewArrival}
                          disabled={saving === p.id + 'isNewArrival'}
                          onCheckedChange={() => toggleFlag(p, 'isNewArrival')}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
}
