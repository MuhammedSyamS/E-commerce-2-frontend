import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Truck, Tag, Shield, Package, CreditCard, MessageSquare, Menu, TrendingUp } from 'lucide-react';
import { useStore } from '../../store/useStore';

const AdminLayout = () => {
    const { user, logout, isAdminSidebarOpen, toggleAdminSidebar } = useStore();
    const navigate = useNavigate();
    // Removed local state

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[11px] uppercase tracking-widest ${isActive ? 'bg-black text-white shadow-lg' : 'text-zinc-400 hover:text-black hover:bg-zinc-50'}`;

    // Helper: Check if fully Admin
    const isAdmin = user?.role === 'admin' || user?.isAdmin;

    return (
        <div className="flex h-screen bg-zinc-50 font-sans pt-24 md:pt-0">
            {/* SIDEBAR */}
            <div className={`bg-white border-r border-zinc-100 flex-col justify-between p-6 hidden md:flex pt-4 h-full transition-all duration-300 overflow-hidden ${isAdminSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 p-0 border-none'}`}>
                {/* STATIC HEADER */}
                <div className="mb-8 px-2 flex-shrink-0 whitespace-nowrap">
                    <h1 className="text-2xl font-black italic tracking-tighter">MISO<span className="text-zinc-300">ADMIN</span></h1>
                </div>

                {/* SCROLLABLE NAV */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 whitespace-nowrap">
                    <nav className="space-y-2">
                        {/* DASHBOARD - Admin Only by default (implied "not others") */}
                        {(user?.isAdmin || user?.role === 'admin') && (
                            <>
                                <NavLink to="/admin" end className={navClass}>
                                    <LayoutDashboard size={18} className="flex-shrink-0" /> Dashboard
                                </NavLink>
                                <NavLink to="/admin/analytics" className={navClass}>
                                    <TrendingUp size={18} className="flex-shrink-0" /> Analytics
                                </NavLink>
                            </>
                        )}

                        {(user?.isAdmin || user?.role === 'admin' || user?.permissions?.includes('manage_products')) && (
                            <NavLink to="/admin/products" className={navClass}>
                                <Package size={18} className="flex-shrink-0" /> Inventory
                            </NavLink>
                        )}

                        {(user?.isAdmin || user?.role === 'admin' || user?.permissions?.includes('manage_orders')) && (
                            <NavLink to="/admin/orders" className={navClass}>
                                <ShoppingBag size={18} className="flex-shrink-0" /> Orders
                            </NavLink>
                        )}

                        {/* RESTRICTED ACTIONS (Admin Only) */}
                        {isAdmin && (
                            <>
                                <NavLink to="/admin/users" className={navClass}>
                                    <Users size={18} className="flex-shrink-0" /> Users
                                </NavLink>
                                <NavLink to="/admin/logs" className={navClass}>
                                    <Shield size={18} className="flex-shrink-0" /> Logs
                                </NavLink>
                                <NavLink to="/admin/reports" className={navClass}>
                                    <LayoutDashboard size={18} className="flex-shrink-0" /> Reports
                                </NavLink>
                                <NavLink to="/admin/marketing" className={navClass}>
                                    <Tag size={18} className="flex-shrink-0" /> Offers
                                </NavLink>
                            </>
                        )}

                        {/* REVIEWS - Visible to Admin and ALL Managers */}
                        {(user?.isAdmin || user?.role === 'admin' || user?.role === 'manager') && (
                            <NavLink to="/admin/reviews" className={navClass}>
                                <MessageSquare size={18} className="flex-shrink-0" /> Reviews
                            </NavLink>
                        )}

                        {/* RESTRICTED ACTIONS (Admin Only) */}
                        {isAdmin && (
                            <>
                                <NavLink to="/admin/payments" className={navClass}>
                                    <CreditCard size={18} className="flex-shrink-0" /> Payments
                                </NavLink>
                                <NavLink to="/admin/settings" className={navClass}>
                                    <Settings size={18} className="flex-shrink-0" /> Settings
                                </NavLink>
                            </>
                        )}
                    </nav>
                </div>

                <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-[11px] uppercase tracking-widest hover:bg-red-50 rounded-xl transition whitespace-nowrap">
                    <LogOut size={18} className="flex-shrink-0" /> Logout
                </button>
            </div>

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 overflow-y-auto pt-24 md:pt-28 transition-all duration-300">
                <div className="p-8 md:p-12 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
