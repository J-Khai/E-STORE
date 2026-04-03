import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import ProtectedRoute from './routes/ProtectedRoute';

// Page components
import HomePage from './pages/HomePage';
import ProductPage from './pages/ProductPage';
import CheckoutPage from './pages/CheckoutPage';
import CheckoutSuccessPage from './pages/CheckoutSuccessPage'; 
import CheckoutErrorPage from './pages/CheckoutErrorPage'; 
import ProductGalleryPage from './pages/ProductGalleryPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CartPage from './pages/CartPage';
import ProfilePage from './pages/ProfilePage';
import OrderHistory from './pages/OrderHistory';

// Admin views
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminInventoryPage from './pages/admin/AdminInventoryPage';
import AdminOrdersPage from './pages/admin/AdminOrdersPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminMetricsPage from './pages/admin/AdminMetricsPage';

import Navbar from './components/common/Navbar';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <div className="min-h-screen bg-zinc-50 flex flex-col antialiased">
            <Toaster position="bottom-right" reverseOrder={false} />
            <Navbar />
            
            <main className="flex-grow">
              <Routes>
                {/* Public links */}
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductGalleryPage />} />
                <Route path="/product/:id" element={<ProductPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Customer area */}
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/checkout/success" element={<CheckoutSuccessPage />} /> 
                <Route path="/checkout/error" element={<CheckoutErrorPage />} /> 
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/profile/history" element={<OrderHistory />} />
                <Route path="/cart" element={<CartPage />} />

                {/* Admin logic */}
                <Route path="/admin" element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
                  <Route element={<AdminDashboardPage />}>
                    <Route index element={<Navigate to="/admin/metrics" replace />} />
                    <Route path="metrics" element={<AdminMetricsPage />} />
                    <Route path="inventory" element={<AdminInventoryPage />} />
                    <Route path="orders" element={<AdminOrdersPage />} />
                    <Route path="users" element={<AdminUsersPage />} />
                  </Route>
                </Route>
              </Routes>
            </main>

            <footer className="h-[72px] border-t border-[#e2e8f0] bg-white flex items-center justify-between px-12 mt-20 text-[10px] uppercase font-bold tracking-widest text-zinc-950/40">
              <div className="flex gap-8 items-center">
                <span>© 2026 E-STORE CORP</span>
                <a href="#" className="hover:text-zinc-950 transition-colors uppercase decoration-none tracking-[0.1em]">Privacy</a>
                <a href="#" className="hover:text-zinc-950 transition-colors uppercase decoration-none tracking-[0.1em]">Terms</a>
              </div>
              <div className="mono text-[10px]">VER: 1.5.0-ADMIN-MS2</div>
            </footer>
          </div>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
