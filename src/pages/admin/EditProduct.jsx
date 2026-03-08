import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Trash2, Loader2, Plus, X, Upload, AlertCircle, Package } from 'lucide-react';
import api from '../../api/instance';
import StockHistory from '../../components/StockHistory';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';
import { resolveMediaURL } from '../../utils/mediaUtils';

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
    variants: [], // Initialize variants
    seo: { metaTitle: '', metaDescription: '' },
    tags: [],
    specs: [],
    richDescription: '',
    stockReason: 'Admin Adjustment',
    stockNote: ''
  });

  const [previewVariantIdx, setPreviewVariantIdx] = useState(null);

  const [newImageUrl, setNewImageUrl] = useState('');

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/products/${id}`);
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
          variants: data.variants || [], // Load variants
          seo: data.seo || { metaTitle: '', metaDescription: '' }, // Load SEO
          tags: data.tags || [],
          specs: data.specs || [],
          richDescription: data.richDescription || '', // Load Story
          stockReason: 'Admin Adjustment',
          stockNote: ''
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
      await api.put(`/products/${id}`, formData);
      addToast("Product Updated Successfully", "success");
      navigate('/admin/products');
    } catch (err) {
      addToast(err.response?.data?.message || "Update Failed", "error");
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this product permanently?")) return;
    try {
      await api.delete(`/products/${id}`);
      addToast("Product Deleted", "success");
      navigate('/admin/products');
    } catch (err) {
      addToast("Delete Failed", "error");
    }
  };

  /* --- NEW: NEXT/PREV NAVIGATION LOGIC --- */
  const [allProducts, setAllProducts] = useState([]);

  // Fetch all products to determine Next/Prev
  useEffect(() => {
    const fetchAll = async () => {
      try {
        const { data } = await api.get('/products');
        setAllProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Failed to load product list for navigation");
      }
    };
    fetchAll();
  }, []);

  const currentIndex = allProducts.findIndex(p => p._id === id);
  const prevProduct = currentIndex > 0 ? allProducts[currentIndex - 1] : null;
  const nextProduct = currentIndex !== -1 && currentIndex < allProducts.length - 1 ? allProducts[currentIndex + 1] : null;

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
            <h1 className="text-xl font-black uppercase tracking-tight">
              Edit <span className="text-zinc-400">Inventory</span>
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* NAVIGATION BUTTONS */}
            <div className="flex bg-white rounded-xl shadow p-1">
              <button
                disabled={!prevProduct}
                onClick={() => navigate(`/admin/products/edit/${prevProduct._id}`)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-zinc-50 rounded-lg transition"
              >
                Prev
              </button>
              <div className="w-px bg-zinc-100 my-1"></div>
              <button
                disabled={!nextProduct}
                onClick={() => navigate(`/admin/products/edit/${nextProduct._id}`)}
                className="px-4 py-2 text-xs font-bold uppercase tracking-widest disabled:opacity-30 hover:bg-zinc-50 rounded-lg transition"
              >
                Next
              </button>
            </div>

            <button onClick={handleDelete} className="text-red-500 hover:text-red-700 p-3 bg-white rounded-xl shadow hover:bg-red-50 transition">
              <Trash2 size={20} />
            </button>
          </div>
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
                        <img src={resolveMediaURL(img)} alt="" className="w-full h-full object-cover" />
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

              <div>
                <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest text-red-500 font-black">Product Story (The "Story" Tab Content)</label>
                <textarea
                  rows="10"
                  placeholder="Tell the narrative of this product. This shows in the 'Story' tab on the live page..."
                  className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black text-sm italic border-l-4 border-l-red-500"
                  value={formData.richDescription}
                  onChange={e => setFormData({ ...formData, richDescription: e.target.value })}
                />
                <p className="text-[9px] text-zinc-400 mt-2">Supports multi-line narrative. Use this for the emotional and high-fidelity product story.</p>
              </div>

              {/* --- 3. CONTENT & SEO --- */}
              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2">Content & SEO</h3>
                  {(!formData.seo?.metaTitle || !formData.seo?.metaDescription) && (
                    <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full animate-pulse mb-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-amber-500"></div>
                      <span className="text-[9px] font-black uppercase text-amber-700 tracking-wider">SEO Missing</span>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Meta Title</label>
                    <input
                      type="text"
                      placeholder="Google Search Title..."
                      className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold text-xs"
                      value={formData.seo?.metaTitle || ''}
                      onChange={e => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Meta Description</label>
                    <input
                      type="text"
                      placeholder="Brief summary for Google results..."
                      className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold text-xs"
                      value={formData.seo?.metaDescription || ''}
                      onChange={e => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })}
                    />
                  </div>
                </div>

                {/* TAGS */}
                <div className="pt-4">
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Product Badges (Tags)</label>
                  <div className="flex gap-2 mb-3">
                    <input
                      type="text"
                      id="tagInput"
                      placeholder="e.g. New Arrival"
                      className="flex-1 bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-black text-xs font-bold uppercase"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = e.target.value.trim();
                          if (val && !formData.tags?.includes(val)) {
                            setFormData({ ...formData, tags: [...(formData.tags || []), val] });
                            e.target.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const input = document.getElementById('tagInput');
                        const val = input.value.trim();
                        if (val && !formData.tags?.includes(val)) {
                          setFormData({ ...formData, tags: [...(formData.tags || []), val] });
                          input.value = '';
                        }
                      }}
                      className="bg-black text-white px-4 rounded-xl hover:bg-zinc-800 text-[10px] font-bold uppercase"
                    >
                      Add
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {formData.tags?.map((tag, i) => (
                      <span key={i} className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                        {tag}
                        <button type="button" onClick={() => setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) })}><X size={10} /></button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* SPECS */}
                <div className="space-y-4 pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase text-zinc-400 tracking-widest">Specifications</label>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, specs: [...formData.specs, { key: '', value: '' }] })}
                      className="text-[10px] font-bold uppercase bg-black text-white px-3 py-1 rounded-full hover:bg-zinc-800"
                    >
                      + Spec
                    </button>
                  </div>

                  {formData.specs.map((spec, index) => (
                    <div key={index} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Label"
                        className="flex-1 bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-black text-xs font-bold uppercase"
                        value={spec.key}
                        onChange={e => {
                          const newSpecs = [...formData.specs];
                          newSpecs[index].key = e.target.value;
                          setFormData({ ...formData, specs: newSpecs });
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        className="flex-1 bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-black text-xs"
                        value={spec.value}
                        onChange={e => {
                          const newSpecs = [...formData.specs];
                          newSpecs[index].value = e.target.value;
                          setFormData({ ...formData, specs: newSpecs });
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, specs: formData.specs.filter((_, i) => i !== index) })}
                        className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
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
                    <div className="space-y-3">
                      {formData.variants.map((variant, idx) => (
                        <div
                          key={idx}
                          onClick={() => setPreviewVariantIdx(idx)}
                          className={`flex gap-3 items-center p-3 rounded-2xl border transition-all cursor-pointer group ${previewVariantIdx === idx ? 'bg-zinc-900 border-zinc-900 shadow-lg' : 'bg-zinc-50 border-zinc-200 hover:border-black'}`}
                        >
                           <div className="w-10 h-10 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0 border border-zinc-200 group-hover:border-white/20 transition-colors">
                             {variant.image ? (
                               <img src={resolveMediaURL(variant.image)} className="w-full h-full object-cover" alt="" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                <Package size={14} />
                              </div>
                            )}
                          </div>
                          <input
                            type="text"
                            placeholder="Size"
                            className={`w-16 bg-transparent outline-none text-xs font-bold uppercase ${previewVariantIdx === idx ? 'text-white' : 'text-zinc-900'}`}
                            value={variant.size}
                            onChange={(e) => {
                              const newVar = [...formData.variants];
                              newVar[idx].size = e.target.value;
                              setFormData({ ...formData, variants: newVar });
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Color"
                            className={`flex-1 bg-transparent outline-none text-xs font-bold uppercase ${previewVariantIdx === idx ? 'text-zinc-300' : 'text-zinc-900'}`}
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
                            className={`w-12 bg-transparent outline-none text-xs font-bold ${previewVariantIdx === idx ? 'text-white' : 'text-zinc-900'}`}
                            value={variant.stock}
                            onChange={(e) => {
                              const newVar = [...formData.variants];
                              newVar[idx].stock = Number(e.target.value);
                              // Auto-update total stock
                              const total = newVar.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
                              setFormData({ ...formData, variants: newVar, countInStock: total });
                            }}
                          />
                          <input
                            type="text"
                            placeholder="Image URL"
                            className={`flex-1 bg-transparent outline-none text-[10px] font-mono ${previewVariantIdx === idx ? 'text-zinc-400' : 'text-zinc-400'}`}
                            value={variant.image || ''}
                            onChange={(e) => {
                              const newVar = [...formData.variants];
                              newVar[idx].image = e.target.value;
                              setFormData({ ...formData, variants: newVar });
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const input = document.createElement('input');
                              input.type = 'file';
                              input.accept = 'image/*';
                              input.onchange = (e) => {
                                const file = e.target.files[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onloadend = () => {
                                    const newVar = [...formData.variants];
                                    newVar[idx].image = reader.result;
                                    setFormData({ ...formData, variants: newVar });
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                            className="p-3 bg-zinc-100 text-zinc-600 rounded-xl hover:bg-zinc-200"
                            title="Upload Variant Image"
                          >
                            <Upload size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              const newVar = formData.variants.filter((_, i) => i !== idx);
                              const total = newVar.reduce((acc, curr) => acc + (Number(curr.stock) || 0), 0);
                              setFormData({ ...formData, variants: newVar, countInStock: total });
                              if (previewVariantIdx === idx) setPreviewVariantIdx(null);
                            }}
                            className={`p-3 rounded-xl transition-colors ${previewVariantIdx === idx ? 'bg-zinc-800 text-red-400 hover:bg-zinc-700' : 'bg-red-50 text-red-500 hover:bg-red-100'}`}
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
                    readOnly={formData.variants && formData.variants.length > 0}
                  />
                  {formData.variants && formData.variants.length > 0 && (
                    <div className="bg-amber-50 border border-amber-200 p-3 rounded-xl mt-2 flex items-start gap-2">
                      <div className="mt-0.5 text-amber-500"><AlertCircle size={14} /></div>
                      <p className="text-[10px] text-amber-700 font-medium leading-relaxed">
                        The <strong>Total Stock</strong> is automatically calculated as the sum of all variant quantities.
                      </p>
                    </div>
                  )}
                </div>

                {/* SYSTEMATIC STOCK REASON */}
                <div className="bg-purple-50 border border-purple-100 p-6 rounded-3xl space-y-4">
                  <div className="flex items-center gap-2 text-purple-600 mb-2">
                    <AlertCircle size={16} />
                    <h3 className="text-xs font-black uppercase tracking-widest">Stock Adjustment Reason</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[9px] font-bold uppercase mb-2 text-purple-400 tracking-widest">Reason</label>
                      <select
                        className="w-full bg-white border border-purple-200 p-3 rounded-xl outline-none focus:border-purple-500 font-bold uppercase text-xs"
                        value={formData.stockReason}
                        onChange={e => setFormData({ ...formData, stockReason: e.target.value })}
                      >
                        <option value="Admin Adjustment">Admin Adjustment</option>
                        <option value="Restock">Restock</option>
                        <option value="Correction">Inventory Correction</option>
                        <option value="Return to Shelf">Return to Shelf</option>
                        <option value="Damaged/Loss">Damaged / Loss</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[9px] font-bold uppercase mb-2 text-purple-400 tracking-widest">Note (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Restocked from warehouse..."
                        className="w-full bg-white border border-purple-200 p-3 rounded-xl outline-none focus:border-purple-500 font-bold text-xs"
                        value={formData.stockNote}
                        onChange={e => setFormData({ ...formData, stockNote: e.target.value })}
                      />
                    </div>
                  </div>
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
                 {previewVariantIdx !== null && formData.variants[previewVariantIdx]?.image ? (
                   <img src={resolveMediaURL(formData.variants[previewVariantIdx].image)} className="w-full h-full object-cover" alt="Variant Preview" />
                 ) : formData.image ? (
                   <img src={resolveMediaURL(formData.image)} className="w-full h-full object-cover" alt="Main Preview" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-zinc-300 gap-2">
                    <Upload size={24} />
                    <span className="text-[10px] font-bold uppercase tracking-widest">No Image</span>
                  </div>
                )}

                {/* Variant Overlay */}
                {previewVariantIdx !== null && (
                  <div className="absolute top-3 left-3 bg-black/80 backdrop-blur-md text-white text-[8px] font-black px-3 py-1.5 uppercase tracking-widest rounded-full z-10 border border-white/20">
                    Previewing: {formData.variants[previewVariantIdx].color || 'Unnamed'} {formData.variants[previewVariantIdx].size || ''}
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
      </div >

      <div className="mt-12">
        <StockHistory productId={id} />
      </div>
    </div >

  );
};

export default EditProduct;
