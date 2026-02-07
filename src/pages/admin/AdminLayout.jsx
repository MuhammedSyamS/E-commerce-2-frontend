import React, { useEffect } from 'react';
import { NavLink, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { LayoutDashboard, ShoppingBag, Users, Settings, LogOut, Tag, Shield, Package, CreditCard, MessageSquare, TrendingUp, X, RefreshCw } from 'lucide-react';
import { useStore } from '../../store/useStore';

const AdminLayout = () => {
    // GLOBAL STATE CONTROL (YouTube Style)
    // isDesktopSidebarOpen -> Controls Width (64 vs 0) on Desktop
    // isMobileSidebarOpen -> Controls Overlay on Mobile
    const { user, logout, isDesktopSidebarOpen, isMobileSidebarOpen, closeMobileSidebar } = useStore();
    const navigate = useNavigate();
    const location = useLocation();

    // CLOSE MOBILE DRAWER ON NAVIGATE
    useEffect(() => {
        closeMobileSidebar();
    }, [location.pathname, closeMobileSidebar]);

    // PREVENT SCROLL ON MOBILE OPEN
    useEffect(() => {
        if (isMobileSidebarOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'auto';
        }
    }, [isMobileSidebarOpen]);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navClass = ({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-[11px] uppercase tracking-widest ${isActive ? 'bg-black text-white shadow-lg' : 'text-zinc-500 hover:text-black hover:bg-zinc-50'}`;

    // Helper: Check if fully Admin
    const isAdmin = user?.role === 'admin' || user?.isAdmin;

    return (
        <div className="flex h-screen bg-zinc-50 font-sans">
            {/* --- DESKTOP SIDEBAR (YouTube Style: Toggles Width) --- */}
            <div className={`fixed left-0 top-[140px] bottom-0 bg-white border-r border-zinc-100 flex-col justify-between p-6 hidden md:flex transition-all duration-300 overflow-hidden z-40 ${isDesktopSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 p-0 border-none'}`}>

                <div className="mt-2"></div>

                {/* SCROLLABLE NAV */}
                <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 whitespace-nowrap">
                    <nav className="space-y-2">
                        {/* DASHBOARD */}
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
                            <>
                                <NavLink to="/admin/orders" className={navClass}>
                                    <ShoppingBag size={18} className="flex-shrink-0" /> Orders
                                </NavLink>
                                <NavLink to="/admin/returns" className={navClass}>
                                    <RefreshCw size={18} className="flex-shrink-0" /> Returns
                                </NavLink>
                            </>
                        )}

                        {/* ADMIN ONLY ACTIONS */}
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

                        {/* REVIEWS - Visible to Admin and Managers */}
                        {(user?.isAdmin || user?.role === 'admin' || user?.role === 'manager') && (
                            <NavLink to="/admin/reviews" className={navClass}>
                                <MessageSquare size={18} className="flex-shrink-0" /> Reviews
                            </NavLink>
                        )}

                        {/* SETTINGS (Admin Only) */}
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
            <div className={`flex-1 overflow-y-auto pt-[140px] transition-all duration-300 h-screen ${isDesktopSidebarOpen ? 'md:ml-64' : 'md:ml-0'}`}>
                <div className="p-6 md:p-12 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </div>

            {/* --- MOBILE SIDEBAR DRAWER --- */}
            <div
                className={`fixed inset-0 z-[200] md:hidden transition-all duration-300 ${isMobileSidebarOpen ? 'visible' : 'invisible delay-300'}`}
            >
                {/* BACKDROP */}
                <div
                    className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${isMobileSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={closeMobileSidebar}
                />

                {/* DRAWER PANEL */}
                <div
                    className={`absolute top-0 left-0 bottom-0 w-[85%] max-w-xs bg-white shadow-2xl transition-transform duration-300 flex flex-col p-6 ${isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                >
                    {/* HEADER */}
                    <div className="mb-8 flex justify-between items-center flex-shrink-0">
                        <h1 className="text-2xl font-black italic tracking-tighter">SLOOK<span className="text-red-500">ADMIN</span></h1>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                closeMobileSidebar();
                            }}
                            className="p-3 bg-zinc-100 rounded-full text-zinc-500 hover:bg-black hover:text-white transition cursor-pointer active:scale-95"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    {/* NAV LINKS */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        <nav className="space-y-2 pb-24">
                            {/* Dashboard */}
                            {(user?.isAdmin || user?.role === 'admin') && (
                                <>
                                    <NavLink to="/admin" end className={navClass}>
                                        <LayoutDashboard size={18} /> Dashboard
                                    </NavLink>
                                    <NavLink to="/admin/analytics" className={navClass}>
                                        <TrendingUp size={18} /> Analytics
                                    </NavLink>
                                </>
                            )}

                            {(user?.isAdmin || user?.role === 'admin' || user?.permissions?.includes('manage_products')) && (
                                <NavLink to="/admin/products" className={navClass}>
                                    <Package size={18} /> Inventory
                                </NavLink>
                            )}

                            {(user?.isAdmin || user?.role === 'admin' || user?.permissions?.includes('manage_orders')) && (
                                <NavLink to="/admin/orders" className={navClass}>
                                    <ShoppingBag size={18} /> Orders
                                </NavLink>
                            )}

                            {isAdmin && (
                                <>
                                    <NavLink to="/admin/users" className={navClass}>
                                        <Users size={18} /> Users
                                    </NavLink>
                                    <NavLink to="/admin/logs" className={navClass}>
                                        <Shield size={18} /> Logs
                                    </NavLink>
                                    <NavLink to="/admin/reports" className={navClass}>
                                        <LayoutDashboard size={18} /> Reports
                                    </NavLink>
                                    <NavLink to="/admin/marketing" className={navClass}>
                                        <Tag size={18} /> Offers
                                    </NavLink>
                                </>
                            )}

                            {(user?.isAdmin || user?.role === 'admin' || user?.role === 'manager') && (
                                <NavLink to="/admin/reviews" className={navClass}>
                                    <MessageSquare size={18} /> Reviews
                                </NavLink>
                            )}

                            {isAdmin && (
                                <>
                                    <NavLink to="/admin/payments" className={navClass}>
                                        <CreditCard size={18} /> Payments
                                    </NavLink>
                                    <NavLink to="/admin/settings" className={navClass}>
                                        <Settings size={18} /> Settings
                                    </NavLink>
                                </>
                            )}
                        </nav>
                    </div>

                    {/* LOGOUT */}
                    <div className="mt-4 pt-4 border-t border-zinc-100 flex-shrink-0">
                        <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-red-500 font-bold text-[11px] uppercase tracking-widest hover:bg-red-50 rounded-xl transition w-full">
                            <LogOut size={18} /> Logout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminLayout;
