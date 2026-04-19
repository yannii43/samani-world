// src/pages/Cart.tsx
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cart, money, CartItem } from "@/lib/cart";

export default function Cart() {
  const navigate = useNavigate();
  const [items, setItems] = useState<CartItem[]>(cart.get());

  useEffect(() => {
    const handler = () => setItems(cart.get());
    window.addEventListener("cart:changed", handler);
    return () => window.removeEventListener("cart:changed", handler);
  }, []);

  const { subtotal, count } = cart.totals();

  if (items.length === 0) {
    return (
      <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
        <h1>Panier</h1>
        <p>Ton panier est vide.</p>
        <Link to="/products">Retour aux produits</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <h1>Panier</h1>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 360px", gap: 18, marginTop: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((it) => (
            <div
              key={`${it.id}::${it.variantId || ""}`}
              style={{
                display: "grid",
                gridTemplateColumns: "100px 1fr 120px",
                gap: 12,
                border: "1px solid #eee",
                borderRadius: 14,
                padding: 12,
                background: "#fff",
              }}
            >
              <img
                src={it.cover_image || "/assets/placeholder.jpg"}
                alt={it.name}
                style={{ width: 100, height: 100, objectFit: "cover", borderRadius: 12 }}
              />

              <div>
                <div style={{ fontWeight: 800 }}>{it.name}</div>
                <div style={{ marginTop: 6 }}>{money(it.price)}</div>

                {it.variantDetails ? (
                  <div style={{ marginTop: 6, opacity: 0.8, fontSize: 13 }}>{it.variantDetails}</div>
                ) : null}

                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <button
                    onClick={() => cart.updateQty(it.id, it.qty - 1, it.variantId || null)}
                    style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
                  >
                    -
                  </button>
                  <div style={{ minWidth: 22, textAlign: "center", fontWeight: 800 }}>{it.qty}</div>
                  <button
                    onClick={() => cart.updateQty(it.id, it.qty + 1, it.variantId || null)}
                    style={{ width: 32, height: 32, borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
                  >
                    +
                  </button>

                  <button
                    onClick={() => cart.remove(it.id, it.variantId || null)}
                    style={{ marginLeft: 10, border: "none", background: "transparent", cursor: "pointer" }}
                  >
                    Supprimer
                  </button>
                </div>
              </div>

              <div style={{ textAlign: "right", fontWeight: 900 }}>{money(it.price * it.qty)}</div>
            </div>
          ))}
        </div>

        <div style={{ border: "1px solid #eee", borderRadius: 14, padding: 14, background: "#fff", height: "fit-content" }}>
          <div style={{ fontWeight: 900, fontSize: 18 }}>Résumé</div>
          <div style={{ marginTop: 10, display: "flex", justifyContent: "space-between" }}>
            <span>Articles</span>
            <b>{count}</b>
          </div>
          <div style={{ marginTop: 8, display: "flex", justifyContent: "space-between" }}>
            <span>Sous-total</span>
            <b>{money(subtotal)}</b>
          </div>

          <button
            onClick={() => navigate("/checkout")}
            style={{
              marginTop: 14,
              width: "100%",
              padding: "12px 14px",
              borderRadius: 12,
              border: "1px solid #111",
              background: "#111",
              color: "#fff",
              cursor: "pointer",
              fontWeight: 800,
            }}
          >
            Passer à la caisse
          </button>

          <button
            onClick={() => cart.clear()}
            style={{
              marginTop: 10,
              width: "100%",
              padding: "10px 14px",
              borderRadius: 12,
              border: "1px solid #ddd",
              background: "#fff",
              cursor: "pointer",
            }}
          >
            Vider le panier
          </button>

          <div style={{ marginTop: 12 }}>
            <Link to="/products">Continuer les achats</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
