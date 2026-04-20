// src/components/Products.tsx
import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { cart } from "@/lib/cart";

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price?: number | null;
  basePrice?: number | null;
  currency?: string | null;

  image?: string | null; // backend renvoie "image"
  imageUrl?: string | null;
  cover_image?: string | null;

  defaultVariantId?: string | null; // ✅ ajouté par backend
};

function resolveImage(src?: string | null) {
  if (!src) return "/assets/placeholder.jpg";
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads")) return `http://localhost:4000${src}`;
  return src;
}

function formatPrice(price: number, currency?: string | null) {
  const cur = currency || "XOF";
  const label = cur === "XOF" ? "FCFA" : cur;
  return `${Number(price || 0).toLocaleString("fr-FR")} ${label}`;
}

export default function Products({
  categorySlug,
  title,
  limit = 24,
  offset = 0,
}: {
  categorySlug?: string;
  title?: string;
  limit?: number;
  offset?: number;
}) {
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  // message UI non bloquant (ex: “indisponible”)
  const [toast, setToast] = useState<string | null>(null);

  const [products, setProducts] = useState<Product[]>([]);

  const apiUrl = useMemo(() => {
    const apiBase = import.meta.env.VITE_API_URL || '';
    const url = new URL(`/api/products`, apiBase || window.location.origin);
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("offset", String(offset));

    if (categorySlug && categorySlug !== "nouveautes") {
      url.searchParams.set("categorySlug", categorySlug);
    }

    if (categorySlug === "nouveautes") {
      url.searchParams.set("filter", "new");
    }

    return url.toString();
  }, [categorySlug, limit, offset]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setApiError(null);

        const res = await fetch(apiUrl, { credentials: "include" });
        const data = await res.json();

        if (!res.ok || !data?.ok) {
          throw new Error(data?.error || `HTTP_${res.status}`);
        }

        if (alive) setProducts(Array.isArray(data.products) ? data.products : []);
      } catch (e: any) {
        if (alive) setApiError(e?.message || "Erreur inconnue");
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, [apiUrl]);

  useEffect(() => {
    if (!toast) return;
    const t = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(t);
  }, [toast]);

  function addQuick(p: Product) {
    // ✅ V1: produit non commandable sans variante
    if (!p.defaultVariantId) {
      setToast(`"${p.name}" est indisponible (ajoute une variante côté admin).`);
      return;
    }

    const cover = p.image || p.imageUrl || p.cover_image || null;
    const price = Number(p.price ?? p.basePrice ?? 0);

    cart.add({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price,
      qty: 1,
      variantId: p.defaultVariantId,
      cover_image: cover ? resolveImage(cover) : null,
      variantDetails: null,
    });

    setToast(`Ajouté au panier : ${p.name}`);
  }

  if (loading) return <div style={{ padding: 24 }}>Chargement…</div>;
  if (apiError) return <div style={{ padding: 24, color: "crimson" }}>Erreur: {apiError}</div>;
  if (!products.length) return <div style={{ padding: 24 }}>Aucun produit trouvé.</div>;

  return (
    <div style={{ padding: "24px 0" }}>
      {title ? <h1 style={{ fontSize: 34, marginBottom: 18 }}>{title}</h1> : null}

      {/* Toast simple */}
      {toast ? (
        <div
          style={{
            marginBottom: 14,
            padding: 12,
            borderRadius: 12,
            background: "#111",
            color: "#fff",
            fontWeight: 700,
            maxWidth: 900,
          }}
        >
          {toast}
        </div>
      ) : null}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
          gap: 18,
        }}
      >
        {products.map((p) => {
          const price = Number(p.price ?? p.basePrice ?? 0);
          const cover = p.image || p.imageUrl || p.cover_image || null;

          const canBuy = !!p.defaultVariantId;

          return (
            <div
              key={p.id}
              style={{
                border: "1px solid #eee",
                borderRadius: 14,
                overflow: "hidden",
                background: "#fff",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                opacity: canBuy ? 1 : 0.92,
              }}
            >
              {/* Badge indisponible */}
              {!canBuy ? (
                <div
                  style={{
                    position: "absolute",
                    top: 10,
                    left: 10,
                    background: "#fff7e6",
                    border: "1px solid #ffd59a",
                    color: "#8a5a00",
                    padding: "6px 10px",
                    borderRadius: 999,
                    fontWeight: 900,
                    fontSize: 12,
                    zIndex: 2,
                  }}
                >
                  Indisponible
                </div>
              ) : null}

              <Link to={`/product/${p.slug}`} style={{ textDecoration: "none", color: "inherit" }}>
                <div style={{ height: 220, background: "#f6f6f6" }}>
                  <img
                    src={resolveImage(cover)}
                    alt={p.name}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                <div style={{ padding: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 16 }}>{p.name}</div>
                  <div style={{ marginTop: 6, opacity: 0.9 }}>{formatPrice(price, p.currency)}</div>

                  {!canBuy ? (
                    <div style={{ marginTop: 8, fontSize: 12, opacity: 0.75 }}>
                      Ce produit n’a pas encore de variantes. Ajoute-en une côté admin pour le mettre en vente.
                    </div>
                  ) : null}
                </div>
              </Link>

              <div style={{ padding: 14, paddingTop: 0, marginTop: "auto" }}>
                <button
                  onClick={() => addQuick(p)}
                  disabled={!canBuy}
                  title={!canBuy ? "Indisponible: aucune variante" : "Ajouter au panier"}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    borderRadius: 12,
                    border: "1px solid #111",
                    background: canBuy ? "#111" : "#f2f2f2",
                    color: canBuy ? "#fff" : "#777",
                    cursor: canBuy ? "pointer" : "not-allowed",
                    fontWeight: 800,
                  }}
                >
                  {canBuy ? "Ajouter au panier" : "Indisponible"}
                </button>

                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, alignItems: "center" }}>
                  <Link to={`/product/${p.slug}`} style={{ textDecoration: "none" }}>
                    Voir le produit →
                  </Link>

                  <Link to="/cart" style={{ textDecoration: "none", opacity: 0.9 }}>
                    Panier
                  </Link>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
