import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';
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
import Admin from './pages/admin/Admin';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';

const App = () => {
  const { isCartOpen, user, setUser } = useStore();

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
    <div className="font-sans text-[#1a1a1a] flex flex-col min-h-screen bg-white">
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

          <Route path="/wishlist" element={<Wishlist />} />
          <Route path="/my-orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          <Route path="/my-reviews" element={<UserReviews />} /> {/* New Route */}

          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/add" element={<AddProduct />} />
          <Route path="/admin/edit/:id" element={<EditProduct />} />

          {/* CATCH ALL - Works now because NotFound is imported */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      {isCartOpen && <CartDrawer />}
    </div>
  );
};

export default App;