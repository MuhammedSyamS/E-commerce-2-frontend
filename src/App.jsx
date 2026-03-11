import React, { useState, useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import { ToastProvider } from './context/ToastContext';
import { Loader2 } from 'lucide-react';

// Components (Keep Critical Components Static for LCP)
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import ErrorBoundary from './components/ErrorBoundary';
import PWAInstallPrompt from './components/PWAInstallPrompt';
import ScrollToTop from './components/ScrollToTop';

// Lazy Load Pages
const Home = lazyWithRetry(() => import('./pages/Home'));
const Shop = lazyWithRetry(() => import('./pages/Shop'));
const ProductDetails = lazyWithRetry(() => import('./pages/ProductDetails'));
const SocialFeed = lazyWithRetry(() => import('./pages/SocialFeed'));
const Login = lazyWithRetry(() => import('./pages/Login'));
const Register = lazyWithRetry(() => import('./pages/Register'));
const ForgotPassword = lazyWithRetry(() => import('./pages/ForgotPassword'));

import { lazyWithRetry } from './utils/lazyWithRetry';

// Account & Settings
const Account = lazyWithRetry(() => import('./pages/Account'));
const EditProfile = lazyWithRetry(() => import('./pages/EditProfile'));
const LoyaltyLedger = lazyWithRetry(() => import('./pages/account/LoyaltyLedger'));
const AddressBook = lazyWithRetry(() => import('./pages/settings/AddressBook'));
const Notifications = lazyWithRetry(() => import('./pages/settings/Notifications'));
const Payments = lazyWithRetry(() => import('./pages/settings/Payments'));
const Security = lazyWithRetry(() => import('./pages/settings/Security'));
const Settings = lazyWithRetry(() => import('./pages/settings/Settings'));

// Orders & Checkout
const Wishlist = lazyWithRetry(() => import('./pages/Wishlist'));
const SharedWishlist = lazyWithRetry(() => import('./pages/SharedWishlist')); // NEW
const Orders = lazyWithRetry(() => import('./pages/Orders'));
const OrderDetails = lazyWithRetry(() => import('./pages/OrderDetails'));
const MyReturns = lazyWithRetry(() => import('./pages/MyReturns'));
const UserReviews = lazyWithRetry(() => import('./pages/UserReviews'));
const TrackOrder = lazyWithRetry(() => import('./pages/TrackOrder')); // NEW
const Returns = lazyWithRetry(() => import('./pages/Returns'));
const Contact = lazyWithRetry(() => import('./pages/support/Contact'));
const Checkout = lazyWithRetry(() => import('./pages/Checkout'));
const OrderSuccess = lazyWithRetry(() => import('./pages/OrderSuccess'));
const NotFound = lazyWithRetry(() => import('./pages/NotFound'));
const Reviews = lazyWithRetry(() => import('./pages/Reviews'));
const SupportHub = lazyWithRetry(() => import('./pages/SupportHub'));
const ReturnPortal = lazyWithRetry(() => import('./pages/ReturnPortal'));
const Invoice = lazyWithRetry(() => import('./pages/Invoice'));
const ReviewDetails = lazyWithRetry(() => import('./pages/ReviewDetails'));

// Content Pages
const About = lazyWithRetry(() => import('./pages/About'));
const Shipping = lazyWithRetry(() => import('./pages/Shipping'));
const CareGuide = lazyWithRetry(() => import('./pages/CareGuide'));
const Privacy = lazyWithRetry(() => import('./pages/Privacy'));
const Terms = lazyWithRetry(() => import('./pages/Terms'));
const HelpCenter = lazyWithRetry(() => import('./pages/support/HelpCenter')); // NEW: Added HelpCenter lazy import
const TicketForm = lazyWithRetry(() => import('./pages/support/TicketForm'));

// Content Pages
const Blog = lazyWithRetry(() => import('./pages/Blog')); // NEW
const BlogPost = lazyWithRetry(() => import('./pages/BlogPost')); // NEW

// Admin Pages
const AdminLayout = lazyWithRetry(() => import('./pages/admin/AdminLayout'));
const AdminDashboard = lazyWithRetry(() => import('./pages/admin/Dashboard'));
const AdminAnalytics = lazyWithRetry(() => import('./pages/admin/AdminAnalytics'));
const AnalyticsRevenue = lazyWithRetry(() => import('./pages/admin/analytics/AnalyticsRevenue')); // Explicit Import
const AnalyticsOrders = lazyWithRetry(() => import('./pages/admin/analytics/AnalyticsOrders'));
const AnalyticsUsers = lazyWithRetry(() => import('./pages/admin/analytics/AnalyticsUsers'));
const AdminProducts = lazyWithRetry(() => import('./pages/admin/Admin'));
const AdminHealth = lazyWithRetry(() => import('./pages/admin/AdminHealth'));
const AddProduct = lazyWithRetry(() => import('./pages/admin/AddProduct'));
const EditProduct = lazyWithRetry(() => import('./pages/admin/EditProduct'));
const AdminOrders = lazyWithRetry(() => import('./pages/admin/AdminOrders'));
const AdminBulkEditor = lazyWithRetry(() => import('./pages/admin/AdminBulkEditor'));
const AdminReturns = lazyWithRetry(() => import('./pages/admin/AdminReturns'));
const AdminUsers = lazyWithRetry(() => import('./pages/admin/AdminUsers'));
const AdminSettings = lazyWithRetry(() => import('./pages/admin/AdminSettings'));
const AdminReviews = lazyWithRetry(() => import('./pages/admin/AdminReviews'));
const AdminPayments = lazyWithRetry(() => import('./pages/admin/AdminPayments'));
const AdminMarketing = lazyWithRetry(() => import('./pages/admin/AdminMarketing'));
const AdminLooks = lazyWithRetry(() => import('./pages/admin/AdminLooks')); // NEW
const AdminBlog = lazyWithRetry(() => import('./pages/admin/AdminBlog')); // NEW
const AdminLogs = lazyWithRetry(() => import('./pages/admin/AdminLogs'));
const AdminReports = lazyWithRetry(() => import('./pages/admin/AdminReports'));
const AdminSupport = lazyWithRetry(() => import('./pages/admin/AdminSupport'));
const AdminEnquiries = lazyWithRetry(() => import('./pages/admin/AdminEnquiries')); // NEW
// const HelpCenter = lazyWithRetry(() => import('./pages/help/HelpCenter')); // Replaced by earlier import or different path?
// Keeping existing import on line 52 as: const HelpCenter = lazyWithRetry(() => import('./pages/support/HelpCenter'));
const TicketDetails = lazyWithRetry(() => import('./pages/help/TicketDetails'));
const SupportTickets = lazyWithRetry(() => import('./pages/help/SupportTickets'));


// Loading Fallback
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen bg-white">
    <Loader2 className="animate-spin text-zinc-300" size={40} />
  </div>
);

