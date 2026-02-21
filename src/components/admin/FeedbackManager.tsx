"use client"

import React, { useState, useEffect } from "react"
import { Check, X, Trash2, Clock, Star, MessageCircle } from "lucide-react"
import { toast } from "sonner"

export function FeedbackManager() {
    const [feedback, setFeedback] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    const fetchFeedback = async () => {
        try {
            const res = await fetch('/api/admin/feedback')
            if (res.ok) {
                const data = await res.json()
                setFeedback(data)
            }
        } catch (err) {
            toast.error("Fikrlarni yuklashda xatolik")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchFeedback()
    }, [])

    const handleToggleApprove = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`/api/admin/feedback/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isApproved: !currentStatus })
            })

            if (res.ok) {
                toast.success(!currentStatus ? "Fikr tasdiqlandi" : "Fikr bekor qilindi")
                setFeedback(feedback.map(f => f.id === id ? { ...f, isApproved: !currentStatus } : f))
            }
        } catch (err) {
            toast.error("Xatolik yuz berdi")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Haqiqatan ham bu fikrni o'chirmoqchimisiz?")) return

        try {
            const res = await fetch(`/api/admin/feedback/${id}`, {
                method: 'DELETE'
            })

            if (res.ok) {
                toast.success("Fikr o'chirildi")
                setFeedback(feedback.filter(f => f.id !== id))
            }
        } catch (err) {
            toast.error("Xatolik yuz berdi")
        }
    }

    if (isLoading) return <div className="p-8 text-center opacity-40 text-[var(--foreground)] font-bold">Yuklanmoqda...</div>

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-serif font-black text-[var(--foreground)]">Mijozlar fikrlari</h2>
                    <p className="text-sm font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Moderatsiya va boshqaruv</p>
                </div>
            </div>

            <div className="grid gap-6">
                {feedback.length > 0 ? (
                    feedback.map((item) => (
                        <div key={item.id} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-3xl p-6 flex flex-col md:flex-row gap-6 items-start md:items-center justify-between group hover:shadow-xl hover:shadow-[var(--glow)] transition-all">
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] font-black text-lg">
                                        {item.user?.firstName?.[0] || 'U'}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-[var(--foreground)]">{item.user?.firstName} {item.user?.lastName}</h4>
                                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-30 text-[var(--foreground)]">
                                            <Clock className="w-3 h-3" />
                                            {new Date(item.createdAt).toLocaleDateString()}
                                            <span className="mx-1">•</span>
                                            {item.user?.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-1">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} className={`w-3 h-3 ${i < (item.rating || 5) ? "text-orange-400 fill-orange-400" : "opacity-20 text-[var(--foreground)] fill-current"}`} />
                                    ))}
                                </div>

                                <p className="text-sm opacity-70 font-medium leading-relaxed italic text-[var(--foreground)]">
                                    "{item.message}"
                                </p>
                            </div>

                            <div className="flex items-center gap-3 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-[var(--border)]">
                                <button
                                    onClick={() => handleToggleApprove(item.id, item.isApproved)}
                                    className={`flex-1 md:flex-initial flex items-center justify-center gap-2 px-6 py-3 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all ${item.isApproved
                                        ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20"
                                        : "bg-[var(--primary)] text-white hover:opacity-90 shadow-lg shadow-[var(--glow)]"
                                        }`}
                                >
                                    {item.isApproved ? <><X className="w-4 h-4" /> Bekor qilish</> : <><Check className="w-4 h-4" /> Tasdiqlash</>}
                                </button>
                                <button
                                    onClick={() => handleDelete(item.id)}
                                    className="p-3 rounded-2xl bg-rose-500/10 text-rose-500 hover:bg-rose-500/20 transition-all border border-rose-500/20"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-20 bg-[var(--primary)]/5 rounded-[3rem] border border-dashed border-[var(--border)]">
                        <MessageCircle className="w-12 h-12 opacity-10 text-[var(--foreground)] mx-auto mb-4" />
                        <p className="opacity-30 font-bold uppercase tracking-widest text-xs text-[var(--foreground)]">Fikrlar mavjud emas</p>
                    </div>
                )}
            </div>
        </div>
    )
}
