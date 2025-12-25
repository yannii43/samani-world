import { MapPin, Phone, Mail, Clock, Truck, CreditCard } from 'lucide-react';
import Header from '@/components/Header';
import { Card, CardContent } from '@/components/ui/card';

export default function About() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-8">À Propos</h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              Qui sommes-nous ?
            </h2>
            <p className="text-gray-600 leading-relaxed mb-4">
              DakarShop est votre boutique en ligne de confiance à Dakar. Nous
              offrons une large sélection de produits de qualité dans les
              catégories électronique, mode et maison.
            </p>
            <p className="text-gray-600 leading-relaxed mb-4">
              Notre mission est de rendre le shopping en ligne accessible,
              pratique et sécurisé pour tous les habitants de Dakar. Nous nous
              engageons à fournir des produits authentiques avec un service
              client exceptionnel.
            </p>
            <img
              src="/assets/delivery-dakar.jpg"
              alt="Livraison à Dakar"
              className="rounded-lg shadow-md"
            />
          </div>

          <div className="space-y-6">
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Informations de Contact
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-[#00A86B] mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Adresse</p>
                      <p className="text-gray-600">Dakar, Sénégal</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 text-[#00A86B] mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Téléphone</p>
                      <p className="text-gray-600">+221 XX XXX XX XX</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 text-[#00A86B] mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Email</p>
                      <p className="text-gray-600">contact@dakarshop.sn</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 text-[#00A86B] mt-1" />
                    <div>
                      <p className="font-medium text-gray-900">Horaires</p>
                      <p className="text-gray-600">Lun - Sam: 8h - 20h</p>
                      <p className="text-gray-600">Dim: 9h - 18h</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Zones de Livraison
                </h3>
                <p className="text-gray-600 mb-3">
                  Nous livrons dans tous les quartiers de Dakar:
                </p>
                <ul className="grid grid-cols-2 gap-2 text-gray-600">
                  <li>• Plateau</li>
                  <li>• Médina</li>
                  <li>• Parcelles Assainies</li>
                  <li>• Almadies</li>
                  <li>• Ouakam</li>
                  <li>• Yoff</li>
                  <li>• Grand Dakar</li>
                  <li>• Point E</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-[#00A86B]/10 flex items-center justify-center flex-shrink-0">
                  <Truck className="h-6 w-6 text-[#00A86B]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Livraison Rapide
                  </h3>
                  <p className="text-gray-600">
                    Livraison gratuite dans tout Dakar sous 24-48h. Suivi de
                    commande en temps réel et notification par SMS.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="h-12 w-12 rounded-full bg-[#00A86B]/10 flex items-center justify-center flex-shrink-0">
                  <CreditCard className="h-6 w-6 text-[#00A86B]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    Paiement Flexible
                  </h3>
                  <p className="text-gray-600">
                    Paiement à la livraison en espèces ou par Mobile Money
                    (Orange Money, Wave, Free Money). Transactions 100%
                    sécurisées.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}