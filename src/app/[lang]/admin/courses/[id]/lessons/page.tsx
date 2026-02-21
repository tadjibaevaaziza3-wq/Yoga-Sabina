"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Plus, Edit2, Trash2, ArrowLeft, Video, Youtube, FileText, Music, Link as LinkIcon, Save, X, Loader2, Check, Upload } from "lucide-react"
import VideoUpload from "@/components/admin/VideoUpload"
import Link from "next/link"

interface Asset {
    id?: string
    type: 'VIDEO' | 'AUDIO' | 'TEXT' | 'PPT'
    name: string
    url: string
    size?: number
}

interface Lesson {
    id: string
    title: string
    description?: string
    videoUrl?: string
    duration?: number
    isFree: boolean
    order: number
    content?: string
    assets: Asset[]
}


export default function AdminLessonsPage({ params }: { params: { id: string, lang: string } }) {
    const { lang, id } = params
    const router = useRouter()

    const [lessons, setLessons] = useState<Lesson[]>([])
    const [loading, setLoading] = useState(true)
    const [editingLesson, setEditingLesson] = useState<Partial<Lesson> | null>(null)
    const [saving, setSaving] = useState(false)

    useEffect(() => {
        fetchLessons()
    }, [])

    const fetchLessons = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/courses/${id}/lessons`)
            const data = await res.json()
            if (data.success) setLessons(data.lessons)
        } finally {
            setLoading(false)
        }
    }

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setSaving(true)
        const method = editingLesson?.id ? 'PUT' : 'POST'
        const url = editingLesson?.id
            ? `/api/admin/courses/${id}/lessons/${editingLesson.id}`
            : `/api/admin/courses/${id}/lessons`

        try {
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(editingLesson)
            })
            const data = await res.json()
            if (data.success) {
                setEditingLesson(null)
                fetchLessons()
            }
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (lessonId: string) => {
        if (!confirm("O'chirib tashlansinmi?")) return
        try {
            await fetch(`/api/admin/courses/${id}/lessons/${lessonId}`, { method: 'DELETE' })
            fetchLessons()
        } catch (err) {
            console.error(err)
        }
    }

    const addAsset = () => {
        const currentAssets = editingLesson?.assets || []
        setEditingLesson({
            ...editingLesson,
            assets: [...currentAssets, { type: 'TEXT', name: '', url: '' }]
        })
    }

    const removeAsset = (index: number) => {
        const currentAssets = [...(editingLesson?.assets || [])]
        currentAssets.splice(index, 1)
        setEditingLesson({ ...editingLesson, assets: currentAssets })
    }

    const updateAsset = (index: number, field: keyof Asset, value: any) => {
        const currentAssets = [...(editingLesson?.assets || [])]
        currentAssets[index] = { ...currentAssets[index], [field]: value }
        setEditingLesson({ ...editingLesson, assets: currentAssets })
    }

    return (
        <div className="min-h-screen bg-[var(--background)] p-8">
            <div className="max-w-6xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href={`/${lang}/admin`} className="w-10 h-10 bg-[var(--card-bg)] rounded-full flex items-center justify-center text-[var(--foreground)] shadow-sm hover:shadow-md transition-all border border-[var(--border)]">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <div>
                            <h1 className="text-2xl font-serif font-black text-[var(--foreground)]">Darslar</h1>
                            <p className="text-xs font-bold text-[var(--primary)] uppercase tracking-widest">Kurs tarkibini boshqarish</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setEditingLesson({ isFree: false, order: lessons.length + 1, assets: [] })}
                        className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--glow)] hover:opacity-90 transition-all"
                    >
                        <Plus className="w-4 h-4" /> Yangi dars
                    </button>
                </div>

                {loading ? (
                    <div className="flex justify-center p-20"><Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" /></div>
                ) : (
                    <div className="space-y-4">
                        {lessons.map((lesson) => (
                            <motion.div
                                key={lesson.id}
                                layout
                                className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border)] shadow-sm hover:shadow-lg hover:shadow-[var(--glow)] transition-all flex items-center gap-6 group"
                            >
                                <div className="w-12 h-12 bg-[var(--secondary)] rounded-2xl flex items-center justify-center text-[var(--primary)] font-black text-lg">
                                    {lesson.order}
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-lg font-bold text-[var(--foreground)] mb-1">{lesson.title}</h3>
                                    <div className="flex items-center gap-4 text-xs font-bold text-[var(--foreground)]/60 uppercase tracking-widest">
                                        {lesson.videoUrl && <span className="flex items-center gap-1"><Video className="w-3 h-3 text-[var(--primary)]" /> Video</span>}
                                        {lesson.duration && <span>{Math.floor(lesson.duration / 60)} min</span>}
                                        {lesson.isFree && <span className="text-green-400 bg-green-400/10 px-2 py-0.5 rounded-full border border-green-400/20">Free Preview</span>}
                                        <span>{lesson.assets.length} files</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                                    <button
                                        onClick={() => setEditingLesson(lesson)}
                                        className="w-10 h-10 rounded-xl bg-[var(--secondary)] text-[var(--foreground)] flex items-center justify-center hover:text-[var(--primary)] transition-all"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(lesson.id)}
                                        className="w-10 h-10 rounded-xl bg-red-500/10 text-red-500 flex items-center justify-center hover:bg-red-500/20 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            <AnimatePresence>
                {editingLesson && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-[#0f1115] w-full max-w-3xl rounded-[3rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col border border-[var(--border)]"
                        >
                            <div className="p-8 border-b border-[var(--border)] flex items-center justify-between bg-[#0f1115] sticky top-0 z-10">
                                <h3 className="text-2xl font-serif font-black text-[var(--foreground)]">
                                    {editingLesson.id ? 'Darsni Tahrirlash' : 'Yangi Dars'}
                                </h3>
                                <button type="button" onClick={() => setEditingLesson(null)} className="text-[var(--foreground)]/50 hover:text-[var(--foreground)] transition-colors">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <form onSubmit={handleSave} className="flex-1 overflow-y-auto p-8 space-y-8 bg-[var(--background)]">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 block mb-2">Sarlavha</label>
                                        <input
                                            required
                                            type="text"
                                            value={editingLesson.title || ''}
                                            onChange={(e) => setEditingLesson({ ...editingLesson, title: e.target.value })}
                                            className="w-full bg-[var(--card-bg)] rounded-2xl p-4 font-bold text-[var(--foreground)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all placeholder:text-[var(--foreground)]/20"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 block mb-2">Video URL (YouTube/Storage)</label>
                                        <div className="flex flex-col gap-4">
                                            <div className="relative">
                                                <input
                                                    type="text"
                                                    value={editingLesson.videoUrl || ''}
                                                    onChange={(e) => setEditingLesson({ ...editingLesson, videoUrl: e.target.value })}
                                                    className="w-full bg-[var(--card-bg)] rounded-2xl p-4 pl-12 font-bold text-[var(--foreground)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all placeholder:text-[var(--foreground)]/20"
                                                    placeholder="YouTube link or storage URL"
                                                />
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex gap-2">
                                                    {(editingLesson.videoUrl?.includes('youtube') || editingLesson.videoUrl?.includes('youtu.be')) ? (
                                                        <Youtube className="w-5 h-5 text-red-500" />
                                                    ) : (
                                                        <Video className="w-5 h-5 text-[var(--accent)]" />
                                                    )}
                                                </div>
                                            </div>

                                            <div className="p-4 border-2 border-dashed border-[var(--border)] rounded-2xl bg-[var(--card-bg)]/50">
                                                <p className="text-[10px] font-bold text-[var(--foreground)]/40 uppercase tracking-widest mb-3">Yoki yangi video yuklash:</p>
                                                <VideoUpload
                                                    onUploadComplete={(path, url) => {
                                                        setEditingLesson({ ...editingLesson, videoUrl: url });
                                                    }}
                                                    bucket="videos"
                                                    path={`courses/${id}`}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 block mb-2">Davomiyligi (soniya)</label>
                                        <input
                                            type="number"
                                            value={editingLesson.duration || ''}
                                            onChange={(e) => setEditingLesson({ ...editingLesson, duration: Number(e.target.value) })}
                                            className="w-full bg-[var(--card-bg)] rounded-2xl p-4 font-bold text-[var(--foreground)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all"
                                        />
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40 block mb-2">Tavsif</label>
                                        <textarea
                                            value={editingLesson.description || ''}
                                            onChange={(e) => setEditingLesson({ ...editingLesson, description: e.target.value })}
                                            className="w-full bg-[var(--card-bg)] rounded-2xl p-4 font-medium text-[var(--foreground)] border border-[var(--border)] focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition-all min-h-[100px] placeholder:text-[var(--foreground)]/20"
                                        />
                                    </div>
                                    <div className="col-span-2 flex items-center gap-4 py-2">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40">Bepul (Free Preview)</label>
                                        <button
                                            type="button"
                                            onClick={() => setEditingLesson({ ...editingLesson, isFree: !editingLesson.isFree })}
                                            className={`w-14 h-8 rounded-full transition-all relative ${editingLesson.isFree ? 'bg-[var(--primary)]' : 'bg-[var(--secondary)]'}`}
                                        >
                                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-all shadow-sm ${editingLesson.isFree ? 'left-7' : 'left-1'}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Assets Section */}
                                <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                                    <div className="flex items-center justify-between">
                                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40">Fayllar va Resurslar</label>
                                        <button
                                            type="button"
                                            onClick={addAsset}
                                            className="text-xs font-bold text-[var(--primary)] flex items-center gap-1 hover:underline"
                                        >
                                            <Plus className="w-3 h-3" /> Qo'shish
                                        </button>
                                    </div>
                                    <div className="space-y-3">
                                        {editingLesson.assets?.map((asset, idx) => (
                                            <div key={idx} className="flex gap-3 items-start bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border)]">
                                                <div className="w-20">
                                                    <select
                                                        value={asset.type}
                                                        onChange={(e) => updateAsset(idx, 'type', e.target.value)}
                                                        className="w-full p-2 rounded-lg text-xs font-bold border border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] outline-none"
                                                    >
                                                        <option value="TEXT">Text</option>
                                                        <option value="VIDEO">Video</option>
                                                        <option value="AUDIO">Audio</option>
                                                        <option value="PPT">PPT</option>
                                                    </select>
                                                </div>
                                                <div className="flex-1 space-y-2">
                                                    <input
                                                        placeholder="Nomi"
                                                        value={asset.name}
                                                        onChange={(e) => updateAsset(idx, 'name', e.target.value)}
                                                        className="w-full p-2 rounded-lg text-sm font-bold border border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] placeholder:text-[var(--foreground)]/20 outline-none focus:border-[var(--primary)]"
                                                    />
                                                    <input
                                                        placeholder="URL"
                                                        value={asset.url}
                                                        onChange={(e) => updateAsset(idx, 'url', e.target.value)}
                                                        className="w-full p-2 rounded-lg text-xs font-mono border border-[var(--border)] bg-[var(--secondary)] text-[var(--foreground)] placeholder:text-[var(--foreground)]/20 outline-none focus:border-[var(--primary)]"
                                                    />
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeAsset(idx)}
                                                    className="p-2 text-red-500/50 hover:text-red-500 transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="w-full py-5 bg-[var(--primary)] text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-[var(--primary)]/20 flex items-center justify-center gap-3 hover:opacity-90 transition-all active:scale-[0.98]"
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
