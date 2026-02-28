'use client'

import React from 'react'

interface Props {
    lang: string
    data: { date: string; count: number }[]
}

const MONTH_NAMES_UZ = ['Yan', 'Fev', 'Mar', 'Apr', 'May', 'Iyn', 'Iyl', 'Avg', 'Sen', 'Okt', 'Noy', 'Dek']
const MONTH_NAMES_RU = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл', 'Авг', 'Сен', 'Окт', 'Ноя', 'Дек']

export default function WatchedTimeChart({ lang, data }: Props) {
    // Get last 60 days of data for more meaningful view
    const now = new Date()
    const last60: { date: string; day: number; month: number; monthName: string; count: number; isFirstOfMonth: boolean }[] = []

    for (let i = 59; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const found = data.find(x => x.date === dateStr)
        const months = lang === 'uz' ? MONTH_NAMES_UZ : MONTH_NAMES_RU
        last60.push({
            date: dateStr,
            day: d.getDate(),
            month: d.getMonth(),
            monthName: months[d.getMonth()],
            count: found?.count || 0,
            isFirstOfMonth: d.getDate() === 1 || i === 59, // mark first of month or first bar
        })
    }

    const maxCount = Math.max(...last60.map(d => d.count), 1)
    const totalLessons = data.reduce((s, d) => s + d.count, 0)
    const activeDays = data.filter(d => d.count > 0).length

    // Group by month for labels
    const monthLabels: { monthName: string; startIdx: number; span: number }[] = []
    let currentMonthStart = 0
    let currentMonth = last60[0]?.month

    last60.forEach((d, i) => {
        if (d.month !== currentMonth || i === last60.length - 1) {
            const endIdx = i === last60.length - 1 ? i + 1 : i
            const months = lang === 'uz' ? MONTH_NAMES_UZ : MONTH_NAMES_RU
            monthLabels.push({
                monthName: months[currentMonth],
                startIdx: currentMonthStart,
                span: endIdx - currentMonthStart,
            })
            currentMonth = d.month
            currentMonthStart = i
        }
    })

    return (
        <div>
            {/* Stats row */}
            <div className="flex items-center gap-3 mb-4 flex-wrap">
                <span className="px-3 py-1.5 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] font-bold text-xs">
                    📚 {totalLessons} {lang === 'uz' ? 'dars' : 'уроков'}
                </span>
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600 font-bold text-xs">
                    🔥 {activeDays} {lang === 'uz' ? 'faol kun' : 'акт. дней'}
                </span>
                <span className="text-[var(--foreground)]/25 font-medium text-[10px] ml-auto">
                    {lang === 'uz' ? 'Oxirgi 60 kun' : 'Последние 60 дней'}
                </span>
            </div>

            {/* Month labels */}
            <div className="flex mb-1" style={{ gap: 0 }}>
                {monthLabels.map((m, i) => (
                    <div
                        key={`${m.monthName}-${i}`}
                        className="text-[10px] font-bold text-[var(--primary)]/60 text-center"
                        style={{ flex: `${m.span} 0 0`, minWidth: 0 }}
                    >
                        {m.monthName}
                    </div>
                ))}
            </div>

            {/* Bar chart with date labels */}
            <div className="flex items-end gap-[2px] h-28 px-1">
                {last60.map((d, i) => {
                    const heightPct = d.count > 0 ? Math.max(12, (d.count / maxCount) * 100) : 3
                    const isToday = i === last60.length - 1
                    const isWeekend = new Date(d.date).getDay() === 0 || new Date(d.date).getDay() === 6
                    return (
                        <div
                            key={d.date}
                            className="flex-1 group relative"
                            style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', alignItems: 'center' }}
                        >
                            {/* Bar */}
                            <div
                                className={`w-full rounded-t-[2px] transition-all duration-200 ${d.count > 0
                                        ? isToday
                                            ? 'bg-[var(--primary)]'
                                            : 'bg-[var(--primary)]/50 group-hover:bg-[var(--primary)]'
                                        : isWeekend
                                            ? 'bg-gray-200/50'
                                            : 'bg-gray-100 group-hover:bg-gray-200'
                                    }`}
                                style={{ height: `${heightPct}%`, minHeight: 2 }}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-30 pointer-events-none">
                                <div className="bg-gray-900 text-white text-[10px] px-2.5 py-1.5 rounded-lg whitespace-nowrap font-medium shadow-xl">
                                    <div className="font-bold">{d.day} {d.monthName}</div>
                                    <div className="opacity-75">{d.count} {lang === 'uz' ? 'dars' : 'ур.'}</div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Date labels row */}
            <div className="flex gap-[2px] mt-1 px-1">
                {last60.map((d, i) => {
                    // Show label for 1st of month, every Monday, and today
                    const dayOfWeek = new Date(d.date).getDay()
                    const showLabel = d.day === 1 || dayOfWeek === 1 || i === last60.length - 1
                    return (
                        <div key={d.date} className="flex-1 text-center overflow-hidden">
                            {showLabel ? (
                                <span className={`text-[7px] font-semibold leading-none block ${i === last60.length - 1 ? 'text-[var(--primary)] font-bold' : 'text-[var(--foreground)]/20'
                                    }`}>
                                    {d.day}
                                </span>
                            ) : null}
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
