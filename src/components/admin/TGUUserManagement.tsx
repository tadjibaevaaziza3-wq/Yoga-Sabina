"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, Search, Phone, Send, Calendar, Clock, AlertCircle, CheckCircle2, MoreHorizontal, Eye, ShieldAlert, MapPin } from "lucide-react"
import { format } from "date-fns"

interface TGUUser {
    id: string
    userNumber: number | null
    name: string
    phone: string | null
    telegramId: string | null
    telegramUsername: string | null
    region: string | null
    subscriptionStatus: string
    expiryDate: string | null
    lastActive: string | null
    priority: number
    color: 'RED' | 'ORANGE' | 'NONE'
}

export function TGUUserManagement() {
    const [users, setUsers] = useState<TGUUser[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchUsers()
    }, [])

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/tgu-users')
            const data = await res.json()
            if (data.success) {
                setUsers(data.users)
            }
            setLoading(false)
        } catch (error) {
            console.error('Fetch users error:', error)
            setLoading(false)
        }
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone?.includes(searchTerm) ||
        user.telegramUsername?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <div className="w-12 h-12 border-4 border-[var(--primary)]/10 border-t-[var(--primary)] rounded-full animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--primary)]/40">Syncing Community Data...</p>
        </div>
    )

    return (
        <div className="space-y-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-editorial font-bold text-[var(--primary)] tracking-tight">TGU Community</h2>
                    <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.4em] mt-1">Real-time engagement & subscription monitoring</p>
                </div>
                <div className="relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--primary)]/30 group-focus-within:text-[var(--primary)] transition-colors" />
                    <input
                        type="text"
                        placeholder="Search by name, phone or @handle..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full md:w-96 pl-14 pr-8 py-4 bg-white border border-[var(--primary)]/5 rounded-[2rem] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 transition-all shadow-soft"
                    />
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-[var(--primary)]/5 overflow-hidden shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--primary)]/5">
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40">User ID</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40">Identity</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40">Telegram / Region</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40">Status</th>
                                <th className="px-8 py-6 text-[10px) font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40">Engagement</th>
                                <th className="px-8 py-6 text-right"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {filteredUsers.map((user, idx) => (
                                    <motion.tr
                                        key={user.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        onClick={() => window.location.href = `/admin/tgu-users/${user.id}`}
                                        className={`group hover:bg-[var(--primary)]/5 transition-colors border-b border-[var(--primary)]/5 last:border-0 cursor-pointer ${user.color === 'RED' ? 'bg-red-50/30' : user.color === 'ORANGE' ? 'bg-orange-50/20' : ''}`}
                                    >
                                        <td className="px-8 py-6">
                                            <span className="text-[11px] font-black text-[var(--primary)]/20 tracking-widest">#{user.userNumber || '---'}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="font-serif font-bold text-[var(--primary)] text-base group-hover:text-[var(--accent)] transition-colors">{user.name}</span>
                                                <div className="flex items-center gap-1.5 mt-1 text-[var(--primary)]/60">
                                                    <Phone className="w-3 h-3 opacity-40" />
                                                    <span className="text-xs font-medium">{user.phone || 'No phone'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-2">
                                                    <Send className="w-3.5 h-3.5 text-[var(--accent)]" />
                                                    <span className="text-xs font-bold text-[var(--primary)]">@{user.telegramUsername || user.telegramId || '---'}</span>
                                                </div>
                                                <div className="flex items-center gap-2 opacity-60">
                                                    <MapPin className="w-3.5 h-3.5" />
                                                    <span className="text-[11px] font-medium">{user.region || 'Unknown'}</span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col gap-2">
                                                <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest w-fit border ${user.subscriptionStatus === 'ACTIVE'
                                                    ? 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                                    : 'bg-slate-50 text-slate-400 border-slate-100'
                                                    }`}>
                                                    <div className={`w-1.5 h-1.5 rounded-full ${user.subscriptionStatus === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-300'}`} />
                                                    {user.subscriptionStatus}
                                                </div>
                                                {user.expiryDate && (
                                                    <div className={`flex items-center gap-1.5 text-[10px] font-bold ${user.color === 'RED' ? 'text-red-500' : 'text-[var(--accent)]'}`}>
                                                        <Clock className="w-3 h-3" />
                                                        EXP: {format(new Date(user.expiryDate), 'MMM dd, yyyy')}
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="flex flex-col">
                                                    <span className="text-[10px] font-bold text-[var(--primary)]/40 uppercase tracking-widest">Last Activity</span>
                                                    <span className="text-xs font-medium text-[var(--primary)]/80">
                                                        {user.lastActive ? format(new Date(user.lastActive), 'MMM dd, HH:mm') : 'Never'}
                                                    </span>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <button className="p-3 rounded-full hover:bg-white hover:shadow-soft transition-all text-[var(--primary)]/30 hover:text-[var(--primary)]">
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="flex items-center justify-between p-8 bg-[var(--primary)]/10 rounded-[2rem] border border-[var(--primary)]/10">
                <div className="flex items-center gap-6">
                    <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white shrink-0">
                        <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                        <p className="text-sm font-bold text-[var(--primary)] tracking-tight">Enterprise Compliance Mode Active</p>
                        <p className="text-xs text-[var(--primary)]/60 font-medium">All sessions are dynamically logged. Unauthorized multi-device access is automatically throttled.</p>
                    </div>
                </div>
                <button
                    onClick={async () => {
                        if (confirm('Send reminders to all users with expiring subscriptions?')) {
                            const res = await fetch('/api/admin/reminders/trigger', { method: 'POST' });
                            const data = await res.json();
                            alert(`Sent ${data.sentCount} notifications.`);
                        }
                    }}
                    className="btn-luxury px-8 py-4 text-[10px] font-bold uppercase tracking-widest shadow-button"
                >
                    Trigger Reminders
                </button>
            </div>
        </div>
    )
}
