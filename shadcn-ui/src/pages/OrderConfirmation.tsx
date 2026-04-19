// src/pages/OrderConfirmation.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { CheckCircle2, MapPin, ShoppingBag, Package, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { money } from "@/lib/cart";
import { apiGet } from "@/lib/api";

type ApiOrder = {
  id: string;
  orderNumber: string;
  subtotal: number;
  shippingCost: number;
  discount: number;
  total: number;
  paymentStatus: string;
  orderStatus: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingMethod: string;
  shippingAddress: string;
  createdAt: string;
};

type ApiOrderItem = {
  productId: string;
  variantId: string;
  quantity: number;
  unitPrice: number;
  productName: string;
  variantDetails?: string | null;
  coverImage?: string | null;
};

type GetOrderResponse =
  | { ok: true; order: ApiOrder; items: ApiOrderItem[] }
  | { ok: false; error: string; message?: string };

function prettyShipping(method?: string) {
  if (method === "click-collect") return "Click & Collect (retrait boutique)";
  if (method === "dakar") return "Livraison Dakar";
  if (method === "hors-dakar") return "Livraison Hors Dakar";
  return method || "";
}

const statusLabel: Record<string, { label: string; color: string }> = {
  confirmed:  { label: "Confirmée",       color: "bg-blue-100 text-blue-800" },
  preparing:  { label: "En préparation",  color: "bg-yellow-100 text-yellow-800" },
  ready:      { label: "Prête",           color: "bg-purple-100 text-purple-800" },
  handover:   { label: "Remise livreur",  color: "bg-indigo-100 text-indigo-800" },
  delivering: { label: "En livraison",    color: "bg-orange-100 text-orange-800" },
  delivered:  { label: "Livrée ✅",       color: "bg-green-100 text-green-800" },
  incident:   { label: "Incident",        color: "bg-red-100 text-red-800" },
  pending:    { label: "En attente",      color: "bg-gray-100 text-gray-700" },
};

const TRACKABLE = ['confirmed','preparing','ready','handover','delivering'];

