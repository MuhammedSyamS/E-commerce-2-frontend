import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import { ToastProvider } from './context/ToastContext';
import axios from 'axios';
import { Loader2 } from 'lucide-react';

// Components (Keep Critical Components Static for LCP)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/PWAInstallPrompt';

// Lazy Load Pages
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductDetails = lazy(() => import('./pages/ProductDetails'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));

// Account & Settings
const Account = lazy(() => import('./pages/Account'));
const EditProfile = lazy(() => import('./pages/EditProfile'));
const AddressBook = lazy(() => import('./pages/settings/AddressBook'));
const Notifications = lazy(() => import('./pages/settings/Notifications'));
const Payments = lazy(() => import('./pages/settings/Payments'));
const Security = lazy(() => import('./pages/settings/Security'));
const Settings = lazy(() => import('./pages/settings/Settings'));

// Orders & Checkout
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Orders = lazy(() => import('./pages/Orders'));
const OrderDetails = lazy(() => import('./pages/OrderDetails'));
const MyReturns = lazy(() => import('./pages/MyReturns'));
const UserReviews = lazy(() => import('./pages/UserReviews'));
const TrackOrder = lazy(() => import('./pages/TrackOrder')); // NEW
const Returns = lazy(() => import('./pages/Returns'));
const Contact = lazy(() => import('./pages/support/Contact'));
const Checkout = lazy(() => import('./pages/Checkout'));
const OrderSuccess = lazy(() => import('./pages/OrderSuccess'));
const NotFound = lazy(() => import('./pages/NotFound'));
const Reviews = lazy(() => import('./pages/Reviews')); // NEW

// Content Pages
const About = lazy(() => import('./pages/About'));
const Shipping = lazy(() => import('./pages/Shipping'));
const CareGuide = lazy(() => import('./pages/CareGuide'));
const Privacy = lazy(() => import('./pages/Privacy'));
const Terms = lazy(() => import('./pages/Terms'));
const HelpCenter = lazy(() => import('./pages/support/HelpCenter')); // NEW: Added HelpCenter lazy import

// Admin Pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazy(() => import('./pages/admin/Dashboard'));
const AdminAnalytics = lazy(() => import('./pages/admin/AdminAnalytics'));
const AnalyticsRevenue = lazy(() => import('./pages/admin/analytics/AnalyticsRevenue')); // Explicit Import
const AnalyticsOrders = lazy(() => import('./pages/admin/analytics/AnalyticsOrders'));
const AnalyticsUsers = lazy(() => import('./pages/admin/analytics/AnalyticsUsers'));
const AdminProducts = lazy(() => import('./pages/admin/Admin'));
const AddProduct = lazy(() => import('./pages/admin/AddProduct'));
const EditProduct = lazy(() => import('./pages/admin/EditProduct'));
const AdminOrders = lazy(() => import('./pages/admin/AdminOrders'));
const AdminReturns = lazy(() => import('./pages/admin/AdminReturns'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminPayments = lazy(() => import('./pages/admin/AdminPayments'));
const AdminMarketing = lazy(() => import('./pages/admin/AdminMarketing'));
const AdminLogs = lazy(() => import('./pages/admin/AdminLogs'));
const AdminReports = lazy(() => import('./pages/admin/AdminReports'));


// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <Loader2 className="animate-spin text-zinc-300" size={40} />
  </div>
);

const App = () => {
  const { isCartOpen, user, setUser, fetchFlashSale } = useStore();
  const location = useLocation();

  // --- SYNC LOCAL STORAGE WITH DATABASE ON MOUNT ---
  React.useEffect(() => {
    fetchFlashSale(); // Fetch Active Sale Global
    const syncUserData = async () => {
      // Check both state user token and localStorage token
      const token = user?.token || localStorage.getItem('token');
      if (!token) return;

      try {
        const config = { headers: { Authorization: `Bearer ${token}` } };
        // Endpoint: /api/users/profile
        const { data } = await axios.get('http://localhost:5000/api/users/profile', config);

        // Update Store with Fresh DB Data
        // IMPORTANT: Ensure we keep the token!
        setUser({ ...data, token: token });
      } catch (err) {
        console.error("Sync Failed:", err);
        // Optional: If 401, logout? For now just log.
        if (err.response?.status === 401) useStore.getState().logout();
      }
    };
    syncUserData();

    // Refresh Flash Sale every minute
    const interval = setInterval(fetchFlashSale, 60000);
    return () => clearInterval(interval);
  }, []); // Run once on mount

  return (
    <ErrorBoundary>
      <ToastProvider>
        <div className="font-sans text-[#1a1a1a] flex flex-col min-h-screen bg-white">
          {/* Navbar Hidden on Admin Routes to prevent overlap/layout conflicts */}
          {/* GLOBAL NAVBAR (Visible everywhere, handles Admin/User logic internally) */}
          <Navbar />

          <main className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/faq" element={<HelpCenter />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/product/:slug" element={<ProductDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* USER ACCOUNT ROUTES */}
                <Route path="/account" element={<Account />} />
                <Route path="/account/edit" element={<EditProfile />} />
                <Route path="/account/addresses" element={<AddressBook />} />
                <Route path="/account/notifications" element={<Notifications />} />
                <Route path="/account/payments" element={<Payments />} />
                <Route path="/account/security" element={<Security />} />
                <Route path="/account/settings" element={<Settings />} /> {/* Shared Settings Hub */}

                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/my-orders" element={<Orders />} />
                <Route path="/order/:id" element={<OrderDetails />} />
                <Route path="/my-returns" element={<MyReturns />} /> {/* New Route */}
                <Route path="/my-reviews" element={<UserReviews />} />

                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/returns" element={<Returns />} />
                <Route path="/reviews" element={<Reviews />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />

                {/* CONTENT ROUTES */}
                <Route path="/about" element={<About />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/care-guide" element={<CareGuide />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />

                {/* ADMIN DASHBOARD ROUTES */}
                <Route path="/admin/*" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} /> {/* Admin Dashboard */}
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="analytics/revenue" element={<AnalyticsRevenue />} />
                  <Route path="analytics/orders" element={<AnalyticsOrders />} />
                  <Route path="analytics/users" element={<AnalyticsUsers />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="products/add" element={<AddProduct />} />
                  <Route path="products/edit/:id" element={<EditProduct />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="returns" element={<AdminReturns />} /> {/* NEW ROUTE */}
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="marketing" element={<AdminMarketing />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="logs" element={<AdminLogs />} />
                  <Route path="settings" element={<AdminSettings />} />
                  <Route path="reports" element={<AdminReports />} />
                  {/* <Route path="analytics" element={<AdminAnalytics />} /> */}
                </Route>

                {/* CATCH ALL */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </main>

          {!location.pathname.startsWith('/admin') && <Footer />}
          {isCartOpen && <CartDrawer />}
          <PWAInstallPrompt />
        </div>
      </ToastProvider>
    </ErrorBoundary>
  );
};

export default App;