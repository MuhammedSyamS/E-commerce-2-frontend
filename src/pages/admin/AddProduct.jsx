import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Plus, X, Upload } from 'lucide-react';
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
    discountPrice: '', // Sale Price
    category: 'Rings',
    subcategory: '', // Subcategory
    image: '', // Main Thumbnail
    images: [], // Additional Images
    tags: [], // Custom Badges
    description: '',
    specs: [], // { key, value }
    countInStock: 0,
    isBestSeller: false
  });

  const [newImageUrl, setNewImageUrl] = useState('');

  const addImage = (e) => {
    e.preventDefault(); // Prevent accidental form submit

    if (!newImageUrl.trim()) {
      addToast("Please enter a valid Image URL first.", "error");
      return;
    }

    if (formData.images.length >= 4) {
      addToast("You can only add up to 4 additional images.", "error");
      return;
    }

    setFormData(prev => ({ ...prev, images: [...prev.images, newImageUrl] }));
    setNewImageUrl('');
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post('http://localhost:5000/api/products', formData, config);
      navigate('/admin/products');
    } catch (err) {
      addToast("Failed to create product: " + (err.response?.data?.message || err.message), "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-20 pt-32">
      <div className="container mx-auto px-6 max-w-6xl">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate('/admin/products')} className="p-2 bg-white rounded-full shadow hover:bg-gray-100 transition">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-3xl font-black uppercase tracking-tighter italic">Add New Piece</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT: FORM */}
          <div className="lg:col-span-2 bg-white p-10 rounded-3xl shadow-sm border border-zinc-100">
            <form onSubmit={handleSubmit} className="space-y-8">

              <div>
                <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Product Name</label>
                <input
                  type="text"
                  placeholder="e.g. Silver Eagle Ring"
                  className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold uppercase text-sm"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Regular Price (₹)</label>
                  <input
                    type="number"
                    placeholder="e.g. 1999"
                    className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold"
                    value={formData.price}
                    onChange={e => setFormData({ ...formData, price: e.target.value })}
                    required
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
                  {/* DYNAMIC CATEGORY INPUT */}
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
                    <option value="Rings" />
                    <option value="Earrings" />
                    <option value="Necklaces" />
                    <option value="Bracelets" />
                    <option value="Pendants" />
                    <option value="Apparel" />
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

              <div>
                <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Inventory Count</label>
                <input
                  type="number"
                  placeholder="e.g. 50"
                  className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black font-bold"
                  value={formData.countInStock}
                  onChange={e => setFormData({ ...formData, countInStock: e.target.value })}
                  required
                />
              </div>

              {/* TAGS SECTION (Replaces simple checkbox) */}
              <div>
                <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Product Badges / Tags</label>
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
                          const newTags = formData.tags ? [...formData.tags, val] : [val];
                          setFormData({ ...formData, tags: newTags });
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
                        const newTags = formData.tags ? [...formData.tags, val] : [val];
                        setFormData({ ...formData, tags: newTags });
                        input.value = '';
                      }
                    }}
                    className="bg-black text-white px-4 rounded-xl hover:bg-zinc-800 text-[10px] font-bold uppercase"
                  >
                    Add
                  </button>
                </div>

                {/* Active Tags */}
                <div className="flex flex-wrap gap-2">
                  {formData.tags && formData.tags.map((tag, i) => (
                    <span key={i} className="bg-zinc-100 text-zinc-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                      {tag}
                      <button type="button" onClick={() => {
                        const newTags = formData.tags.filter(t => t !== tag);
                        setFormData({ ...formData, tags: newTags });
                      }}>
                        <X size={10} />
                      </button>
                    </span>
                  ))}
                  {(!formData.tags || formData.tags.length === 0) && <span className="text-[10px] text-zinc-300 italic">No tags added.</span>}
                </div>

                {/* Suggestions */}
                <div className="flex gap-2 mt-2">
                  {['Best Seller', 'New Arrival', 'Limited Edition', 'Seasonal'].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => {
                        if (!formData.tags?.includes(s)) {
                          const newTags = formData.tags ? [...formData.tags, s] : [s];
                          setFormData({ ...formData, tags: newTags });
                        }
                      }}
                      className="text-[9px] font-bold text-zinc-400 hover:text-black border border-dashed border-zinc-200 hover:border-black px-2 py-1 rounded-full transition"
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* IMAGES SECTION */}
              <div className="space-y-4 border-t border-zinc-100 pt-8">
                <h3 className="text-xs font-black uppercase tracking-widest">Product Imagery</h3>

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
                      {/* File Input Trigger Icon */}
                      <button
                        type="button"
                        onClick={() => document.getElementById('mainImageInput').click()}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-black transition"
                        title="Upload from Device"
                      >
                        <Upload size={18} />
                      </button>
                    </div>
                    {/* Hidden File Input */}
                    <input
                      id="mainImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData({ ...formData, image: reader.result }); // Base64
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                    />
                  </div>
                </div>

                {/* Additional Images Upload */}
                <div>
                  <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Additional Images ({formData.images.length}/4)</label>

                  {/* URL + Upload Bar */}
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

                    {/* The + Button now Triggers File Upload if URL is empty, or Adds URL if present */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        if (newImageUrl.trim()) {
                          addImage(e); // Add text URL
                        } else {
                          document.getElementById('multiImageInput').click(); // Trigger File Picker
                        }
                      }}
                      className="bg-black text-white px-4 rounded-xl hover:bg-zinc-800 flex items-center gap-2"
                      title={newImageUrl.trim() ? "Add URL" : "Upload File"}
                    >
                      {newImageUrl.trim() ? <Save size={16} /> : <Upload size={16} />}
                      <span className="text-[10px] font-bold uppercase hidden md:inline">{newImageUrl.trim() ? "ADD LINK" : "UPLOAD"}</span>
                    </button>

                    {/* Hidden File Input for Multiple Images */}
                    <input
                      id="multiImageInput"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          if (formData.images.length >= 4) {
                            addToast("You can only add up to 4 additional images.", "error");
                            return;
                          }
                          const reader = new FileReader();
                          reader.onloadend = () => {
                            setFormData(prev => ({ ...prev, images: [...prev.images, reader.result] }));
                          };
                          reader.readAsDataURL(file);
                        }
                        // Reset to allow selecting same file again if needed
                        e.target.value = '';
                      }}
                    />
                  </div>

                  {/* Image List */}
                  <div className="grid grid-cols-4 gap-4 mt-4">
                    {formData.images.map((img, idx) => (
                      <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-zinc-200 bg-zinc-50">
                        <img src={img} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(idx)}
                          className="absolute top-1 right-1 bg-white rounded-full p-1 shadow hover:text-red-500 hover:scale-110 transition"
                        >
                          <X size={12} />
                        </button>
                      </div>
                    ))}
                    {/* Placeholder for Adding More (Visual Cue) */}
                    {formData.images.length < 4 && (
                      <div
                        onClick={() => document.getElementById('multiImageInput').click()}
                        className="aspect-square rounded-lg border-2 border-dashed border-zinc-200 flex flex-col items-center justify-center text-zinc-300 hover:border-zinc-400 hover:text-zinc-500 cursor-pointer transition gap-1"
                      >
                        <Plus size={20} />
                        <span className="text-[8px] font-black uppercase text-center">Add Photo</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase mb-2 text-zinc-400 tracking-widest">Description</label>
                <textarea
                  rows="6"
                  placeholder="Detailed product description..."
                  className="w-full bg-zinc-50 border border-zinc-200 p-4 rounded-xl outline-none focus:border-black text-sm"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                ></textarea>
              </div>

              {/* SPECS SECTION */}
              <div className="space-y-4 border-t border-zinc-100 pt-8">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black uppercase tracking-widest">Specifications</h3>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, specs: [...formData.specs, { key: '', value: '' }] })}
                    className="text-[10px] font-bold uppercase bg-black text-white px-3 py-1 rounded-full hover:bg-zinc-800"
                  >
                    + Add Spec
                  </button>
                </div>

                {formData.specs.map((spec, index) => (
                  <div key={index} className="flex gap-4">
                    <input
                      type="text"
                      placeholder="Label (e.g. Material)"
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
                      placeholder="Value (e.g. Gold)"
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
                      onClick={() => {
                        const newSpecs = formData.specs.filter((_, i) => i !== index);
                        setFormData({ ...formData, specs: newSpecs });
                      }}
                      className="p-3 bg-red-50 text-red-500 rounded-xl hover:bg-red-100"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>



              <button disabled={loading} type="submit" className="w-full bg-black text-white py-5 rounded-full font-black uppercase tracking-[0.2em] hover:bg-zinc-800 transition shadow-xl disabled:opacity-50">
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