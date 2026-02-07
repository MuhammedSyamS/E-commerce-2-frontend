import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X, Upload, Video } from 'lucide-react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';

const AddProduct = () => {
  const navigate = useNavigate();
  const { user } = useStore();
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    discountPrice: '',
    category: '',
    subcategory: '',
    image: '',
    images: [],
    tags: [],
    description: '',
    specs: [],
    countInStock: 0,
    isBestSeller: false,
    video: '', // Video URL
    variants: [], // { size, color, stock }
    seo: { metaTitle: '', metaDescription: '' }
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  const addImage = (e) => {
    e.preventDefault();
    if (newImageUrl.trim()) {
      if (formData.images.length >= 4) return addToast("Max 4 images allowed", "error");
      setFormData({ ...formData, images: [...formData.images, newImageUrl] });
      setNewImageUrl('');
    }
  };

  const removeImage = (index) => {
    setFormData({ ...formData, images: formData.images.filter((_, i) => i !== index) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user.token}`,
        },
      };

      await axios.post('http://localhost:5000/api/products', formData, config);
      addToast('Product Published Successfully!', 'success');
      navigate('/admin/dashboard');
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create product', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#Fdfdfd] text-zinc-900 font-sans pb-20">
      {/* HEADER */}
      <div className="bg-white border-b border-zinc-100 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => navigate('/admin/dashboard')} className="p-2 hover:bg-zinc-50 rounded-full transition">
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-xl font-black uppercase tracking-tighter">Add New Product</h1>
          </div>
          <div className="flex gap-3">
            <button onClick={() => navigate('/admin/dashboard')} className="px-6 py-2 text-[10px] font-bold uppercase tracking-widest text-zinc-400 hover:text-black">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="bg-black text-white px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-zinc-800 transition shadow-lg shadow-black/10 disabled:opacity-50"
            >
              {loading ? 'Publishing...' : 'Publish'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">

          {/* LEFT: FORM INPUTS */}
          <div className="lg:col-span-2 space-y-10">
            <form onSubmit={handleSubmit} className="space-y-10">

              {/* --- 1. BASIC INFO --- */}
              <div className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2">Basic Information</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Price (₹)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold text-lg"
                      value={formData.price}
                      onChange={e => setFormData({ ...formData, price: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Sale Price (Optional)</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold text-lg"
                      value={formData.discountPrice}
                      onChange={e => setFormData({ ...formData, discountPrice: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Product Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Premium Cotton T-Shirt"
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold uppercase text-sm"
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Category</label>
                    <input
                      list="categoryOptions"
                      type="text"
                      placeholder="Select or Type..."
                      className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold uppercase text-sm"
                      value={formData.category}
                      onChange={e => setFormData({ ...formData, category: e.target.value })}
                    />
                    <datalist id="categoryOptions">
                      <option value="Clothing" />
                      <option value="Footwear" />
                      <option value="Electronics" />
                      <option value="Home & Living" />
                      <option value="Accessories" />
                      <option value="Beauty" />
                    </datalist>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Subcategory (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Gold Plated"
                      className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold uppercase text-sm"
                      value={formData.subcategory}
                      onChange={e => setFormData({ ...formData, subcategory: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* --- 2. MEDIA (Images + Video) --- */}
              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2">Media</h3>

                {/* VIDEO URL */}
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest flex items-center gap-2">
                    <Video size={14} /> Product Video
                  </label>
                  <div className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="Paste YouTube Link or Upload..."
                      className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black text-xs font-mono"
                      value={formData.video || ''}
                      onChange={e => setFormData({ ...formData, video: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => document.getElementById('videoInput').click()}
                      className="bg-black text-white px-4 py-4 rounded-xl hover:bg-zinc-800 flex items-center gap-2"
                    >
                      <Upload size={16} />
                      <span className="text-[10px] font-bold uppercase hidden md:inline">Upload</span>
                    </button>
                    <input
                      id="videoInput"
                      type="file"
                      accept="video/*"
                      className="hidden"
                      onChange={async (e) => {
                        const file = e.target.files[0];
                        if (!file) return;

                        if (file.size > 100 * 1024 * 1024) { // 100MB
                          addToast("File is too large (Max 100MB)", "error");
                          return;
                        }

                        const uploadData = new FormData();
                        uploadData.append('file', file);
                        setLoading(true);

                        try {
                          const { data } = await axios.post('http://localhost:5000/api/upload', uploadData, {
                            headers: { 'Content-Type': 'multipart/form-data' }
                          });
                          // Prepend server URL for consistency
                          const fullUrl = `http://localhost:5000${data.filePath}`;
                          setFormData(prev => ({ ...prev, video: fullUrl }));
                          addToast("Video uploaded successfully", "success");
                        } catch (err) {
                          addToast("Upload failed", "error");
                        } finally {
                          setLoading(false);
                        }
                      }}
                    />
                  </div>
                  <p className="text-[9px] text-zinc-400 mt-1 pl-1">Supports YouTube, Vimeo, or upload a file (Max 100MB).</p>
                </div>

                {/* Main Image Upload */}
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Main Product Image</label>
                  <div className="flex gap-2 items-center">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Paste URL or Upload..."
                        className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black text-xs pr-12"
                        value={formData.image}
                        onChange={e => setFormData({ ...formData, image: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        onClick={() => document.getElementById('mainImageInput').click()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition"
                      >
                        <Upload size={18} />
                      </button>
                    </div>
                    <input
                      id="mainImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => setFormData({ ...formData, image: reader.result });
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Additional Images */}
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Gallery ({formData.images.length}/4)</label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <input
                        type="text"
                        placeholder="Paste URL or click + to upload..."
                        className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-black text-xs pr-10"
                        value={newImageUrl}
                        onChange={e => setNewImageUrl(e.target.value)}
                      />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (newImageUrl.trim()) addImage(e);
                        else document.getElementById('multiImageInput').click();
                      }}
                      className="bg-black text-white px-4 rounded-xl hover:bg-zinc-800 flex items-center gap-2"
                    >
                      {newImageUrl.trim() ? <Save size={16} /> : <Upload size={16} />}
                      <span className="text-[10px] font-bold uppercase hidden md:inline">{newImageUrl.trim() ? "ADD" : "UPLOAD"}</span>
                    </button>
                    <input
                      id="multiImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (formData.images.length >= 4) return addToast("Max 4 images allowed", "error");
                          const reader = new FileReader();
                          reader.onloadend = () => setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }));
                          reader.readAsDataURL(file);
                        }
                        e.target.value = '';
                      }}
                    />
                  </div>
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-zinc-200 bg-zinc-50">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:text-red-500">
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>


              {/* --- 3. DESCRIPTION & SEO --- */}
              <div className="space-y-6 pt-6 border-t border-zinc-100">
                <h3 className="text-xs font-black uppercase tracking-widest text-zinc-900 border-b border-zinc-100 pb-2">Content & SEO</h3>

                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Description</label>
                  <textarea
                    rows="6"
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black text-sm"
                    value={formData.description}
                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                  ></textarea>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Meta Title (SEO)</label>
                    <input
                      type="text"
                      placeholder="SEO Title (Optional)"
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-black text-xs"
                      value={formData.seo?.metaTitle || ''}
                      onChange={e => setFormData({ ...formData, seo: { ...formData.seo, metaTitle: e.target.value } })}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Meta Description (SEO)</label>
                    <input
                      type="text"
                      placeholder="Brief summary for Google..."
                      className="w-full bg-zinc-50 border border-zinc-200 p-3 rounded-xl outline-none focus:border-black text-xs"
                      value={formData.seo?.metaDescription || ''}
                      onChange={e => setFormData({ ...formData, seo: { ...formData.seo, metaDescription: e.target.value } })}
                    />
                  </div>
                </div>
              </div>

              {/* --- 4. DATA & VARIANTS --- */}
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
                            placeholder="Color (e.g. Silver)"
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
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Total Stock Count</label>
                  <input
                    type="number"
                    placeholder="e.g. 50"
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold"
                    value={formData.countInStock}
                    onChange={e => setFormData({ ...formData, countInStock: e.target.value })}
                    required
                    readOnly={formData.variants && formData.variants.length > 0} // Read-only if variants exist
                  />
                  {formData.variants && formData.variants.length > 0 && <p className="text-[9px] text-zinc-400 mt-1">Calculated automatically from variants.</p>}
                </div>

                {/* TAGS */}
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Product Badges</label>
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

              <button disabled={loading} type="submit" className="w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition shadow-xl disabled:opacity-50 mt-8">
                {loading ? 'Publishing...' : 'Publish Product'}
              </button>

            </form>
          </div>

          {/* RIGHT: LIVE PREVIEW */}
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
                    <p className="text-[10px] font-black uppercase text-zinc-400 tracking-widest mb-1">{formData.category} {formData.subcategory && `• ${formData.subcategory}`}</p>
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
    </div>
  );
};

export default AddProduct;