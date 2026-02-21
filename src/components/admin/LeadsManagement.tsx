"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, Users, TrendingUp, Mail, Phone, Gift, Send } from "lucide-react"

interface Lead {
    id: string
    email?: string
    phone?: string
    firstName?: string
    lastName?: string
    createdAt: string
    daysSinceRegistration: number
    profile?: {
        name?: string
    }
}

export function LeadsManagement() {
    const [leads, setLeads] = useState<Lead[]>([])
    const [loading, setLoading] = useState(true)
    const [metrics, setMetrics] = useState<{
        totalLeads: number;
        totalCustomers: number;
        conversionRate: string;
        totalUsers: number;
    } | null>(null)
    const [searchTerm, setSearchTerm] = useState('')

    // CRM states
    const [isExporting, setIsExporting] = useState(false)
    const [showBroadcastModal, setShowBroadcastModal] = useState(false)

    useEffect(() => {
        fetchLeads()
    }, [])

    const fetchLeads = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/leads')
            const data = await res.json()
            if (data.success) {
                setLeads(data.leads)
                setMetrics(data.metrics)
            }
        } catch (error) {
            console.error('Error fetching leads:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleExport = async () => {
        setIsExporting(true)
        try {
            const res = await fetch('/api/admin/leads/export')
            const blob = await res.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `leads-${new Date().toISOString().split('T')[0]}.csv`
            document.body.appendChild(a)
            a.click()
            a.remove()
        } catch (error) {
            alert('Exportda xatolik')
        } finally {
            setIsExporting(false)
        }
    }

    const filteredLeads = leads.filter(lead => {
        if (!searchTerm) return true
        const name = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.profile?.name || ''
        const contact = `${lead.email || ''} ${lead.phone || ''}`
        return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            contact.toLowerCase().includes(searchTerm.toLowerCase())
    })

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-gradient-to-br from-purple-500 to-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-purple-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <Users className="w-6 h-6" />
                        <span className="text-xs font-black uppercase tracking-widest opacity-80">Jami Lidlar</span>
                    </div>
                    <p className="text-3xl font-black">{metrics?.totalLeads || 0}</p>
                </div>
                <div className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border)] shadow-sm">
                    <div className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2">Mijozlar</div>
                    <p className="text-3xl font-black text-[var(--foreground)]">{metrics?.totalCustomers || 0}</p>
                </div>
                <div className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border)] shadow-sm">
                    <div className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2">Konversiya</div>
                    <p className="text-3xl font-black text-[var(--foreground)]">{metrics?.conversionRate || '0%'}</p>
                </div>
                <div className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border)] shadow-sm">
                    <div className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2">Jami</div>
                    <p className="text-3xl font-black text-[var(--foreground)]">{metrics?.totalUsers || 0}</p>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-serif font-black text-[var(--foreground)] mb-2">Lidlar Boshqaruvi</h2>
                    <p className="text-sm font-bold opacity-40 uppercase tracking-[0.2em] text-[var(--foreground)]">
                        Sotib olmagan foydalanuvchilar
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="px-6 py-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 text-sm font-extrabold hover:bg-emerald-500/20 transition-all flex items-center gap-2"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
                        Eksport CSV
                    </button>
                    <button
                        onClick={() => setShowBroadcastModal(true)}
                        className="px-6 py-3 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 text-sm font-extrabold hover:bg-blue-500/20 transition-all flex items-center gap-2"
                    >
                        <Send className="w-4 h-4" />
                        Hammaga Xabar
                    </button>
                </div>
            </div>

            {/* Search */}
            <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30 text-[var(--foreground)]" />
                <input
                    type="text"
                    placeholder="Qidiruv (ism, email, telefon)..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--primary)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 font-medium text-[var(--foreground)]"
                />
            </div>

            {/* Leads Grid */}
            <div className="grid gap-6">
                {filteredLeads.map((lead) => (
                    <LeadCard key={lead.id} lead={lead} onUpdate={fetchLeads} />
                ))}
                {filteredLeads.length === 0 && (
                    <div className="text-center p-20 bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border)]">
                        <Users className="w-16 h-16 opacity-20 text-[var(--foreground)] mx-auto mb-4" />
                        <p className="opacity-30 font-black uppercase tracking-widest text-xs text-[var(--foreground)]">
                            {searchTerm ? 'Lidlar topilmadi' : 'Barcha foydalanuvchilar mijozga aylangan! 🎉'}
                        </p>
                    </div>
                )}
            </div>

            {showBroadcastModal && (
                <BroadcastModal onClose={() => setShowBroadcastModal(false)} />
            )}
        </div>
    )
}

