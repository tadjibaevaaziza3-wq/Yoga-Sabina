'use client';

/**
 * DavomatSection — Offline Course Attendance Table + Donut Chart
 * 
 * Shows each offline course's full attendance history in a table,
 * plus a visual donut chart of present/absent/late/excused breakdown.
 */

import { useState } from 'react';
import { ChevronDown, ChevronUp, CalendarDays, CheckCircle2, XCircle, Clock, AlertCircle } from 'lucide-react';

interface Attendance {
    date: string;
    timeSlot: string | null;
    status: string; // PRESENT | ABSENT | LATE | EXCUSED
    note: string | null;
}

interface OfflineCourseData {
    subscriptionId: string;
    courseId: string;
    courseTitle: string;
    timeSlot: string | null;
    startsAt: string;
    endsAt: string;
    attendances: Attendance[];
    stats: {
        totalClasses: number;
        attended: number;
        absent: number;
        excused: number;
    };
}

interface DavomatSectionProps {
    offlineCourses: OfflineCourseData[];
    lang: 'uz' | 'ru';
}

const STATUS_CONFIG: Record<string, { icon: React.ReactNode; label: { uz: string; ru: string }; color: string; bg: string }> = {
    PRESENT: {
        icon: <CheckCircle2 size={14} />,
        label: { uz: 'Keldi', ru: 'Присутствовал' },
        color: 'text-emerald-600',
        bg: 'bg-emerald-500',
    },
    LATE: {
        icon: <Clock size={14} />,
        label: { uz: 'Kechikdi', ru: 'Опоздал' },
        color: 'text-amber-600',
        bg: 'bg-amber-500',
    },
    ABSENT: {
        icon: <XCircle size={14} />,
        label: { uz: 'Kelmadi', ru: 'Отсутствовал' },
        color: 'text-red-600',
        bg: 'bg-red-500',
    },
    EXCUSED: {
        icon: <AlertCircle size={14} />,
        label: { uz: 'Sababli', ru: 'По уваж. причине' },
        color: 'text-sky-600',
        bg: 'bg-sky-500',
    },
};

