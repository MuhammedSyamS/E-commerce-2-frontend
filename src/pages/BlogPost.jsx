import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import { Calendar, User, ArrowLeft, Share2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const BlogPost = () => {
    const { slug } = useParams();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPost = async () => {
            try {
                const { data } = await axios.get(`/api/blog/${slug}`);
                setPost(data);
                setLoading(false);
            } catch (err) {
                console.error(err);
                setLoading(false);
            }
        };
        fetchPost();
    }, [slug]);

    if (loading) return <div className="min-h-screen bg-white flex items-center justify-center text-xs font-bold uppercase animate-pulse">Loading Story...</div>;
    if (!post) return <div className="min-h-screen bg-white flex items-center justify-center text-xs font-bold uppercase text-zinc-400">Story Not Found</div>;

    return (
        <div className="min-h-screen bg-white">
            <Navbar />

            <article className="pt-32 pb-16">
                {/* Header */}
                <div className="px-6 md:px-12 max-w-4xl mx-auto text-center mb-12">
                    <Link to="/blog" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-black mb-8 transition-colors">
                        <ArrowLeft size={12} /> Back to Journal
                    </Link>

                    <div className="flex items-center justify-center gap-4 text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-6">
                        <span>{new Date(post.publishedAt).toLocaleDateString()}</span>
                        <span>•</span>
                        <span>{post.author}</span>
                    </div>

                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-black uppercase leading-[0.9] italic break-words">{post.title}</h1>

                    {post.tags && (
                        <div className="flex justify-center gap-2 mt-8">
                            {post.tags.map(tag => (
                                <span key={tag} className="px-3 py-1 border border-zinc-200 rounded-full text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                {/* Cover Image */}
                {post.coverImage && (
                    <div className="w-full h-[50vh] md:h-[70vh] mb-16 overflow-hidden">
                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover" />
                    </div>
                )}

                {/* Content */}
                <div className="px-6 md:px-12 max-w-3xl mx-auto">
                    <div
                        className="prose prose-zinc prose-lg max-w-none 
                        prose-headings:font-black prose-headings:uppercase prose-headings:italic 
                        prose-p:font-medium prose-p:text-zinc-600 
                        prose-a:text-black prose-a:font-bold prose-a:no-underline hover:prose-a:underline
                        prose-blockquote:border-l-4 prose-blockquote:border-black prose-blockquote:pl-6 prose-blockquote:italic prose-blockquote:font-bold
                        prose-img:rounded-xl"
                        dangerouslySetInnerHTML={{ __html: post.content }}
                    />
                </div>
            </article>

            <Footer />
        </div>
    );
};

export default BlogPost;
