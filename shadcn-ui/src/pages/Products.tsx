// src/pages/Checkout.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cart, money, type CartItem } from "@/lib/cart";

type OrderResponse =
  | { ok: true; order: { id: string; orderNumber: string; total: number } }
  | { ok: false; error: string; message?: string };

const SHIPPING_OPTIONS = [
  { id: "click-collect", label: "Click & Collect (retrait boutique)", cost: 0 },
  { id: "dakar", label: "Livraison Dakar (1–2 jours)", cost: 2000 },
  { id: "hors-dakar", label: "Livraison hors Dakar", cost: 4000 },
] as const;

type ShippingMethod = (typeof SHIPPING_OPTIONS)[number]["id"];
type PaymentMethod = "on-delivery" | "online";

export default function Checkout() {
  const navigate = useNavigate();

  const [items, setItems] = useState<CartItem[]>(() => cart.get());

  useEffect(() => {
    const onChange = () => setItems(cart.get());
    window.addEventListener("cart:changed", onChange);
    return () => window.removeEventListener("cart:changed", onChange);
  }, []);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");

  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("dakar");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("on-delivery");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.price * it.qty, 0), [items]);

  const shippingCost = useMemo(() => {
    const opt = SHIPPING_OPTIONS.find((x) => x.id === shippingMethod);
    return opt ? opt.cost : 0;
  }, [shippingMethod]);

  const total = subtotal + shippingCost;

  async function submit() {
    setErr(null);

    if (!items.length) return setErr("Ton panier est vide.");
    if (!customerName.trim()) return setErr("Nom requis.");
    if (!customerPhone.trim()) return setErr("Téléphone requis.");
    if (!customerEmail.trim()) return setErr("Email requis.");
    if (shippingMethod !== "click-collect" && !shippingAddress.trim()) {
      return setErr("Adresse de livraison requise.");
    }

    if (paymentMethod === "online") {
      return setErr("Paiement en ligne disponible en V2. Choisis “Paiement à la livraison” pour V1.");
    }

    // ✅ DB exige variant_id NOT NULL
    const missing = items.find((it) => !it.variantId);
    if (missing) {
      return setErr(`Choisis une variante pour "${missing.name}" (taille/couleur) puis réessaie.`);
    }

    setLoading(true);
    try {
      const payload = {
        customerName: customerName.trim(),
        customerEmail: customerEmail.trim(),
        customerPhone: customerPhone.trim(),
        shippingMethod, // click-collect | dakar | hors-dakar
        shippingAddress: shippingMethod === "click-collect" ? "RETRAIT BOUTIQUE" : shippingAddress.trim(),
        paymentMethod: "on-delivery",
        items: items.map((it) => ({
          productId: it.id,
          variantId: it.variantId, // ✅ jamais null
          quantity: it.qty,
        })),
      };

      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      let data: OrderResponse;

      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Réponse API non-JSON: ${text.slice(0, 160)}`);
      }

      if (!res.ok || data.ok === false) {
        throw new Error((data as any)?.message || (data as any)?.error || `Erreur API (${res.status})`);
      }

      cart.clear();
      navigate(`/order-confirmation/${encodeURIComponent(data.order.id)}`);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h1 style={{ marginTop: 6 }}>Checkout</h1>

      {err && (
        <div style={{ background: "#ffe9e9", border: "1px solid #ffb3b3", padding: 12, borderRadius: 12, marginBottom: 14 }}>
          <b>Erreur:</b> {err}
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 0.8fr", gap: 18 }}>
        {/* Form */}
        <div style={{ border: "1px solid #eee", borderRadius: 16, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Informations client</h3>

          <div style={{ display: "grid", gap: 10 }}>
            <input
              placeholder="Nom complet *"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
            />
            <input
              placeholder="Téléphone *"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
            />
            <input
              placeholder="Email *"
              value={customerEmail}
              onChange={(e) => setCustomerEmail(e.target.value)}
              style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
            />
          </div>

          <h3 style={{ marginTop: 18 }}>Livraison</h3>

          <div style={{ display: "grid", gap: 10 }}>
            <select
              value={shippingMethod}
              onChange={(e) => setShippingMethod(e.target.value as ShippingMethod)}
              style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
            >
              {SHIPPING_OPTIONS.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.label} — {money(o.cost)}
                </option>
              ))}
            </select>

            {shippingMethod !== "click-collect" && (
              <input
                placeholder="Adresse de livraison *"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                style={{ padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
              />
            )}
          </div>

          <h3 style={{ marginTop: 18 }}>Paiement</h3>

          <div style={{ display: "grid", gap: 10 }}>
            <label style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === "on-delivery"}
                onChange={() => setPaymentMethod("on-delivery")}
              />
              Paiement à la livraison (V1)
            </label>

            <label style={{ display: "flex", gap: 10, alignItems: "center", opacity: 0.6 }}>
              <input
                type="radio"
                name="pay"
                checked={paymentMethod === "online"}
                onChange={() => setPaymentMethod("online")}
              />
              Paiement en ligne (V2 / bientôt)
            </label>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
            <Link to="/cart" style={{ textDecoration: "none" }}>
              <button style={{ padding: "12px 14px", borderRadius: 12, border: "1px solid #ddd", background: "#fff" }}>
                ← Retour panier
              </button>
            </Link>

            <button
              onClick={submit}
              disabled={loading}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #111",
                background: "#111",
                color: "#fff",
                cursor: "pointer",
                minWidth: 220,
              }}
            >
              {loading ? "Envoi..." : "Valider la commande"}
            </button>
          </div>
        </div>

        {/* Summary */}
        <div style={{ border: "1px solid #eee", borderRadius: 16, padding: 16 }}>
          <h3 style={{ marginTop: 0 }}>Récapitulatif</h3>

          {!items.length ? (
            <div>Panier vide.</div>
          ) : (
            <div style={{ display: "grid", gap: 10 }}>
              {items.map((it) => (
                <div key={`${it.id}-${it.variantId}`} style={{ display: "flex", gap: 12, alignItems: "center" }}>
                  <img
                    src={it.cover_image || "/assets/placeholder.jpg"}
                    alt={it.name}
                    style={{ width: 54, height: 54, borderRadius: 12, objectFit: "cover", border: "1px solid #eee" }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700 }}>{it.name}</div>
                    <div style={{ opacity: 0.7 }}>
                      {it.qty} × {money(it.price)}
                      {it.variantDetails ? <span style={{ marginLeft: 8 }}>({it.variantDetails})</span> : null}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800 }}>{money(it.price * it.qty)}</div>
                </div>
              ))}

              <hr style={{ border: "none", borderTop: "1px solid #eee", margin: "10px 0" }} />

              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Sous-total</span>
                <b>{money(subtotal)}</b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Livraison</span>
                <b>{money(shippingCost)}</b>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 18, marginTop: 6 }}>
                <span>Total</span>
                <b>{money(total)}</b>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
