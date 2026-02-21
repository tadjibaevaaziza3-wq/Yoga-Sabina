'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Loader2, Search, Filter, Download, ExternalLink, MessageCircle, CheckCircle, XCircle, Clock, AlertCircle } from 'lucide-react'

interface Purchase {
    id: string
    user: {
        firstName?: string
        lastName?: string
        email?: string
        phone?: string
        telegramId?: string
    }
    course: {
        title: string
        consultationFormat: 'ONLINE' | 'OFFLINE'
    }
    amount: number
    status: string
    consultationStatus: 'NEW' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED' | null
    createdAt: string
}

interface Stats {
    total: number
    revenue: number
    byStatus: {
        new: number
        confirmed: number
        completed: number
        canceled: number
    }
}

export default function AdminConsultationsPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('ALL')

    useEffect(() => {
        fetchPurchases()
    }, [])

    const fetchPurchases = async () => {
        try {
            const res = await fetch('/api/admin/consultations')
            const data = await res.json()
            if (data.success) {
                setPurchases(data.purchases)
                setStats(data.stats)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (purchaseId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/consultations/${purchaseId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            const data = await res.json()
            if (data.success) {
                fetchPurchases() // Refresh list
            }
        } catch (error) {
            console.error(error)
        }
    }

    const filteredPurchases = purchases.filter(p => {
        if (filter === 'ALL') return true
        return p.consultationStatus === filter
    })

    if (loading) {
        return (
            <div className="min-h-screen bg-[var(--background)] flex items-center justify-center">
                <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
            </div>
        )
    }

    return (
        <div className="p-8 bg-[var(--background)] min-h-screen font-sans text-[var(--foreground)]">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div>
                    <h1 className="text-4xl font-serif font-black text-[var(--foreground)] mb-2">Konsultatsiyalar</h1>
                    <p className="text-sm font-bold text-[var(--primary)] uppercase tracking-widest opacity-60">Buyurtmalar va holatlar monitoringi</p>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid md:grid-cols-4 gap-6">
                        <div className="bg-[var(--card-bg)] rounded-[2rem] p-6 border border-[var(--border)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/50 mb-2">Jami buyurtmalar</div>
                            <div className="text-4xl font-black text-[var(--primary)]">{stats.total}</div>
                        </div>
                        <div className="bg-[var(--card-bg)] rounded-[2rem] p-6 border border-[var(--border)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/50 mb-2">Tushum (UZS)</div>
                            <div className="text-4xl font-black text-[var(--accent)]">
                                {(stats.revenue / 1000000).toFixed(1)}M
                            </div>
                        </div>
                        <div className="bg-[var(--card-bg)] rounded-[2rem] p-6 border border-[var(--border)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/50 mb-2">Yangi</div>
                            <div className="text-4xl font-black text-blue-400">{stats.byStatus.new}</div>
                        </div>
                        <div className="bg-[var(--card-bg)] rounded-[2rem] p-6 border border-[var(--border)] relative overflow-hidden group">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/50 mb-2">Yakunlangan</div>
                            <div className="text-4xl font-black text-green-400">{stats.byStatus.completed}</div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="flex flex-wrap gap-2 bg-[var(--card-bg)] p-2 rounded-2xl border border-[var(--border)] w-fit">
                    {['ALL', 'NEW', 'CONFIRMED', 'COMPLETED', 'CANCELED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${filter === status
                                ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30'
                                : 'text-[var(--foreground)]/60 hover:bg-[var(--secondary)] hover:text-[var(--foreground)]'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] overflow-hidden shadow-xl shadow-[var(--glow)]/5">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[var(--secondary)]/50 border-b border-[var(--border)]">
                                <tr>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Mijoz</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Format</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Summa</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Sana</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Status</th>
                                    <th className="px-8 py-6 text-left text-[10px] font-black text-[var(--foreground)]/40 uppercase tracking-widest">Aloqa</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {filteredPurchases.map(purchase => (
                                    <tr key={purchase.id} className="hover:bg-[var(--secondary)]/30 transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="font-bold text-[var(--foreground)] text-sm mb-1">
                                                {purchase.user.firstName} {purchase.user.lastName}
                                            </div>
                                            <div className="text-xs font-medium text-[var(--foreground)]/50">{purchase.user.email || purchase.user.phone}</div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${purchase.course.consultationFormat === 'ONLINE'
                                                ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                                : 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                                                }`}>
                                                {purchase.course.consultationFormat}
                                            </span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="font-black text-[var(--accent)]">
                                                {(Number(purchase.amount) / 1000000).toFixed(1)}M
                                            </span>
                                        </td>
                                        <td className="px-8 py-6 text-xs font-bold text-[var(--foreground)]/40">
                                            {new Date(purchase.createdAt).toLocaleDateString('ru')}
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="relative">
                                                <select
                                                    value={purchase.consultationStatus || 'NEW'}
                                                    onChange={(e) => updateStatus(purchase.id, e.target.value)}
                                                    className="w-full bg-[var(--secondary)] border border-[var(--border)] text-[var(--foreground)] text-xs font-bold rounded-xl px-3 py-2 outline-none focus:border-[var(--primary)] appearance-none cursor-pointer hover:bg-[var(--secondary)]/80 transition-colors"
                                                >
                                                    <option value="NEW">YANGI</option>
                                                    <option value="CONFIRMED">TASDIQLANDI</option>
                                                    <option value="COMPLETED">YAKUNLANDI</option>
                                                    <option value="CANCELED">BEKOR QILINDI</option>
                                                </select>
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-[var(--foreground)]/40">
                                                    <Filter className="w-3 h-3" />
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            {purchase.user.telegramId && (
                                                <button
                                                    onClick={() => navigator.clipboard.writeText(`@${purchase.user.telegramId}`)}
                                                    className="flex items-center gap-2 text-[var(--primary)] hover:text-[var(--accent)] text-xs font-black uppercase tracking-widest transition-colors group"
                                                >
                                                    <span>TG Nusxalash</span>
                                                    <ExternalLink className="w-3 h-3 opacity-50 group-hover:opacity-100" />
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        {filteredPurchases.length === 0 && (
                            <div className="text-center py-20 flex flex-col items-center justify-center gap-4">
                                <div className="w-16 h-16 rounded-full bg-[var(--secondary)] flex items-center justify-center text-[var(--foreground)]/20">
                                    <Search className="w-8 h-8" />
                                </div>
                                <p className="text-[var(--foreground)]/40 text-sm font-bold uppercase tracking-widest">
                                    Buyurtmalar topilmadi
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