// Pure CSS Donut Chart component
function DonutChart({ stats, lang }: { stats: OfflineCourseData['stats']; lang: 'uz' | 'ru' }) {
    const total = stats.totalClasses || 1;
    const late = stats.attended - (stats.attended); // we don't track late separately in stats, treat attended as present+late
    const segments = [
        { key: 'PRESENT', value: stats.attended, color: '#10b981' },
        { key: 'ABSENT', value: stats.absent, color: '#ef4444' },
        { key: 'EXCUSED', value: stats.excused, color: '#0ea5e9' },
    ];

    // Build conic-gradient
    let gradientParts: string[] = [];
    let cumulative = 0;
    for (const seg of segments) {
        const pct = (seg.value / total) * 100;
        if (pct > 0) {
            gradientParts.push(`${seg.color} ${cumulative}% ${cumulative + pct}%`);
        }
        cumulative += pct;
    }
    if (cumulative < 100) {
        gradientParts.push(`#e5e7eb ${cumulative}% 100%`);
    }

    const attendancePct = total > 0 ? Math.round((stats.attended / total) * 100) : 0;

    return (
        <div className="flex flex-col items-center gap-3">
            {/* Donut */}
            <div
                className="relative w-28 h-28 rounded-full"
                style={{
                    background: `conic-gradient(${gradientParts.join(', ')})`,
                }}
            >
                <div className="absolute inset-3 rounded-full bg-[var(--card-bg)] flex items-center justify-center flex-col">
                    <span className="text-xl font-black text-[var(--foreground)]">{attendancePct}%</span>
                    <span className="text-[9px] text-[var(--foreground)]/50 font-medium">
                        {lang === 'uz' ? 'qatnov' : 'посещ.'}
                    </span>
                </div>
            </div>
            {/* Legend */}
            <div className="flex flex-wrap gap-x-4 gap-y-1 justify-center">
                {segments.filter(s => s.value > 0).map(seg => (
                    <div key={seg.key} className="flex items-center gap-1.5 text-[10px] font-semibold text-[var(--foreground)]/70">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: seg.color }} />
                        {STATUS_CONFIG[seg.key]?.label[lang] || seg.key}: {seg.value}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function DavomatSection({ offlineCourses, lang }: DavomatSectionProps) {
    const [expandedCourse, setExpandedCourse] = useState<string | null>(
        offlineCourses.length === 1 ? offlineCourses[0].courseId : null
    );

    if (offlineCourses.length === 0) return null;

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
            day: 'numeric',
            month: 'short',
        });
    };

    const formatFullDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
            weekday: 'short',
            day: 'numeric',
            month: 'long',
        });
    };

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    };

    return (
        <section className="space-y-6">
            <div className="flex items-center gap-3">
                <CalendarDays className="text-[var(--primary)]" size={24} />
                <h2 className="text-2xl font-serif font-black text-[var(--foreground)]">
                    {lang === 'uz' ? 'Davomat' : 'Посещаемость'}
                </h2>
            </div>

            {offlineCourses.map((oc) => {
                const isExpanded = expandedCourse === oc.courseId;
                const daysLeft = getDaysRemaining(oc.endsAt);
                const isUrgent = daysLeft < 7;

                return (
                    <div
                        key={oc.courseId}
                        className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm"
                    >
                        {/* Header — always visible */}
                        <button
                            onClick={() => setExpandedCourse(isExpanded ? null : oc.courseId)}
                            className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--foreground)]/3 transition-colors"
                        >
                            <div className="flex-1">
                                <h3 className="font-bold text-[var(--foreground)] text-base">
                                    {oc.courseTitle}
                                </h3>
                                <div className="flex flex-wrap gap-3 mt-1.5 text-[11px] text-[var(--foreground)]/60">
                                    {oc.timeSlot && (
                                        <span className="flex items-center gap-1">
                                            <Clock size={11} /> {oc.timeSlot}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <CheckCircle2 size={11} className="text-emerald-500" />
                                        {oc.stats.attended}/{oc.stats.totalClasses} {lang === 'uz' ? 'dars' : 'занятий'}
                                    </span>
                                    <span className={`font-semibold ${isUrgent ? 'text-red-500' : ''}`}>
                                        {lang === 'uz' ? `To'lov: ${formatDate(oc.endsAt)}` : `Оплата: ${formatDate(oc.endsAt)}`}
                                    </span>
                                </div>
                            </div>
                            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </button>

                        {/* Expanded content */}
                        {isExpanded && (
                            <div className="border-t border-[var(--border)]">
                                {/* Chart + Stats row */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5">
                                    {/* Donut Chart */}
                                    <DonutChart stats={oc.stats} lang={lang} />

                                    {/* Quick Stats */}
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 text-center">
                                            <div className="text-2xl font-black text-emerald-600">{oc.stats.attended}</div>
                                            <div className="text-[10px] font-semibold text-emerald-600/70 uppercase tracking-wider">
                                                {lang === 'uz' ? 'Kelgan' : 'Присутствовал'}
                                            </div>
                                        </div>
                                        <div className="bg-red-50 dark:bg-red-500/10 rounded-xl p-3 text-center">
                                            <div className="text-2xl font-black text-red-600">{oc.stats.absent}</div>
                                            <div className="text-[10px] font-semibold text-red-600/70 uppercase tracking-wider">
                                                {lang === 'uz' ? 'Kelmagan' : 'Отсутствовал'}
                                            </div>
                                        </div>
                                        <div className="bg-sky-50 dark:bg-sky-500/10 rounded-xl p-3 text-center">
                                            <div className="text-2xl font-black text-sky-600">{oc.stats.excused}</div>
                                            <div className="text-[10px] font-semibold text-sky-600/70 uppercase tracking-wider">
                                                {lang === 'uz' ? 'Sababli' : 'По причине'}
                                            </div>
                                        </div>
                                        <div className="bg-[var(--primary)]/5 rounded-xl p-3 text-center">
                                            <div className="text-2xl font-black text-[var(--primary)]">{oc.stats.totalClasses}</div>
                                            <div className="text-[10px] font-semibold text-[var(--primary)]/70 uppercase tracking-wider">
                                                {lang === 'uz' ? 'Jami dars' : 'Всего занятий'}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Attendance Table */}
                                {oc.attendances.length > 0 ? (
                                    <div className="px-5 pb-5">
                                        <h4 className="text-xs font-bold text-[var(--foreground)]/50 uppercase tracking-wider mb-3">
                                            {lang === 'uz' ? 'Batafsil jadval' : 'Подробная таблица'}
                                        </h4>
                                        <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
                                            <table className="w-full text-sm">
                                                <thead>
                                                    <tr className="bg-[var(--foreground)]/5">
                                                        <th className="text-left px-4 py-2.5 font-semibold text-[var(--foreground)]/60 text-xs">
                                                            #
                                                        </th>
                                                        <th className="text-left px-4 py-2.5 font-semibold text-[var(--foreground)]/60 text-xs">
                                                            {lang === 'uz' ? 'Sana' : 'Дата'}
                                                        </th>
                                                        <th className="text-left px-4 py-2.5 font-semibold text-[var(--foreground)]/60 text-xs">
                                                            {lang === 'uz' ? 'Vaqt' : 'Время'}
                                                        </th>
                                                        <th className="text-left px-4 py-2.5 font-semibold text-[var(--foreground)]/60 text-xs">
                                                            {lang === 'uz' ? 'Holat' : 'Статус'}
                                                        </th>
                                                        <th className="text-left px-4 py-2.5 font-semibold text-[var(--foreground)]/60 text-xs">
                                                            {lang === 'uz' ? 'Izoh' : 'Примечание'}
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {oc.attendances.map((a, i) => {
                                                        const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.ABSENT;
                                                        return (
                                                            <tr
                                                                key={i}
                                                                className="border-t border-[var(--border)] hover:bg-[var(--foreground)]/3 transition-colors"
                                                            >
                                                                <td className="px-4 py-2.5 text-[var(--foreground)]/40 text-xs">
                                                                    {i + 1}
                                                                </td>
                                                                <td className="px-4 py-2.5 font-medium text-[var(--foreground)] text-xs">
                                                                    {formatFullDate(a.date)}
                                                                </td>
                                                                <td className="px-4 py-2.5 text-[var(--foreground)]/60 text-xs">
                                                                    {a.timeSlot || oc.timeSlot || '—'}
                                                                </td>
                                                                <td className="px-4 py-2.5">
                                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold ${cfg.color} ${cfg.bg}/10`}>
                                                                        {cfg.icon}
                                                                        {cfg.label[lang]}
                                                                    </span>
                                                                </td>
                                                                <td className="px-4 py-2.5 text-[var(--foreground)]/50 text-xs max-w-[150px] truncate">
                                                                    {a.note || '—'}
                                                                </td>
                                                            </tr>
                                                        );
                                                    })}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="px-5 pb-5 text-center py-8 text-[var(--foreground)]/40 text-sm">
                                        {lang === 'uz' ? 'Hali davomat ma\'lumotlari yo\'q' : 'Данных о посещаемости пока нет'}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                );
            })}
        </section>
    );
}
