'use client'

import React, { useEffect, useState } from 'react'
import { CheckCircle, XCircle, Clock, BarChart3, Calendar, MapPin } from 'lucide-react'

interface OfflineCourse {
    id: string
    title: string
    titleRu?: string
    coverImage?: string
    location?: string
    locationRu?: string
    schedule?: string
    scheduleRu?: string
}

interface SessionStat {
    id: string
    date: string
    title?: string
    status: string | null
}

interface CourseStat {
    courseId: string
    totalSessions: number
    attended: number
    missed: number
    excused: number
    percentage: number
    sessions: SessionStat[]
}

interface Props {
    lang: string
}

const statusIcons: Record<string, { icon: React.ReactNode; color: string; label: { uz: string; ru: string } }> = {
    PRESENT: { icon: <CheckCircle className="w-4 h-4" />, color: '#16a34a', label: { uz: 'Keldi', ru: 'Присутствовал' } },
    ABSENT: { icon: <XCircle className="w-4 h-4" />, color: '#dc2626', label: { uz: 'Kelmadi', ru: 'Отсутствовал' } },
    LATE: { icon: <Clock className="w-4 h-4" />, color: '#d97706', label: { uz: 'Kechikdi', ru: 'Опоздал' } },
    EXCUSED: { icon: <Clock className="w-4 h-4" />, color: '#2563eb', label: { uz: 'Sababli', ru: 'По причине' } },
}

