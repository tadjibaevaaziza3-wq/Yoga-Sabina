"use client"

import { useState, useEffect } from "react"
import { Heart, MessageSquare, TrendingUp, Star } from "lucide-react"

export function EngagementStats() {
    const [stats, setStats] = useState<any[]>([])
    const [feedbacks, setFeedbacks] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchStats()
    }, [])

    const fetchStats = async () => {
        try {
            const [statsRes, feedbackRes] = await Promise.all([
                fetch("/api/admin/engagement-stats"), // Need to create this
                fetch("/api/social/feedback")
            ])
            const statsData = await statsRes.json()
            const feedbackData = await feedbackRes.json()

            if (statsData.success) setStats(statsData.stats)
            if (feedbackData.success) setFeedbacks(feedbackData.feedbacks)
        } catch (e) {
            console.error("Stats fetch failed")
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="animate-pulse h-60 bg-[var(--primary)]/5 rounded-[2.5rem]" />

    return (
        <div className="grid lg:grid-cols-2 gap-8">
            {/* Top Videos KPI */}
            <div className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] shadow-sm p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-blue-500 text-white flex items-center justify-center">
                        <TrendingUp className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[var(--foreground)]">Content KPI</h3>
                        <p className="text-xs opacity-40 font-bold uppercase tracking-widest text-[var(--foreground)]">Eng ko'p yoqqan va muhokama qilingan</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {stats.map((s, i) => (
                        <div key={i} className="flex items-center justify-between p-4 bg-[var(--primary)]/5 rounded-2xl border border-[var(--border)]">
                            <span className="text-sm font-bold text-[var(--foreground)] truncate max-w-[150px]">{s.title}</span>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-1 text-red-500 font-black text-xs">
                                    <Heart className="w-3 h-3 fill-current" /> {s.likes}
                                </div>
                                <div className="flex items-center gap-1 text-blue-500 font-black text-xs">
                                    <MessageSquare className="w-3 h-3 fill-current" /> {s.comments}
                                </div>
                            </div>
                        </div>
                    ))}
                    {stats.length === 0 && <p className="text-xs opacity-30 italic text-[var(--foreground)]">Hali ma'lumotlar yo'q</p>}
                </div>
            </div>

            {/* Platform Feedback List */}
            <div className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] shadow-sm p-8">
                <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center">
                        <Star className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-[var(--foreground)]">Fikrlar va Reytinglar</h3>
                        <p className="text-xs opacity-40 font-bold uppercase tracking-widest text-[var(--foreground)]">Platforma haqidagi umumiy fikrlar</p>
                    </div>
                </div>

                <div className="space-y-4 max-h-[300px] overflow-y-auto">
                    {feedbacks.map((f, i) => (
                        <div key={i} className="p-4 border-b border-[var(--border)] last:border-0 hover:bg-[var(--primary)]/5 transition-all">
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-[10px] font-black uppercase opacity-40 text-[var(--foreground)]">{f.user.name}</span>
                                <div className="flex">
                                    {[1, 2, 3, 4, 5].map(s => (
                                        <Star key={s} className={`w-2 h-2 ${f.rating >= s ? "fill-orange-500 text-orange-500" : "opacity-10 text-[var(--foreground)]"}`} />
                                    ))}
                                </div>
                            </div>
                            <p className="text-xs opacity-70 leading-relaxed italic text-[var(--foreground)]">"{f.text}"</p>
                        </div>
                    ))}
                    {feedbacks.length === 0 && <p className="text-xs opacity-30 italic text-[var(--foreground)]">Fikrlar yo'q</p>}
                </div>
            </div>
        </div>
    )
}


