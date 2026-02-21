"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, Video, Check, X, Loader2, Globe, Layers } from "lucide-react"

interface Course {
    id: string
    title: string
    titleRu?: string
    description: string
    descriptionRu?: string
    price: number
    type: 'ONLINE' | 'OFFLINE'
    isActive: boolean
    coverImage?: string
    durationDays?: number
    durationLabel?: string
    location?: string
    locationRu?: string
    schedule?: string
    scheduleRu?: string
    times?: string
    timesRu?: string
}

export function CourseCRUD() {
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)
    const [editingCourse, setEditingCourse] = useState<Partial<Course> | null>(null)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState<'main' | 'uz' | 'ru' | 'offline'>('main')
    const [typeFilter, setTypeFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL')

    useEffect(() => {
        fetchCourses()
    }, [])

    const fetchCourses = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/courses')
            const data = await res.json()
            if (data.success) setCourses(data.courses)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const method = editingCourse?.id ? 'PUT' : 'POST'
        const url = editingCourse?.id ? `/api/admin/courses/${editingCourse.id}` : '/api/admin/courses'

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingCourse)
            })
            const data = await res.json()
            if (data.success) {
                setEditingCourse(null)
                fetchCourses()
            }
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Haqiqatan ham ushbu kursni o'chirib tashlamoqchimisiz?")) return
        try {
            await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
            fetchCourses()
        } catch (err) {
            console.error(err)
        }
    }

    if (loading) return <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" /></div>

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <h3 className="text-2xl font-serif font-black text-[var(--foreground)]">Kurslarni Boshqarish</h3>
                <button
                    onClick={() => { setEditingCourse({ type: 'ONLINE', isActive: true }); setActiveTab('main') }}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--glow)] hover:opacity-90 transition-all"
                >
                    <Plus className="w-4 h-4" /> Yangi kurs
                </button>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                {(['ALL', 'ONLINE', 'OFFLINE'] as const).map((type) => (
                    <button
                        key={type}
                        onClick={() => setTypeFilter(type)}
                        className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${typeFilter === type
                            ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--glow)]"
                            : "bg-[var(--primary)]/10 text-[var(--foreground)] opacity-40 hover:opacity-100"
                            }`}
                    >
                        {type === 'ALL' ? "Barchasi" : type}
                    </button>
                ))}
            </div>

            <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
                {courses
                    .filter(c => typeFilter === 'ALL' || c.type === typeFilter)
                    .map((course) => (
                        <motion.div
                            key={course.id}
                            layout
                            className="bg-[var(--card-bg)] border border-[var(--border)] rounded-[2.5rem] overflow-hidden group hover:shadow-2xl hover:shadow-[var(--glow)] transition-all duration-500 flex flex-col"
                        >
                            <div className="aspect-video relative overflow-hidden bg-[var(--primary)]/5">
                                {course.coverImage ? (
                                    <img src={course.coverImage} alt={course.title} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-700" />
                                ) : (
                                    <div className="flex items-center justify-center w-full h-full opacity-10 text-[var(--foreground)]">
                                        <Globe className="w-12 h-12" />
                                    </div>
                                )}
                                <div className="absolute top-4 left-4 flex gap-2">
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${course.type === 'ONLINE' ? 'bg-blue-500 text-white' : 'bg-orange-500 text-white'}`}>
                                        {course.type}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${course.isActive ? 'bg-purple-500 text-white' : 'bg-red-500 text-white'}`}>
                                        {course.isActive ? 'Active' : 'Draft'}
                                    </span>
                                </div>
                            </div>

                            <div className="p-8 flex-1 flex flex-col">
                                <h4 className="text-xl font-serif font-bold text-[var(--foreground)] mb-2 line-clamp-2">{course.title}</h4>
                                <p className="text-xs opacity-40 mb-6 font-bold uppercase tracking-widest text-[var(--foreground)]">
                                    {new Intl.NumberFormat('uz-UZ').format(Number(course.price))} UZS
                                </p>

                                <div className="mt-auto flex gap-2">
                                    <button
                                        onClick={() => { setEditingCourse(course); setActiveTab('main') }}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--primary)]/5 text-[var(--foreground)] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[var(--primary)]/10 transition-all"
                                    >
                                        <Edit2 className="w-3 h-3" /> Edit
                                    </button>
                                    <Link
                                        href={`/uz/admin/courses/${course.id}/lessons`}
                                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-[var(--primary)]/5 text-[var(--foreground)] rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-[var(--primary)]/10 transition-all"
                                    >
                                        <Video className="w-3 h-3" /> Lessons
                                    </Link>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="w-12 flex items-center justify-center py-3 text-red-400 hover:text-red-600 transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
            </div>

            <AnimatePresence>
                {editingCourse && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[var(--card-bg)] w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                        >
                            <div className="p-8 border-b border-[var(--border)] flex items-center justify-between bg-[var(--card-bg)] sticky top-0 z-10">
                                <h3 className="text-2xl font-serif font-black text-[var(--foreground)]">
                                    {editingCourse.id ? 'Kursni Tahrirlash' : 'Yangi Kurs'}
                                </h3>
                                <button type="button" onClick={() => setEditingCourse(null)} className="opacity-30 hover:opacity-100 text-[var(--foreground)]">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto">
                                <div className="px-8 pt-4 pb-0 flex gap-4 border-b border-[var(--border)] sticky top-0 bg-[var(--card-bg)] z-10">
                                    {['main', 'uz', 'ru', 'offline'].map(tab => (
                                        <button
                                            key={tab}
                                            type="button"
                                            onClick={() => setActiveTab(tab as any)}
                                            className={`pb-4 text-xs font-black uppercase tracking-widest transition-all relative ${activeTab === tab ? 'text-[var(--foreground)]' : 'text-[var(--foreground)] opacity-30 hover:opacity-60'}`}
                                        >
                                            {tab === 'main' && 'Asosiy'}
                                            {tab === 'uz' && 'O\'zbekcha'}
                                            {tab === 'ru' && 'Русский'}
                                            {tab === 'offline' && 'Offline'}
                                            {activeTab === tab && <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--primary)] rounded-t-full" />}
                                        </button>
                                    ))}
                                </div>

                                <div className="p-8 space-y-8">
                                    {activeTab === 'main' && (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Narxi</label>
                                                <input
                                                    required
                                                    type="number"
                                                    value={editingCourse.price || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, price: Number(e.target.value) })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-bold text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Turi</label>
                                                <select
                                                    value={editingCourse.type}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, type: e.target.value as any })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-bold text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                >
                                                    <option value="ONLINE">ONLINE</option>
                                                    <option value="OFFLINE">OFFLINE</option>
                                                </select>
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Davomiyligi (kun)</label>
                                                <input
                                                    type="number"
                                                    value={editingCourse.durationDays || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, durationDays: Number(e.target.value) })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-bold text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Davomiyligi (Matn - masalan "Doimiy")</label>
                                                <input
                                                    type="text"
                                                    value={editingCourse.durationLabel || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, durationLabel: e.target.value })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-bold text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                />
                                            </div>
                                            <div className="col-span-2 space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Rasm URL</label>
                                                <input
                                                    type="text"
                                                    value={editingCourse.coverImage || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, coverImage: e.target.value })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-bold text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                />
                                            </div>
                                            <div className="flex items-center gap-4 py-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Aktiv</label>
                                                <button
                                                    type="button"
                                                    onClick={() => setEditingCourse({ ...editingCourse, isActive: !editingCourse.isActive })}
                                                    className={`w-14 h-8 rounded-full transition-all relative ${editingCourse.isActive ? 'bg-[var(--primary)]' : 'bg-[var(--primary)]/10'}`}
                                                >
                                                    <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${editingCourse.isActive ? 'left-7' : 'left-1'}`} />
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'uz' && (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Sarlavha (UZ)</label>
                                                <input
                                                    required
                                                    type="text"
                                                    value={editingCourse.title || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, title: e.target.value })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-bold text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Tavsif (UZ)</label>
                                                <textarea
                                                    rows={5}
                                                    value={editingCourse.description || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, description: e.target.value })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-medium text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'ru' && (
                                        <div className="space-y-6">
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Sarlavha (RU)</label>
                                                <input
                                                    type="text"
                                                    value={editingCourse.titleRu || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, titleRu: e.target.value })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-bold text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Tavsif (RU)</label>
                                                <textarea
                                                    rows={5}
                                                    value={editingCourse.descriptionRu || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, descriptionRu: e.target.value })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-medium text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {activeTab === 'offline' && (
                                        <div className="grid md:grid-cols-2 gap-6">
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Joylashuv (UZ)</label>
                                                <input
                                                    type="text"
                                                    value={editingCourse.location || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, location: e.target.value })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-bold text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Joylashuv (RU)</label>
                                                <input
                                                    type="text"
                                                    value={editingCourse.locationRu || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, locationRu: e.target.value })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-bold text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Kunlar (UZ)</label>
                                                <input
                                                    type="text"
                                                    value={editingCourse.schedule || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, schedule: e.target.value })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-bold text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Kunlar (RU)</label>
                                                <input
                                                    type="text"
                                                    value={editingCourse.scheduleRu || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, scheduleRu: e.target.value })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-bold text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Vaqtlar (UZ)</label>
                                                <input
                                                    type="text"
                                                    value={editingCourse.times || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, times: e.target.value })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-bold text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                />
                                            </div>
                                            <div className="space-y-4">
                                                <label className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Vaqtlar (RU)</label>
                                                <input
                                                    type="text"
                                                    value={editingCourse.timesRu || ''}
                                                    onChange={(e) => setEditingCourse({ ...editingCourse, timesRu: e.target.value })}
                                                    className="w-full bg-[var(--primary)]/5 rounded-2xl p-4 font-bold text-[var(--foreground)] border-transparent focus:border-[var(--primary)]/20 focus:ring-0"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="p-8 border-t border-[var(--border)] bg-[var(--card-bg)] sticky bottom-0 z-10">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full py-5 bg-[var(--primary)] text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-[var(--glow)] flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98]"
                                    >
                                        {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                                        Saqlash
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

import Link from "next/link"


