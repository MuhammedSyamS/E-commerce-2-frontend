import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useStore } from './store/useStore';
import { ToastProvider } from './context/ToastContext';
import axios from 'axios';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Account from './pages/Account';
import EditProfile from './pages/EditProfile';
import AddressBook from './pages/settings/AddressBook';
import Notifications from './pages/settings/Notifications';
import Payments from './pages/settings/Payments';
import Security from './pages/settings/Security';

// --- ADDED MISSING IMPORTS TO FIX WHITE PAGE ---
import Orders from './pages/Orders';
import Wishlist from './pages/Wishlist';
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderDetails from './pages/OrderDetails';
import TrackOrder from './pages/TrackOrder';
import Returns from './pages/Returns';
import Contact from './pages/support/Contact';
import UserReviews from './pages/UserReviews'; // Added import
import NotFound from './pages/NotFound'; // Restored import

// Admin Pages
import AdminProducts from './pages/admin/Admin'; // Renamed from Admin
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';
import AdminLayout from './pages/admin/AdminLayout';
import AdminDashboard from './pages/admin/Dashboard';
import AdminOrders from './pages/admin/AdminOrders';
import AdminUsers from './pages/admin/AdminUsers';
import AdminSettings from './pages/admin/AdminSettings';
import AdminReviews from './pages/admin/AdminReviews';
import AdminPayments from './pages/admin/AdminPayments';
import AdminMarketing from './pages/admin/AdminMarketing';
import AdminLogs from './pages/admin/AdminLogs';
import AdminReports from './pages/admin/AdminReports'; // Added import
import AdminAnalytics from './pages/admin/AdminAnalytics'; // Added Import
import AnalyticsRevenue from './pages/admin/analytics/AnalyticsRevenue';
import AnalyticsOrders from './pages/admin/analytics/AnalyticsOrders';
import AnalyticsUsers from './pages/admin/analytics/AnalyticsUsers';

const App = () => {
  const { isCartOpen, user, setUser } = useStore();
  const location = useLocation();

  // --- SYNC LOCAL STORAGE WITH DATABASE ON MOUNT ---
  React.useEffect(() => {
    const syncUserData = async () => {
      if (!user?.token) return;
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        // Endpoint: /api/users/profile
        const { data } = await axios.get('http://localhost:5000/api/users/profile', config);

        // Update Store with Fresh DB Data
        setUser({ ...data, token: user.token });
      } catch (err) {
        console.error("Sync Failed:", err);
        // Optional: If 401, logout? For now just log.
        if (err.response?.status === 401) useStore.getState().logout();
      }
    };
    syncUserData();
  }, []); // Run once on mount

  return (
    <ToastProvider>
      <div className="font-sans text-[#1a1a1a] flex flex-col min-h-screen bg-white">
        {/* Hide standard Navbar for Admin routes? 
            Actually user likely wants standard navbar gone for admin panel.
            But simpler to just keep it or conditionally hide. 
            The AdminLayout has a sidebar. 
            If I nest AdminLayout inside Routes, Navbar is still outside.
            I won't change Navbar logic for now to avoid breaking stuff, usually Admin link is in Navbar for admins.
        */}
        <Navbar />

        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
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

            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/my-orders" element={<Orders />} />
            <Route path="/order/:id" element={<OrderDetails />} />
            <Route path="/my-reviews" element={<UserReviews />} />

            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/returns" element={<Returns />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<Checkout />} />
            <Route path="/order-success" element={<OrderSuccess />} />

            {/* ADMIN DASHBOARD ROUTES */}
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="analytics" element={<AdminAnalytics />} />
              <Route path="analytics/revenue" element={<AnalyticsRevenue />} /> {/* NEW */}
              <Route path="analytics/orders" element={<AnalyticsOrders />} />   {/* NEW */}
              <Route path="analytics/users" element={<AnalyticsUsers />} />     {/* NEW */}
              <Route path="products" element={<AdminProducts />} />
              <Route path="orders" element={<AdminOrders />} />
              <Route path="users" element={<AdminUsers />} /> {/* Added Users Route */}
              <Route path="add" element={<AddProduct />} />
              <Route path="edit/:id" element={<EditProduct />} />
              <Route path="settings" element={<AdminSettings />} />
              <Route path="reviews" element={<AdminReviews />} />
              <Route path="marketing" element={<AdminMarketing />} />
              <Route path="logs" element={<AdminLogs />} />
              <Route path="reports" element={<AdminReports />} />
              <Route path="payments" element={<AdminPayments />} /> {/* Added Payments Route */}
            </Route>

            {/* CATCH ALL */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        {!location.pathname.startsWith('/admin') && <Footer />}
        {isCartOpen && <CartDrawer />}
      </div>
    </ToastProvider>
  );
};

export default App;