export default function OfflineProgress({ lang }: Props) {
    const [courses, setCourses] = useState<OfflineCourse[]>([])
    const [stats, setStats] = useState<CourseStat[]>([])
    const [loading, setLoading] = useState(true)

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
                {[1, 2].map(i => (
                    <div key={i} className="h-48 bg-[var(--card-bg)] rounded-[2rem] animate-pulse" />
                ))}
            </div>
        )
    }

    if (courses.length === 0) return null

    const t = {
        title: lang === 'uz' ? 'Offline Kurslar Davomati' : 'Посещаемость оффлайн курсов',
        attended: lang === 'uz' ? 'Kelgan' : 'Присутствовал',
        missed: lang === 'uz' ? 'Ketkazgan' : 'Пропущено',
        total: lang === 'uz' ? 'Jami' : 'Всего',
        sessions: lang === 'uz' ? "mashg'ulot" : 'занятий',
        noSessions: lang === 'uz' ? "Hali mashg'ulotlar yo'q" : 'Занятий пока нет',
        history: lang === 'uz' ? "Mashg'ulotlar tarixi" : 'История занятий',
    }

    return (
        <div className="space-y-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-[var(--primary)]/60">
                📋 {t.title}
            </h3>

            {courses.map(course => {
                const stat = stats.find(s => s.courseId === course.id)
                if (!stat) return null

                return (
                    <div
                        key={course.id}
                        className="bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border)] shadow-sm overflow-hidden"
                    >
                        {/* Course Header */}
                        <div className="p-6 pb-4">
                            <h4 className="text-base font-bold text-[var(--text-primary)] mb-1">
                                {lang === 'ru' && course.titleRu ? course.titleRu : course.title}
                            </h4>
                            <div className="flex items-center gap-4 text-xs text-[var(--text-secondary)]">
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

                        {/* Stats Row */}
                        <div className="px-6 pb-4 flex items-center gap-6">
                            {/* Attendance ring */}
                            <div className="relative w-20 h-20 flex-shrink-0">
                                <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
                                    <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="8" />
                                    <circle
                                        cx="40" cy="40" r="34" fill="none"
                                        stroke={stat.percentage >= 80 ? '#16a34a' : stat.percentage >= 50 ? '#d97706' : '#dc2626'}
                                        strokeWidth="8"
                                        strokeLinecap="round"
                                        strokeDasharray={`${(stat.percentage / 100) * 213.6} 213.6`}
                                    />
                                </svg>
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <span className="text-lg font-black text-[var(--text-primary)]">{stat.percentage}%</span>
                                </div>
                            </div>

                            <div className="flex-1 grid grid-cols-3 gap-3">
                                <div className="text-center p-2 bg-green-50 rounded-xl">
                                    <div className="text-lg font-black text-green-600">{stat.attended}</div>
                                    <div className="text-[10px] font-bold text-green-600/60 uppercase">{t.attended}</div>
                                </div>
                                <div className="text-center p-2 bg-red-50 rounded-xl">
                                    <div className="text-lg font-black text-red-600">{stat.missed}</div>
                                    <div className="text-[10px] font-bold text-red-600/60 uppercase">{t.missed}</div>
                                </div>
                                <div className="text-center p-2 bg-gray-50 rounded-xl">
                                    <div className="text-lg font-black text-gray-600">{stat.totalSessions}</div>
                                    <div className="text-[10px] font-bold text-gray-600/60 uppercase">{t.total}</div>
                                </div>
                            </div>
                        </div>

                        {/* Progress Timeline Bar Chart */}
                        {stat.sessions.length > 0 && (
                            <div className="px-6 pb-4">
                                <h5 className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]/40 mb-2">
                                    📊 {lang === 'uz' ? 'Davomat diagrammasi' : 'Диаграмма посещаемости'}
                                </h5>
                                <div className="flex gap-1 items-end h-16 p-2 bg-white rounded-xl border border-[var(--border)]">
                                    {stat.sessions.map((session, idx) => {
                                        const color = session.status === 'PRESENT' ? '#16a34a'
                                            : session.status === 'LATE' ? '#d97706'
                                                : session.status === 'ABSENT' ? '#dc2626'
                                                    : session.status === 'EXCUSED' ? '#2563eb'
                                                        : '#e5e7eb'
                                        const height = session.status === 'PRESENT' ? '100%'
                                            : session.status === 'LATE' ? '75%'
                                                : session.status === 'ABSENT' ? '30%'
                                                    : session.status === 'EXCUSED' ? '50%'
                                                        : '15%'
                                        return (
                                            <div
                                                key={session.id}
                                                className="flex-1 rounded-sm transition-all hover:opacity-80 cursor-pointer group relative"
                                                style={{ backgroundColor: color, height, minWidth: 6, maxWidth: 24 }}
                                                title={`${new Date(session.date).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'ru-RU', { day: 'numeric', month: 'short' })} — ${statusIcons[session.status || '']?.label[lang as 'uz' | 'ru'] || '—'}`}
                                            />
                                        )
                                    })}
                                </div>
                                <div className="flex gap-3 mt-1.5 justify-center">
                                    {[
                                        { color: '#16a34a', label: lang === 'uz' ? 'Keldi' : 'Был' },
                                        { color: '#d97706', label: lang === 'uz' ? 'Kechikdi' : 'Опозд.' },
                                        { color: '#dc2626', label: lang === 'uz' ? 'Kelmadi' : 'Не был' },
                                    ].map(l => (
                                        <span key={l.color} className="flex items-center gap-1 text-[9px] text-[var(--text-secondary)]">
                                            <span className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: l.color }} />
                                            {l.label}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Session History */}
                        {stat.sessions.length > 0 ? (
                            <div className="px-6 pb-6">
                                <h5 className="text-xs font-bold uppercase tracking-widest text-[var(--primary)]/40 mb-3">
                                    {t.history}
                                </h5>
                                <div className="space-y-2 max-h-60 overflow-y-auto">
                                    {stat.sessions.slice().reverse().map(session => (
                                        <div
                                            key={session.id}
                                            className="flex items-center justify-between p-3 rounded-xl bg-white border border-[var(--border)]"
                                        >
                                            <div>
                                                <div className="text-sm font-semibold text-[var(--text-primary)]">
                                                    {new Date(session.date).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'ru-RU', {
                                                        weekday: 'short', day: 'numeric', month: 'short'
                                                    })}
                                                </div>
                                                {session.title && (
                                                    <div className="text-xs text-[var(--text-secondary)]">{session.title}</div>
                                                )}
                                            </div>
                                            {session.status ? (
                                                <span
                                                    className="flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full"
                                                    style={{
                                                        color: statusIcons[session.status]?.color || '#666',
                                                        backgroundColor: `${statusIcons[session.status]?.color || '#666'}15`,
                                                    }}
                                                >
                                                    {statusIcons[session.status]?.icon}
                                                    {statusIcons[session.status]?.label[lang as 'uz' | 'ru'] || session.status}
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-medium">—</span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="px-6 pb-6 text-center text-sm text-[var(--text-secondary)]">
                                {t.noSessions}
                            </div>
                        )}
                    </div>
                )
            })}
        </div>
    )
}