export default function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();

  const effectiveId = useMemo(() => {
    if (id) return id;
    const lastId = localStorage.getItem("samani_last_order_id");
    if (lastId) return lastId;
    try {
      const raw = localStorage.getItem("samani_last_order_v1");
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.id) return String(parsed.id);
    } catch {}
    return "";
  }, [id]);

  const [loading, setLoading] = useState<boolean>(!!effectiveId);
  const [err, setErr] = useState<string | null>(null);
  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [items, setItems] = useState<ApiOrderItem[]>([]);

  useEffect(() => {
    let mounted = true;
    async function run() {
      if (!effectiveId) { setLoading(false); return; }
      setLoading(true); setErr(null);
      try {
        const data = await apiGet<GetOrderResponse>(`/orders/${encodeURIComponent(effectiveId)}`);
        if (!mounted) return;
        if ((data as any).ok === false) throw new Error((data as any).message || (data as any).error || "NOT_FOUND");
        const ok = data as any as { ok: true; order: ApiOrder; items: ApiOrderItem[] };
        setOrder(ok.order);
        setItems(Array.isArray(ok.items) ? ok.items : []);
        localStorage.setItem("samani_last_order_id", ok.order.id);
      } catch (e: any) {
        if (mounted) setErr(e?.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [effectiveId]);

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-3">
          <Loader2 className="h-10 w-10 animate-spin mx-auto text-gray-400" />
          <p className="text-gray-500">Chargement de votre commande…</p>
        </div>
      </div>
    );
  }

  if (err || !order) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg text-center">
        <Package className="h-16 w-16 mx-auto text-gray-300 mb-4" />
        <h1 className="text-2xl font-bold mb-2">Commande introuvable</h1>
        <p className="text-gray-500 mb-6">{err || "Aucune commande trouvée."}</p>
        <Button asChild className="bg-black hover:bg-gray-900">
          <Link to="/products">Retour à la boutique</Link>
        </Button>
      </div>
    );
  }

  const s = statusLabel[order.orderStatus] ?? statusLabel.pending;
  const isTrackable = TRACKABLE.includes(order.orderStatus);

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">

      {/* En-tête succès */}
      <div className="text-center mb-8">
        <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
          Commande confirmée !
        </h1>
        <p className="text-gray-500 mt-2">
          Merci <strong>{order.customerName}</strong>, votre commande a bien été reçue.
        </p>
        <div className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full">
          <span className="text-sm text-gray-600">Référence :</span>
          <span className="font-mono font-bold text-black">#{order.orderNumber}</span>
        </div>
      </div>

      {/* Bouton Suivre — visible si commande en cours */}
      {isTrackable && (
        <Card className="mb-6 border-black bg-black text-white">
          <CardContent className="p-5 flex items-center justify-between gap-4">
            <div>
              <p className="font-semibold text-lg">Suivre ma livraison</p>
              <p className="text-gray-300 text-sm mt-0.5">Votre commande est en cours — consultez son avancement en temps réel.</p>
            </div>
            <Button asChild variant="outline" className="shrink-0 bg-white text-black hover:bg-gray-100 border-0">
              <Link to={`/track?orderNumber=${order.orderNumber}`}>
                <MapPin className="mr-2 h-4 w-4" />
                Suivre
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Statut */}
      <Card className="mb-6">
        <CardContent className="p-5 flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500">Statut de la commande</p>
            <Badge className={`mt-1 text-sm border-0 ${s.color}`}>{s.label}</Badge>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Date</p>
            <p className="text-sm font-medium">
              {new Date(order.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Articles */}
      <Card className="mb-6">
        <CardHeader><CardTitle className="text-base">Articles commandés</CardTitle></CardHeader>
        <CardContent className="p-0">
          {items.length === 0 ? (
            <p className="text-sm text-gray-400 p-4">Aucun article trouvé.</p>
          ) : (
            <div className="divide-y">
              {items.map((it, idx) => (
                <div key={`${it.productId}-${it.variantId}-${idx}`} className="flex items-center gap-4 p-4">
                  <img
                    src={it.coverImage || "/assets/placeholder.jpg"}
                    alt={it.productName}
                    className="h-14 w-14 rounded-lg object-cover border border-gray-100 shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{it.productName}</p>
                    {it.variantDetails && <p className="text-xs text-gray-500 mt-0.5">{it.variantDetails}</p>}
                    <p className="text-xs text-gray-400 mt-0.5">Qté : {it.quantity}</p>
                  </div>
                  <p className="font-bold text-sm shrink-0">{money(it.unitPrice * it.quantity)}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Récapitulatif financier */}
      <Card className="mb-6">
        <CardContent className="p-5 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Sous-total</span>
            <span>{money(order.subtotal)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Livraison ({prettyShipping(order.shippingMethod)})</span>
            <span>{money(order.shippingCost)}</span>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-sm text-green-600">
              <span>Réduction</span>
              <span>- {money(order.discount)}</span>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-bold text-lg">
            <span>Total</span>
            <span>{money(order.total)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Infos livraison */}
      <Card className="mb-8">
        <CardHeader><CardTitle className="text-base">Informations de livraison</CardTitle></CardHeader>
        <CardContent className="p-5 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-500">Destinataire</span>
            <span className="font-medium">{order.customerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-500">Téléphone</span>
            <span className="font-medium">{order.customerPhone}</span>
          </div>
          {order.shippingAddress && (
            <div className="flex justify-between">
              <span className="text-gray-500">Adresse</span>
              <span className="font-medium text-right max-w-[60%]">{order.shippingAddress}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-500">Mode</span>
            <span className="font-medium">{prettyShipping(order.shippingMethod)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        {isTrackable && (
          <Button asChild className="flex-1 bg-black hover:bg-gray-900">
            <Link to={`/track?orderNumber=${order.orderNumber}`}>
              <MapPin className="mr-2 h-4 w-4" />
              Suivre ma commande
            </Link>
          </Button>
        )}
        <Button asChild variant="outline" className="flex-1">
          <Link to="/products">
            <ShoppingBag className="mr-2 h-4 w-4" />
            Continuer les achats
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link to="/account">Mon compte</Link>
        </Button>
      </div>
    </div>
  );
}
