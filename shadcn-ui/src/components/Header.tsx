// src/components/Header.tsx
import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShoppingCart, Menu, User, LogOut, LayoutDashboard, Heart, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Logo from "@/components/Logo";
import { cart } from "@/lib/cart";
import { useAuthStore } from "@/lib/auth-store";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Header() {
  const navigate = useNavigate();
  const [totalItems, setTotalItems] = useState(() => cart.totals().count);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onChange = () => setTotalItems(cart.totals().count);
    window.addEventListener("cart:changed", onChange);
    return () => window.removeEventListener("cart:changed", onChange);
  }, []);

  useEffect(() => {
    if (searchOpen) searchInputRef.current?.focus();
  }, [searchOpen]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (q) {
      navigate(`/products?q=${encodeURIComponent(q)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const { isAuthenticated, user, logout } = useAuthStore();
  const isAdminUser = user?.role === 'admin' || user?.role === 'superadmin';

  const navigation = [
    { name: "Nouveautés", href: "/products?filter=new" },
    { name: "Robes", href: "/category/robes" },
    { name: "Abaya", href: "/category/abaya" },
    { name: "Sacs", href: "/category/sacs" },
    { name: "Chaussures", href: "/category/chaussures" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white shadow-sm">
      <div className="bg-black text-white text-center py-2 text-sm">
        <p>✨ Livraison gratuite pour toute commande supérieure à 50 000 FCFA</p>
      </div>

      <div className="container mx-auto px-4">
        <div className="flex h-20 items-center justify-between">
          <Logo />

          <nav className="hidden lg:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="text-sm font-medium text-gray-700 hover:text-black transition-colors relative group"
              >
                {item.name}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all group-hover:w-full" />
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            {/* Search bar */}
            {searchOpen ? (
              <form onSubmit={handleSearchSubmit} className="flex items-center">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un produit..."
                  className="border border-gray-300 rounded-l-md px-3 py-1.5 text-sm w-48 md:w-64 focus:outline-none focus:border-black"
                />
                <Button type="submit" size="icon" className="rounded-l-none rounded-r-md bg-black hover:bg-gray-900 h-9 w-9">
                  <Search className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="ml-1"
                  onClick={() => { setSearchOpen(false); setSearchQuery(""); }}
                  aria-label="Fermer la recherche"
                >
                  <X className="h-4 w-4" />
                </Button>
              </form>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                aria-label="Recherche"
                onClick={() => setSearchOpen(true)}
              >
                <Search className="h-5 w-5" />
              </Button>
            )}

            {isAuthenticated && (
              <Link to="/wishlist">
                <Button variant="ghost" size="icon" aria-label="Wishlist">
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>
            )}

            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative" aria-label="Panier">
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs bg-black hover:bg-black"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
            </Link>

            {isAuthenticated && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Compte">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>

                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2">
                    <p className="text-sm font-medium">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.email}</p>
                  </div>

                  <DropdownMenuSeparator />

                  {isAdminUser && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="cursor-pointer">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Administration
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}

                  <DropdownMenuItem asChild>
                    <Link to="/account" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      Mon compte
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onClick={() => logout()} className="cursor-pointer text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="ghost" className="hidden md:flex hover:text-black">
                  <User className="mr-2 h-4 w-4" />
                  Connexion
                </Button>
              </Link>
            )}

            <Sheet>
              <SheetTrigger asChild className="lg:hidden">
                <Button variant="ghost" size="icon" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>

              <SheetContent>
                <div className="mt-8">
                  <Logo className="mb-8" linkTo="/" />
                  <nav className="flex flex-col space-y-4">
                    {navigation.map((item) => (
                      <Link
                        key={item.name}
                        to={item.href}
                        className="text-lg font-medium text-gray-700 hover:text-black transition-colors"
                      >
                        {item.name}
                      </Link>
                    ))}
                    {!isAuthenticated && (
                      <Link to="/login" className="text-lg font-medium text-black hover:text-gray-700 transition-colors">
                        Connexion
                      </Link>
                    )}
                  </nav>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
}
