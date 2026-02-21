"use client"

import { motion } from "framer-motion"
import { Users, BookCheck, DollarSign, BarChart3, Mail, Phone, MapPin, HeartPulse, Loader2, Settings, Send, Image as ImageIcon, Video, Music, Info } from "lucide-react"
import { useState, useEffect } from "react"
import { SkeletonKPIGrid } from "@/components/ui/Skeleton"

export function AdminKPI() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/stats')
            .then(res => res.json())
            .then(data => {
                if (data.success) setStats(data.stats)
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    if (loading) return <SkeletonKPIGrid />

    const kpiItems = [
        { label: "Total Community", val: stats?.userCount || 0, icon: <Users className="w-6 h-6" />, color: "bg-[var(--primary)]" },
        { label: "Completed Journeys", val: stats?.purchaseCount || 0, icon: <BookCheck className="w-6 h-6" />, color: "bg-[var(--accent)]" },
        { label: "Global Revenue", val: `${new Intl.NumberFormat('uz-UZ').format(stats?.totalRevenue || 0)} UZS`, icon: <DollarSign className="w-6 h-6" />, color: "bg-[var(--primary)]/80" },
        { label: "Active Memberships", val: stats?.activeSubscriptions || 0, icon: <BarChart3 className="w-6 h-6" />, color: "bg-[var(--accent)]/80" },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {kpiItems.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-[var(--card-bg)] p-10 rounded-[2.5rem] border border-[var(--primary)]/5 shadow-soft hover:shadow-button transition-all duration-300 group relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary)]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[var(--accent)]/10 transition-colors" />
                    <div className={`${stat.color} w-14 h-14 rounded-[1.25rem] flex items-center justify-center text-white mb-6 shadow-soft group-hover:scale-110 transition-transform relative z-10`}>
                        {stat.icon}
                    </div>
                    <div className="text-[10px] font-bold text-[var(--primary)]/30 uppercase tracking-[0.4em] mb-2 relative z-10">{stat.label}</div>
                    <div className="text-3xl font-editorial font-bold text-[var(--primary)] relative z-10 tracking-tight">{stat.val}</div>
                </motion.div>
            ))}
        </div>
    )
}