function BroadcastModal({ onClose }: { onClose: () => void }) {
    const [content, setContent] = useState('')
    const [loading, setLoading] = useState(false)

    const handleBroadcast = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!content) return
        setLoading(true)
        try {
            const res = await fetch('/api/admin/leads/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content })
            })
            const data = await res.json()
            if (data.success) {
                alert(`Muvaffaqiyatli! ${data.results.successCount} kishiga yuborildi.`)
                onClose()
            } else {
                alert('Xatolik: ' + data.error)
            }
        } catch (error) {
            alert('Tarmoq xatoligi')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--card-bg)] rounded-[2.5rem] p-8 max-w-lg w-full border border-[var(--border)] shadow-2xl"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                        <Send className="w-6 h-6 text-blue-500" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-serif font-black text-[var(--foreground)]">Massiv Xabar</h3>
                        <p className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Barcha lidlar uchun</p>
                    </div>
                </div>

                <form onSubmit={handleBroadcast} className="space-y-6">
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2 block">Xabar matni (Markdown qo'llab-quvvatlanadi)</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            rows={6}
                            className="w-full px-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--primary)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 font-medium text-[var(--foreground)] resize-none"
                            placeholder="Salom! Yangi kursimizga 20% chegirma..."
                            required
                        />
                    </div>

                    <div className="p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10">
                        <p className="text-[10px] text-blue-500 font-bold uppercase tracking-[0.1em] leading-relaxed">
                            ⚠️ Diqqat: Bu xabar barcha "Lid" statusidagi (sotib olmagan) foydalanuvchilarga yuboriladi.
                            Jarayon ko'p vaqt olishi mumkin.
                        </p>
                    </div>

                    <div className="flex gap-3 pt-2">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-4 rounded-2xl border border-[var(--border)] text-[var(--foreground)] font-extrabold opacity-60 hover:opacity-100 transition-all">
                            Bekor qilish
                        </button>
                        <button type="submit" disabled={loading || !content} className="flex-1 px-4 py-4 rounded-2xl bg-blue-500 text-white font-extrabold shadow-xl shadow-blue-500/20 hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 uppercase tracking-widest text-xs">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Yuborish</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}

function LeadCard({ lead, onUpdate }: { lead: Lead; onUpdate: () => void }) {
    const [showGrantForm, setShowGrantForm] = useState(false)

    const userName = `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || lead.profile?.name || 'No Name'
    const registrationDate = new Date(lead.createdAt).toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    })

    const getDaysColor = (days: number) => {
        if (days < 7) return 'text-purple-500 bg-purple-500/10 border-purple-500/20'
        if (days < 30) return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20'
        return 'text-red-500 bg-red-500/10 border-red-500/20'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border)] shadow-sm hover:shadow-xl transition-all"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">{userName}</h3>
                            <div className="flex flex-wrap gap-3 text-sm">
                                {lead.email && (
                                    <div className="flex items-center gap-2 opacity-70 text-[var(--foreground)]">
                                        <Mail className="w-4 h-4 text-purple-500" />
                                        {lead.email}
                                    </div>
                                )}
                                {lead.phone && (
                                    <div className="flex items-center gap-2 opacity-70 text-[var(--foreground)]">
                                        <Phone className="w-4 h-4 text-purple-500" />
                                        {lead.phone}
                                    </div>
                                )}
                            </div>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${getDaysColor(lead.daysSinceRegistration)}`}>
                            {lead.daysSinceRegistration} kun oldin
                        </span>
                    </div>

                    <div className="text-xs opacity-50 text-[var(--foreground)]">
                        Ro&apos;yxatdan o&apos;tgan: {registrationDate}
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[200px]">
                    <button
                        onClick={() => setShowGrantForm(true)}
                        className="w-full px-4 py-3 rounded-xl bg-[var(--primary)] text-white text-sm font-extrabold shadow-xl shadow-[var(--glow)] hover:opacity-90 transition-all flex items-center justify-center gap-2"
                    >
                        <Gift className="w-4 h-4" />
                        Obuna Berish
                    </button>
                    <button className="w-full px-4 py-3 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 text-sm font-extrabold hover:bg-blue-500/20 transition-all flex items-center justify-center gap-2">
                        <Send className="w-4 h-4" />
                        Xabar Yuborish
                    </button>
                </div>
            </div>

            {showGrantForm && (
                <GrantSubscriptionModal
                    userId={lead.id}
                    userName={userName}
                    onClose={() => setShowGrantForm(false)}
                    onSuccess={() => {
                        setShowGrantForm(false)
                        onUpdate()
                    }}
                />
            )}
        </motion.div>
    )
}

function GrantSubscriptionModal({ userId, userName, onClose, onSuccess }: { userId: string; userName: string; onClose: () => void; onSuccess: () => void }) {
    const [courses, setCourses] = useState<any[]>([])
    const [selectedCourse, setSelectedCourse] = useState('')
    const [duration, setDuration] = useState(30)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        fetch('/api/admin/courses').then(r => r.json()).then(data => {
            if (data.success) setCourses(data.courses)
        })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            const res = await fetch('/api/admin/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, courseId: selectedCourse, durationDays: duration })
            })
            const data = await res.json()
            if (data.success) {
                alert('Obuna muvaffaqiyatli berildi!')
                onSuccess()
            } else {
                alert('Xatolik: ' + data.error)
            }
        } catch (error) {
            alert('Tarmoq xatoligi')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--card-bg)] rounded-[2.5rem] p-8 max-w-md w-full border border-[var(--border)] shadow-2xl"
            >
                <h3 className="text-2xl font-serif font-black text-[var(--foreground)] mb-2">Obuna Berish</h3>
                <p className="text-sm opacity-60 text-[var(--foreground)] mb-6">{userName} uchun</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2 block">Kurs</label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--primary)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 font-medium text-[var(--foreground)] appearance-none"
                            required
                        >
                            <option value="" className="bg-[var(--card-bg)]">Tanlang</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id} className="bg-[var(--card-bg)]">{course.title}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2 block">Davomiyligi (kun)</label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            min="1"
                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--primary)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 font-medium text-[var(--foreground)]"
                            required
                        />
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button type="button" onClick={onClose} className="flex-1 px-4 py-3 rounded-xl border border-[var(--border)] text-[var(--foreground)] font-extrabold opacity-60 hover:opacity-100 transition-all">
                            Bekor qilish
                        </button>
                        <button type="submit" disabled={loading} className="flex-1 px-4 py-3 rounded-xl bg-[var(--primary)] text-white font-extrabold shadow-xl shadow-[var(--glow)] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Gift className="w-4 h-4" /> Berish</>}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}


