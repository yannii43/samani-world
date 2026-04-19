// src/pages/TrackOrder.tsx
import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { MapPin, Search, CheckCircle2, Clock, Loader2, Package, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

type TrackingEvent = {
  id: string;
  status: string;
  note: string | null;
  createdAt: string;
};

type TrackOrder = {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  shippingMethod: string;
  shippingAddress: string;
  paymentStatus: string;
  orderStatus: string;
  createdAt: string;
};

type TrackResponse =
  | { ok: true; order: TrackOrder; events: TrackingEvent[] }
  | { ok: false; error: string; message?: string };

const statusConfig: Record<string, { label: string; color: string; icon: typeof CheckCircle2 }> = {
  pending:    { label: "En attente",          color: "bg-gray-100 text-gray-700",    icon: Clock },
  confirmed:  { label: "Confirmée",           color: "bg-blue-100 text-blue-800",    icon: CheckCircle2 },
  preparing:  { label: "En préparation",      color: "bg-yellow-100 text-yellow-800",icon: Package },
  ready:      { label: "Prête",               color: "bg-purple-100 text-purple-800",icon: CheckCircle2 },
  handover:   { label: "Remise au livreur",   color: "bg-indigo-100 text-indigo-800",icon: MapPin },
  delivering: { label: "En cours de livraison", color: "bg-orange-100 text-orange-800", icon: MapPin },
  delivered:  { label: "Livrée",             color: "bg-green-100 text-green-800",  icon: CheckCircle2 },
  incident:   { label: "Incident",            color: "bg-red-100 text-red-800",      icon: AlertTriangle },
};

// Étapes dans l'ordre pour la timeline
const STEPS = ["confirmed", "preparing", "ready", "handover", "delivering", "delivered"];

function fmtDate(iso?: string) {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    });
  } catch { return iso; }
}

export default function TrackOrderPage() {
  const location = useLocation();

  // Lire ?orderNumber= depuis l'URL (envoyé depuis Account ou OrderConfirmation)
  const params = new URLSearchParams(location.search);
  const urlOrderNumber = params.get("orderNumber") || "";

  const [orderNumber, setOrderNumber] = useState(urlOrderNumber);
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [result, setResult] = useState<{ order: TrackOrder; events: TrackingEvent[] } | null>(null);

  // Si orderNumber pré-rempli depuis URL, focus automatique sur le champ téléphone
  useEffect(() => {
    if (urlOrderNumber) setOrderNumber(urlOrderNumber);
  }, [urlOrderNumber]);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setErr(null);
    setResult(null);

    const on = orderNumber.trim();
    const ph = phone.trim();

    if (!on) { setErr("Le numéro de commande est requis."); return; }
    if (!ph)  { setErr("Le numéro de téléphone est requis."); return; }

    setLoading(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: on, phone: ph }),
      });
      const json = (await res.json()) as TrackResponse;

      if (!res.ok || json.ok === false) {
        const e2 = json as { ok: false; error: string; message?: string };
        throw new Error(e2.message || e2.error || `Erreur ${res.status}`);
      }

      setResult({ order: json.order, events: Array.isArray(json.events) ? json.events : [] });
    } catch (e: any) {
      setErr(e?.message || "Erreur lors de la recherche");
    } finally {
      setLoading(false);
    }
  }

  const currentStep = result ? STEPS.indexOf(result.order.orderStatus) : -1;

  return (
    <div className="container mx-auto px-4 py-10 max-w-2xl">

      {/* Titre */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <MapPin className="h-7 w-7 text-black" />
          <h1 className="text-3xl font-bold" style={{ fontFamily: '"Playfair Display", serif' }}>
            Suivre ma commande
          </h1>
        </div>
        <p className="text-gray-500">Entrez votre numéro de commande et le téléphone utilisé lors de la commande.</p>
      </div>

      {/* Formulaire */}
      <Card className="mb-8">
        <CardContent className="p-6">
          <form onSubmit={submit} className="space-y-4">
            <div>
              <Label htmlFor="orderNumber">Numéro de commande *</Label>
              <Input
                id="orderNumber"
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="Ex : ORD-20260106-GT28"
                className="mt-1 font-mono"
                autoFocus={!urlOrderNumber}
              />
            </div>
            <div>
              <Label htmlFor="phone">Téléphone *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+221 77 000 00 00"
                className="mt-1"
                autoFocus={!!urlOrderNumber}
              />
            </div>

            {err && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                {err}
              </div>
            )}

            <Button type="submit" className="w-full bg-black hover:bg-gray-900" disabled={loading}>
              {loading ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Recherche en cours…</>
              ) : (
                <><Search className="mr-2 h-4 w-4" />Suivre ma commande</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Résultats */}
      {result && (
        <div className="space-y-6">

          {/* Infos commande */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Commande #{result.order.orderNumber}</CardTitle>
                <Badge className={`border-0 ${(statusConfig[result.order.orderStatus] ?? statusConfig.pending).color}`}>
                  {(statusConfig[result.order.orderStatus] ?? statusConfig.pending).label}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-5 pt-0 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Client</span>
                <span className="font-medium">{result.order.customerName}</span>
              </div>
              {result.order.shippingAddress && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Adresse</span>
                  <span className="font-medium text-right max-w-[60%]">{result.order.shippingAddress}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Commande passée le</span>
                <span className="font-medium">{fmtDate(result.order.createdAt)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Timeline de progression */}
          {result.order.orderStatus !== 'incident' && (
            <Card>
              <CardHeader><CardTitle className="text-base">Progression</CardTitle></CardHeader>
              <CardContent className="p-5 pt-0">
                <div className="space-y-1">
                  {STEPS.map((step, i) => {
                    const cfg = statusConfig[step];
                    const done = i <= currentStep;
                    const active = i === currentStep;
                    const Icon = cfg.icon;
                    return (
                      <div key={step} className="flex items-start gap-3">
                        <div className="flex flex-col items-center">
                          <div className={`h-7 w-7 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                            active ? 'bg-black text-white' : done ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'
                          }`}>
                            <Icon className="h-3.5 w-3.5" />
                          </div>
                          {i < STEPS.length - 1 && (
                            <div className={`w-0.5 h-6 ${done && i < currentStep ? 'bg-green-400' : 'bg-gray-200'}`} />
                          )}
                        </div>
                        <p className={`text-sm pt-1 ${active ? 'font-bold text-black' : done ? 'text-gray-700' : 'text-gray-400'}`}>
                          {cfg.label}
                          {active && <span className="ml-2 text-xs font-normal text-gray-500">(statut actuel)</span>}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Historique des événements */}
          <Card>
            <CardHeader><CardTitle className="text-base">Historique des événements</CardTitle></CardHeader>
            <CardContent className="p-0">
              {result.events.length === 0 ? (
                <p className="text-sm text-gray-400 p-5">Aucun événement de suivi enregistré pour l'instant.</p>
              ) : (
                <div className="divide-y">
                  {result.events.map((ev) => {
                    const cfg = statusConfig[ev.status] ?? statusConfig.pending;
                    return (
                      <div key={ev.id} className="flex items-start justify-between gap-4 p-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Badge className={`text-xs border-0 ${cfg.color}`}>{cfg.label}</Badge>
                          </div>
                          {ev.note && <p className="text-sm text-gray-600">{ev.note}</p>}
                        </div>
                        <p className="text-xs text-gray-400 whitespace-nowrap shrink-0">{fmtDate(ev.createdAt)}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
