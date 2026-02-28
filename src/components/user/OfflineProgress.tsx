'use client'

import React, { useEffect, useState, useMemo } from 'react'
import { CheckCircle, XCircle, Clock, Calendar, MapPin } from 'lucide-react'

interface OfflineCourse {
    id: string; title: string; titleRu?: string; coverImage?: string
    location?: string; locationRu?: string; schedule?: string; scheduleRu?: string
}
interface SessionStat {
    id: string; date: string; title?: string; status: string | null
}
interface CourseStat {
    courseId: string; totalSessions: number; attended: number; missed: number; excused: number
    percentage: number; sessions: SessionStat[]
}
interface Props { lang: string }

const statusIcons: Record<string, { icon: React.ReactNode; color: string; bg: string; label: { uz: string; ru: string } }> = {
    PRESENT: { icon: <CheckCircle className="w-4 h-4" />, color: '#16a34a', bg: '#f0fdf4', label: { uz: 'Keldi', ru: 'Присутствовал' } },
    ABSENT: { icon: <XCircle className="w-4 h-4" />, color: '#dc2626', bg: '#fef2f2', label: { uz: 'Kelmadi', ru: 'Отсутствовал' } },
    LATE: { icon: <Clock className="w-4 h-4" />, color: '#d97706', bg: '#fffbeb', label: { uz: 'Kechikdi', ru: 'Опоздал' } },
    EXCUSED: { icon: <Clock className="w-4 h-4" />, color: '#2563eb', bg: '#eff6ff', label: { uz: 'Sababli', ru: 'По причине' } },
}

function formatDateInput(d: Date): string {
    return d.toISOString().split('T')[0]
}

const MONTH_UZ = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
const MONTH_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
const DAY_UZ = ['Ya', 'Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha']
const DAY_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

