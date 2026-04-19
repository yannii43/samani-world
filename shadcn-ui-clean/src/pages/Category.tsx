import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Products from "@/components/Products";

const titleMap: Record<string, string> = {
  nouveautes: "Nouveautés",
  robes: "Robes",
  abaya: "Abaya",
  sacs: "Sacs",
  chaussures: "Chaussures",
};

export default function Category() {
  const { slug } = useParams();

  const safeSlug = (slug || "").toLowerCase();
  const title = useMemo(() => titleMap[safeSlug] || safeSlug, [safeSlug]);

  const metaDesc: Record<string, string> = {
    robes: "Découvrez notre collection de robes féminines à Dakar. Élégantes, modernes et raffinées. Livraison partout au Sénégal.",
    abaya: "Collection d'abayas de luxe à Dakar. Tissus de qualité, coupes soignées. Livraison partout au Sénégal.",
    sacs: "Sacs et maroquinerie féminine à Dakar. Sacs à main, pochettes, accessoires de luxe. Livraison au Sénégal.",
    chaussures: "Chaussures femme à Dakar — escarpins, sandales, mules. Livraison partout au Sénégal.",
  };

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 18px" }}>
      <Helmet>
        <title>{title} — Samani World Dakar, Sénégal</title>
        <meta name="description" content={metaDesc[safeSlug] || `${title} — Boutique Samani World à Dakar. Livraison partout au Sénégal.`} />
        <link rel="canonical" href={`https://samaniworld.com/category/${safeSlug}`} />
      </Helmet>
      <Products categorySlug={safeSlug} title={title} />
    </div>
  );
}
