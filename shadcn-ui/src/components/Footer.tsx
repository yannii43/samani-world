import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Instagram, Facebook, MessageCircle } from 'lucide-react';
import Logo from './Logo';

const shopLinks = [
  { label: 'Nouveautés', href: '/products?filter=new' },
  { label: 'Robes', href: '/category/robes' },
  { label: 'Abaya', href: '/category/abaya' },
  { label: 'Sacs', href: '/category/sacs' },
  { label: 'Chaussures', href: '/category/chaussures' },
];

const infoLinks = [
  { label: 'À propos', href: '/about' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Suivre ma commande', href: '/track' },
  { label: 'Contact', href: '/contact' },
];

const legalLinks = [
  { label: 'Conditions générales de vente', href: '/cgv' },
  { label: 'Politique de confidentialité', href: '/confidentialite' },
];

export default function Footer() {
  return (
    <footer className="bg-black text-white mt-16">
      {/* Bande info livraison */}
      <div className="border-b border-white/10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-wrap justify-center gap-8 text-sm text-white/70">
            <span>🚚 Livraison Dakar : 2 000 FCFA</span>
            <span>🌍 Hors Dakar : 5 000 FCFA</span>
            <span>🏪 Click &amp; Collect : Gratuit</span>
            <span>💳 Paiement à la livraison</span>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Colonne 1 — Brand */}
          <div className="space-y-4">
            <Logo variant="white" linkTo="/" />
            <p className="text-sm text-white/60 leading-relaxed">
              La mode féminine luxueuse à portée de main. Robes, abayas, accessoires —
              livraison partout au Sénégal.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <a
                href="https://www.instagram.com/samani_world/"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Instagram Samani World"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://web.facebook.com/profile.php?id=61562122352393"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="Facebook Samani World"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://www.tiktok.com/@samani_world"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="TikTok Samani World"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.32 6.32 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z"/>
                </svg>
              </a>
              <a
                href="https://wa.me/221700000000"
                target="_blank"
                rel="noopener noreferrer"
                className="h-9 w-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                aria-label="WhatsApp Samani World"
              >
                <MessageCircle className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Colonne 2 — Boutique */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Boutique</h3>
            <ul className="space-y-2">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 3 — Informations */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Informations</h3>
            <ul className="space-y-2">
              {infoLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="text-sm text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Colonne 4 — Contact */}
          <div>
            <h3 className="font-semibold text-sm uppercase tracking-wider mb-4">Contact</h3>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-sm text-white/60">
                <MapPin className="h-4 w-4 mt-0.5 shrink-0" />
                <span>Dakar, Sénégal</span>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Phone className="h-4 w-4 shrink-0" />
                <a href="tel:+221700000000" className="hover:text-white transition-colors">
                  +221 70 000 00 00
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <Mail className="h-4 w-4 shrink-0" />
                <a href="mailto:contact@samaniworld.com" className="hover:text-white transition-colors">
                  contact@samaniworld.com
                </a>
              </li>
              <li className="flex items-center gap-2 text-sm text-white/60">
                <MessageCircle className="h-4 w-4 shrink-0" />
                <a
                  href="https://wa.me/221700000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition-colors"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bas du footer */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-white/40">
            © {new Date().getFullYear()} Samani World. Tous droits réservés.
          </p>
          <div className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className="text-xs text-white/40 hover:text-white/70 transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
