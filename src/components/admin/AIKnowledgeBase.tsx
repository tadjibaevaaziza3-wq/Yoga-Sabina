"use client"

import React, { useState, useEffect } from "react"
import { Search, Plus, Trash2, Brain, AlertCircle, CheckCircle2, Loader2, Sparkles, X } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface KBEntry {
    id: string
    title: string
    summary: string
    topics: string[]
    transcript: string
    createdAt: string
}

export function AIKnowledgeBase() {
    const [entries, setEntries] = useState<KBEntry[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [isAdding, setIsAdding] = useState(false)
    const [status, setStatus] = useState<{ type: 'success' | 'error', message: string } | null>(null)

    // Form state
    const [newEntry, setNewEntry] = useState({
        title: "",
        summary: "",
        transcript: "",
        topics: ""
    })
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchEntries()
    }, [])

    const fetchEntries = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/ai/train')
            const data = await res.json()
            if (data.success) {
                setEntries(data.entries)
            }
        } catch (e) {
            console.error('Failed to fetch KB entries:', e)
        } finally {
            setLoading(false)
        }
    }

    const handleAdd = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        setStatus(null)
        try {
            const res = await fetch('/api/admin/ai/train', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...newEntry,
                    topics: newEntry.topics.split(',').map(t => t.trim()).filter(t => t)
                }),
            })
            const data = await res.json()
            if (data.success) {
                setStatus({ type: 'success', message: "Ma'lumotlar bazaga muvaffaqiyatli qo'shildi va embeddinglar yaratildi." })
                setIsAdding(false)
                setNewEntry({ title: "", summary: "", transcript: "", topics: "" })
                fetchEntries()
            } else {
                setStatus({ type: 'error', message: data.error || "Xatolik yuz berdi" })
            }
        } catch (e) {
            setStatus({ type: 'error', message: "Server bilan bog'lanishda xatolik" })
        } finally {
            setSubmitting(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Haqiqatan ham ushbu ma'lumotni o'chirib tashlamoqchimisiz?")) return

        try {
            const res = await fetch(`/api/admin/ai/train?id=${id}`, { method: 'DELETE' })
            const data = await res.json()
            if (data.success) {
                setEntries(entries.filter(e => e.id !== id))
            }
        } catch (e) {
            console.error('Delete failed:', e)
        }
    }

    const filteredEntries = entries.filter(e =>
        e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    return (
        <div className="space-y-8">
            {/* Header section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-editorial font-bold text-[var(--primary)] mb-2 flex items-center gap-3">
                        <Brain className="w-8 h-8 text-[var(--accent)]" />
                        AI Bilimlar Bazasi
                    </h2>
                    <p className="text-xs font-bold text-[var(--accent)] uppercase tracking-[0.3em]">
                        RAG Engine uchun video transkriptlarini boshqarish
                    </p>
                </div>
                <button
                    onClick={() => setIsAdding(!isAdding)}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-lg"
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    {isAdding ? "Bekor qilish" : "Yangi Transkript Qo'shish"}
                </button>
            </div>

            {/* Status alerts */}
            <AnimatePresence>
                {status && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className={`p-4 rounded-2xl flex items-center gap-3 ${status.type === 'success' ? 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-600 border border-rose-500/20'
                            }`}
                    >
                        {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                        <p className="text-xs font-bold uppercase tracking-wider">{status.message}</p>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Addition form */}
            <AnimatePresence>
                {isAdding && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleAdd}
                        className="overflow-hidden bg-[var(--primary)]/5 p-8 rounded-[2.5rem] border border-[var(--primary)]/10 space-y-6"
                    >
                        <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/50 ml-2">Video Sarlavhasi</label>
                                <input
                                    required
                                    value={newEntry.title}
                                    onChange={e => setNewEntry({ ...newEntry, title: e.target.value })}
                                    className="w-full px-6 py-4 bg-white rounded-2xl border border-[var(--primary)]/5 focus:border-[var(--primary)]/20 outline-none transition-all text-sm"
                                    placeholder="Masalan: Kundalik Yoga asoslari"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/50 ml-2">Mavzular (vergul bilan ajrating)</label>
                                <input
                                    value={newEntry.topics}
                                    onChange={e => setNewEntry({ ...newEntry, topics: e.target.value })}
                                    className="w-full px-6 py-4 bg-white rounded-2xl border border-[var(--primary)]/5 focus:border-[var(--primary)]/20 outline-none transition-all text-sm"
                                    placeholder="yoga, meditatsiya, sog'liq"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/50 ml-2">Qisqacha mazmuni (Summary)</label>
                            <textarea
                                required
                                value={newEntry.summary}
                                onChange={e => setNewEntry({ ...newEntry, summary: e.target.value })}
                                className="w-full px-6 py-4 bg-white rounded-2xl border border-[var(--primary)]/5 focus:border-[var(--primary)]/20 outline-none transition-all text-sm min-h-[80px]"
                                placeholder="Video haqida qisqacha ma'lumot..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/50 ml-2">To'liq Transkript / Matn</label>
                            <textarea
                                required
                                value={newEntry.transcript}
                                onChange={e => setNewEntry({ ...newEntry, transcript: e.target.value })}
                                className="w-full px-6 py-4 bg-white rounded-2xl border border-[var(--primary)]/5 focus:border-[var(--primary)]/20 outline-none transition-all text-sm min-h-[200px]"
                                placeholder="Videodagi barcha so'zlar yoki asosiy ma'lumotlar..."
                            />
                        </div>

                        <button
                            disabled={submitting}
                            type="submit"
                            className="w-full py-5 bg-[var(--primary)] text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 shadow-xl hover:opacity-90 disabled:opacity-50 transition-all"
                        >
                            {submitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                            AI Bazaga Qo'shish va Embedding Yaratish
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Search and list view */}
            <div className="space-y-6">
                <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--primary)]/20" />
                    <input
                        type="text"
                        placeholder="Bilimlar bazasidan qidiring..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 py-4 bg-white rounded-[1.5rem] border border-[var(--primary)]/10 focus:border-[var(--primary)]/30 outline-none transition-all text-sm shadow-sm"
                    />
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20 grayscale opacity-30">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <p className="text-xs font-bold uppercase tracking-widest">Yuklanmoqda...</p>
                    </div>
                ) : filteredEntries.length === 0 ? (
                    <div className="p-20 text-center bg-white/50 border border-dashed border-[var(--primary)]/10 rounded-[3rem]">
                        <Brain className="w-12 h-12 text-[var(--primary)]/5 mx-auto mb-4" />
                        <p className="text-sm text-[var(--primary)]/40 font-medium italic">Hozircha hech qanday bilimlar bazasi elementi mavjud emas.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {filteredEntries.map((entry) => (
                            <div key={entry.id} className="bg-white p-6 rounded-[2rem] border border-[var(--primary)]/5 hover:border-[var(--primary)]/10 transition-all group flex items-start justify-between gap-6 shadow-sm">
                                <div className="space-y-3 flex-1">
                                    <div className="flex items-center gap-3">
                                        <h4 className="font-bold text-[var(--primary)] text-lg">{entry.title}</h4>
                                        <div className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold rounded-full border border-emerald-500/20">
                                            Embedded
                                        </div>
                                    </div>
                                    <p className="text-xs text-[var(--primary)]/60 line-clamp-2 leading-relaxed">
                                        {entry.summary}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {entry.topics.map((topic, i) => (
                                            <span key={i} className="px-3 py-1 bg-[var(--primary)]/5 text-[var(--primary)]/40 text-[9px] font-black uppercase tracking-widest rounded-full">
                                                #{topic}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="text-[10px] font-bold text-[var(--primary)]/20 uppercase tracking-widest flex items-center gap-2">
                                        ID: {entry.id} тАв Qo'shildi: {new Date(entry.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                <button
                                    onClick={() => handleDelete(entry.id)}
                                    className="p-3 bg-rose-500/5 text-rose-500 hover:bg-rose-500 hover:text-white rounded-2xl transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
