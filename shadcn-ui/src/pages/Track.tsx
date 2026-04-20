// src/pages/Track.tsx
import { useState } from "react";

type TrackEvent = {
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
  | { ok: true; order: TrackOrder; events: TrackEvent[] }
  | { ok: false; error: string; message?: string };

function labelStatus(s: string) {
  const m: Record<string, string> = {
    confirmed: "Commande confirmée",
    preparing: "En préparation",
    ready: "Prête",
    handover: "Remise au livreur",
    delivering: "En livraison",
    delivered: "Livrée",
    incident: "Incident",
    pending: "En attente",
  };
  return m[s] || s;
}

export default function Track() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [data, setData] = useState<{ order: TrackOrder; events: TrackEvent[] } | null>(null);

  async function submit() {
    setErr(null);
    setData(null);

    const on = orderNumber.trim();
    const ph = phone.trim();
    if (!on || !ph) return setErr("Order number et téléphone requis.");

    setLoading(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber: on, phone: ph }),
      });

      const json = (await res.json()) as TrackResponse;
      if (!res.ok || json.ok === false) {
        const e = json as { ok: false; error: string; message?: string };
        throw new Error(e.message || e.error || `HTTP_${res.status}`);
      }

      setData({ order: json.order, events: json.events || [] });
    } catch (e: any) {
      setErr(e?.message || "Erreur");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 16 }}>
      <h1>Suivre ma commande</h1>

      <div style={{ display: "grid", gap: 10, maxWidth: 420, marginTop: 12 }}>
        <input
          placeholder="Numéro de commande (ex: ORD-20260106-GT28)"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
        />
        <input
          placeholder="Téléphone (ex: 770000000)"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
        />
        <button
          onClick={submit}
          disabled={loading}
          style={{
            padding: 12,
            borderRadius: 12,
            border: "1px solid #111",
            background: "#111",
            color: "#fff",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          {loading ? "Recherche..." : "Suivre"}
        </button>
      </div>

      {err && (
        <div style={{ marginTop: 14, color: "crimson" }}>
          <b>Erreur :</b> {err}
        </div>
      )}

      {data && (
        <div style={{ marginTop: 18, border: "1px solid #eee", borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 18 }}>
            Réf: <b>{data.order.orderNumber}</b>
          </div>
          <div style={{ marginTop: 6 }}>
            Statut actuel: <b>{labelStatus(data.order.orderStatus)}</b>
          </div>
          <div style={{ marginTop: 6, opacity: 0.85 }}>
            Livraison: {data.order.shippingMethod} — {data.order.shippingAddress}
          </div>

          <hr style={{ margin: "14px 0" }} />

          <h3 style={{ marginTop: 0 }}>Historique</h3>

          {data.events.length === 0 ? (
            <div style={{ opacity: 0.7 }}>Aucun événement pour le moment.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {data.events.map((ev) => (
                <div key={ev.id} style={{ border: "1px solid #eee", borderRadius: 12, padding: 12 }}>
                  <div style={{ fontWeight: 900 }}>{labelStatus(ev.status)}</div>
                  {ev.note ? <div style={{ marginTop: 4 }}>{ev.note}</div> : null}
                  <div style={{ marginTop: 6, fontSize: 12, opacity: 0.7 }}>
                    {new Date(ev.createdAt).toLocaleString("fr-FR")}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
