import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';
import { Plus, Trash2, Edit, ExternalLink, FileText, Eye, EyeOff } from 'lucide-react';

const AdminBlog = () => {
    const { user } = useStore();
    const { addToast } = useToast();
    const [posts, setPosts] = useState([]);
    const [isEditing, setIsEditing] = useState(false);
    const [currentPostId, setCurrentPostId] = useState(null);

    const [formData, setFormData] = useState({
        title: '',
        content: '', // HTML
        coverImage: '',
        tags: '',
        isPublished: false
    });

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const { data } = await axios.get('/api/blog/admin/all', config);
            setPosts(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            const payload = {
                ...formData,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
            };

            if (isEditing) {
                await axios.put(`/api/blog/${currentPostId}`, payload, config);
                addToast("Post Updated", "success");
            } else {
                await axios.post('/api/blog', payload, config);
                addToast("Post Created", "success");
            }
            fetchPosts();
            resetForm();
        } catch (err) {
            addToast("Operation failed", "error");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this post?")) return;
        try {
            const config = { headers: { Authorization: `Bearer ${user.token}` } };
            await axios.delete(`/api/blog/${id}`, config);
            setPosts(posts.filter(p => p._id !== id));
            addToast("Post Deleted", "success");
        } catch (err) {
            addToast("Delete failed", "error");
        }
    };

    const startEdit = (post) => {
        setIsEditing(true);
        setCurrentPostId(post._id);
        setFormData({
            title: post.title,
            content: post.content,
            coverImage: post.coverImage || '',
            tags: post.tags ? post.tags.join(', ') : '',
            isPublished: post.isPublished
        });
    };

    const resetForm = () => {
        setIsEditing(false);
        setCurrentPostId(null);
        setFormData({
            title: '',
            content: '',
            coverImage: '',
            tags: '',
            isPublished: false
        });
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List */}
            <div className="lg:col-span-1 space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-black uppercase italic">Posts ({posts.length})</h2>
                    {isEditing && (
                        <button onClick={resetForm} className="text-xs font-bold underline">Cancel Edit</button>
                    )}
                </div>
                <div className="space-y-3 max-h-[80vh] overflow-y-auto">
                    {posts.map(post => (
                        <div key={post._id} className={`p-4 rounded-xl border transition-all cursor-pointer ${currentPostId === post._id ? 'bg-black text-white border-black' : 'bg-white border-zinc-100 hover:border-zinc-300'}`}
                            onClick={() => startEdit(post)}>
                            <h3 className="font-bold text-sm truncate">{post.title}</h3>
                            <div className="flex items-center justify-between mt-2">
                                <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded ${post.isPublished ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-500'} ${currentPostId === post._id ? 'bg-white/20 text-white' : ''}`}>
                                    {post.isPublished ? 'Published' : 'Draft'}
                                </span>
                                <span className="text-[9px] opacity-70">{new Date(post.createdAt).toLocaleDateString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor */}
            <div className="lg:col-span-2">
                <div className="bg-white p-8 rounded-3xl border border-zinc-100 shadow-sm">
                    <h2 className="text-2xl font-black uppercase italic mb-6">{isEditing ? 'Edit Post' : 'New Post'}</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2">Title</label>
                            <input required type="text" className="w-full bg-zinc-50 p-4 rounded-xl font-bold outline-none focus:ring-2 ring-black/5"
                                value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2">Cover Image URL</label>
                            <input type="text" className="w-full bg-zinc-50 p-4 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-black/5"
                                value={formData.coverImage} onChange={e => setFormData({ ...formData, coverImage: e.target.value })} />
                        </div>

                        <div>
                            <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2">Content (HTML)</label>
                            <textarea required rows={15} className="w-full bg-zinc-50 p-4 rounded-xl text-sm font-mono outline-none focus:ring-2 ring-black/5 resize-none"
                                value={formData.content} onChange={e => setFormData({ ...formData, content: e.target.value })}
                                placeholder="<h1>Title</h1><p>Content...</p>" />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <label className="block text-[10px] font-black uppercase text-zinc-400 mb-2">Tags (Comma separated)</label>
                                <input type="text" className="w-full bg-zinc-50 p-4 rounded-xl text-sm font-medium outline-none focus:ring-2 ring-black/5"
                                    value={formData.tags} onChange={e => setFormData({ ...formData, tags: e.target.value })}
                                    placeholder="Fashion, Summer, Tips" />
                            </div>
                            <div className="flex items-center">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input type="checkbox" className="w-5 h-5 rounded border-zinc-300 text-black focus:ring-black"
                                        checked={formData.isPublished} onChange={e => setFormData({ ...formData, isPublished: e.target.checked })} />
                                    <span className="text-sm font-bold uppercase">Publish Immediately</span>
                                </label>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pt-4">
                            <button type="submit" className="flex-1 bg-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-transform">
                                {isEditing ? 'Update Post' : 'Create Post'}
                            </button>
                            {isEditing && (
                                <button type="button" onClick={() => handleDelete(currentPostId)} className="px-6 py-4 bg-red-50 text-red-500 rounded-xl font-black uppercase text-xs hover:bg-red-100 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AdminBlog;
