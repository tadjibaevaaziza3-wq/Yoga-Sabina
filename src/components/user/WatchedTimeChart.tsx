'use client'

import React from 'react'

interface Props {
    lang: string
    data: { date: string; count: number }[]
}

export default function WatchedTimeChart({ lang, data }: Props) {
    // Get last 30 days of data
    const now = new Date()
    const last30: { date: string; label: string; count: number }[] = []

    for (let i = 29; i >= 0; i--) {
        const d = new Date(now)
        d.setDate(d.getDate() - i)
        const dateStr = d.toISOString().split('T')[0]
        const found = data.find(x => x.date === dateStr)
        last30.push({
            date: dateStr,
            label: d.toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'ru-RU', { day: 'numeric', month: 'short' }),
            count: found?.count || 0,
        })
    }

    const maxCount = Math.max(...last30.map(d => d.count), 1)
    const totalLessons = data.reduce((s, d) => s + d.count, 0)
    const activeDays = data.filter(d => d.count > 0).length

    return (
        <div>
            {/* Stats row */}
            <div className="flex items-center gap-4 mb-4 text-xs">
                <span className="px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-bold">
                    {totalLessons} {lang === 'uz' ? 'dars' : 'уроков'}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 font-bold">
                    {activeDays} {lang === 'uz' ? 'faol kun' : 'акт. дней'}
                </span>
                <span className="text-[var(--foreground)]/30 font-medium ml-auto">
                    {lang === 'uz' ? 'Oxirgi 30 kun' : 'Последние 30 дней'}
                </span>
            </div>

            {/* Bar chart */}
            <div className="flex items-end gap-[3px] h-24">
                {last30.map((d, i) => {
                    const heightPct = d.count > 0 ? Math.max(15, (d.count / maxCount) * 100) : 4
                    const isToday = i === last30.length - 1
                    return (
                        <div
                            key={d.date}
                            className="flex-1 group relative cursor-pointer"
                            style={{ height: '100%', display: 'flex', alignItems: 'flex-end' }}
                        >
                            <div
                                className={`w-full rounded-t-sm transition-all duration-200 ${d.count > 0
                                        ? isToday
                                            ? 'bg-[var(--primary)]'
                                            : 'bg-[var(--primary)]/60 group-hover:bg-[var(--primary)]'
                                        : 'bg-gray-100 group-hover:bg-gray-200'
                                    }`}
                                style={{ height: `${heightPct}%`, minHeight: 3 }}
                            />
                            {/* Tooltip */}
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10">
                                <div className="bg-gray-900 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap font-medium shadow-lg">
                                    {d.label}: {d.count} {lang === 'uz' ? 'dars' : 'ур.'}
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Date labels (show every 5th) */}
            <div className="flex gap-[3px] mt-1">
                {last30.map((d, i) => (
                    <div key={d.date} className="flex-1 text-center">
                        {(i % 7 === 0 || i === last30.length - 1) ? (
                            <span className="text-[8px] text-[var(--foreground)]/25 font-medium">
                                {new Date(d.date).getDate()}
                            </span>
                        ) : null}
                    </div>
                ))}
            </div>
        </div>
    )
}
