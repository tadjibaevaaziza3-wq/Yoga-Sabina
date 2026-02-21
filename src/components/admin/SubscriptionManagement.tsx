"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, Plus, Search, Calendar, CheckCircle, XCircle, Clock, Filter } from "lucide-react"

interface Subscription {
    id: string
    userId: string
    courseId: string
    startsAt: string
    endsAt: string
    status: string
    daysRemaining: number
    isExpired: boolean
    user: {
        id: string
        email: string
        firstName?: string
        lastName?: string
        profile?: {
            name?: string
        }
    }
    course: {
        id: string
        title: string
        price: number
    }
}

export function SubscriptionManagement() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateForm, setShowCreateForm] = useState(false)
    const [filter, setFilter] = useState<string>('ALL')
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchSubscriptions()
    }, [filter])

    const fetchSubscriptions = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filter !== 'ALL') {
                params.append('status', filter)
            }

            const res = await fetch(`/api/admin/subscriptions?${params}`)
            const data = await res.json()
            if (data.success) {
                setSubscriptions(data.subscriptions)
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredSubscriptions = subscriptions.filter(sub => {
        if (!searchTerm) return true
        const userName = sub.user.firstName || sub.user.profile?.name || sub.user.email || ''
        const courseName = sub.course.title || ''
        return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            courseName.toLowerCase().includes(searchTerm.toLowerCase())
    })

    const getStatusBadge = (status: string, isExpired: boolean) => {
        if (isExpired && status === 'ACTIVE') {
            return <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-orange-100 text-orange-700">Expired</span>
        }

        switch (status) {
            case 'ACTIVE':
                return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-500 border border-purple-500/20">Active</span>
            case 'EXPIRED':
                return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20">Expired</span>
            case 'CANCELED':
                return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-500/10 text-gray-500 border border-gray-500/20">Canceled</span>
            default:
                return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20">{status}</span>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-serif font-black text-[var(--foreground)] mb-2 flex items-center gap-3">
                        Obunalar Boshqaruvi
                        <span className="text-[10px] font-black uppercase tracking-widest bg-[var(--primary)]/10 text-[var(--primary)] px-3 py-1 rounded-full border border-[var(--primary)]/20">
                            AI Master Agent
                        </span>
                    </h2>
                    <p className="text-sm font-bold opacity-40 uppercase tracking-[0.2em] text-[var(--foreground)]">
                        Nazoratdagi jami obunalar: {subscriptions.length} ta
                    </p>
                </div>
                <button
                    onClick={() => setShowCreateForm(true)}
                    className="px-8 py-4 rounded-2xl bg-[var(--primary)] text-white text-sm font-extrabold shadow-xl shadow-[var(--glow)] hover:opacity-90 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Yangi Obuna Qo'shish
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30 text-[var(--foreground)]" />
                    <input
                        type="text"
                        placeholder="Foydalanuvchi yoki kurs nomi..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--primary)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 font-medium text-[var(--foreground)]"
                    />
                </div>
                <div className="flex gap-2">
                    {['ALL', 'ACTIVE', 'EXPIRED', 'CANCELED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-4 rounded-2xl text-sm font-extrabold transition-all ${filter === status
                                ? 'bg-[var(--primary)] text-white shadow-xl shadow-[var(--glow)]'
                                : 'bg-[var(--card-bg)] text-[var(--foreground)] opacity-60 border border-[var(--border)] hover:opacity-100'
                                }`}
                        >
                            {status === 'ALL' ? 'Hammasi' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Create Form Modal */}
            {showCreateForm && (
                <CreateSubscriptionForm
                    onClose={() => setShowCreateForm(false)}
                    onSuccess={() => {
                        setShowCreateForm(false)
                        fetchSubscriptions()
                    }}
                />
            )}

            {/* Subscriptions List */}
            <div className="grid gap-6">
                {filteredSubscriptions.map((sub) => (
                    <SubscriptionCard
                        key={sub.id}
                        subscription={sub}
                        onUpdate={fetchSubscriptions}
                        getStatusBadge={getStatusBadge}
                    />
                ))}
                {filteredSubscriptions.length === 0 && (
                    <div className="text-center p-20 bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border)]">
                        <p className="opacity-30 font-black uppercase tracking-widest text-xs text-[var(--foreground)]">
                            Obunalar topilmadi
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

function SubscriptionCard({ subscription, onUpdate, getStatusBadge }: {
    subscription: Subscription;
    onUpdate: () => void;
    getStatusBadge: (status: string, isExpired: boolean) => React.ReactElement
}) {
    const [extending, setExtending] = useState(false)
    const [days, setDays] = useState(30)

    const handleExtend = async () => {
        if (!days || days <= 0) return
        setExtending(true)
        try {
            const res = await fetch(`/api/admin/subscriptions/${subscription.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ durationDays: days })
            })
            const data = await res.json()
            if (data.success) {
                alert('Obuna muvaffaqiyatli uzaytirildi!')
                onUpdate()
            } else {
                alert('Xatolik: ' + data.error)
            }
        } catch (error) {
            alert('Tarmoq xatoligi')
        } finally {
            setExtending(false)
        }
    }

    const handleCancel = async () => {
        if (!confirm('Obunani bekor qilishni xohlaysizmi?')) return
        try {
            const res = await fetch(`/api/admin/subscriptions/${subscription.id}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (data.success) {
                alert('Obuna bekor qilindi')
                onUpdate()
            }
        } catch (error) {
            alert('Xatolik yuz berdi')
        }
    }

    const userName = subscription.user.firstName || subscription.user.profile?.name || subscription.user.email
    const startDate = new Date(subscription.startsAt).toLocaleDateString('uz-UZ')
    const endDate = new Date(subscription.endsAt).toLocaleDateString('uz-UZ')

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--card-bg)] p-8 rounded-[2rem] border border-[var(--border)] shadow-sm hover:shadow-xl transition-all"
        >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">{userName}</h3>
                            <p className="text-sm opacity-60 font-medium text-[var(--foreground)]">{subscription.user.email}</p>
                        </div>
                        {getStatusBadge(subscription.status, subscription.isExpired)}
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-500" />
                            <span className="font-bold opacity-70 text-[var(--foreground)]">{startDate} - {endDate}</span>
                        </div>
                        {subscription.status === 'ACTIVE' && !subscription.isExpired && (
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-[var(--primary)]" />
                                <span className="font-bold text-[var(--primary)]">{subscription.daysRemaining} kun qoldi</span>
                            </div>
                        )}
                    </div>

                    <div className="p-4 bg-[var(--primary)]/10 rounded-xl border border-[var(--border)]">
                        <p className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-1">Kurs</p>
                        <p className="font-bold text-[var(--foreground)]">{subscription.course.title}</p>
                    </div>
                </div>

                <div className="flex flex-col gap-3 min-w-[200px]">
                    <div className="flex gap-2">
                        <input
                            type="number"
                            value={days}
                            onChange={(e) => setDays(parseInt(e.target.value))}
                            placeholder="Kunlar"
                            className="flex-1 px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--primary)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 font-medium text-[var(--foreground)] text-sm"
                        />
                        <button
                            onClick={handleExtend}
                            disabled={extending}
                            className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-widest hover:opacity-90 transition-all disabled:opacity-50 shadow-lg shadow-[var(--glow)]"
                        >
                            {extending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Uzaytirish'}
                        </button>
                    </div>
                    <button
                        onClick={handleCancel}
                        className="w-full px-4 py-2 rounded-xl bg-red-500/10 text-red-500 text-[10px] font-black uppercase tracking-widest hover:bg-red-500/20 transition-all border border-red-500/20"
                    >
                        Bekor qilish
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

function CreateSubscriptionForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [users, setUsers] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState('')
    const [selectedCourse, setSelectedCourse] = useState('')
    const [duration, setDuration] = useState(30)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Fetch users and courses
        Promise.all([
            fetch('/api/admin/users').then(r => r.json()),
            fetch('/api/admin/courses').then(r => r.json())
        ]).then(([usersData, coursesData]) => {
            if (usersData.success) setUsers(usersData.users)
            if (coursesData.success) setCourses(coursesData.courses)
        })
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedUser || !selectedCourse || !duration) {
            alert('Barcha maydonlarni to\'ldiring')
            return
        }

        setLoading(true)
        try {
            const res = await fetch('/api/admin/subscriptions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: selectedUser,
                    courseId: selectedCourse,
                    durationDays: duration
                })
            })
            const data = await res.json()
            if (data.success) {
                alert('Obuna muvaffaqiyatli yaratildi!')
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[var(--card-bg)] rounded-[3rem] p-10 max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-[var(--border)] shadow-2xl"
            >
                <h3 className="text-3xl font-serif font-black text-[var(--foreground)] mb-6">Yangi Obuna Yaratish</h3>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2 block">
                            Foydalanuvchi
                        </label>
                        <select
                            value={selectedUser}
                            onChange={(e) => setSelectedUser(e.target.value)}
                            className="w-full px-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--primary)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 font-medium text-[var(--foreground)] appearance-none"
                            required
                        >
                            <option value="" className="bg-[var(--card-bg)]">Foydalanuvchini tanlang</option>
                            {users.map(user => (
                                <option key={user.id} value={user.id} className="bg-[var(--card-bg)]">
                                    {user.firstName || user.profile?.name || user.email}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2 block">
                            Kurs
                        </label>
                        <select
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                            className="w-full px-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--primary)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 font-medium text-[var(--foreground)] appearance-none"
                            required
                        >
                            <option value="" className="bg-[var(--card-bg)]">Kursni tanlang</option>
                            {courses.map(course => (
                                <option key={course.id} value={course.id} className="bg-[var(--card-bg)]">
                                    {course.title} ({course.type})
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2 block">
                            Davomiyligi (kunlarda)
                        </label>
                        <input
                            type="number"
                            value={duration}
                            onChange={(e) => setDuration(parseInt(e.target.value))}
                            min="1"
                            className="w-full px-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--primary)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 font-medium text-[var(--foreground)]"
                            required
                        />
                    </div>

                    <div className="flex gap-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-4 rounded-2xl border border-[var(--border)] text-[var(--foreground)] opacity-60 font-extrabold hover:opacity-100 transition-all"
                        >
                            Bekor qilish
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex-1 px-6 py-4 rounded-2xl bg-[var(--primary)] text-white font-extrabold shadow-xl shadow-[var(--glow)] hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Yaratish'}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}


