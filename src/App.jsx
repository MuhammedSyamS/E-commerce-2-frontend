import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { useStore } from './store/useStore';

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
import Account from './pages/Account';
import Orders from './pages/Orders'; 
import Wishlist from './pages/Wishlist'; // <--- 1. ADD THIS IMPORT
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import OrderDetails from './pages/OrderDetails';
import TrackOrder from './pages/TrackOrder';
import Returns from './pages/Returns';
import NotFound from './pages/NotFound';
import Contact from './pages/support/Contact'; 

// Admin
import Admin from './pages/admin/Admin';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct';

const App = () => {
  const isCartOpen = useStore((state) => state.isCartOpen);

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
          
          {/* USER ACCOUNT ROUTES */}
          <Route path="/account" element={<Account />} />
          <Route path="/wishlist" element={<Wishlist />} /> {/* <--- 2. ADD THIS ROUTE */}
          <Route path="/my-orders" element={<Orders />} />
          <Route path="/order/:id" element={<OrderDetails />} />
          
          <Route path="/track-order" element={<TrackOrder />} />
          <Route path="/returns" element={<Returns />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />
          
          {/* ADMIN ROUTES */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/add" element={<AddProduct />} />
          <Route path="/admin/edit/:id" element={<EditProduct />} />
          
          {/* CATCH ALL */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      {isCartOpen && <CartDrawer />}
    </div>
  );
};

export default App;