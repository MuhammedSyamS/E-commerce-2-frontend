import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Calendar, User, ArrowRight } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Blog = () => {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPosts = async () => {
            try {
                const { data } = await axios.get('/api/blog');
                setPosts(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <section className="pt-32 pb-16 px-6 md:px-12 max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400 mb-3">Journal</p>
                    <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">The <span className="text-zinc-300">Edit</span></h1>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-xs font-bold uppercase animate-pulse">Loading Stories...</div>
                ) : posts.length === 0 ? (
                    <div className="text-center py-20 text-xs font-bold uppercase text-zinc-400">No stories yet. Stay tuned.</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                        {posts.map(post => (
                            <Link key={post._id} to={`/blog/${post.slug}`} className="group cursor-pointer">
                                <div className="aspect-[4/3] bg-zinc-100 mb-6 overflow-hidden rounded-none relative">
                                    {post.coverImage ? (
                                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-zinc-300 font-black text-4xl uppercase opacity-20 group-hover:opacity-30 transition-opacity">
                                            Slook
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500" />
                                </div>

                                <div className="space-y-3">
                                    <div className="flex items-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400">
                                        <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(post.publishedAt).toLocaleDateString()}</span>
                                        {post.tags && post.tags.length > 0 && <span>• {post.tags[0]}</span>}
                                    </div>

                                    <h2 className="text-2xl font-black uppercase leading-tight group-hover:text-zinc-600 transition-colors">{post.title}</h2>

                                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest mt-4 group/btn">
                                        Read Story <ArrowRight size={12} className="transition-transform group-hover/btn:translate-x-1" />
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>

            <Footer />
        </div>
    );
};

export default Blog;
