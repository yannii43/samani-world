export default function Cgv() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-black text-white py-16 text-center px-4">
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
          Conditions Générales de Vente
        </h1>
        <p className="text-white/70 text-sm">Dernière mise à jour : Janvier 2025</p>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-3xl prose prose-gray">
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">1. Identification du vendeur</h2>
          <p className="text-gray-600 leading-relaxed">
            Samani World est une boutique en ligne spécialisée dans la mode féminine, basée à Dakar, Sénégal.
            Contact : contact@samaniworld.com · +221 70 000 00 00
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">2. Objet</h2>
          <p className="text-gray-600 leading-relaxed">
            Les présentes conditions générales régissent les ventes de produits effectuées sur le site
            Samani World entre le vendeur et tout acheteur (ci-après "le client").
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">3. Commandes</h2>
          <p className="text-gray-600 leading-relaxed mb-2">
            Toute commande passée sur le site vaut acceptation des présentes CGV. Le client reçoit
            un numéro de commande par confirmation. La commande n'est définitive qu'après confirmation
            de disponibilité du produit.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Samani World se réserve le droit d'annuler toute commande en cas de problème de disponibilité
            ou d'information erronée, avec remboursement intégral si paiement effectué.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">4. Prix</h2>
          <p className="text-gray-600 leading-relaxed">
            Les prix sont exprimés en Francs CFA (FCFA) toutes taxes comprises. Samani World se réserve
            le droit de modifier ses prix à tout moment, mais les produits seront facturés au tarif en
            vigueur au moment de la commande.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">5. Livraison</h2>
          <ul className="text-gray-600 space-y-1 list-disc list-inside">
            <li>Livraison à Dakar : 2 000 FCFA, délai 24-48h</li>
            <li>Livraison hors Dakar : 5 000 FCFA, délai 2-4 jours ouvrables</li>
            <li>Click & Collect : Gratuit, à convenir</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-2">
            Samani World n'est pas responsable des retards dus à des causes extérieures (grèves, intempéries, etc.).
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">6. Paiement</h2>
          <p className="text-gray-600 leading-relaxed">
            Le paiement s'effectue soit à la livraison (espèces), soit en ligne. En cas de paiement
            en ligne, le montant est débité lors de la confirmation de commande. Aucune information
            bancaire n'est conservée sur nos serveurs.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">7. Retours et remboursements</h2>
          <p className="text-gray-600 leading-relaxed">
            Le client dispose de 7 jours à compter de la réception pour retourner un article non conforme
            ou défectueux. L'article doit être retourné dans son emballage d'origine, non porté. Les frais
            de retour sont à la charge du client sauf en cas d'erreur de notre part.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">8. Propriété intellectuelle</h2>
          <p className="text-gray-600 leading-relaxed">
            L'ensemble des contenus du site (textes, images, logos) est protégé par le droit d'auteur.
            Toute reproduction sans autorisation est interdite.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">9. Litiges</h2>
          <p className="text-gray-600 leading-relaxed">
            En cas de litige, une solution amiable sera recherchée. À défaut, les tribunaux de Dakar
            seront seuls compétents.
          </p>
        </section>
      </div>
    </div>
  );
}
