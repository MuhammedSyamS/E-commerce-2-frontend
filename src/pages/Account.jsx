import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';
import { resolveMediaURL } from '../utils/mediaUtils';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import api from '../api/instance';
import { useToast } from '../context/ToastContext';
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
  Upload,
  Zap
} from 'lucide-react';

const Account = () => {
  const { user, logout, refreshUser } = useStore();
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

    if (user && user._id) {
      fetchMyLooks();
    }
  }, [user?._id]); // Only run when user ID changes, not the whole user object

  useEffect(() => {
    if (user?.token) {
      refreshUser();
    }
  }, []); // Run once on mount to ensure fresh data

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
      className={`group flex items-center p-5 md:p-6 border rounded-[1.5rem] transition-all duration-300 text-left
        ${danger
          ? 'bg-red-50 border-red-100 hover:bg-red-100 hover:border-red-200'
          : 'bg-white border-zinc-200 hover:border-zinc-800 hover:shadow-lg'
        }`}
    >
      <div className={`p-3 md:p-4 rounded-full mr-4 md:mr-5 transition-colors
        ${danger ? 'bg-red-100/50 text-red-600' : 'bg-zinc-50 text-zinc-900 group-hover:bg-black group-hover:text-white'}`}>
        <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
      </div>
      <div className="flex-1">
        <h3 className={`font-black uppercase tracking-tight text-base md:text-lg mb-1 ${danger ? 'text-red-700' : 'text-zinc-900'}`}>{title}</h3>
        <p className={`text-[9px] md:text-[10px] font-bold uppercase tracking-widest ${danger ? 'text-red-500' : 'text-zinc-500'}`}>{subtext}</p>
      </div>
      <ChevronRight className={`w-4 h-4 md:w-5 md:h-5 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all ${danger ? 'text-red-400' : 'text-zinc-400'}`} />
    </button>
  );


  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          const MAX_WIDTH = 1200;
          const MAX_HEIGHT = 1200;
          if (width > height) {
            if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
          } else {
            if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to blob
          canvas.toBlob((blob) => {
            resolve(blob);
          }, 'image/jpeg', 0.82);
        };
        img.src = event.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

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
    <div className="min-h-screen bg-white pb-20 px-4 md:px-6 pt-44 md:pt-52 font-sans text-[#1a1a1a]">
      <div className="max-w-7xl mx-auto">
        {showRewardsModal && <RewardsModal />}

        {/* Header Section */}
        <div className="mb-12 text-center">
          <div className="inline-block mb-6">
            <div className="flex flex-wrap items-center justify-center gap-3">
              <div className="bg-zinc-950 text-white px-6 py-2 rounded-full flex items-center gap-2 shadow-xl border border-white/10">
                <Crown size={14} className="text-amber-400" />
                <span className="text-[10px] font-black uppercase tracking-widest">{user?.membershipTier || 'Bronze'} Elite</span>
              </div>
              <div className="bg-white text-zinc-950 px-6 py-2 rounded-full flex items-center gap-2 shadow-lg border border-zinc-100">
                <Trophy size={14} className="text-amber-500" />
                <span className="text-[10px] font-black uppercase tracking-widest">{user?.loyaltyPoints ?? 0} Coins</span>
              </div>
            </div>
          </div>
          <h1 className="!text-3xl md:!text-5xl font-black text-black mb-2 md:mb-4 uppercase tracking-tighter leading-none">
            My <span className="text-zinc-400">Account</span>
          </h1>
          <p className="text-zinc-500 text-[10px] md:text-sm font-bold uppercase tracking-widest">
            Welcome back, <span className="text-black font-black">{displayName}</span>
          </p>
          {user?.phone && (
            <p className="text-zinc-400 text-[9px] md:text-xs font-bold uppercase tracking-[0.2em] mt-2">
              {user.phone}
            </p>
          )}
        </div>

        {/* Grid Layout - Responsive: 1 col mobile, 2 col tablet, 3 col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mt-8 md:mt-12">

          <AccountCard
            icon={Trophy}
            title="Loyalty Rewards"
            subtext="Manage SLOOK coins & Elite status"
            onClick={() => navigate('/account/loyalty')}
          />

          <AccountCard
            icon={Package}
            title="My Orders"
            subtext="Track active shipments & history"
            onClick={() => navigate('/my-orders')}
          />

          <AccountCard
            icon={RotateCcw}
            title="My Returns"
            subtext="Track returns & exchanges"
            onClick={() => navigate('/my-returns')}
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
                className="bg-white w-full max-w-4xl md:rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row h-full md:h-[70vh] shadow-2xl relative"
              >
                {/* LEFT SIDE: PREVIEW */}
                <div className="w-full md:w-1/2 bg-zinc-100 relative group h-[40vh] md:h-auto shrink-0 md:shrink">
                  {selectedImage ? (
                    <div className="w-full h-full relative">
                      <img src={selectedImage} className="w-full h-full object-cover" alt="Preview" />
                      {uploadStep === 2 && (
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                          <p className="text-white text-[9px] font-black uppercase tracking-widest bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-md">
                            Tap image to pin tag
                          </p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center p-8 md:p-12 text-center border-2 border-dashed border-zinc-200">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-xl mb-6">
                        <Camera size={32} className="text-zinc-300" />
                      </div>
                      <p className="text-sm font-black uppercase tracking-widest text-zinc-400">Share your Vibe</p>
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={async (e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setIsSubmitting(true);
                            try {
                                const resizedBlob = await resizeImage(file);
                                const resizedFile = new File([resizedBlob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });
                                setSelectedFile(resizedFile);
                                
                                const reader = new FileReader();
                                reader.onloadend = () => setSelectedImage(reader.result);
                                reader.readAsDataURL(resizedFile);
                            } catch (err) {
                                console.error("Image processing failed:", err);
                                toastError("Failed to process image");
                            } finally {
                                setIsSubmitting(false);
                            }
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
                <div className="w-full md:w-1/2 p-6 md:p-8 flex flex-col bg-white overflow-y-auto no-scrollbar pb-24 md:pb-8">
                  <div className="flex justify-between items-center mb-6 md:mb-8">
                    <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter">Step {uploadStep}/3</h3>
                    <button onClick={() => setShowUploadModal(false)} className="p-2 hover:bg-zinc-50 rounded-full">
                      <X size={24} />
                    </button>
                  </div>

                  <div className="flex-1 overflow-y-auto no-scrollbar">
                    {uploadStep === 1 && (
                      <div className="space-y-6">
                        <div className="space-y-2">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-orange-600 mb-2">
                                Guidelines
                            </h4>
                          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Add a Caption</label>
                          <textarea
                            value={caption}
                            onChange={(e) => setCaption(e.target.value)}
                            placeholder="Tell the community about this look..."
                            className="w-full h-24 md:h-32 p-4 bg-zinc-50 border border-zinc-100 rounded-3xl text-sm outline-none focus:border-black transition-all resize-none"
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
                                    const { data } = await api.get(`/products/search?keyword=${e.target.value}`);
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
                          {(searchResults.products || []).map((prod) => (
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
                              <img src={resolveMediaURL(prod.image)} className="w-10 h-12 object-cover rounded-lg" alt="" />
                              <div className="flex-1">
                                <h2 className="text-2xl font-black uppercase tracking-tighter">My SLOOKS</h2>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Community Gallery</p>
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
                            <h2 className="text-xl font-black uppercase tracking-tight">Personal Details</h2>
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

                  <div className="md:pt-8 mt-auto md:border-t border-zinc-50 flex gap-4 absolute md:relative bottom-0 left-0 right-0 p-6 md:p-0 bg-white/80 md:bg-transparent backdrop-blur-md md:backdrop-blur-none z-10">
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
                        className={`flex-1 px-8 py-4 md:py-4 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${selectedImage || uploadStep > 1 ? 'bg-black text-white hover:bg-zinc-800' : 'bg-zinc-100 text-zinc-300 cursor-not-allowed'}`}
                      >
                        Next Step
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
              <p className="text-[9px] md:text-[11px] font-black uppercase tracking-[0.4em] text-amber-500 mb-2">Social Proof</p>
                    <h2 className="!text-3xl md:!text-5xl font-black uppercase tracking-tighter leading-none">Your <span className="text-zinc-300">Signature</span> Looks</h2>
            </div>
            <button
              onClick={() => setShowUploadModal(true)}
              className="mt-6 md:mt-0 w-full md:w-auto bg-black text-white px-6 py-4 md:px-8 md:py-4 rounded-xl md:rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition shadow-xl active:scale-95 flex items-center justify-center gap-2 group"
            >
              <PlusCircle size={14} className="md:w-4 md:h-4 group-hover:rotate-90 transition-transform duration-300" /> Upload New Look
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
                  <img src={resolveMediaURL(look.image)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="" loading="lazy" />

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
