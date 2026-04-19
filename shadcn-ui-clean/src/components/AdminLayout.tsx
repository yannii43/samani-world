import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  ShoppingCart, 
  FolderTree, 
  Settings, 
  LogOut,
  Home
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/lib/auth-store';
import Logo from './Logo';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  if (!user || user.role !== 'admin') {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin/dashboard' },
    { icon: Package, label: 'Produits', path: '/admin/products' },
    { icon: ShoppingCart, label: 'Commandes', path: '/admin/orders' },
    { icon: FolderTree, label: 'Catégories', path: '/admin/categories' },
    { icon: Settings, label: 'Options', path: '/admin/options' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-black text-white p-6 z-50">
        <Link to="/" className="block mb-8">
          <Logo variant="white" />
        </Link>

        <nav className="space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white text-black'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-6 left-6 right-6 space-y-2">
          <Link to="/">
            <Button variant="outline" className="w-full bg-transparent border-white text-white hover:bg-white hover:text-black">
              <Home className="mr-2 h-4 w-4" />
              Retour au site
            </Button>
          </Link>
          <Button
            variant="ghost"
            className="w-full text-white hover:bg-white/10"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Déconnexion
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 p-8">
        <div className="max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}