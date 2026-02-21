"use client"

import React, { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import {
    ChevronLeft,
    User,
    Phone,
    MapPin,
    Clock,
    Calendar,
    PlayCircle,
    History,
    Crown,
    Mail,
    Smartphone
} from 'lucide-react'
import { format } from 'date-fns'

import { use } from "react"

export default function TGUUserDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/admin/tgu-users/${id}`)
                const json = await res.json()
                if (json.success) setData(json.data)
            } catch (e) {
                console.error(e)
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    if (loading) return <div className="p-20 text-center font-bold animate-pulse">Yuklanmoqda...</div>
    if (!data) return <div className="p-20 text-center text-rose-500">Foydalanuvchi topilmadi</div>

    return (
        <div className="min-h-screen bg-[var(--background)] p-8 pb-20 space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-3 text-[var(--primary)] font-bold hover:opacity-70 transition-all uppercase tracking-widest text-[10px]"
                >
                    <ChevronLeft className="w-4 h-4" />
                    Orqaga
                </button>
                <div className="px-6 py-2 rounded-full bg-[var(--primary)]/10 border border-[var(--primary)]/20 text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary)]">
                    TGU User Analytics
                </div>
            </div>

            {/* Profile Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* User Info Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="lg:col-span-1 bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm space-y-6"
                >
                    <div className="w-20 h-20 rounded-[2rem] bg-[var(--primary)] flex items-center justify-center text-white text-3xl font-black">
                        {data.profile.name[0]}
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-primary mb-1">{data.profile.name}</h1>
                        <p className="text-[10px] text-[var(--primary)]/40 font-black uppercase tracking-widest">ID: {data.profile.id}</p>
                    </div>

                    <div className="space-y-4 pt-6 border-t border-[var(--border)]">
                        <div className="flex items-center gap-4 text-sm font-medium text-primary/70">
                            <Phone className="w-5 h-5 text-[var(--primary)]" />
                            {data.profile.phone}
                        </div>
                        {data.profile.telegramUsername && (
                            <div className="flex items-center gap-4 text-sm font-medium text-primary/70">
                                <Mail className="w-5 h-5 text-[var(--primary)]" />
                                @{data.profile.telegramUsername}
                            </div>
                        )}
                        <div className="flex items-center gap-4 text-sm font-medium text-primary/70">
                            <MapPin className="w-5 h-5 text-[var(--primary)]" />
                            {data.profile.region || 'Noma\'lum hudud'}
                        </div>
                        <div className="flex items-center gap-4 text-sm font-medium text-primary/70">
                            <Calendar className="w-5 h-5 text-[var(--primary)]" />
                            Registered: {format(new Date(data.profile.registeredAt), 'dd.MM.yyyy')}
                        </div>
                    </div>
                </motion.div>

                {/* Subscriptions & Watch Stats */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Active Subscriptions */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <Crown className="w-6 h-6 text-amber-500" />
                            <h2 className="text-lg font-black text-primary">Obunalar tarixi</h2>
                        </div>
                        <div className="space-y-4">
                            {data.subscriptions.map((sub: any) => (
                                <div key={sub.id} className="flex items-center justify-between p-4 rounded-2xl bg-[var(--background)] border border-[var(--border)]">
                                    <div>
                                        <p className="text-sm font-black text-primary uppercase tracking-tight">Standard Plan</p>
                                        <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">Tugaydi: {format(new Date(sub.endsAt), 'dd MMMM, yyyy')}</p>
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${sub.status === 'ACTIVE' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-primary/5 text-primary/40'
                                        }`}>
                                        {sub.status}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Lesson Engagement */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm"
                    >
                        <div className="flex items-center gap-4 mb-6">
                            <PlayCircle className="w-6 h-6 text-[var(--primary)]" />
                            <h2 className="text-lg font-black text-primary">Video Mashg'ulotlar Analytics</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {data.lessonEngagement.length === 0 ? (
                                <p className="text-sm text-primary/40 font-medium italic">Video ko'rilmagan</p>
                            ) : data.lessonEngagement.map((stat: any) => (
                                <div key={stat.lessonId} className="p-6 rounded-3xl bg-[var(--background)] border border-[var(--border)] space-y-3">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]">ID: {stat.lessonId.slice(-8)}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <Clock className="w-4 h-4 text-primary/40" />
                                            <p className="text-2xl font-black text-primary">{(stat.watchTime / 60).toFixed(1)} <span className="text-sm font-bold opacity-40">min</span></p>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-primary/40 font-bold uppercase tracking-widest">Oxirgi marta: {format(new Date(stat.lastWatched), 'dd.MM, HH:mm')}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Event Timeline */}
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
                className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm"
            >
                <div className="flex items-center gap-4 mb-8">
                    <History className="w-6 h-6 text-primary/40" />
                    <h2 className="text-lg font-black text-primary uppercase tracking-widest">Global Activity Log</h2>
                </div>
                <div className="space-y-4">
                    {data.recentLogs.map((log: any) => (
                        <div key={log.id} className="flex items-center justify-between p-6 rounded-[2rem] bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all">
                            <div className="flex items-center gap-6">
                                <div className={`w-2 h-2 rounded-full ${log.event === 'VIDEO_HEARTBEAT' ? 'bg-amber-500' :
                                    log.event === 'COURSE_VIEW' ? 'bg-indigo-500' :
                                        log.event === 'SUBSCRIPTION_REMINDER' ? 'bg-rose-500' : 'bg-primary/20'
                                    } shadow-[0_0_10px_rgba(0,0,0,0.1)]`} />
                                <div>
                                    <p className="text-[11px] font-black text-primary uppercase tracking-[0.1em]">{log.event.replace(/_/g, ' ')}</p>
                                    <p className="text-[10px] text-primary/40 font-medium">
                                        {JSON.stringify(log.metadata).slice(0, 100)}...
                                    </p>
                                </div>
                            </div>
                            <p className="text-[10px] text-primary/30 font-bold uppercase tracking-widest">
                                {format(new Date(log.createdAt), 'HH:mm:ss')}
                            </p>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    )
}
