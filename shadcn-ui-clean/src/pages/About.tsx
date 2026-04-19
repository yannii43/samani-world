import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, Clock, Truck, CreditCard, Heart, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const values = [
  {
    icon: Heart,
    title: 'Passion pour la mode',
    desc: 'Chaque pièce est sélectionnée avec soin pour mettre en valeur l\'élégance africaine contemporaine.',
  },
  {
    icon: Shield,
    title: 'Qualité garantie',
    desc: 'Nous travaillons avec des créateurs et fournisseurs de confiance pour vous offrir le meilleur.',
  },
  {
    icon: Truck,
    title: 'Livraison fiable',
    desc: 'Dakar et toutes les régions du Sénégal. Votre commande suivie à chaque étape.',
  },
  {
    icon: CreditCard,
    title: 'Paiement simple',
    desc: 'Paiement à la livraison, Wave, Orange Money. Zéro surprise au checkout.',
  },
];

export default function About() {
  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>À propos de Samani World — Boutique Mode Dakar, Sénégal</title>
        <meta name="description" content="Découvrez l'histoire de Samani World, boutique de mode féminine fondée à Dakar. Robes, abayas et accessoires. Livraison partout au Sénégal." />
        <link rel="canonical" href="https://samaniworld.com/about" />
      </Helmet>

      {/* Hero */}
      <section className="bg-black text-white py-20 text-center px-4">
        <h1 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: '"Playfair Display", serif' }}>
          À propos de Samani World
        </h1>
        <p className="text-white/70 text-lg max-w-xl mx-auto">
          La mode féminine luxueuse, accessible depuis Dakar jusqu'à partout au Sénégal.
        </p>
      </section>

      {/* Notre histoire */}
      <section className="container mx-auto px-4 py-16 max-w-3xl text-center">
        <h2 className="text-3xl font-bold mb-6" style={{ fontFamily: '"Playfair Display", serif' }}>
          Notre histoire
        </h2>
        <p className="text-gray-600 leading-relaxed mb-4">
          Samani World est née de la conviction que chaque femme mérite d'avoir accès à des vêtements
          élégants et de qualité, sans se déplacer. Fondée à Dakar, notre boutique propose une sélection
          soigneusement choisie de robes, abayas, accessoires et bien plus encore.
        </p>
        <p className="text-gray-600 leading-relaxed">
          Nous croyons en un shopping en ligne simple, transparent et fiable — avec une livraison
          partout au Sénégal et un service client toujours disponible pour vous accompagner.
        </p>
      </section>

      {/* Nos valeurs */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="container mx-auto max-w-5xl">
          <h2 className="text-3xl font-bold text-center mb-10" style={{ fontFamily: '"Playfair Display", serif' }}>
            Nos engagements
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="text-center">
                <CardContent className="p-6 space-y-3">
                  <div className="h-12 w-12 rounded-full bg-black/5 flex items-center justify-center mx-auto">
                    <Icon className="h-6 w-6 text-black" />
                  </div>
                  <h3 className="font-semibold">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact rapide */}
      <section className="container mx-auto px-4 py-16 max-w-2xl">
        <h2 className="text-3xl font-bold text-center mb-8" style={{ fontFamily: '"Playfair Display", serif' }}>
          Nous contacter
        </h2>
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-3 text-gray-700">
              <MapPin className="h-5 w-5 shrink-0" />
              <span>Dakar, Sénégal</span>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Phone className="h-5 w-5 shrink-0" />
              <a href="tel:+221700000000" className="hover:underline">+221 70 000 00 00</a>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Mail className="h-5 w-5 shrink-0" />
              <a href="mailto:contact@samaniworld.com" className="hover:underline">contact@samaniworld.com</a>
            </div>
            <div className="flex items-center gap-3 text-gray-700">
              <Clock className="h-5 w-5 shrink-0" />
              <span>Lun – Sam : 8h – 20h · Dim : 9h – 18h</span>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
