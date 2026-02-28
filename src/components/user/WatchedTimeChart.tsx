'use client'

import React, { useState, useMemo } from 'react'

interface Props {
    lang: string
    data: { date: string; count: number }[]
}

const MONTH_NAMES_UZ = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentyabr', 'Oktyabr', 'Noyabr', 'Dekabr']
const MONTH_NAMES_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const MONTH_SHORT_UZ = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
const MONTH_SHORT_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']
const DAY_NAMES_UZ = ['Ya', 'Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sha']
const DAY_NAMES_RU = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']

function formatDateInput(d: Date): string {
    return d.toISOString().split('T')[0]
}

export default function WatchedTimeChart({ lang, data }: Props) {
    const now = new Date()
    const defaultStart = new Date(now)
    defaultStart.setDate(defaultStart.getDate() - 30)

    const [startDate, setStartDate] = useState(formatDateInput(defaultStart))
    const [endDate, setEndDate] = useState(formatDateInput(now))

    const filteredData = useMemo(() => {
        const start = new Date(startDate)
        const end = new Date(endDate)
        const days: { date: string; day: number; month: number; monthName: string; dayName: string; count: number; minutes: number }[] = []
        const months = lang === 'uz' ? MONTH_SHORT_UZ : MONTH_SHORT_RU
        const dayNames = lang === 'uz' ? DAY_NAMES_UZ : DAY_NAMES_RU

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = formatDateInput(d)
            const found = data.find(x => x.date === dateStr)
            const count = found?.count || 0
            days.push({
                date: dateStr,
                day: d.getDate(),
                month: d.getMonth(),
                monthName: months[d.getMonth()],
                dayName: dayNames[d.getDay()],
                count,
                minutes: count * 15, // ~15 min per lesson
            })
        }
        return days
    }, [startDate, endDate, data, lang])

    const maxMinutes = Math.max(...filteredData.map(d => d.minutes), 1)
    const totalMinutes = filteredData.reduce((s, d) => s + d.minutes, 0)
    const totalLessons = filteredData.reduce((s, d) => s + d.count, 0)
    const activeDays = filteredData.filter(d => d.count > 0).length
    const totalHours = Math.floor(totalMinutes / 60)
    const remainMinutes = totalMinutes % 60

    // Group by month for labels
    const monthGroups: { monthName: string; fullName: string; span: number }[] = []
    let prevMonth = -1
    const fullMonths = lang === 'uz' ? MONTH_NAMES_UZ : MONTH_NAMES_RU
    filteredData.forEach(d => {
        if (d.month !== prevMonth) {
            monthGroups.push({ monthName: d.monthName, fullName: fullMonths[d.month], span: 1 })
            prevMonth = d.month
        } else {
            monthGroups[monthGroups.length - 1].span++
        }
    })

    // Quick range presets
    const setRange = (daysBack: number) => {
        const end = new Date()
        const start = new Date()
        start.setDate(start.getDate() - daysBack)
        setStartDate(formatDateInput(start))
        setEndDate(formatDateInput(end))
    }

    const t = {
        title: lang === 'uz' ? "Online kurslar faolligi" : "Активность онлайн курсов",
        start: lang === 'uz' ? 'Boshlanish' : 'Начало',
        end: lang === 'uz' ? 'Tugash' : 'Конец',
        lessons: lang === 'uz' ? 'dars' : 'уроков',
        activeDays: lang === 'uz' ? 'faol kun' : 'акт. дней',
        watched: lang === 'uz' ? 'tomosha qilindi' : 'просмотрено',
        min: lang === 'uz' ? 'daqiqa' : 'мин',
        hour: lang === 'uz' ? 'soat' : 'ч',
    }

    return (
        <div>
            {/* Header with title and date pickers */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
                <h3 className="text-sm font-black uppercase tracking-widest text-[var(--primary)]/60">
                    🎬 {t.title}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-[var(--primary)]/5 rounded-xl px-3 py-1.5">
                        <label className="text-[9px] font-bold text-[var(--foreground)]/30 uppercase">{t.start}</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={e => setStartDate(e.target.value)}
                            className="bg-transparent text-[11px] font-semibold text-[var(--foreground)] border-none focus:outline-none cursor-pointer w-[110px]"
                        />
                    </div>
                    <span className="text-[var(--foreground)]/20 text-xs font-bold">→</span>
                    <div className="flex items-center gap-1.5 bg-[var(--primary)]/5 rounded-xl px-3 py-1.5">
                        <label className="text-[9px] font-bold text-[var(--foreground)]/30 uppercase">{t.end}</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={e => setEndDate(e.target.value)}
                            className="bg-transparent text-[11px] font-semibold text-[var(--foreground)] border-none focus:outline-none cursor-pointer w-[110px]"
                        />
                    </div>
                </div>
            </div>

            {/* Quick range buttons */}
            <div className="flex items-center gap-1.5 mb-4 flex-wrap">
                {[
                    { label: lang === 'uz' ? '7 kun' : '7 дней', days: 7 },
                    { label: lang === 'uz' ? '30 kun' : '30 дней', days: 30 },
                    { label: lang === 'uz' ? '60 kun' : '60 дней', days: 60 },
                    { label: lang === 'uz' ? '90 kun' : '90 дней', days: 90 },
                ].map(p => (
                    <button
                        key={p.days}
                        onClick={() => setRange(p.days)}
                        className="px-3 py-1 rounded-lg text-[9px] font-bold text-[var(--foreground)]/40 bg-[var(--foreground)]/[0.03] hover:bg-[var(--primary)]/10 hover:text-[var(--primary)] transition-all"
                    >
                        {p.label}
                    </button>
                ))}
            </div>

            {/* Stats cards */}
            <div className="grid grid-cols-3 gap-3 mb-5">
                <div className="bg-gradient-to-br from-[var(--primary)]/10 to-[var(--primary)]/5 rounded-2xl p-3.5 text-center">
                    <div className="text-xl font-black text-[var(--primary)]">
                        {totalHours > 0 ? `${totalHours}${t.hour} ${remainMinutes}${t.min}` : `${totalMinutes}${t.min}`}
                    </div>
                    <div className="text-[9px] font-bold text-[var(--foreground)]/30 uppercase mt-0.5">⏱ {t.watched}</div>
                </div>
                <div className="bg-gradient-to-br from-emerald-50 to-emerald-50/50 rounded-2xl p-3.5 text-center">
                    <div className="text-xl font-black text-emerald-600">{totalLessons}</div>
                    <div className="text-[9px] font-bold text-[var(--foreground)]/30 uppercase mt-0.5">📚 {t.lessons}</div>
                </div>
                <div className="bg-gradient-to-br from-amber-50 to-amber-50/50 rounded-2xl p-3.5 text-center">
                    <div className="text-xl font-black text-amber-600">{activeDays}</div>
                    <div className="text-[9px] font-bold text-[var(--foreground)]/30 uppercase mt-0.5">🔥 {t.activeDays}</div>
                </div>
            </div>

            {/* Month labels */}
            <div className="flex mb-0.5" style={{ gap: 0 }}>
                {monthGroups.map((m, i) => (
                    <div
                        key={`${m.monthName}-${i}`}
                        className="text-[10px] font-bold text-[var(--primary)] text-center"
                        style={{ flex: `${m.span} 0 0`, minWidth: 0 }}
                    >
                        {m.fullName}
                    </div>
                ))}
            </div>

            {/* Bar chart */}
            <div className="bg-gradient-to-b from-[var(--primary)]/[0.02] to-transparent rounded-2xl p-3 pt-1">
                {/* Minute grid lines */}
                <div className="relative">
                    <div className="absolute inset-0 flex flex-col justify-between pointer-events-none py-1" style={{ height: 140 }}>
                        {[maxMinutes, Math.round(maxMinutes * 0.5), 0].map((val, i) => (
                            <div key={i} className="flex items-center gap-1">
                                <span className="text-[7px] font-semibold text-[var(--foreground)]/15 w-6 text-right">{val}{t.min}</span>
                                <div className="flex-1 border-b border-dashed border-[var(--foreground)]/[0.04]" />
                            </div>
                        ))}
                    </div>

                    <div className="flex items-end gap-[2px] pl-8" style={{ height: 140 }}>
                        {filteredData.map((d, i) => {
                            const heightPct = d.minutes > 0 ? Math.max(8, (d.minutes / maxMinutes) * 100) : 2
                            const isToday = d.date === formatDateInput(new Date())
                            const isWeekend = new Date(d.date).getDay() === 0 || new Date(d.date).getDay() === 6
                            return (
                                <div
                                    key={d.date}
                                    className="flex-1 group relative"
                                    style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}
                                >
                                    <div
                                        className={`w-full rounded-t-sm transition-all duration-200 ${d.count > 0
                                                ? isToday
                                                    ? 'bg-gradient-to-t from-[var(--primary)] to-[var(--primary)]/70'
                                                    : 'bg-gradient-to-t from-[var(--primary)]/70 to-[var(--primary)]/30 group-hover:from-[var(--primary)] group-hover:to-[var(--primary)]/60'
                                                : isWeekend
                                                    ? 'bg-[var(--foreground)]/[0.03]'
                                                    : 'bg-[var(--foreground)]/[0.02] group-hover:bg-[var(--foreground)]/[0.06]'
                                            }`}
                                        style={{ height: `${heightPct}%`, minHeight: 1 }}
                                    />
                                    {/* Tooltip */}
                                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none">
                                        <div className="bg-gray-900 text-white text-[10px] px-3 py-2 rounded-xl whitespace-nowrap shadow-2xl border border-white/10">
                                            <div className="font-bold text-[11px]">{d.day} {d.monthName}, {d.dayName}</div>
                                            <div className="flex items-center gap-3 mt-0.5">
                                                <span className="text-emerald-300">📚 {d.count} {t.lessons}</span>
                                                <span className="text-blue-300">⏱ {d.minutes} {t.min}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Date labels */}
                <div className="flex gap-[2px] mt-1 pl-8">
                    {filteredData.map((d, i) => {
                        const dayOfWeek = new Date(d.date).getDay()
                        const isFirst = d.day === 1
                        const isMonday = dayOfWeek === 1
                        const isToday = d.date === formatDateInput(new Date())
                        const showLabel = isFirst || isMonday || isToday || (filteredData.length <= 14)
                        return (
                            <div key={d.date} className="flex-1 text-center overflow-hidden">
                                {showLabel ? (
                                    <span className={`text-[7px] font-semibold leading-none block ${isToday ? 'text-[var(--primary)] font-black' : isFirst ? 'text-[var(--foreground)]/40' : 'text-[var(--foreground)]/15'
                                        }`}>
                                        {d.day}
                                    </span>
                                ) : null}
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
