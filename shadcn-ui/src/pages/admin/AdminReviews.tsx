import { useEffect, useState } from 'react';
import { Check, X, Star } from 'lucide-react';
import AdminLayout from '@/components/AdminLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { toast } from 'sonner';

type Review = { id: string; productId: string; productName: string; userId: string | null; userName: string | null; rating: number; comment: string | null; status: string; createdAt: string };

function fmtDate(d: string) { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' }); }

export default function AdminReviews() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('pending');

  const load = async (status = 'pending') => {
    setLoading(true);
    try {
      const data = await fetch(`/api/admin/reviews?status=${status}`, { credentials: 'include' }).then((r) => r.json());
      setReviews(data.reviews || []);
    } catch { toast.error('Erreur'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(tab); }, [tab]);

  const moderate = async (id: string, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/reviews/${id}`, {
        method: 'PATCH', credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.ok) { toast.success(status === 'approved' ? 'Avis approuvé' : 'Avis rejeté'); load(tab); }
      else toast.error(data.message || 'Erreur');
    } catch { toast.error('Erreur réseau'); }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>Avis clients</h1>
          <p className="text-gray-500 mt-1">Modérez les avis avant publication</p>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList>
            <TabsTrigger value="pending">En attente</TabsTrigger>
            <TabsTrigger value="approved">Approuvés</TabsTrigger>
            <TabsTrigger value="rejected">Rejetés</TabsTrigger>
          </TabsList>

          {['pending', 'approved', 'rejected'].map((t) => (
            <TabsContent key={t} value={t}>
              {loading && tab === t ? (
                <div className="space-y-3">{[1,2,3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
              ) : reviews.length === 0 ? (
                <Card><CardContent className="text-center py-12 text-gray-400">Aucun avis dans cette catégorie</CardContent></Card>
              ) : (
                <div className="space-y-3">
                  {reviews.map((r) => (
                    <Card key={r.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex">
                                {[1,2,3,4,5].map((i) => (
                                  <Star key={i} className={`h-4 w-4 ${i <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-200'}`} />
                                ))}
                              </div>
                              <span className="font-medium text-sm">{r.userName || 'Anonyme'}</span>
                              <span className="text-xs text-gray-400">·</span>
                              <span className="text-xs text-gray-400">{r.productName}</span>
                              <span className="text-xs text-gray-400">·</span>
                              <span className="text-xs text-gray-400">{fmtDate(r.createdAt)}</span>
                            </div>
                            {r.comment && <p className="text-sm text-gray-600">{r.comment}</p>}
                          </div>
                          {t === 'pending' && (
                            <div className="flex gap-2 shrink-0">
                              <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => moderate(r.id, 'approved')}>
                                <Check className="h-4 w-4" />
                              </Button>
                              <Button size="sm" variant="outline" className="border-red-300 text-red-600 hover:bg-red-50" onClick={() => moderate(r.id, 'rejected')}>
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          )}
                          {t !== 'pending' && (
                            <Badge className={`shrink-0 border-0 ${t === 'approved' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {t === 'approved' ? 'Approuvé' : 'Rejeté'}
                            </Badge>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </AdminLayout>
  );
}
