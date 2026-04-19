// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

// Layout
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages publiques
import Index from "./pages/Index";
import ProductsPage from "./pages/ProductsPage";
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import OrderConfirmation from "./pages/OrderConfirmation";
import TrackOrder from "./pages/TrackOrder";
import NotFound from "./pages/NotFound";

// Auth
import Login from "./pages/Login";
import Register from "./pages/Register";

// Compte client (protégé)
import Account from "./pages/Account";
import Wishlist from "./pages/Wishlist";

// Pages statiques
import About from "./pages/About";
import Contact from "./pages/Contact";
import Faq from "./pages/Faq";
import Cgv from "./pages/Cgv";
import Confidentialite from "./pages/Confidentialite";

// Admin (protégé)
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminCustomers from "./pages/admin/AdminCustomers";
import AdminPromotions from "./pages/admin/AdminPromotions";
import AdminReviews from "./pages/admin/AdminReviews";
import AdminContent from "./pages/admin/AdminContent";
import AdminSales from "./pages/admin/AdminSales";

export default function App() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-1">
        <Routes>
          {/* ── PUBLIC ─────────────────────────────────────── */}
          <Route path="/" element={<Index />} />
          <Route path="/products" element={<ProductsPage />} />
          <Route path="/category/:slug" element={<Category />} />
          <Route path="/product/:slug" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-confirmation" element={<OrderConfirmation />} />
          <Route path="/order-confirmation/:id" element={<OrderConfirmation />} />
          <Route path="/track" element={<TrackOrder />} />

          {/* ── AUTH ───────────────────────────────────────── */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* ── COMPTE CLIENT (connecté) ────────────────────── */}
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

          {/* ── PAGES STATIQUES ────────────────────────────── */}
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/cgv" element={<Cgv />} />
          <Route path="/confidentialite" element={<Confidentialite />} />

          {/* ── ADMIN (admin/superadmin requis) ─────────────── */}
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/products" element={<ProtectedRoute requireAdmin><AdminProducts /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute requireAdmin><AdminCategories /></ProtectedRoute>} />
          <Route path="/admin/orders" element={<ProtectedRoute requireAdmin><AdminOrders /></ProtectedRoute>} />
          <Route path="/admin/customers" element={<ProtectedRoute requireAdmin><AdminCustomers /></ProtectedRoute>} />
          <Route path="/admin/promotions" element={<ProtectedRoute requireAdmin><AdminPromotions /></ProtectedRoute>} />
          <Route path="/admin/reviews" element={<ProtectedRoute requireAdmin><AdminReviews /></ProtectedRoute>} />
          <Route path="/admin/content" element={<ProtectedRoute requireAdmin><AdminContent /></ProtectedRoute>} />
          <Route path="/admin/sales" element={<ProtectedRoute requireAdmin><AdminSales /></ProtectedRoute>} />
          <Route path="/admin/dashboard" element={<Navigate to="/admin" replace />} />

          {/* ── 404 ────────────────────────────────────────── */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
    </div>
  );
}
