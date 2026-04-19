// src/pages/ProductDetail.tsx
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { apiGet } from "@/lib/api";
import { cart, money } from "@/lib/cart";

type Variant = {
  id: string;
  sku?: string | null;
  price?: number | null;
  stock?: number | null;
  // ex: "size:s|color:black"
  details?: string | null;
  variant_details?: string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  price?: number | null;
  basePrice?: number | null;
  currency?: string | null;

  // selon ton backend, ça peut s’appeler image / imageUrl / cover_image
  image?: string | null;
  imageUrl?: string | null;
  cover_image?: string | null;

  // parfois: images: string[]
  images?: string[] | null;

  // parfois: variants: Variant[]
  variants?: Variant[] | null;
};

type ProductResponse =
  | { ok: true; product: Product }
  | { ok: false; error: string; message?: string };

type VariantsResponse =
  | { ok: true; variants: Variant[] }
  | { ok: false; error: string; message?: string };

function resolveImage(src?: string | null) {
  if (!src) return "/assets/placeholder.jpg";
  if (src.startsWith("http")) return src;
  if (src.startsWith("/uploads")) return `http://localhost:4000${src}`;
  return src; // ex: /assets/...
}

function humanizeVariant(details?: string | null) {
  if (!details) return null;

  const parts = details
    .split("|")
    .map((p) => p.trim())
    .filter(Boolean);

  const out: string[] = [];

  for (const p of parts) {
    const [kRaw, vRaw] = p.split(":");
    const k = (kRaw || "").trim().toLowerCase();
    let v = (vRaw || "").trim();

    v = v.replace(/^size[-_]/i, "");
    v = v.replace(/^color[-_]/i, "");
    v = v.replace(/^couleur[-_]/i, "");

    if (k.includes("size") || k.includes("taille")) {
      out.push(`Taille ${v.toUpperCase()}`);
      continue;
    }

    if (k.includes("color") || k.includes("couleur")) {
      const nice = v ? v.charAt(0).toUpperCase() + v.slice(1) : v;
      out.push(`Couleur ${nice}`);
      continue;
    }

    if (k && v) out.push(`${k}: ${v}`);
  }

  return out.length ? out.join(" • ") : details;
}

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  const [product, setProduct] = useState<Product | null>(null);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string>("");

  const [qty, setQty] = useState(1);
  const [adding, setAdding] = useState(false);

  // 1) Fetch product
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!slug) return;

      setLoading(true);
      setErr(null);

      try {
        const data = await apiGet<ProductResponse>(`/api/products/${encodeURIComponent(slug)}`);

        if (!mounted) return;

        if ((data as any).ok === false) {
          throw new Error((data as any).message || (data as any).error || "NOT_FOUND");
        }

        const p = (data as any).product as Product;
        setProduct(p);

        // variants embarquées
        const embedded = Array.isArray(p.variants) ? p.variants : [];
        setVariants(embedded);

        // preset variante
        if (embedded.length && !selectedVariantId) {
          setSelectedVariantId(embedded[0].id);
        }
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message || String(e));
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // 2) Optionnel: si ton backend a un endpoint variantes, on essaye (sinon ignore)
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!product?.id) return;

      // si déjà des variantes embarquées, pas besoin
      if (variants.length) return;

      try {
        const data = await apiGet<VariantsResponse>(`/api/products/${encodeURIComponent(product.id)}/variants`);
        if (!mounted) return;

        if ((data as any).ok === true && Array.isArray((data as any).variants)) {
          const v = (data as any).variants as Variant[];
          setVariants(v);

          if (v.length && !selectedVariantId) {
            setSelectedVariantId(v[0].id);
          }
        }
      } catch {
        // endpoint absent => pas grave
      }
    })();

    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product?.id]);

  const cover = useMemo(() => {
    if (!product) return null;
    return product.image || product.imageUrl || product.cover_image || null;
  }, [product]);

  const gallery = useMemo(() => {
    const imgs: string[] = [];

    // images[] si existe
    if (product?.images && Array.isArray(product.images)) {
      imgs.push(...product.images.filter(Boolean));
    }

    // sinon cover en fallback
    if (cover) imgs.unshift(cover);

    // unique
    return Array.from(new Set(imgs));
  }, [product?.images, cover]);

  const price = useMemo(() => {
    if (!product) return 0;
    return Number(product.price ?? product.basePrice ?? 0);
  }, [product]);

  const selectedVariant = useMemo(() => {
    return variants.find((v) => v.id === selectedVariantId) || null;
  }, [variants, selectedVariantId]);

  const displayedPrice = useMemo(() => {
    // si la variante a un prix spécifique
    const vp = selectedVariant?.price;
    if (vp !== undefined && vp !== null && !Number.isNaN(Number(vp))) return Number(vp);
    return price;
  }, [selectedVariant?.price, price]);

  async function addToCart() {
    if (!product) return;

    // ✅ DB: variant_id NOT NULL => on bloque si pas de variante
    if (!selectedVariantId) {
      setErr("Aucune variante trouvée pour ce produit. Ajoute au moins une variante côté admin (taille/couleur).");
      return;
    }

    setAdding(true);
    try {
      const details = selectedVariant?.variant_details || selectedVariant?.details || null;

      cart.add({
        id: product.id,
        name: product.name,
        slug: product.slug,
        price: displayedPrice,
        qty,
        variantId: selectedVariantId,
        cover_image: cover ? resolveImage(cover) : null,
        variantDetails: details ? humanizeVariant(details) : null,
      });

      // petite confirmation soft
      setErr(null);
    } catch (e: any) {
      setErr(e?.message || String(e));
    } finally {
      setAdding(false);
    }
  }

  if (loading) {
    return (
      <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
        <h1>Produit</h1>
        <p>Chargement…</p>
      </div>
    );
  }

  if (err && !product) {
    return (
      <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
        <h1>Produit</h1>
        <p style={{ color: "#b00020" }}>
          <b>Erreur :</b> {err}
        </p>
        <Link to="/products">Retour aux produits</Link>
      </div>
    );
  }

  if (!product) {
    return (
      <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
        <h1>Produit</h1>
        <p>Produit introuvable.</p>
        <Link to="/products">Retour aux produits</Link>
      </div>
    );
  }

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description || undefined,
    "image": resolveImage(gallery[0] || null),
    "brand": { "@type": "Brand", "name": "Samani World" },
    "offers": {
      "@type": "Offer",
      "price": displayedPrice,
      "priceCurrency": "XOF",
      "availability": "https://schema.org/InStock",
      "seller": { "@type": "Organization", "name": "Samani World" },
    },
  };

  return (
    <div style={{ padding: 16, maxWidth: 1100, margin: "0 auto" }}>
      <Helmet>
        <title>{product.name} — Samani World Dakar</title>
        <meta name="description" content={product.description ? product.description.slice(0, 160) : `Achetez ${product.name} sur Samani World. Livraison partout au Sénégal.`} />
        <link rel="canonical" href={`https://samaniworld.com/product/${product.slug}`} />
        <script type="application/ld+json">{JSON.stringify(productSchema)}</script>
      </Helmet>
      <div style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: 18 }}>
        {/* Galerie */}
        <div>
          <div
            style={{
              border: "1px solid #eee",
              borderRadius: 16,
              background: "#fff",
              overflow: "hidden",
            }}
          >
            <img
              src={resolveImage(gallery[0] || null)}
              alt={product.name}
              style={{ width: "100%", height: 520, objectFit: "cover", display: "block" }}
            />
          </div>

          {/* thumbs (protégé: gallery peut être vide, jamais de .map sur undefined) */}
          {gallery.length > 1 ? (
            <div style={{ marginTop: 10, display: "flex", gap: 10, flexWrap: "wrap" }}>
              {gallery.slice(0, 6).map((img) => (
                <img
                  key={img}
                  src={resolveImage(img)}
                  alt={product.name}
                  loading="lazy"
                  style={{ width: 74, height: 74, objectFit: "cover", borderRadius: 12, border: "1px solid #eee" }}
                />
              ))}
            </div>
          ) : null}
        </div>

        {/* Infos */}
        <div>
          <h1 style={{ marginTop: 0 }}>{product.name}</h1>
          <div style={{ fontSize: 20, fontWeight: 900, marginTop: 8 }}>{money(displayedPrice)}</div>

          {product.description ? <p style={{ marginTop: 10, opacity: 0.85 }}>{product.description}</p> : null}

          {/* Variantes */}
          <div style={{ marginTop: 16 }}>
            <div style={{ fontWeight: 800, marginBottom: 8 }}>Variante</div>

            {variants.length === 0 ? (
              <div style={{ background: "#fff7e6", border: "1px solid #ffd59a", padding: 12, borderRadius: 12 }}>
                Aucune variante trouvée. Pour valider des commandes (DB exige variant_id), ajoute une variante côté admin.
              </div>
            ) : (
              <select
                value={selectedVariantId}
                onChange={(e) => setSelectedVariantId(e.target.value)}
                style={{ width: "100%", padding: 12, borderRadius: 12, border: "1px solid #ddd" }}
              >
                {variants.map((v) => {
                  const text = humanizeVariant(v.variant_details || v.details) || v.sku || v.id;
                  const vPrice =
                    v.price !== undefined && v.price !== null ? ` — ${money(Number(v.price))}` : "";
                  return (
                    <option key={v.id} value={v.id}>
                      {text}
                      {vPrice}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          {/* Quantité */}
          <div style={{ marginTop: 14, display: "flex", gap: 10, alignItems: "center" }}>
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
            >
              -
            </button>
            <div style={{ minWidth: 28, textAlign: "center", fontWeight: 900 }}>{qty}</div>
            <button
              onClick={() => setQty((q) => q + 1)}
              style={{ width: 36, height: 36, borderRadius: 10, border: "1px solid #ddd", background: "#fff" }}
            >
              +
            </button>
          </div>

          {/* Erreur si variante manquante */}
          {err ? (
            <div style={{ marginTop: 12, color: "#b00020" }}>
              <b>Note :</b> {err}
            </div>
          ) : null}

          {/* CTA */}
          <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              onClick={addToCart}
              disabled={adding}
              style={{
                padding: "12px 14px",
                borderRadius: 12,
                border: "1px solid #111",
                background: "#111",
                color: "#fff",
                cursor: "pointer",
                minWidth: 220,
                fontWeight: 900,
              }}
            >
              {adding ? "Ajout..." : "Ajouter au panier"}
            </button>

            <Link to="/cart" style={{ textDecoration: "none" }}>
              <button
                style={{
                  padding: "12px 14px",
                  borderRadius: 12,
                  border: "1px solid #ddd",
                  background: "#fff",
                  cursor: "pointer",
                  fontWeight: 800,
                }}
              >
                Voir le panier →
              </button>
            </Link>
          </div>

          <div style={{ marginTop: 14 }}>
            <Link to="/products">← Retour produits</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
