"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, Calendar as CalendarIcon, Phone, Mail, MapPin, Clock, CheckCircle, XCircle, AlertCircle } from "lucide-react"

interface Consultation {
    id: string
    userId: string
    courseId: string
    amount: number
    status: string
    consultationStatus: string
    createdAt: string
    user: {
        firstName?: string
        lastName?: string
        email?: string
        phone?: string
        profile?: {
            name?: string
        }
    }
    course: {
        title: string
        consultationFormat?: string
    }
}

export function ConsultationCalendar() {
    const [consultations, setConsultations] = useState<Consultation[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('ALL')
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        fetchConsultations()
    }, [filter])

    const fetchConsultations = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filter !== 'ALL') {
                params.append('status', filter)
            }

            const res = await fetch(`/api/admin/consultations?${params}`)
            const data = await res.json()
            if (data.success) {
                setConsultations(data.consultations)
                setStats(data.byStatus)
            }
        } catch (error) {
            console.error('Error fetching consultations:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'NEW':
                return <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> Yangi
                </span>
            case 'CONFIRMED':
                return <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Tasdiqlangan
                </span>
            case 'COMPLETED':
                return <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-purple-500/10 text-purple-500 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Bajarilgan
                </span>
            case 'CANCELED':
                return <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-red-500/10 text-red-500 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Bekor qilingan
                </span>
            default:
                return <span className="px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-gray-500/10 text-gray-500">{status || 'NEW'}</span>
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
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-500/10 p-4 rounded-2xl border border-blue-500/20">
                    <div className="text-xs font-black uppercase tracking-widest text-blue-500 opacity-60 mb-1">Yangi</div>
                    <div className="text-2xl font-black text-blue-500">{stats?.NEW || 0}</div>
                </div>
                <div className="bg-yellow-500/10 p-4 rounded-2xl border border-yellow-500/20">
                    <div className="text-xs font-black uppercase tracking-widest text-yellow-500 opacity-60 mb-1">Tasdiqlangan</div>
                    <div className="text-2xl font-black text-yellow-500">{stats?.CONFIRMED || 0}</div>
                </div>
                <div className="bg-purple-500/10 p-4 rounded-2xl border border-purple-500/20">
                    <div className="text-xs font-black uppercase tracking-widest text-purple-500 opacity-60 mb-1">Bajarilgan</div>
                    <div className="text-2xl font-black text-purple-500">{stats?.COMPLETED || 0}</div>
                </div>
                <div className="bg-red-500/10 p-4 rounded-2xl border border-red-500/20">
                    <div className="text-xs font-black uppercase tracking-widest text-red-500 opacity-60 mb-1">Bekor</div>
                    <div className="text-2xl font-black text-red-500">{stats?.CANCELED || 0}</div>
                </div>
            </div>

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h2 className="text-3xl font-serif font-black text-[var(--foreground)] mb-2">Konsultatsiyalar Kalendari</h2>
                    <p className="text-sm font-bold opacity-40 uppercase tracking-[0.2em] text-[var(--foreground)]">
                        Jami: {consultations.length} ta bron
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex gap-2 flex-wrap">
                {['ALL', 'NEW', 'CONFIRMED', 'COMPLETED', 'CANCELED'].map((status) => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-6 py-3 rounded-2xl text-sm font-extrabold transition-all ${filter === status
                            ? 'bg-[var(--primary)] text-white shadow-xl shadow-[var(--glow)]'
                            : 'bg-[var(--card-bg)] text-[var(--foreground)] opacity-40 hover:opacity-100 border border-[var(--border)]'
                            }`}
                    >
                        {status === 'ALL' ? 'Hammasi' : status}
                    </button>
                ))}
            </div>

            {/* Consultations Grid */}
            <div className="grid gap-6">
                {consultations.map((consultation) => (
                    <ConsultationCard
                        key={consultation.id}
                        consultation={consultation}
                        onUpdate={fetchConsultations}
                        getStatusBadge={getStatusBadge}
                    />
                ))}
                {consultations.length === 0 && (
                    <div className="text-center p-20 bg-[var(--card-bg)] rounded-[2rem] border border-dashed border-[var(--border)]">
                        <CalendarIcon className="w-16 h-16 opacity-10 text-[var(--foreground)] mx-auto mb-4" />
                        <p className="opacity-30 font-black uppercase tracking-widest text-xs text-[var(--foreground)]">
                            Konsultatsiyalar topilmadi
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}

function ConsultationCard({ consultation, onUpdate, getStatusBadge }: {
    consultation: Consultation;
    onUpdate: () => void;
    getStatusBadge: (status: string) => React.ReactElement
}) {
    const [updating, setUpdating] = useState(false)

    const handleStatusChange = async (newStatus: string) => {
        setUpdating(true)
        try {
            const res = await fetch(`/api/admin/consultations/${consultation.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ consultationStatus: newStatus })
            })
            const data = await res.json()
            if (data.success) {
                alert('Status yangilandi!')
                onUpdate()
            } else {
                alert('Xatolik: ' + data.error)
            }
        } catch (error) {
            alert('Tarmoq xatoligi')
        } finally {
            setUpdating(false)
        }
    }

    const userName = `${consultation.user.firstName || ''} ${consultation.user.lastName || ''}`.trim() ||
        consultation.user.profile?.name ||
        consultation.user.email ||
        'N/A'

    const bookingDate = new Date(consultation.createdAt).toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    const currentStatus = consultation.consultationStatus || 'NEW'

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[var(--card-bg)] p-8 rounded-[2rem] border border-[var(--border)] shadow-sm hover:shadow-xl hover:shadow-[var(--glow)] transition-all"
        >
            <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
                <div className="flex-1 space-y-4">
                    <div className="flex items-start justify-between">
                        <div>
                            <h3 className="text-xl font-bold text-[var(--foreground)] mb-1">{userName}</h3>
                            <p className="text-sm font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">
                                {consultation.course.title}
                            </p>
                        </div>
                        {getStatusBadge(currentStatus)}
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 p-4 bg-[var(--primary)]/5 rounded-xl border border-[var(--border)]">
                            <Phone className="w-5 h-5 text-[var(--primary)]" />
                            <div>
                                <div className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Telefon</div>
                                <div className="font-bold text-[var(--foreground)]">
                                    {consultation.user.phone ? (
                                        <a href={`tel:${consultation.user.phone}`} className="hover:underline">
                                            {consultation.user.phone}
                                        </a>
                                    ) : 'N/A'}
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-[var(--primary)]/5 rounded-xl border border-[var(--border)]">
                            <Mail className="w-5 h-5 text-[var(--primary)]" />
                            <div>
                                <div className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">Email</div>
                                <div className="font-bold text-[var(--foreground)] text-sm truncate">
                                    {consultation.user.email ? (
                                        <a href={`mailto:${consultation.user.email}`} className="hover:underline">
                                            {consultation.user.email}
                                        </a>
                                    ) : 'N/A'}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 text-sm">
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-[var(--primary)]" />
                            <span className="font-bold opacity-60 text-[var(--foreground)]">Bron qilingan: {bookingDate}</span>
                        </div>
                        {consultation.course.consultationFormat && (
                            <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[var(--primary)]" />
                                <span className="font-bold text-[var(--primary)] uppercase text-xs">
                                    {consultation.course.consultationFormat}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-2 min-w-[180px]">
                    <div className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-1">
                        Statusni o'zgartirish
                    </div>
                    {['NEW', 'CONFIRMED', 'COMPLETED', 'CANCELED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => handleStatusChange(status)}
                            disabled={updating || currentStatus === status}
                            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all disabled:opacity-50 ${currentStatus === status
                                ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--glow)]'
                                : 'bg-[var(--primary)]/5 text-[var(--foreground)] opacity-60 hover:opacity-100 border border-[var(--border)]'
                                }`}
                        >
                            {updating ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : status}
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    )
}


