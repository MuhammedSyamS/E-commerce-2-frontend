import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import { useStore } from './store/useStore';

// Components
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductDetails from './pages/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import Account from './pages/Account';
import OrderDetails from './pages/OrderDetails'; // <--- NEW
import Checkout from './pages/Checkout';
import OrderSuccess from './pages/OrderSuccess';
import NotFound from './pages/NotFound';         // <--- NEW

// Admin
import Admin from './pages/admin/Admin';
import AddProduct from './pages/admin/AddProduct';
import EditProduct from './pages/admin/EditProduct'; // <--- NEW

// --- Internal Cart Component ---
const CartDrawer = () => {
  const { cart, toggleCart, removeFromCart } = useStore();
  const navigate = useNavigate();
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
  
  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={toggleCart}></div>
      <div className="relative w-full max-w-[400px] bg-white h-full shadow-2xl flex flex-col animate-slide-in">
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-lg font-bold uppercase tracking-widest">Cart ({cart.length})</h2>
          <button onClick={toggleCart}><X className="w-6 h-6 hover:rotate-90 transition" /></button>
        </div>

        <div className="flex-1 overflow-y-auto p-5">
          {cart.length === 0 ? (
             <p className="text-gray-500 text-center mt-20 text-sm">Your cart is currently empty.</p>
          ) : (
            cart.map(item => (
              <div key={item._id} className="flex gap-4 mb-6">
                <img src={item.image} className="w-20 h-24 object-cover bg-gray-100" alt={item.name} />
                <div className="flex-1 flex flex-col justify-between py-1">
                  <div>
                    <h4 className="font-bold text-sm text-gray-900">{item.name}</h4>
                    <p className="text-xs text-gray-500 mt-1">Silver / Adjustable</p>
                  </div>
                  <div className="flex justify-between items-end">
                     <span className="font-bold text-sm">Rs. {item.price}</span>
                     <button onClick={() => removeFromCart(item._id)} className="text-[10px] uppercase font-bold text-red-500 underline">Remove</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {cart.length > 0 && (
          <div className="p-5 bg-[#f9f9f9] border-t">
            <div className="flex justify-between mb-4 font-bold text-sm uppercase">
              <span>Subtotal</span>
              <span>Rs. {subtotal}.00</span>
            </div>
            <button 
              onClick={() => { toggleCart(); navigate('/checkout'); }} 
              className="w-full bg-black text-white py-4 font-bold uppercase tracking-widest text-xs hover:bg-gray-800 transition"
            >
              Checkout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

// --- App ---
const App = () => {
  const isCartOpen = useStore(state => state.isCartOpen);

  return (
    <div className="font-sans text-[#1a1a1a] flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:slug" element={<ProductDetails />} />
          
          {/* User Auth & Account */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/account" element={<Account />} />
          <Route path="/order/:id" element={<OrderDetails />} /> {/* <--- NEW */}

          {/* Checkout */}
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/order-success" element={<OrderSuccess />} />

          {/* Admin Routes */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/add" element={<AddProduct />} />
          <Route path="/admin/edit/:id" element={<EditProduct />} /> {/* <--- NEW */}

          {/* 404 */}
          <Route path="*" element={<NotFound />} /> {/* <--- NEW */}
        </Routes>
      </div>
      <Footer />
      {isCartOpen && <CartDrawer />}
    </div>
  );
};

export default App;