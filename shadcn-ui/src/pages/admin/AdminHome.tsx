// src/pages/admin/AdminHome.tsx
import { Link } from "react-router-dom";

export default function AdminHome() {
  return (
    <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>
      <h1 style={{ marginTop: 6 }}>Admin — Samani World</h1>
      <p style={{ opacity: 0.75, marginTop: 6 }}>
        Espace admin (V1). On ajoutera l’authentification après.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 18 }}>
        <Link to="/admin/orders" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 16,
              padding: 16,
              background: "#fff",
            }}
          >
            <h2 style={{ marginTop: 0 }}>📦 Commandes</h2>
            <p style={{ opacity: 0.75, marginBottom: 0 }}>
              Voir la liste des commandes, statuts, détails.
            </p>
          </div>
        </Link>

        <Link to="/admin/products" style={{ textDecoration: "none", color: "inherit" }}>
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 16,
              padding: 16,
              background: "#fff",
            }}
          >
            <h2 style={{ marginTop: 0 }}>🛍️ Produits</h2>
            <p style={{ opacity: 0.75, marginBottom: 0 }}>
              Gérer les produits, variantes, images.
            </p>
          </div>
        </Link>
      </div>

      <div style={{ marginTop: 16 }}>
        <Link to="/products">← Retour boutique</Link>
      </div>
    </div>
  );
}
