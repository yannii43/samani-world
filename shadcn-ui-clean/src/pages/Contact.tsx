import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { MapPin, Phone, Mail, MessageCircle, Clock, Send } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    // Simulation d'envoi (à remplacer par un vrai endpoint)
    await new Promise((r) => setTimeout(r, 800));
    toast.success('Message envoyé ! Nous vous répondrons dans les plus brefs délais.');
    setForm({ name: '', email: '', phone: '', message: '' });
    setSending(false);
  };

  return (
    <div className="min-h-screen bg-white">
      <Helmet>
        <title>Contact — Samani World Dakar</title>
        <meta name="description" content="Contactez Samani World à Dakar. WhatsApp, email, téléphone. Notre équipe répond sous 24h pour toute question sur vos commandes." />
        <link rel="canonical" href="https://samaniworld.com/contact" />
      </Helmet>

      {/* Hero */}
      <section className="bg-black text-white py-16 text-center px-4">
        <h1 className="text-4xl font-bold mb-3" style={{ fontFamily: '"Playfair Display", serif' }}>
          Contactez-nous
        </h1>
        <p className="text-white/70 max-w-md mx-auto">
          Une question, une commande spéciale ? Notre équipe est là pour vous.
        </p>
      </section>

      <div className="container mx-auto px-4 py-12 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Formulaire */}
          <div>
            <h2 className="text-2xl font-bold mb-6">Envoyer un message</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom complet *</Label>
                <Input
                  id="name"
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="votre@email.com"
                />
              </div>
              <div>
                <Label htmlFor="phone">Téléphone</Label>
                <Input
                  id="phone"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  placeholder="+221 XX XXX XX XX"
                />
              </div>
              <div>
                <Label htmlFor="message">Message *</Label>
                <Textarea
                  id="message"
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Comment pouvons-nous vous aider ?"
                />
              </div>
              <Button type="submit" className="w-full bg-black hover:bg-gray-900" disabled={sending}>
                {sending ? 'Envoi...' : (<><Send className="mr-2 h-4 w-4" /> Envoyer le message</>)}
              </Button>
            </form>
          </div>

          {/* Infos contact */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold mb-2">Nos coordonnées</h2>
            <Card>
              <CardContent className="p-6 space-y-5">
                <div className="flex items-start gap-3">
                  <MapPin className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Adresse</p>
                    <p className="text-sm text-gray-500">Dakar, Sénégal</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Phone className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Téléphone</p>
                    <a href="tel:+221700000000" className="text-sm text-gray-500 hover:text-black">
                      +221 70 000 00 00
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">WhatsApp</p>
                    <a
                      href="https://wa.me/221700000000"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-gray-500 hover:text-black"
                    >
                      +221 70 000 00 00
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Email</p>
                    <a href="mailto:contact@samaniworld.com" className="text-sm text-gray-500 hover:text-black">
                      contact@samaniworld.com
                    </a>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Clock className="h-5 w-5 mt-0.5 shrink-0" />
                  <div>
                    <p className="font-medium">Horaires</p>
                    <p className="text-sm text-gray-500">Lun – Sam : 8h – 20h</p>
                    <p className="text-sm text-gray-500">Dim : 9h – 18h</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black text-white border-0">
              <CardContent className="p-6">
                <h3 className="font-semibold mb-2">Réponse rapide garantie</h3>
                <p className="text-sm text-white/70">
                  Nous répondons à tous les messages sous 24h. Pour une réponse immédiate,
                  contactez-nous sur WhatsApp.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
