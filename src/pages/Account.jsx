import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api/instance';
import { useToast } from '../context/ToastContext';
import axios from 'axios';
import {
  Package,
  Heart,
  User,
  MapPin,
  CreditCard,
  Bell,
  LogOut,
  ChevronRight,
  ShieldCheck,
  Star,
  RotateCcw,
  MessageSquare,
  Trophy,
  Crown,
  Info,
  X,
  Camera,
  Image as ImageIcon,
  PlusCircle,
  Settings,
  ArrowRight,
  CheckCircle2,
  Plus,
  Search,
  Trash2,
  Upload
} from 'lucide-react';

const Account = () => {
  const { user, logout } = useStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { success, error: toastError } = useToast();
  const [showRewardsModal, setShowRewardsModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [myLooks, setMyLooks] = useState([]);
  const [loadingLooks, setLoadingLooks] = useState(true);

  useEffect(() => {
    if (searchParams.get('action') === 'upload') {
      setShowUploadModal(true);
    }
  }, [searchParams]);

  useEffect(() => {
    const fetchMyLooks = async () => {
      try {
        const { data } = await api.get('/looks/my');
        setMyLooks(data);
      } catch (err) {
        console.error('Error fetching my looks:', err);
      } finally {
        setLoadingLooks(false);
      }
    };

    if (user) {
      fetchMyLooks();
    }
  }, [user]);

  // UPLOAD MODAL STATE
  const [uploadStep, setUploadStep] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [taggedProducts, setTaggedProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Redirect if not logged in
  if (!user) {
    navigate('/login');
    return null;
  }

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const displayName = user.firstName ? `${user.firstName} ${user.lastName || ''}` : 'User';

  // Card Component
  const AccountCard = ({ icon: Icon, title, subtext, onClick, danger = false }) => (
    <button
      onClick={onClick}
      className={`group flex items-center p-6 border rounded-xl transition-all duration-300 text-left
        ${danger
          ? 'bg-red-50 border-red-100 hover:bg-red-100 hover:border-red-200'
          : 'bg-white border-zinc-200 hover:border-zinc-800 hover:shadow-lg'
        }`}
    >
      <div className={`p-4 rounded-full mr-5 transition-colors
        ${danger ? 'bg-red-100/50 text-red-600' : 'bg-zinc-50 text-zinc-900 group-hover:bg-black group-hover:text-white'}`}>
        <Icon size={24} strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <h3 className={`font-bold text-lg mb-1 ${danger ? 'text-red-700' : 'text-zinc-900'}`}>{title}</h3>
        <p className={`text-sm ${danger ? 'text-red-500' : 'text-zinc-500'}`}>{subtext}</p>
      </div>
      <ChevronRight size={20} className={`opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${danger ? 'text-red-400' : 'text-zinc-400'}`} />
    </button>
  );

  // Rewards Modal Component
  const RewardsModal = () => (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden shadow-2xl animate-in zoom-in duration-300">
        <div className="p-8 bg-black text-white relative">
          <button onClick={() => setShowRewardsModal(false)} className="absolute top-6 right-6 p-2 hover:bg-white/10 rounded-full transition-colors"><X size={20} /></button>
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-amber-400 rounded-full text-black"><Crown size={24} /></div>
            <h2 className="text-2xl font-black uppercase tracking-tighter">Elite <span className="text-amber-400">Rewards</span></h2>
          </div>
          <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.3em]">The SLOOK Privilege Program</p>
        </div>

        <div className="p-8 space-y-8 max-h-[60vh] overflow-y-auto no-scrollbar">
          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <div className="w-1 h-1 bg-amber-400 rounded-full"></div> Membership Tiers
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                { name: 'Bronze', spend: '₹0', perks: '1.0x Coin Multiplier' },
                { name: 'Silver', spend: '₹10k+', perks: '1.2x Coin Multiplier' },
                { name: 'Gold', spend: '₹50k+', perks: '1.5x Coin Multiplier' },
                { name: 'Platinum', spend: '₹1 Lakh+', perks: '2.0x Coin Multiplier' }
              ].map(tier => (
                <div key={tier.name} className={`p-4 rounded-2xl border ${user.membershipTier === tier.name ? 'border-amber-400 bg-amber-50' : 'border-zinc-100'}`}>
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-black text-sm uppercase">{tier.name}</span>
                    <span className="text-[9px] font-bold text-zinc-500">{tier.spend}</span>
                  </div>
                  <p className="text-[10px] text-zinc-400 font-medium">{tier.perks}</p>
                </div>
              ))}
            </div>
          </section>

          <section>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4 flex items-center gap-2">
              <div className="w-1 h-1 bg-amber-400 rounded-full"></div> How to Earn Coins
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="p-2 bg-white rounded-lg shadow-sm"><Package size={18} /></div>
                <div>
                  <p className="text-xs font-black uppercase">Shopping</p>
                  <p className="text-[10px] text-zinc-500">Earn coins on every purchase based on your tier.</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-zinc-50 rounded-2xl border border-zinc-100">
                <div className="p-2 bg-white rounded-lg shadow-sm"><User size={18} /></div>
                <div>
                  <p className="text-xs font-black uppercase">Referrals</p>
                  <p className="text-[10px] text-zinc-500">Earn ₹500 for every friend who makes their first purchase.</p>
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="p-8 border-t border-zinc-100 flex justify-end">
          <button onClick={() => setShowRewardsModal(false)} className="px-8 py-3 bg-black text-white rounded-full font-black uppercase tracking-widest text-[10px] hover:scale-105 active:scale-95 transition-all">Understood</button>
        </div>
      </div>
    </div>
  );

  const handleDeleteLook = async (lookId) => {
    if (!window.confirm("Are you sure you want to delete this look? This cannot be undone.")) return;
    try {
      await api.delete(`/looks/${lookId}`);
      setMyLooks(prev => prev.filter(l => l._id !== lookId));
      success("Look deleted successfully");
    } catch (err) {
      console.error(err);
      toastError(err.response?.data?.message || "Failed to delete look");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 pt-44 md:pt-52">
      <div className="max-w-7xl mx-auto">
        {showRewardsModal && <RewardsModal />}

        {/* Header Section */}
        <div className="mb-12 text-center">
          <h1 className="text-3xl md:text-4xl font-black text-zinc-900 mb-4 tracking-tight">
            My Account
          </h1>
          <p className="text-zinc-500 text-lg">
            Welcome back, <span className="text-black font-semibold">{displayName}</span>
          </p>
        </div>

        {/* Grid Layout - Responsive: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          <AccountCard
            icon={Package}
            title="My Orders"
            subtext="Track active shipments & history"
            onClick={() => navigate('/my-orders')}
          />

          <AccountCard
            icon={Camera}
            title="My SLOOKS"
            subtext="Share your style with community"
            onClick={() => {
              const el = document.getElementById('slooks-section');
              el?.scrollIntoView({ behavior: 'smooth' });
            }}
          />

          {/* LOYALTY CARD */}
          <div className="bg-gradient-to-br from-amber-200 via-yellow-400 to-amber-500 rounded-xl p-6 text-black shadow-lg relative overflow-hidden group hover:shadow-xl transition-all cursor-pointer">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity" onClick={() => navigate('/account/loyalty-ledger')}>
              <Star size={100} fill="black" />
            </div>
            <div className="relative z-10 h-full flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-black/10 p-2 rounded-full"><Star size={20} fill="black" /></div>
                  <h3 className="font-black uppercase tracking-widest text-xs">SLOOK Coins</h3>
                </div>
                <button
                  onClick={(e) => { e.stopPropagation(); setShowRewardsModal(true); }}
                  className="p-1 hover:bg-black/10 rounded-full transition-colors"
                >
                  <Info size={16} />
                </button>
              </div>
              <div onClick={() => navigate('/account/loyalty-ledger')} className="flex-1">
                <p className="text-4xl font-black mb-1">{user.loyaltyPoints || 0}</p>
                <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Available Balance</p>
                <p className="text-[10px] mt-4 font-medium opacity-60">1 Coin = ₹1. <span className="underline decoration-black/20">View Ledger</span></p>
              </div>
            </div>
          </div>

          <AccountCard
            icon={Heart}
            title="Wishlist"
            subtext="Your curated collection"
            onClick={() => navigate('/wishlist')}
          />

          {/* MY TICKETS */}
          <AccountCard
            icon={MessageSquare}
            title="My Tickets"
            subtext="View and manage support requests"
            onClick={() => navigate('/support-tickets')}
          />

          {/* TIER CARD */}
          <div className={`rounded-xl p-6 text-white shadow-lg relative overflow-hidden group hover:shadow-xl transition-all ${user.membershipTier === 'Platinum' ? 'bg-zinc-900 border border-zinc-800' :
            user.membershipTier === 'Gold' ? 'bg-amber-600' :
              user.membershipTier === 'Silver' ? 'bg-blue-600' : 'bg-green-600'
            }`}>
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Crown size={100} fill="white" />
            </div>
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="bg-white/10 p-2 rounded-full"><Trophy size={20} fill="white" /></div>
                  <h3 className="font-black uppercase tracking-widest text-xs">{user.membershipTier || 'Bronze'} Member</h3>
                </div>
                <button
                  onClick={() => setShowRewardsModal(true)}
                  className="p-1 hover:bg-white/10 rounded-full transition-colors"
                >
                  <Info size={16} />
                </button>
              </div>
              <p className="text-4xl font-black mb-1">{user.membershipTier || 'Bronze'}</p>
              <p className="text-xs font-bold opacity-70 uppercase tracking-wider">Tier Status</p>

              {/* Progress to next tier */}
              <div className="mt-4">
                <div className="w-full bg-white/20 h-1 rounded-full overflow-hidden">
                  <div className="bg-white h-full" style={{ width: `${Math.min(100, ((user.totalSpent || 0) / 100000) * 100)}%` }}></div>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-[9px] font-bold uppercase tracking-widest opacity-60">
                    ₹{(user.totalSpent || 0).toLocaleString()} Spent
                  </p>
                  {user.membershipTier !== 'Platinum' && (
                    <p className="text-[8px] font-black uppercase tracking-tighter bg-white/10 px-2 py-0.5 rounded">Next: {
                      user.membershipTier === 'Silver' ? 'Gold' : user.membershipTier === 'Gold' ? 'Platinum' : 'Silver'
                    }</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          <AccountCard
            icon={Info}
            title="Help Center"
            subtext="FAQ & Support Hub"
            onClick={() => navigate('/support')}
          />

          <AccountCard
            icon={User}
            title="Profile"
            subtext="Personal details & preferences"
            onClick={() => navigate('/account/edit')}
          />

          <AccountCard
            icon={MapPin}
            title="Addresses"
            subtext="Manage shipping locations"
            onClick={() => navigate('/account/addresses')}
          />

          <AccountCard
            icon={Star}
            title="My Reviews"
            subtext="Feedback you have shared"
            onClick={() => navigate('/my-reviews')}
          />

          <AccountCard
            icon={CreditCard}
            title="Payments"
            subtext="Saved cards & billing info"
            onClick={() => navigate('/account/payments')}
          />

          <AccountCard
            icon={Bell}
            title="Notifications"
            subtext="Offers & order updates"
            onClick={() => navigate('/account/notifications')}
          />

          <AccountCard
            icon={ShieldCheck}
            title="Security"
            subtext="Password & account protection"
            onClick={() => navigate('/account/security')}
          />

          <AccountCard
            icon={LogOut}
            title="Sign Out"
            subtext="Securely log out of device"
            onClick={handleLogout}
            danger={true}
          />
        </div>

        {/* UPLOAD LOOK MODAL */}
        <AnimatePresence>
          {showUploadModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white w-full max-w-4xl rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row h-[85vh] md:h-[70vh] shadow-2xl"
              >
                {/* LEFT SIDE: PREVIEW */}
                <div className="w-full md:w-1/2 bg-zinc-100 relative group">
                  {selectedImage ? (
                    <div className="w-full h-full relative">
                      <img src={selectedImage} className="w-full h-full object-cover" alt="Preview" />
                      {uploadStep === 2 && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <p className="text-white text-[10px] font-black uppercase tracking-widest bg-black/40 px-4 py-2 rounded-full backdrop-blur-md">
                            Tap image to pin tag (Coming Soon)
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-12 text-center border-2 border-dashed border-zinc-200">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mb-6">
                        <Camera size={32} className="text-zinc-300" />
                      </div>
                      <p className="text-sm font-black uppercase tracking-widest text-zinc-400">Share your Vibe</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setSelectedFile(file);
                            const reader = new FileReader();
                            reader.onloadend = () => setSelectedImage(reader.result);
                            reader.readAsDataURL(file);
                          }
                        }}
                      />
                    </div>
                  )}
                  {selectedImage && uploadStep === 1 && (
                    <button
                      onClick={() => {
                        setSelectedImage(null);
                        setSelectedFile(null);
                      }}
                      className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>

                {/* RIGHT SIDE: ACTIONS */}
                <div className="w-full md:w-1/2 p-8 flex flex-col bg-white">
                  <div className="flex justify-between items-center mb-8">
                    <h3 className="text-2xl font-black uppercase tracking-tighter italic">Step {uploadStep}/3</h3>
                    <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-zinc-50 rounded-full">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    {uploadStep === 1 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Add a Caption</label>
                          <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Tell the community about this look..."
                            className="w-full h-32 p-4 bg-zinc-50 border border-zinc-100 rounded-3xl text-sm outline-none focus:border-black transition-all resize-none"
                          />
                        </div>
                        <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100">
                          <p className="text-[10px] font-bold text-amber-800 uppercase leading-relaxed">
                            💡 Tip: Looks with engaging captions get 40% more likes!
                          </p>
                        </div>
                      </div>
                    )}

                    {uploadStep === 2 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Tag Products</label>
                          <div className="relative">
                            <input
                              type="text"
                              value={searchQuery}
                              onChange={async (e) => {
                                setSearchQuery(e.target.value);
                                if (e.target.value.length > 2) {
                                  setIsSearching(true);
                                  try {
                                    const { data } = await axios.get(`/api/products/search?keyword=${e.target.value}`);
                                    setSearchResults(data);
                                  } catch (err) {
                                    console.error(err);
                                  } finally {
                                    setIsSearching(false);
                                  }
                                } else {
                                  setSearchResults([]);
                                }
                              }}
                              placeholder="Search products to tag..."
                              className="w-full pl-12 pr-4 py-4 bg-zinc-50 border border-zinc-100 rounded-2xl text-sm outline-none focus:border-black transition-all"
                            />
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300" size={18} />
                          </div>
                        </div>

                        {/* SEARCH RESULTS */}
                        <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                          {searchResults.map((prod) => (
                            <div
                              key={prod._id}
                              onClick={() => {
                                if (!taggedProducts.find(p => p._id === prod._id)) {
                                  setTaggedProducts([...taggedProducts, prod]);
                                }
                                setSearchQuery('');
                                setSearchResults([]);
                              }}
                              className="flex items-center gap-4 p-3 rounded-2xl border border-zinc-50 hover:border-black cursor-pointer transition-all group"
                            >
                              <img src={prod.image} className="w-10 h-12 object-cover rounded-lg" alt="" />
                              <div className="flex-1">
                                <p className="text-[10px] font-black uppercase tracking-tight">{prod.name}</p>
                                <p className="text-[9px] font-bold text-zinc-400">₹{prod.price}</p>
                              </div>
                              <Plus size={14} className="text-zinc-300 group-hover:text-black" />
                            </div>
                          ))}
                        </div>

                        {/* TAGGED PRODUCTS LIST */}
                        {taggedProducts.length > 0 && (
                          <div className="pt-4 border-t border-zinc-100">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Tagged In this Look</p>
                            <div className="flex flex-wrap gap-2">
                              {taggedProducts.map(prod => (
                                <div key={prod._id} className="flex items-center gap-2 bg-zinc-100 px-3 py-1.5 rounded-full">
                                  <span className="text-[9px] font-black uppercase truncate max-w-[100px]">{prod.name}</span>
                                  <button onClick={() => setTaggedProducts(taggedProducts.filter(p => p._id !== prod._id))}>
                                    <X size={10} className="text-zinc-400 hover:text-red-500" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {uploadStep === 3 && (
                      <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
                          <CheckCircle2 size={40} />
                        </div>
                        <div>
                          <h4 className="text-xl font-black uppercase tracking-tighter italic">Ready for Review!</h4>
                          <p className="text-xs text-zinc-500 max-w-[250px] mx-auto mt-2 leading-relaxed">
                            Your look will be reviewed by the SLOOK Curators and should be live within 24 hours.
                          </p>
                        </div>
                        <div className="w-full p-6 bg-zinc-50 rounded-[2rem] border border-zinc-100 text-left">
                          <p className="text-[9px] font-black uppercase text-zinc-400 mb-2">Details Summary</p>
                          <div className="space-y-1">
                            <p className="text-[10px] font-bold uppercase">Caption: <span className="text-zinc-500">{caption || "No caption"}</span></p>
                            <p className="text-[10px] font-bold uppercase">Tags: <span className="text-zinc-500">{taggedProducts.length} Products</span></p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-8 mt-auto border-t border-zinc-50 flex gap-4">
                    {uploadStep > 1 && (
                      <button
                        onClick={() => setUploadStep(uploadStep - 1)}
                        className="flex-1 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest border border-zinc-200 hover:border-black transition-all"
                      >
                        Back
                      </button>
                    )}
                    {uploadStep < 3 ? (
                      <button
                        // Disable next until image is selected
                        disabled={uploadStep === 1 && !selectedImage}
                        onClick={() => setUploadStep(uploadStep + 1)}
                        className={`flex-1 px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedImage || uploadStep > 1 ? 'bg-black text-white hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'}`}
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={async () => {
                          setIsSubmitting(true);
                          try {
                            const formData = new FormData();
                            formData.append('image', selectedFile);
                            formData.append('caption', caption);
                            formData.append('products', JSON.stringify(taggedProducts));

                            const { data } = await api.post('/looks', formData, {
                              headers: { 'Content-Type': 'multipart/form-data' }
                            });

                            success("Look submitted for curation! ✨");
                            setMyLooks(prev => [data, ...prev]);
                            setShowUploadModal(false);
                            setUploadStep(1);
                            setSelectedImage(null);
                            setSelectedFile(null);
                            setCaption('');
                            setTaggedProducts([]);
                          } catch (err) {
                            console.error('Upload failed:', err);
                            toastError(err.response?.data?.message || "Failed to upload style look");
                          } finally {
                            setIsSubmitting(false);
                          }
                        }}
                        className="flex-1 bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-xl flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        ) : (
                          <>Complete Upload <Plus size={14} /></>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MY SLOOKS (LOOKBOOK) SECTION */}
        <div id="slooks-section" className="mt-20 pt-20 border-t border-zinc-200">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <p className="text-[11px] font-black uppercase tracking-[0.4em] text-amber-500 mb-2">Social Proof</p>
              <h2 className="text-4xl font-black uppercase tracking-tighter italic transform -skew-x-3">Your <span className="text-zinc-300">Signature</span> Looks</h2>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="bg-black text-white px-8 py-4 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all flex items-center gap-2 group"
            >
              <PlusCircle size={16} className="group-hover:rotate-90 transition-transform duration-300" /> Upload New Look
            </button>
          </div>

          {/* LOOKS GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-6">
            {/* UPLOAD PLACEHOLDER */}
            <div
              onClick={() => setShowUploadModal(true)}
              className="aspect-[3/4] border-2 border-dashed border-zinc-200 rounded-3xl flex flex-col items-center justify-center p-6 text-center hover:border-black hover:bg-zinc-50 transition-all cursor-pointer group"
            >
              <div className="w-12 h-12 bg-zinc-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <ImageIcon size={24} className="text-zinc-400 group-hover:text-black" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-black">Drop a Photo</p>
            </div>

            {/* REAL USER LOOKS */}
            {loadingLooks ? (
              [1, 2, 3].map(i => (
                <div key={i} className="aspect-[3/4] rounded-3xl bg-zinc-100 animate-pulse" />
              ))
            ) : (
              myLooks.map(look => (
                <div key={look._id} className="relative aspect-[3/4] rounded-3xl overflow-hidden border border-zinc-100 group shadow-sm hover:shadow-xl transition-all">
                  <img src={look.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" loading="lazy" />

                  {/* DELETE BUTTON */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteLook(look._id);
                    }}
                    className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white z-20 hover:scale-110 shadow-lg"
                    title="Delete Look"
                  >
                    <Trash2 size={16} />
                  </button>

                  <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                    <span className={`text-[8px] font-black uppercase px-2 py-0.5 rounded-full ${look.status === 'approved' ? 'bg-green-400 text-black' :
                      look.status === 'rejected' ? 'bg-red-400 text-white' :
                        'bg-amber-400 text-black'
                      }`}>
                      {look.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Account;