export default function OfflineProgress({ lang }: Props) {
    const [courses, setCourses] = useState<OfflineCourse[]>([])
    const [stats, setStats] = useState<CourseStat[]>([])
    const [loading, setLoading] = useState(true)

    // Date range for each course
    const [dateRanges, setDateRanges] = useState<Record<string, { start: string; end: string }>>({})

    useEffect(() => {
        fetch('/api/user/offline-progress')
            .then(r => r.json())
            .then(data => {
                setCourses(data.courses || [])
                setStats(data.stats || [])
            })
            .catch(() => { })
            .finally(() => setLoading(false))
    }, [])

    if (loading) {
        return (
            <div className="space-y-4">
                {[1].map(i => (
                    <div key={i} className="h-48 bg-[var(--card-bg)] rounded-2xl animate-pulse" />
                ))}
            </div>
        )
    }

    if (courses.length === 0) return null

    const t = {
        title: lang === 'uz' ? 'Offline kurslar davomati' : 'Посещаемость оффлайн курсов',
        attended: lang === 'uz' ? 'Keldi' : 'Были',
        missed: lang === 'uz' ? 'Kelmadi' : 'Пропущено',
        total: lang === 'uz' ? 'Jami' : 'Всего',
        sessions: lang === 'uz' ? "mashg'ulot" : 'занятий',
        noSessions: lang === 'uz' ? "Hali mashg'ulotlar yo'q" : 'Занятий пока нет',
        start: lang === 'uz' ? 'Boshlanish' : 'Начало',
        end: lang === 'uz' ? 'Tugash' : 'Конец',
        attendance: lang === 'uz' ? 'Davomat' : 'Посещаемость',
    }

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--primary)]/60">
                📋 {t.title}
            </h3>

            {courses.map(course => {
                const stat = stats.find(s => s.courseId === course.id)
                if (!stat) return null

                const range = dateRanges[course.id]
                const filteredSessions = range
                    ? stat.sessions.filter(s => {
                        const d = s.date.split('T')[0]
                        return d >= range.start && d <= range.end
                    })
                    : stat.sessions

                const filteredAttended = filteredSessions.filter(s => s.status === 'PRESENT' || s.status === 'LATE').length
                const filteredMissed = filteredSessions.filter(s => s.status === 'ABSENT').length
                const filteredTotal = filteredSessions.length
                const filteredPct = filteredTotal > 0 ? Math.round((filteredAttended / filteredTotal) * 100) : 0
                const months = lang === 'uz' ? MONTH_UZ : MONTH_RU
                const dayNames = lang === 'uz' ? DAY_UZ : DAY_RU

                const setRange = (courseId: string, start: string, end: string) => {
                    setDateRanges(prev => ({ ...prev, [courseId]: { start, end } }))
                }

                const clearRange = (courseId: string) => {
                    setDateRanges(prev => {
                        const next = { ...prev }
                        delete next[courseId]
                        return next
                    })
                }

                return (
                    <div
                        key={course.id}
                        className="bg-white rounded-2xl border border-[var(--foreground)]/[0.04] shadow-sm overflow-hidden"
                    >
                        {/* Course Header */}
                        <div className="p-5 pb-3">
                            <h4 className="text-sm font-bold text-[var(--foreground)] mb-1">
                                {lang === 'ru' && course.titleRu ? course.titleRu : course.title}
                            </h4>
                            <div className="flex items-center gap-4 text-[10px] text-[var(--foreground)]/30 font-medium">
                                {course.location && (
                                    <span className="flex items-center gap-1">
                                        <MapPin className="w-3 h-3" />
                                        {lang === 'ru' && course.locationRu ? course.locationRu : course.location}
                                    </span>
                                )}
                                {course.schedule && (
                                    <span className="flex items-center gap-1">
                                        <Calendar className="w-3 h-3" />
                                        {lang === 'ru' && course.scheduleRu ? course.scheduleRu : course.schedule}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Date Range Picker */}
                        <div className="px-5 pb-3 flex items-center gap-2 flex-wrap">
                            <div className="flex items-center gap-1.5 bg-[var(--primary)]/5 rounded-xl px-3 py-1.5">
                                <label className="text-[9px] font-bold text-[var(--foreground)]/30 uppercase">{t.start}</label>
                                <input
                                    type="date"
                                    value={range?.start || ''}
                                    onChange={e => setRange(course.id, e.target.value, range?.end || formatDateInput(new Date()))}
                                    className="bg-transparent text-[11px] font-semibold text-[var(--foreground)] border-none focus:outline-none cursor-pointer w-[110px]"
                                />
                            </div>
                            <span className="text-[var(--foreground)]/20 text-xs font-bold">→</span>
                            <div className="flex items-center gap-1.5 bg-[var(--primary)]/5 rounded-xl px-3 py-1.5">
                                <label className="text-[9px] font-bold text-[var(--foreground)]/30 uppercase">{t.end}</label>
                                <input
                                    type="date"
                                    value={range?.end || ''}
                                    onChange={e => setRange(course.id, range?.start || '', e.target.value)}
                                    className="bg-transparent text-[11px] font-semibold text-[var(--foreground)] border-none focus:outline-none cursor-pointer w-[110px]"
                                />
                            </div>
                            {range && (
                                <button
                                    onClick={() => clearRange(course.id)}
                                    className="text-[9px] font-bold text-red-400 hover:text-red-600 transition-colors px-2 py-1"
                                >
                                    ✕ {lang === 'uz' ? 'Tozalash' : 'Сбросить'}
                                </button>
                            )}
                        </div>

                        {/* Stats Cards */}
                        <div className="px-5 pb-4 grid grid-cols-4 gap-2">
                            <div className="bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 rounded-xl p-2.5 text-center">
                                <div className="text-lg font-black text-[var(--primary)]">{filteredPct}%</div>
                                <div className="text-[8px] font-bold text-[var(--foreground)]/25 uppercase">{t.attendance}</div>
                            </div>
                            <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 rounded-xl p-2.5 text-center">
                                <div className="text-lg font-black text-emerald-600">{filteredAttended}</div>
                                <div className="text-[8px] font-bold text-[var(--foreground)]/25 uppercase">{t.attended}</div>
                            </div>
                            <div className="bg-gradient-to-br from-red-50 to-red-50/50 rounded-xl p-2.5 text-center">
                                <div className="text-lg font-black text-red-500">{filteredMissed}</div>
                                <div className="text-[8px] font-bold text-[var(--foreground)]/25 uppercase">{t.missed}</div>
                            </div>
                            <div className="bg-gradient-to-br from-gray-50 to-gray-50/80 rounded-xl p-2.5 text-center">
                                <div className="text-lg font-black text-[var(--foreground)]/60">{filteredTotal}</div>
                                <div className="text-[8px] font-bold text-[var(--foreground)]/25 uppercase">{t.total}</div>
                            </div>
                        </div>

                        {/* Progress Bar */}
                        <div className="px-5 pb-3">
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all duration-500 ${filteredPct >= 80 ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
                                            : filteredPct >= 50 ? 'bg-gradient-to-r from-amber-500 to-amber-400'
                                                : 'bg-gradient-to-r from-red-500 to-red-400'
                                        }`}
                                    style={{ width: `${filteredPct}%` }}
                                />
                            </div>
                        </div>

                        {/* Sessions Timeline */}
                        {filteredSessions.length > 0 ? (
                            <div className="px-5 pb-5">
                                <div className="text-[9px] font-bold text-[var(--foreground)]/25 uppercase mb-2">
                                    📅 {lang === 'uz' ? "Mashg'ulotlar" : 'Занятия'}
                                </div>
                                <div className="flex gap-[4px] flex-wrap">
                                    {filteredSessions.map(session => {
                                        const d = new Date(session.date)
                                        const cfg = session.status ? statusIcons[session.status] : null
                                        const isToday = d.toDateString() === new Date().toDateString()
                                        return (
                                            <div
                                                key={session.id}
                                                className="group relative"
                                            >
                                                <div
                                                    className={`w-9 h-9 rounded-lg flex flex-col items-center justify-center text-[8px] font-bold transition-all cursor-pointer
                                                        ${isToday ? 'ring-2 ring-[var(--primary)] ring-offset-1' : ''}
                                                        ${cfg ? '' : 'bg-gray-50 text-[var(--foreground)]/20 border border-dashed border-gray-200'}
                                                    `}
                                                    style={cfg ? { backgroundColor: cfg.bg, color: cfg.color, border: `1.5px solid ${cfg.color}30` } : {}}
                                                >
                                                    <span className="font-black text-[10px] leading-none">{d.getDate()}</span>
                                                    <span className="text-[6px] opacity-60 leading-none mt-0.5">
                                                        {months[d.getMonth()]}
                                                    </span>
                                                </div>
                                                {/* Tooltip */}
                                                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:block z-30 pointer-events-none">
                                                    <div className="bg-gray-900 text-white text-[10px] px-3 py-2 rounded-xl whitespace-nowrap shadow-2xl border border-white/10">
                                                        <div className="font-bold">
                                                            {d.getDate()} {months[d.getMonth()]}, {dayNames[d.getDay()]}
                                                        </div>
                                                        <div className="mt-0.5" style={{ color: cfg?.color || '#888' }}>
                                                            {cfg
                                                                ? cfg.label[lang as 'uz' | 'ru']
                                                                : (lang === 'uz' ? 'Belgilanmagan' : 'Не отмечено')}
                                                        </div>
                                                        {session.title && (
                                                            <div className="text-white/50 mt-0.5">{session.title}</div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>

                                {/* Legend */}
                                <div className="flex items-center gap-3 mt-3 flex-wrap">
                                    {Object.entries(statusIcons).map(([key, cfg]) => (
                                        <div key={key} className="flex items-center gap-1 text-[8px] font-semibold" style={{ color: cfg.color }}>
                                            <div className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: cfg.bg, border: `1.5px solid ${cfg.color}40` }} />
                                            {cfg.label[lang as 'uz' | 'ru']}
                                        </div>
                                    ))}
                                    <div className="flex items-center gap-1 text-[8px] font-semibold text-[var(--foreground)]/20">
                                        <div className="w-2.5 h-2.5 rounded-sm bg-gray-50 border border-dashed border-gray-200" />
                                        {lang === 'uz' ? 'Belgilanmagan' : 'Не отмечено'}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="px-5 pb-5 text-center text-[var(--foreground)]/20 text-xs font-medium py-6">
                                {t.noSessions}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
