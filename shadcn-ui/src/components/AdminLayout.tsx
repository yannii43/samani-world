import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  FolderTree,
  Users,
  Tag,
  Star,
  BarChart2,
  Megaphone,
  LogOut,
  Home,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore, isAdmin } from '@/lib/auth-store';
import Logo from './Logo';

interface AdminLayoutProps {
  children: React.ReactNode;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
  { icon: Package, label: 'Produits', path: '/admin/products' },
  { icon: FolderTree, label: 'Catégories', path: '/admin/categories' },
  { icon: ShoppingCart, label: 'Commandes', path: '/admin/orders' },
  { icon: Users, label: 'Clients', path: '/admin/customers' },
  { icon: Tag, label: 'Promotions', path: '/admin/promotions' },
  { icon: Star, label: 'Avis clients', path: '/admin/reviews' },
  { icon: Megaphone, label: 'Contenu boutique', path: '/admin/content' },
  { icon: BarChart2, label: 'Ventes', path: '/admin/sales' },
];

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  if (!isAdmin(user)) {
    navigate('/login', { replace: true });
    return null;
  }

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-black text-white flex flex-col z-50">
        <div className="p-6 border-b border-white/10">
          <Link to="/">
            <Logo variant="white" />
          </Link>
          <p className="text-xs text-white/50 mt-2">
            {user?.name} · <span className="capitalize">{user?.role}</span>
          </p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.path === '/admin'
                ? location.pathname === '/admin'
                : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg transition-colors text-sm ${
                  isActive
                    ? 'bg-white text-black font-semibold'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-2">
          <Link to="/">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-transparent border-white/30 text-white hover:bg-white hover:text-black"
            >
              <Home className="mr-2 h-4 w-4" />
              Retour au site
            </Button>
          </Link>
          <Button
            variant="ghost"
            size="sm"
            className="w-full text-white/70 hover:bg-white/10 hover:text-white"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
