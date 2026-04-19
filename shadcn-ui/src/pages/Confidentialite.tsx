export default function Confidentialite() {
  return (
    <div className="min-h-screen bg-white">
      <section className="bg-black text-white py-16 text-center px-4">
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
          Politique de confidentialité
        </h1>
        <p className="text-white/70 text-sm">Dernière mise à jour : Janvier 2025</p>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">1. Données collectées</h2>
          <p className="text-gray-600 leading-relaxed mb-2">
            Lors de vos achats ou de la création d'un compte, nous collectons :
          </p>
          <ul className="text-gray-600 space-y-1 list-disc list-inside">
            <li>Nom et prénom</li>
            <li>Adresse email</li>
            <li>Numéro de téléphone</li>
            <li>Adresse de livraison</li>
            <li>Historique des commandes</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">2. Utilisation des données</h2>
          <p className="text-gray-600 leading-relaxed mb-2">
            Vos données sont utilisées pour :
          </p>
          <ul className="text-gray-600 space-y-1 list-disc list-inside">
            <li>Traiter et livrer vos commandes</li>
            <li>Gérer votre compte client</li>
            <li>Vous envoyer les confirmations de commande</li>
            <li>Améliorer nos services</li>
            <li>Vous contacter en cas de problème avec votre commande</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">3. Conservation des données</h2>
          <p className="text-gray-600 leading-relaxed">
            Vos données sont conservées pendant la durée de votre relation commerciale avec Samani World,
            et au maximum 3 ans après votre dernier achat. Vous pouvez demander la suppression de votre
            compte à tout moment.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">4. Partage des données</h2>
          <p className="text-gray-600 leading-relaxed">
            Vos données ne sont pas vendues ni partagées avec des tiers, sauf dans les cas nécessaires
            à l'exécution de votre commande (transporteurs, prestataires de paiement) ou si la loi l'exige.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">5. Cookies</h2>
          <p className="text-gray-600 leading-relaxed">
            Notre site utilise des cookies techniques nécessaires au bon fonctionnement (session, panier).
            Nous n'utilisons pas de cookies publicitaires ou de tracking tiers sans votre consentement.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">6. Sécurité</h2>
          <p className="text-gray-600 leading-relaxed">
            Vos mots de passe sont hashés et jamais stockés en clair. Les communications sont
            sécurisées par HTTPS. Nous appliquons les bonnes pratiques de sécurité pour protéger
            vos données.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">7. Vos droits</h2>
          <p className="text-gray-600 leading-relaxed mb-2">
            Conformément aux lois en vigueur, vous disposez des droits suivants :
          </p>
          <ul className="text-gray-600 space-y-1 list-disc list-inside">
            <li>Droit d'accès à vos données</li>
            <li>Droit de rectification</li>
            <li>Droit à l'effacement ("droit à l'oubli")</li>
            <li>Droit à la portabilité</li>
          </ul>
          <p className="text-gray-600 leading-relaxed mt-3">
            Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@samaniworld.com" className="underline">contact@samaniworld.com</a>
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-xl font-bold mb-3">8. Contact</h2>
          <p className="text-gray-600 leading-relaxed">
            Pour toute question relative à cette politique, contactez-nous :
            <br />
            Email : contact@samaniworld.com
            <br />
            Téléphone : +221 70 000 00 00
          </p>
        </section>
      </div>
    </div>
  );
}
