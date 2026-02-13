import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Loader2, Plus, X, Upload } from 'lucide-react';
import axios from 'axios';
import StockHistory from '../../components/StockHistory';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';

const EditProduct = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useStore();
  const { addToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountPrice: '',
    category: '',
    subcategory: '',
    image: '',
    images: [],
    description: '',
    countInStock: 0,
    isBestSeller: false,
    variants: [] // Initialize variants
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await axios.get(`http://localhost:5000/api/products/${id}`);
        setFormData({
          name: data.name,
          price: data.price,
          discountPrice: data.discountPrice || '', // Load discount
          category: data.category,
          subcategory: data.subcategory || '', // Load subcategory
          image: data.image,
          images: data.images || [], // Load images array
          description: data.description || '',
          countInStock: data.countInStock || 0,
          isBestSeller: data.isBestSeller || false,
          variants: data.variants || [] // Load variants
        });
      } catch (error) {
        addToast("Failed to load product", "error");
        navigate('/admin/products');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id, navigate, addToast]);

  const addImage = () => {
    if (newImageUrl.trim()) {
      setFormData({ ...formData, images: [...formData.images, newImageUrl] });
      setNewImageUrl('');
    }
  };

  const removeImage = (index) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    setFormData({ ...formData, images: newImages });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`http://localhost:5000/api/products/${id}`, formData, config);
      addToast("Product Updated Successfully", "success");
      navigate('/admin/products');
    } catch (err) {
      addToast(err.response?.data?.message || "Update Failed", "error");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`http://localhost:5000/api/products/${id}`, config);
      addToast("Product Deleted", "success");
      navigate('/admin/products');
    } catch (err) {
      addToast("Delete Failed", "error");
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center">
      <Loader2 className="animate-spin" />
    </div>
  );

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 pt-32">
      <div className="container mx-auto px-6 max-w-6xl">

        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/products')} className="p-2 bg-white rounded-full shadow hover:bg-zinc-100 transition">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-3xl font-black uppercase tracking-tighter italic">Edit <span className="text-zinc-400">Inventory</span></h1>
          </div>
          <button onClick={handleDelete} className="text-red-500 hover:text-red-700 p-3 bg-white rounded-xl shadow hover:bg-red-50 transition">
            <Trash2 size={20} />
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT FORM */}
          <div className="lg:col-span-2 bg-white p-10 rounded-3xl shadow-sm border border-zinc-100">
            <form onSubmit={handleSave} className="space-y-8">
              <div>
                <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Product Name</label>
                <input
                  type="text"
                  className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold uppercase text-sm"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Regular Price (₹)</label>
                  <input
                    type="number"
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Sale Price (Optional)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1499"
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold"
                    value={formData.discountPrice}
                    onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Category</label>
                  <select
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold uppercase text-sm"
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                  >
                    <option value="Rings">Rings</option>
                    <option value="Earrings">Earrings</option>
                    <option value="Necklaces">Necklaces</option>
                    <option value="Bracelets">Bracelets</option>
                    <option value="Pendants">Pendants</option>
                    <option value="Apparel">Apparel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Subcategory (Optional)</label>
                  <input
                    type="text"
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold uppercase text-sm"
                    value={formData.subcategory}
                    onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                  />
                </div>
              </div>



              {/* IMAGES SECTION */}
              <div className="space-y-4 border-t border-zinc-100 pt-8">
                <h3 className="text-xs font-black uppercase tracking-widest">Product Imagery</h3>

                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Main Product Image URL</label>
                  <input
                    type="text"
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black text-xs"
                    value={formData.image}
                    onChange={e => setFormData({ ...formData, image: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Additional Images ({formData.images.length}/4)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Add another image URL..."
                      className="flex-1 bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-black text-xs"
                      value={newImageUrl}
                      onChange={e => setNewImageUrl(e.target.value)}
                    />
                    <button type="button" onClick={addImage} className="bg-black text-white px-4 rounded-xl hover:bg-zinc-800">
                      <Plus size={18} />
                    </button>
                  </div>

                  {/* Image List */}
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-zinc-200">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:text-red-500"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Description</label>
                <textarea
                  rows="6"
                  className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black text-sm"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                />
              </div>

              {/* --- VARIANTS & INVENTORY --- */}
              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2">Inventory Data</h3>

                {/* VARIANTS SECTION */}
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Product Variants (Size/Color)</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, variants: [...(formData.variants || []), { size: '', color: '', stock: 0 }] })}
                      className="text-[10px] font-bold uppercase bg-black text-white px-3 py-1 rounded-full hover:bg-zinc-800"
                    >
                      + Add Variant
                    </button>
                  </div>

                  {formData.variants && formData.variants.length > 0 ? (
                    <div className="space-y-2">
                      {formData.variants.map((variant, idx) => (
                        <div key={idx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            placeholder="Size (e.g. 7)"
                            className="w-20 bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-black text-xs font-bold uppercase"
                            value={variant.size}
                            onChange={(e) => {
                              const newVar = [...formData.variants];
                              newVar[idx].size = e.target.value;
                              setFormData({ ...formData, variants: newVar });
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Color (e.g. Black)"
                            className="flex-1 bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-black text-xs font-bold uppercase"
                            value={variant.color}
                            onChange={(e) => {
                              const newVar = [...formData.variants];
                              newVar[idx].color = e.target.value;
                              setFormData({ ...formData, variants: newVar });
                            }}
                          />
                          <input
                            type="number"
                            placeholder="Qty"
                            className="w-20 bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-black text-xs font-bold"
                            value={variant.stock}
                            onChange={(e) => {
                              const newVar = [...formData.variants];
                              newVar[idx].stock = Number(e.target.value);
                              // Auto-update total stock
                              const total = newVar.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
                              setFormData({ ...formData, variants: newVar, countInStock: total });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newVar = formData.variants.filter((_, i) => i !== idx);
                              const total = newVar.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
                              setFormData({ ...formData, variants: newVar, countInStock: total });
                            }}
                            className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-zinc-400 italic mb-4">No variants added. Using simple stock count below.</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Total Stock Quantity</label>
                  <input
                    type="number"
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold"
                    value={formData.countInStock}
                    onChange={e => setFormData({ ...formData, countInStock: e.target.value })}
                    placeholder="0"
                    readOnly={formData.variants && formData.variants.length > 0} // Read-only if variants exist
                  />
                  {formData.variants && formData.variants.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mt-2 flex items-start gap-2">
                      <div className="mt-0.5 text-amber-500"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg></div>
                      <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                        The <strong>Total Stock</strong> is automatically calculated as the sum of all variant quantities. You cannot edit it manually while variants exist.
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <input
                  type="checkbox"
                  id="bestSeller"
                  checked={formData.isBestSeller}
                  onChange={e => setFormData({ ...formData, isBestSeller: e.target.checked })}
                  className="w-5 h-5 accent-black"
                />
                <label htmlFor="bestSeller" className="text-sm font-bold uppercase tracking-wide">Mark as Best Seller</label>
              </div>

              <button className="w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-[0.2em] text-xs hover:bg-zinc-800 transition shadow-xl">
                Save Changes
              </button>
            </form>
          </div>

          {/* RIGHT PREVIEW */}
          <div className="lg:col-span-1">
            <h3 className="text-[10px] font-black uppercase text-zinc-400 mb-6 tracking-widest sticky top-32">Listing Preview</h3>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-zinc-100 sticky top-44">
              <div className="aspect-[4/5] bg-zinc-100 rounded-2xl overflow-hidden mb-6 relative">
                {formData.image ? (
                  <img src={formData.image} className="w-full h-full object-cover" alt="Preview" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-2">
                    <Upload size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                  </div>
                )}

                {/* Sale Badge */}
                {Number(formData.discountPrice) > 0 && Number(formData.discountPrice) < Number(formData.price) && (
                  <span className="absolute top-3 right-3 bg-red-600 text-white text-[9px] font-black px-3 py-1 uppercase tracking-widest rounded-full">
                    Sale
                  </span>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">{formData.category} {formData.subcategory ? `• ${formData.subcategory}` : ''}</p>
                    <h3 className="font-black text-xl uppercase italic tracking-tighter leading-none">{formData.name || "Untitled Product"}</h3>
                  </div>
                </div>

                <div className="flex items-baseline gap-3 mt-4 border-t border-zinc-100 pt-4">
                  {Number(formData.discountPrice) > 0 ? (
                    <>
                      <span className="font-bold text-lg">₹{Number(formData.discountPrice).toLocaleString()}</span>
                      <span className="text-zinc-400 text-xs line-through decoration-red-500 decoration-2">₹{Number(formData.price || 0).toLocaleString()}</span>
                    </>
                  ) : (
                    <span className="font-bold text-lg">₹{Number(formData.price || 0).toLocaleString()}</span>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      <div className="mt-12">
        <StockHistory productId={id} />
      </div>
    </div>
    </div >
  );
};

export default EditProduct;