import api from './api/instance';

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
        // Endpoint: /api/users/profile
        const { data } = await api.get('/users/profile');

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
          {/* Navbar Hidden on Full Screen Review only */}
          {!location.pathname.startsWith('/review/') && <Navbar />}

          <main className="flex-grow">
            <ScrollToTop />
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/community" element={<SocialFeed />} />
                <Route path="/looks" element={<SocialFeed />} />
                <Route path="/faq" element={<SupportHub />} />
                <Route path="/support" element={<SupportHub />} />
                <Route path="/returns-portal" element={<ReturnPortal />} />
                <Route path="/track-order" element={<TrackOrder />} />
                <Route path="/product/:slug" element={<ProductDetails />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />

                {/* USER ACCOUNT ROUTES */}
                <Route path="/account" element={<Account />} />
                <Route path="/account/loyalty" element={<LoyaltyLedger />} />
                <Route path="/account/edit" element={<EditProfile />} />
                <Route path="/account/addresses" element={<AddressBook />} />
                <Route path="/account/notifications" element={<Notifications />} />
                <Route path="/account/payments" element={<Payments />} />
                <Route path="/account/security" element={<Security />} />
                <Route path="/account/settings" element={<Settings />} /> {/* Shared Settings Hub */}

                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/wishlist/shared/:userId" element={<SharedWishlist />} />
                <Route path="/my-orders" element={<Orders />} />
                <Route path="/order/:id" element={<OrderDetails />} />
                <Route path="/my-returns" element={<MyReturns />} /> {/* New Route */}
                <Route path="/my-reviews" element={<UserReviews />} />



                <Route path="/returns" element={<Returns />} />

                <Route path="/reviews" element={<Reviews />} />
                <Route path="/review/:reviewId" element={<ReviewDetails />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/order-success" element={<OrderSuccess />} />
                <Route path="/support/ticket" element={<TicketForm />} />
                <Route path="/support-tickets" element={<SupportTickets />} />
                <Route path="/ticket/:id" element={<TicketDetails />} />
                <Route path="/invoice/:id" element={<Invoice />} />

                {/* CONTENT ROUTES */}
                <Route path="/about" element={<About />} />
                <Route path="/shipping" element={<Shipping />} />
                <Route path="/care-guide" element={<CareGuide />} />
                <Route path="/privacy" element={<Privacy />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/blog/:slug" element={<BlogPost />} />

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
                  <Route path="products/bulk" element={<AdminBulkEditor />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="returns" element={<AdminReturns />} /> {/* NEW ROUTE */}
                  <Route path="looks" element={<AdminLooks />} /> {/* NEW COMMUNITY MODERATION */}
                  <Route path="support" element={<AdminSupport />} /> {/* NEW SUPPORT */}
                  <Route path="enquiries" element={<AdminEnquiries />} /> {/* NEW ENQUIRIES */}
                  <Route path="payments" element={<AdminPayments />} />
                  <Route path="marketing" element={<AdminMarketing />} />
                  <Route path="blog" element={<AdminBlog />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="logs" element={<AdminLogs />} />
                  <Route path="health" element={<AdminHealth />} />
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
