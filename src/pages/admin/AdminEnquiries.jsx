import React, { useEffect, useState, useCallback } from 'react';
import api from '../../api/instance';
import { useStore } from '../../store/useStore';
import { useToast } from '../../context/ToastContext';
import {
    Mail, Search, Trash2, RefreshCw,
    ChevronRight, MessageCircle, X, Send, CheckCircle
} from 'lucide-react';
import { io } from 'socket.io-client';

/* ─── STATUS CONFIG ─────────────────────────────── */
const STATUS_CFG = {
    New: { color: '#7c3aed', bg: '#7c3aed12', label: 'New', dot: true },
    Read: { color: '#0284c7', bg: '#0284c712', label: 'Read', dot: false },
    Replied: { color: '#059669', bg: '#05966912', label: 'Replied', dot: false },
};

const Badge = ({ status }) => {
    const s = STATUS_CFG[status] || STATUS_CFG.New;
    return (
        <span style={{ background: s.bg, color: s.color, fontSize: 8, fontWeight: 900, letterSpacing: 1.5, padding: '3px 8px', borderRadius: 999, textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
            {s.dot && <span style={{ width: 5, height: 5, borderRadius: 999, background: s.color, display: 'inline-block' }} />}
            {s.label}
        </span>
    );
};

const fmtDate = d => {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export default function AdminEnquiries() {
    const { user } = useStore();
    const { addToast } = useToast();

    const [enquiries, setEnquiries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selected, setSelected] = useState(null);
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('All');
    const [updating, setUpdating] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [confirmDelete, setConfirmDelete] = useState(false);

    // Reply state
    const [replyText, setReplyText] = useState('');
    const [sending, setSending] = useState(false);

    /* ── Fetch ── */
    const fetchAll = useCallback(async () => {
        setLoading(true);
        try {
            const { data } = await api.get('/support/admin/contacts');
            setEnquiries(data);
        } catch {
            addToast('Failed to load enquiries', 'error');
        } finally {
            setLoading(false);
        }
    }, [user?.token]);

    useEffect(() => {
        fetchAll();

        // --- SOCKET.IO ---
        const socket = io();

        socket.on('new-contact', (data) => {
            addToast(`New Guest Inquiry: ${data.name}`, "info");
            fetchAll();
        });

        return () => {
            socket.disconnect();
        };
    }, [fetchAll]);

    /* ── Select + auto-mark as Read ── */
    const handleSelect = async (enq) => {
        setSelected(enq);
        setConfirmDelete(false);
        setReplyText('');
        if (enq.status === 'New') {
            setEnquiries(prev => prev.map(e => e._id === enq._id ? { ...e, status: 'Read', readByAdmin: true } : e));
            setSelected(s => s?._id === enq._id ? { ...s, status: 'Read', readByAdmin: true } : s);
            try { await api.put(`/support/admin/contacts/${enq._id}`, { status: 'Read' }); } catch { }
        }
    };

    /* ── Status change ── */
    const handleStatusChange = async (newStatus) => {
        if (!selected) return;
        setUpdating(true);
        try {
            const { data } = await api.put(`/support/admin/contacts/${selected._id}`, { status: newStatus });
            setEnquiries(prev => prev.map(e => e._id === data._id ? data : e));
            setSelected(data);
            addToast(`Marked as ${newStatus}`, 'success');
        } catch { addToast('Update failed', 'error'); }
        finally { setUpdating(false); }
    };

    /* ── Send Email Reply ── */
    const handleSendReply = async () => {
        if (!replyText.trim()) { addToast('Please type a reply message', 'error'); return; }
        setSending(true);
        try {
            const { data } = await api.post(
                `/support/admin/contacts/${selected._id}/reply`,
                { replyMessage: replyText }
            );
            setEnquiries(prev => prev.map(e => e._id === data.contact._id ? data.contact : e));
            setSelected(data.contact);
            setReplyText('');
            addToast('Reply sent successfully via email!', 'success');
        } catch (err) {
            addToast(err?.response?.data?.message || 'Failed to send reply', 'error');
        } finally {
            setSending(false);
        }
    };

    /* ── Delete ── */
    const handleDelete = async () => {
        if (!selected) return;
        if (!confirmDelete) { setConfirmDelete(true); return; }
        setDeleting(true);
        try {
            await api.delete(`/support/admin/contacts/${selected._id}`);
            setEnquiries(prev => prev.filter(e => e._id !== selected._id));
            setSelected(null);
            setConfirmDelete(false);
            addToast('Enquiry deleted', 'success');
        } catch { addToast('Delete failed', 'error'); }
        finally { setDeleting(false); }
    };

    /* ── Filtered ── */
    const filtered = enquiries.filter(e => {
        const matchStatus = filterStatus === 'All' || e.status === filterStatus;
        const q = search.toLowerCase();
        const matchSearch = !q || e.name?.toLowerCase().includes(q) || e.email?.toLowerCase().includes(q) || e.subject?.toLowerCase().includes(q);
        return matchStatus && matchSearch;
    });

    const total = enquiries.length;
    const newCount = enquiries.filter(e => e.status === 'New').length;
    const readCount = enquiries.filter(e => e.status === 'Read').length;
    const repliedCount = enquiries.filter(e => e.status === 'Replied').length;

    return (
        <div className="space-y-6 pb-16">
            {/* HEADER */}
            <div style={{ background: 'linear-gradient(135deg,#09090b 0%,#18181b 60%,#1c1917 100%)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 20, padding: '28px 32px', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                            <span className="text-[9px] font-black text-violet-400 uppercase tracking-[3px]">Customer Messages</span>
                        </div>
                        <h1 style={{ background: 'linear-gradient(135deg,#fff 30%,#a1a1aa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
                            className="text-4xl font-black italic tracking-tighter leading-none">ENQUIRIES</h1>
                        <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[2px] mt-1">All customer contact form submissions</p>
                    </div>
                    <button onClick={fetchAll} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 18px' }}
                        className="flex items-center gap-2 text-white text-[10px] font-black uppercase tracking-widest hover:opacity-80 transition">
                        <RefreshCw size={12} /> Refresh
                    </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-5" style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                    {[{ l: 'Total', v: total, c: '#a1a1aa' }, { l: 'New', v: newCount, c: '#7c3aed' }, { l: 'Read', v: readCount, c: '#0284c7' }, { l: 'Replied', v: repliedCount, c: '#059669' }].map((s, i) => (
                        <div key={i}>
                            <p style={{ color: s.c, fontSize: 9, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4 }}>{s.l}</p>
                            <p style={{ color: '#fff', fontSize: 28, fontWeight: 900, letterSpacing: -1, lineHeight: 1 }}>{s.v}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* FILTERS */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={13} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name, email or subject..."
                        className="w-full pl-9 pr-4 py-2.5 text-xs font-medium bg-white border border-zinc-200 rounded-xl outline-none focus:border-violet-400 transition" />
                </div>
                <div style={{ background: '#f4f4f5', borderRadius: 12, padding: 4 }} className="flex items-center gap-1 flex-shrink-0">
                    {['All', 'New', 'Read', 'Replied'].map(s => (
                        <button key={s} onClick={() => setFilterStatus(s)}
                            style={filterStatus === s ? { background: '#fff', color: '#09090b', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' } : { color: '#71717a' }}
                            className="px-3 py-1.5 text-[10px] font-black uppercase tracking-wider rounded-lg transition">
                            {s}{s === 'New' && newCount > 0 && <span style={{ background: '#7c3aed', color: '#fff', borderRadius: 999, fontSize: 8, padding: '1px 5px', marginLeft: 3 }}>{newCount}</span>}
                        </button>
                    ))}
                </div>
            </div>

            {/* MASTER-DETAIL */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <div style={{ border: '2px solid #7c3aed20', borderTop: '2px solid #7c3aed', borderRadius: 999, width: 36, height: 36 }} className="animate-spin" />
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
                    {/* LIST */}
                    <div className="lg:col-span-2 space-y-2 max-h-[70vh] overflow-y-auto pr-1 custom-scrollbar">
                        {filtered.length === 0 ? (
                            <div className="flex flex-col items-center justify-center gap-3 py-16 text-zinc-300">
                                <Mail size={32} strokeWidth={1.5} />
                                <p className="text-[10px] font-black uppercase tracking-[2px]">No enquiries found</p>
                            </div>
                        ) : filtered.map(enq => (
                            <div key={enq._id} onClick={() => handleSelect(enq)}
                                style={{ border: selected?._id === enq._id ? '1.5px solid #7c3aed' : '1px solid #e4e4e7', background: selected?._id === enq._id ? '#faf5ff' : '#fff', borderRadius: 14, padding: '14px 16px', cursor: 'pointer', transition: 'all 0.15s ease' }}
                                className="hover:shadow-sm">
                                <div className="flex justify-between items-start mb-1.5">
                                    <div className="flex items-center gap-2">
                                        {enq.status === 'New' && <div style={{ width: 7, height: 7, borderRadius: 999, background: '#7c3aed', flexShrink: 0 }} />}
                                        <p style={{ fontSize: 11, fontWeight: 700, color: '#09090b' }} className="truncate max-w-[160px]">{enq.name || 'Unknown'}</p>
                                    </div>
                                    <Badge status={enq.status} />
                                </div>
                                <p style={{ fontSize: 10, color: '#71717a', fontWeight: 600, marginBottom: 2 }} className="truncate">{enq.subject || 'No subject'}</p>
                                <p style={{ fontSize: 9, color: '#a1a1aa' }}>{enq.email}</p>
                                <div className="flex justify-between items-center mt-2">
                                    <p style={{ fontSize: 8, color: '#a1a1aa' }}>{fmtDate(enq.createdAt)}</p>
                                    <ChevronRight size={12} className="text-zinc-300" />
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* DETAIL */}
                    <div className="lg:col-span-3">
                        {selected ? (
                            <div style={{ background: '#fff', border: '1px solid #e4e4e7', borderRadius: 20, padding: '28px', position: 'sticky', top: 24, maxHeight: '80vh', overflowY: 'auto' }}
                                className="custom-scrollbar">
                                {/* Top bar */}
                                <div className="flex justify-between items-start mb-5 pb-4" style={{ borderBottom: '1px solid #f4f4f5' }}>
                                    <div>
                                        <Badge status={selected.status} />
                                        <h2 style={{ fontSize: 18, fontWeight: 900, color: '#09090b', marginTop: 8, lineHeight: 1.2 }}>{selected.subject || 'No Subject'}</h2>
                                    </div>
                                    <button onClick={() => setSelected(null)} className="text-zinc-400 hover:text-zinc-700 transition p-1"><X size={16} /></button>
                                </div>

                                {/* Sender info */}
                                <div className="grid grid-cols-2 gap-4 mb-5">
                                    {[['Sender', selected.name], ['Email', selected.email], ['Received', fmtDate(selected.createdAt)], ['Status', selected.status]].map(([l, v]) => (
                                        <div key={l}>
                                            <p style={{ fontSize: 8, color: '#a1a1aa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 2 }}>{l}</p>
                                            <p style={{ fontSize: 12, color: '#09090b', fontWeight: 600 }}>{v}</p>
                                        </div>
                                    ))}
                                </div>

                                {/* Customer's message */}
                                <div style={{ background: '#fafafa', border: '1px solid #f4f4f5', borderRadius: 14, padding: '16px 18px', marginBottom: 20 }}>
                                    <p style={{ fontSize: 9, color: '#a1a1aa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>Customer Message</p>
                                    <p style={{ fontSize: 13, color: '#3f3f46', lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>{selected.message}</p>
                                </div>

                                {/* Previous reply if any */}
                                {selected.adminReply && (
                                    <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 14, padding: '14px 18px', marginBottom: 20 }}>
                                        <div className="flex items-center gap-2 mb-2">
                                            <CheckCircle size={12} style={{ color: '#059669' }} />
                                            <p style={{ fontSize: 9, color: '#059669', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5 }}>Previous Reply Sent</p>
                                        </div>
                                        <p style={{ fontSize: 12, color: '#3f3f46', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selected.adminReply}</p>
                                    </div>
                                )}

                                {/* ── REPLY BOX ── */}
                                <div style={{ background: '#faf5ff', border: '1.5px solid #ddd6fe', borderRadius: 16, padding: '18px' }} className="mb-4">
                                    <p style={{ fontSize: 9, color: '#7c3aed', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 8 }}>
                                        Reply to {selected.name} · sent from help.slook@gmail.com
                                    </p>
                                    <textarea
                                        value={replyText}
                                        onChange={e => setReplyText(e.target.value)}
                                        placeholder={`Hi ${selected.name},\n\nThank you for reaching out...`}
                                        rows={5}
                                        style={{ width: '100%', fontSize: 13, color: '#09090b', lineHeight: 1.6, background: '#fff', border: '1px solid #e4e4e7', borderRadius: 10, padding: '12px 14px', outline: 'none', resize: 'vertical', fontFamily: 'inherit' }}
                                        onFocus={e => e.target.style.borderColor = '#7c3aed'}
                                        onBlur={e => e.target.style.borderColor = '#e4e4e7'}
                                    />
                                    <button onClick={handleSendReply} disabled={sending || !replyText.trim()}
                                        style={{
                                            marginTop: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                                            background: sending || !replyText.trim() ? '#a5b4fc' : 'linear-gradient(135deg,#7c3aed,#6d28d9)',
                                            color: '#fff', borderRadius: 10, padding: '12px 20px', fontSize: 11, fontWeight: 900,
                                            textTransform: 'uppercase', letterSpacing: 1.5, cursor: sending || !replyText.trim() ? 'not-allowed' : 'pointer',
                                            boxShadow: sending || !replyText.trim() ? 'none' : '0 6px 16px rgba(124,58,237,0.35)',
                                            transition: 'all 0.15s', border: 'none',
                                        }}>
                                        <Send size={13} />
                                        {sending ? 'Sending...' : 'Send Reply via Email'}
                                    </button>
                                </div>

                                {/* Status pills */}
                                <div className="mb-4">
                                    <p style={{ fontSize: 9, color: '#a1a1aa', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 6 }}>Mark as</p>
                                    <div className="flex gap-2 flex-wrap">
                                        {['New', 'Read', 'Replied'].map(s => (
                                            <button key={s} onClick={() => handleStatusChange(s)} disabled={updating || selected.status === s}
                                                style={{
                                                    background: selected.status === s ? STATUS_CFG[s]?.bg : '#f4f4f5',
                                                    color: selected.status === s ? STATUS_CFG[s]?.color : '#71717a',
                                                    border: `1px solid ${selected.status === s ? STATUS_CFG[s]?.color + '40' : 'transparent'}`,
                                                    borderRadius: 999, padding: '6px 16px', fontSize: 9, fontWeight: 900,
                                                    textTransform: 'uppercase', letterSpacing: 1.5,
                                                    cursor: selected.status === s ? 'default' : 'pointer',
                                                    opacity: updating ? 0.6 : 1, transition: 'all 0.15s',
                                                }}>{s}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Delete */}
                                <button onClick={handleDelete} disabled={deleting}
                                    style={{
                                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%',
                                        background: confirmDelete ? '#dc2626' : '#fef2f2',
                                        color: confirmDelete ? '#fff' : '#dc2626',
                                        borderRadius: 12, padding: '10px 20px', fontSize: 10, fontWeight: 900,
                                        textTransform: 'uppercase', letterSpacing: 1.5, cursor: 'pointer',
                                        border: '1px solid #fecaca', transition: 'all 0.15s',
                                    }}>
                                    <Trash2 size={12} />
                                    {deleting ? 'Deleting...' : confirmDelete ? 'Are you sure? Click to confirm' : 'Delete Enquiry'}
                                </button>
                                {confirmDelete && (
                                    <button onClick={() => setConfirmDelete(false)} className="w-full text-center text-[9px] font-bold text-zinc-400 hover:text-zinc-600 transition mt-2">
                                        Cancel
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div style={{ border: '2px dashed #e4e4e7', borderRadius: 20, height: 320 }} className="flex flex-col items-center justify-center gap-3">
                                <MessageCircle size={32} className="text-zinc-200" strokeWidth={1.5} />
                                <p style={{ fontSize: 10, fontWeight: 800, color: '#d4d4d8', textTransform: 'uppercase', letterSpacing: 2 }}>Select an enquiry to view</p>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
