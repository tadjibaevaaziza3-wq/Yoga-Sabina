"use client"

import { useState, useEffect } from "react"
import { DollarSign, Users, BookMarked, Layers, ShoppingBag, BarChart3, TrendingUp, Loader2 } from "lucide-react"
import { motion } from "framer-motion"

export function AnalyticsView() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/analytics')
            .then(res => res.json())
            .then(data => {
                if (data.success) setStats(data.stats)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    if (loading) return (
        <div className="flex items-center justify-center p-20 min-h-[400px]">
            <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
        </div>
    )

    const mainKPIs = [
        { label: "Jami Foydalanuvchilar", val: stats?.userCount || 0, icon: <Users className="w-6 h-6" />, color: "bg-blue-500" },
        { label: "Faol Obunalar", val: stats?.activeSubscriptions || 0, icon: <Layers className="w-6 h-6" />, color: "bg-purple-500" },
        { label: "Jami Daromad", val: `${new Intl.NumberFormat('uz-UZ').format(stats?.totalRevenue || 0)} сум`, icon: <DollarSign className="w-6 h-6" />, color: "bg-[var(--accent)]" },
        { label: "Kutilayotgan To'lovlar", val: stats?.pendingPurchases || 0, icon: <ShoppingBag className="w-6 h-6" />, color: "bg-orange-500" },
    ]

    return (
        <div className="space-y-12 animate-in fade-in duration-700">
            <div className="flex flex-col gap-2">
                <h2 className="text-3xl font-serif font-black text-[var(--foreground)]">Platforma Analitikasi</h2>
                <p className="text-sm font-bold opacity-40 uppercase tracking-[0.2em] text-[var(--foreground)]">Real vaqtdagi ko'rsatkichlar va hisobotlar</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {mainKPIs.map((kpi, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm hover:shadow-xl transition-all"
                    >
                        <div className={`${kpi.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white mb-6 shadow-lg shadow-[var(--glow)]`}>
                            {kpi.icon}
                        </div>
                        <div className="text-[10px] font-black opacity-30 uppercase tracking-widest mb-1 text-[var(--foreground)]">{kpi.label}</div>
                        <div className="text-3xl font-black text-[var(--foreground)] tracking-tight">{kpi.val}</div>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {/* Popular Courses */}
                <section className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                            <BarChart3 className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-[var(--foreground)]">Ommabop Kurslar</h3>
                    </div>

                    <div className="space-y-4">
                        {stats?.popularCourses?.map((course: any, i: number) => (
                            <div key={i} className="flex items-center justify-between p-5 bg-[var(--primary)]/5 rounded-2xl border border-[var(--border)] transition-all hover:bg-[var(--primary)]/10">
                                <span className="text-sm font-bold text-[var(--foreground)] truncate pr-4">{course.title}</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-black text-[var(--foreground)]">{course.count}</span>
                                    <span className="text-[10px] font-bold opacity-50 uppercase tracking-widest text-[var(--primary)]">obuna</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Activity / Sales */}
                <section className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <h3 className="text-xl font-serif font-bold text-[var(--foreground)]">Ohirgi Sotuvlar</h3>
                    </div>

                    <div className="space-y-6">
                        {stats?.recentPurchases?.map((purchase: any, i: number) => (
                            <div key={i} className="flex items-center gap-4 group">
                                <div className="w-12 h-12 rounded-full bg-[var(--primary)]/10 flex-shrink-0 flex items-center justify-center font-bold text-[var(--primary)] group-hover:bg-[var(--primary)] group-hover:text-[var(--primary-foreground)] transition-all">
                                    {purchase.user?.firstName?.[0] || 'U'}
                                </div>
                                <div className="flex-grow min-w-0">
                                    <div className="text-sm font-bold text-[var(--foreground)] truncate">{purchase.user?.firstName || 'Foydalanuvchi'}</div>
                                    <div className="text-[10px] opacity-50 font-black uppercase tracking-widest truncate text-[var(--primary)]">
                                        {purchase.course?.title}
                                    </div>
                                </div>
                                <div className="text-right flex-shrink-0">
                                    <div className="text-sm font-black text-[var(--foreground)]">
                                        {new Intl.NumberFormat('uz-UZ').format(purchase.amount)} сум
                                    </div>
                                    <div className="text-[9px] opacity-30 font-bold uppercase tracking-tighter text-[var(--foreground)]">
                                        {new Date(purchase.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}


