import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

const faqs = [
  {
    category: 'Commandes',
    items: [
      {
        q: 'Comment passer une commande ?',
        a: 'Ajoutez les articles de votre choix au panier, puis cliquez sur "Passer commande". Remplissez vos informations de livraison et confirmez. Vous recevrez un numéro de commande pour le suivi.',
      },
      {
        q: 'Puis-je modifier ou annuler ma commande ?',
        a: 'Vous pouvez annuler ou modifier une commande tant qu\'elle n\'a pas été mise en préparation. Contactez-nous rapidement par WhatsApp ou email.',
      },
      {
        q: 'Comment suivre ma commande ?',
        a: 'Rendez-vous sur la page "Suivre ma commande" avec votre numéro de commande et votre numéro de téléphone. Vous verrez chaque étape en temps réel.',
      },
    ],
  },
  {
    category: 'Livraison',
    items: [
      {
        q: 'Quels sont les délais de livraison ?',
        a: 'Dakar : 24 à 48h. Hors Dakar (régions) : 2 à 4 jours ouvrables. Les commandes passées avant 14h sont expédiées le jour même.',
      },
      {
        q: 'Quels sont les frais de livraison ?',
        a: 'Dakar : 2 000 FCFA. Hors Dakar : 5 000 FCFA. Click & Collect (retrait en boutique) : Gratuit.',
      },
      {
        q: 'Livrez-vous partout au Sénégal ?',
        a: 'Oui, nous livrons dans toutes les régions du Sénégal via nos partenaires logistiques.',
      },
    ],
  },
  {
    category: 'Paiement',
    items: [
      {
        q: 'Quels modes de paiement acceptez-vous ?',
        a: 'Paiement à la livraison (espèces). Paiement en ligne via Wave, Orange Money (en cours d\'intégration).',
      },
      {
        q: 'Le paiement à la livraison est-il sécurisé ?',
        a: 'Absolument. Vous payez uniquement lorsque vous recevez et vérifiez votre commande. Pas de risque.',
      },
    ],
  },
  {
    category: 'Produits & Tailles',
    items: [
      {
        q: 'Comment choisir ma taille ?',
        a: 'Chaque fiche produit indique le guide des tailles disponibles. En cas de doute, contactez-nous sur WhatsApp avec vos mesures.',
      },
      {
        q: 'Les photos représentent-elles fidèlement les produits ?',
        a: 'Oui, nos photos sont prises en conditions réelles. Les couleurs peuvent légèrement varier selon l\'écran.',
      },
      {
        q: 'Puis-je retourner un article ?',
        a: 'Oui, sous 7 jours après réception, si l\'article est dans son état d\'origine. Contactez-nous pour initier le retour.',
      },
    ],
  },
  {
    category: 'Compte client',
    items: [
      {
        q: 'Est-ce obligatoire de créer un compte pour commander ?',
        a: 'Non, vous pouvez commander sans compte. Cependant, un compte vous permet de suivre vos commandes et de gérer vos favoris facilement.',
      },
      {
        q: 'J\'ai oublié mon mot de passe, que faire ?',
        a: 'Cliquez sur "Mot de passe oublié" sur la page de connexion. Vous recevrez un lien de réinitialisation par email.',
      },
    ],
  },
];

export default function Faq() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>FAQ — Livraison, Paiement, Commandes | Samani World Sénégal</title>
        <meta name="description" content="Questions fréquentes sur Samani World : délais de livraison au Sénégal, paiement à la livraison, Wave, Orange Money, retours et suivi de commande." />
        <link rel="canonical" href="https://samaniworld.com/faq" />
      </Helmet>

      {/* Hero */}
      <section className="bg-black text-white py-16 text-center px-4">
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
          Questions fréquentes
        </h1>
        <p className="text-white/70 max-w-md mx-auto">
          Trouvez rapidement des réponses à vos questions.
        </p>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {faqs.map(({ category, items }) => (
          <div key={category} className="mb-8">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 border-b pb-2">{category}</h2>
            <Accordion type="single" collapsible className="space-y-2">
              {items.map((item, i) => (
                <AccordionItem key={i} value={`${category}-${i}`} className="border rounded-lg px-4">
                  <AccordionTrigger className="text-left text-sm font-medium py-4">
                    {item.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-600 pb-4 leading-relaxed">
                    {item.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        <div className="mt-10 p-6 bg-gray-50 rounded-xl text-center">
          <p className="text-gray-600 mb-3">Vous n'avez pas trouvé votre réponse ?</p>
          <Link to="/contact" className="inline-flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-lg text-sm hover:bg-gray-900 transition-colors">
            Contactez-nous
          </Link>
        </div>
      </div>
    </div>
  );
}