export function UserList() {
    const [users, setUsers] = useState<any[]>([])
    const [filteredUsers, setFilteredUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [statusFilter, setStatusFilter] = useState('ALL') // ALL, ACTIVE, INACTIVE

    useEffect(() => {
        fetch('/api/admin/users')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUsers(data.users)
                    setFilteredUsers(data.users)
                }
                setLoading(false)
            })
            .catch(() => setLoading(false))
    }, [])

    useEffect(() => {
        let result = users

        // Search filter
        if (searchTerm) {
            const term = searchTerm.toLowerCase()
            result = result.filter(user =>
                (user.profile?.fullName?.toLowerCase().includes(term)) ||
                (user.email?.toLowerCase().includes(term)) ||
                (user.profile?.phone?.includes(term))
            )
        }

        // Status filter
        if (statusFilter !== 'ALL') {
            result = result.filter(user => {
                const hasActive = user.subscriptions?.some((s: any) => s.status === 'ACTIVE')
                return statusFilter === 'ACTIVE' ? hasActive : !hasActive
            })
        }

        setFilteredUsers(result)
    }, [searchTerm, statusFilter, users])

    if (loading) return (
        <div className="flex items-center justify-center p-20">
            <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
        </div>
    )

    return (
        <div className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] shadow-sm overflow-hidden">
            <div className="p-8 border-b border-[var(--border)] flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h3 className="text-2xl font-editorial font-bold text-[var(--primary)] tracking-tight">Active Community</h3>
                    <p className="text-[11px] text-[var(--accent)] font-bold uppercase tracking-[0.3em] mt-2">Total identified: {filteredUsers.length}</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch gap-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Qidiruv (Ism, Email, Tel)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-3 bg-[var(--secondary)] rounded-xl text-sm border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 w-full sm:w-64 font-bold text-[var(--foreground)] placeholder:text-[var(--foreground)]/30"
                        />
                        <Users className="w-4 h-4 opacity-30 absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]" />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="px-4 py-3 bg-[var(--secondary)] rounded-xl text-sm border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-bold text-[var(--foreground)] appearance-none cursor-pointer"
                    >
                        <option value="ALL">Barcha Statuslar</option>
                        <option value="ACTIVE">Faol Obunachilar</option>
                        <option value="INACTIVE">Obunasi yo'qlar</option>
                    </select>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-[var(--background)] text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--primary)]/40 border-b border-[var(--primary)]/5">
                            <th className="px-10 py-6 font-bold">PROFILE</th>
                            <th className="px-10 py-6 font-bold">CONTACT INFO</th>
                            <th className="px-10 py-6 font-bold">LOCATION</th>
                            <th className="px-10 py-6 font-bold">HEALTH NOTES</th>
                            <th className="px-10 py-6 font-bold text-right">STATUS & ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-[var(--secondary)]/30 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-[var(--foreground)]">{user.profile?.fullName || user.email?.split('@')[0] || "No Name"}</div>
                                    <div className="text-[10px] font-bold opacity-30 uppercase tracking-widest text-[var(--foreground)]">{user.role}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-sm opacity-70 mb-1 text-[var(--foreground)]">
                                        <Phone className="w-3 h-3 text-[var(--primary)]" />
                                        {user.profile?.phone || "N/A"}
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] opacity-30 text-[var(--foreground)]">
                                        <Mail className="w-3 h-3" />
                                        {user.email || "No Email"}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-sm opacity-70 text-[var(--foreground)]">
                                        <MapPin className="w-3 h-3 text-[var(--primary)]" />
                                        {user.profile?.address || "N/A"}
                                    </div>
                                </td>
                                <td className="px-8 py-6 max-w-[200px]">
                                    <div className="flex items-start gap-2 text-xs text-[var(--primary)]/70 italic leading-relaxed">
                                        <HeartPulse className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                                        {user.profile?.healthNote || "Ma'lumot yo'q"}
                                    </div>
                                </td>
                                <td className="px-8 py-6 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                        <span className={`px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-[0.2em] border ${user.subscriptions?.some((s: any) => s.status === 'ACTIVE')
                                            ? "bg-[var(--primary)]/5 text-[var(--primary)] border-[var(--primary)]/10"
                                            : "bg-red-500/5 text-red-500 border-red-500/10"
                                            }`}>
                                            {user.subscriptions?.some((s: any) => s.status === 'ACTIVE') ? "Membership Active" : "No Access"}
                                        </span>
                                        <button className="p-2 hover:bg-[var(--secondary)] rounded-lg opacity-40 hover:opacity-100 transition-all text-[var(--foreground)]">
                                            <Settings className="w-4 h-4" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {users.length === 0 && (
                <div className="p-20 text-center text-[var(--foreground)]/30 font-black uppercase tracking-widest text-xs">
                    Foydalanuvchilar topilmadi
                </div>
            )}
        </div>
    )
}

export function BroadcastTool() {
    const [type, setType] = useState<'TEXT' | 'PHOTO' | 'VIDEO' | 'AUDIO'>('TEXT')
    const [content, setContent] = useState('')
    const [mediaUrl, setMediaUrl] = useState('')
    const [target, setTarget] = useState('ALL')
    const [courseId, setCourseId] = useState('')
    const [telegramId, setTelegramId] = useState('')
    const [courses, setCourses] = useState<any[]>([])
    const [sending, setSending] = useState(false)
    const [status, setStatus] = useState<string | null>(null)

    useEffect(() => {
        let isMounted = true
        if (target === 'COURSE' && courses.length === 0) {
            fetch('/api/admin/courses')
                .then(res => res.json())
                .then(data => {
                    if (isMounted && data.success && Array.isArray(data.courses)) {
                        setCourses(data.courses)
                    } else if (isMounted && Array.isArray(data)) {
                        setCourses(data) // Backward compatibility if API returns raw array
                    }
                })
                .catch(err => console.error("Failed to fetch courses", err))
        }
        return () => { isMounted = false }
    }, [target, courses.length])

    const handleSend = async () => {
        if (!content) return
        setSending(true)
        setStatus("Yuborilmoqda...")
        try {
            const res = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, content, mediaUrl, target, courseId, telegramId })
            })
            const data = await res.json()
            if (data.success) {
                setStatus(`Muvaffaqiyatli: ${data.successCount} ta foydalanuvchiga yuborildi`)
                setContent('')
                setMediaUrl('')
            } else {
                setStatus(`Xatolik: ${data.error}`)
            }
        } catch (err) {
            setStatus("Tarmoq xatoligi")
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in zoom-in duration-300">
            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/30 mb-2 block">Xabar turi</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { id: 'TEXT', icon: <Info className="w-5 h-5" />, label: 'Matn' },
                                { id: 'PHOTO', icon: <ImageIcon className="w-5 h-5" />, label: 'Rasm' },
                                { id: 'VIDEO', icon: <Video className="w-5 h-5" />, label: 'Video' },
                                { id: 'AUDIO', icon: <Music className="w-5 h-5" />, label: 'Audio' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setType(item.id as any)}
                                    className={`flex flex-col items-center justify-center gap-3 py-5 rounded-2xl border transition-all hover:-translate-y-1 ${type === item.id ? "bg-[var(--primary)] text-white border-[var(--primary)] shadow-lg shadow-[var(--primary)]/20" : "bg-[var(--card-bg)] text-[var(--foreground)]/40 border-[var(--border)] hover:border-[var(--accent)]/40 hover:bg-[var(--secondary)]"
                                        }`}
                                >
                                    {item.icon}
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/30 mb-2 block">Xabar matni</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Xabarni kiriting..."
                            className="w-full bg-[var(--secondary)]/50 rounded-2xl p-4 text-sm min-h-[140px] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 border border-[var(--border)] transition-all font-medium text-[var(--foreground)] placeholder:text-[var(--foreground)]/20 shadow-inner"
                        />
                    </div>

                    {type !== 'TEXT' && (
                        <div className="animate-in fade-in slide-in-from-top-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/30 mb-2 block">Media URL (Storage Link)</label>
                            <input
                                type="text"
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-[var(--secondary)]/50 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 border border-[var(--border)] transition-all font-medium text-[var(--foreground)] placeholder:text-[var(--foreground)]/20 shadow-inner"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div className="p-6 bg-[var(--secondary)]/30 border border-[var(--border)] rounded-2xl space-y-4 shadow-sm">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/50 flex items-center gap-2">
                            <Users className="w-4 h-4" /> Target (Auditoriya)
                        </label>
                        <select
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full bg-[var(--card-bg)] rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 border border-[var(--border)] transition-all appearance-none font-bold text-[var(--foreground)] shadow-sm cursor-pointer"
                        >
                            <option value="ALL">Barcha Dastur Foydalanuvchilari</option>
                            <option value="LEADS">Faqat qiziqqanlar (Sotib olmaganlar)</option>
                            <option value="COURSE">Ma'lum bitta kurs o'quvchilari</option>
                            <option value="SPECIFIC">Bitta foydalanuvchi (ID)</option>
                        </select>

                        {target === 'COURSE' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/50 mt-4 mb-2 block">Kursni tanlang</label>
                                <select
                                    value={courseId}
                                    onChange={(e) => setCourseId(e.target.value)}
                                    className="w-full bg-[var(--card-bg)] rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 border border-[var(--border)] transition-all appearance-none font-bold text-[var(--foreground)] shadow-sm cursor-pointer"
                                >
                                    <option value="">-- Kursni tanlang --</option>
                                    {Array.isArray(courses) && courses.map(c => (
                                        <option key={c.id} value={c.id}>{c.titleRu || c.title}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {target === 'SPECIFIC' && (
                            <div className="animate-in fade-in slide-in-from-top-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/50 mt-4 mb-2 block">Telegram ID</label>
                                <input
                                    type="text"
                                    value={telegramId}
                                    onChange={(e) => setTelegramId(e.target.value)}
                                    placeholder="e.g. 123456789"
                                    className="w-full bg-[var(--card-bg)] rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 border border-[var(--border)] transition-all font-bold text-[var(--foreground)] shadow-inner"
                                />
                            </div>
                        )}
                    </div>

                    <div className="p-6 bg-[var(--primary)]/5 border border-[var(--primary)]/10 rounded-2xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--primary)]/10 rounded-full -mr-12 -mt-12 blur-2xl" />
                        <div className="flex items-center gap-2 mb-3 relative z-10">
                            <Info className="w-5 h-5 text-[var(--primary)]" />
                            <span className="text-sm font-bold text-[var(--primary)]">Maxsus Imkoniyatlar</span>
                        </div>
                        <ul className="space-y-2 text-xs text-[var(--primary)]/70 font-semibold relative z-10">
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0 mt-1" /> Telegramdagi foydalanuvchilar qutisiga to'g'ridan-to'g'ri xabar boradi.</li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0 mt-1" /> Ovozli, Video yoki Rasm (Media URL kiritilsa) yuboriladi.</li>
                            <li className="flex items-start gap-2"><div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)] shrink-0 mt-1" /> Kurs ishtirokchilari rejimida dars qoldirib ketganlarga eslatma jo'natish qulay.</li>
                        </ul>
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={sending || !content}
                        className="w-full h-16 bg-[var(--primary)] text-[var(--primary-foreground)] font-black uppercase tracking-widest rounded-2xl shadow-xl shadow-[var(--glow)] hover:-translate-y-1 disabled:opacity-50 disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-3 relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 pointer-events-none" />
                        {sending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />}
                        Broadcast Xabarni yuborish
                    </button>

                    {status && (
                        <div className={`text-center text-xs font-black uppercase tracking-widest p-4 rounded-xl border ${status.includes('Muvaffaqiyatli') ? 'bg-green-500/10 text-green-600 border-green-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'} animate-in slide-in-from-bottom-2`}>
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
