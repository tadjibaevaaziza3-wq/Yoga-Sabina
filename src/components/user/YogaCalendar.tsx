'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { Calendar, ChevronLeft, ChevronRight, Droplets, Flame, Timer, Trophy, X } from 'lucide-react'

interface YogaCalendarProps {
    lang: string
    initialCycleData?: any
    practiceData?: { date: string, minutes: number, sessions: number }[]
}

const MONTHS_UZ = ['Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun', 'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr']
const MONTHS_RU = ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь']
const DAYS_UZ = ['Du', 'Se', 'Cho', 'Pa', 'Ju', 'Sh', 'Ya']
const DAYS_RU = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

export default function YogaCalendar({ lang, initialCycleData, practiceData = [] }: YogaCalendarProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date())
    const [view, setView] = useState<'practice' | 'cycle'>('practice')
    const [cycleData, setCycleData] = useState<{ periods: { start: string, end: string }[], cycleLength: number }>(
        { periods: initialCycleData?.periods || [], cycleLength: initialCycleData?.cycleLength || 28 }
    )
    const [markingPeriod, setMarkingPeriod] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)

    const t = {
        practice: lang === 'uz' ? 'Mashg\'ulot' : 'Практика',
        cycle: lang === 'uz' ? 'Hayz kalendari' : 'Менструальный календарь',
        minutes: lang === 'uz' ? 'daqiqa' : 'минут',
        sessions: lang === 'uz' ? 'mashg\'ulot' : 'занятий',
        markStart: lang === 'uz' ? 'Boshlanish kunini belgilang' : 'Отметьте начало',
        markEnd: lang === 'uz' ? 'Tugash kunini belgilang' : 'Отметьте конец',
        prediction: lang === 'uz' ? 'Taxminiy' : 'Предполагаемый',
        cycleLength: lang === 'uz' ? 'Tsikl davomiyligi' : 'Длина цикла',
        days: lang === 'uz' ? 'kun' : 'дней',
        save: lang === 'uz' ? 'Saqlash' : 'Сохранить',
    }

    const months = lang === 'uz' ? MONTHS_UZ : MONTHS_RU
    const days = lang === 'uz' ? DAYS_UZ : DAYS_RU

    const getDaysInMonth = (date: Date) => {
        const year = date.getFullYear()
        const month = date.getMonth()
        const firstDay = new Date(year, month, 1)
        const lastDay = new Date(year, month + 1, 0)
        const startPad = (firstDay.getDay() + 6) % 7 // Monday = 0
        const daysCount = lastDay.getDate()
        return { startPad, daysCount, year, month }
    }

    const { startPad, daysCount, year, month } = getDaysInMonth(currentMonth)

    // Practice data lookup
    const practiceMap = new Map(practiceData.map(d => [d.date, d]))

    // Period data lookup
    const isPeriodDay = useCallback((dateStr: string) => {
        return cycleData.periods.some(p => dateStr >= p.start && dateStr <= p.end)
    }, [cycleData.periods])

    // Predict next period
    const predictedStart = cycleData.periods.length > 0 ? (() => {
        const lastPeriod = cycleData.periods[cycleData.periods.length - 1]
        const lastStart = new Date(lastPeriod.start)
        const predicted = new Date(lastStart.getTime() + cycleData.cycleLength * 24 * 60 * 60 * 1000)
        return predicted.toISOString().split('T')[0]
    })() : null

    const isPredictedDay = (dateStr: string) => {
        if (!predictedStart) return false
        const pred = new Date(predictedStart)
        const check = new Date(dateStr)
        const diff = (check.getTime() - pred.getTime()) / (24 * 60 * 60 * 1000)
        return diff >= 0 && diff < 5 // Predict 5 days
    }

    const handleDayClick = (day: number) => {
        if (view !== 'cycle') return
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`

        if (!markingPeriod) {
            setMarkingPeriod(dateStr)
        } else {
            const start = markingPeriod < dateStr ? markingPeriod : dateStr
            const end = markingPeriod < dateStr ? dateStr : markingPeriod
            setCycleData(prev => ({
                ...prev,
                periods: [...prev.periods, { start, end }]
            }))
            setMarkingPeriod(null)
        }
    }

    const saveCycleData = async () => {
        setSaving(true)
        try {
            await fetch('/api/user/kpi', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'update_cycle', cycleData })
            })
        } catch (err) {
            console.error('Failed to save cycle data:', err)
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] shadow-sm overflow-hidden">
            {/* Tab Header */}
            <div className="flex border-b border-[var(--border)]">
                <button
                    onClick={() => setView('practice')}
                    className={`flex-1 py-5 text-center text-[11px] font-black uppercase tracking-widest transition-all ${view === 'practice' ? 'bg-[var(--primary)] text-white' : 'text-[var(--foreground)]/40 hover:bg-[var(--secondary)]'}`}
                >
                    <Flame className="w-4 h-4 inline mr-2" />
                    {t.practice}
                </button>
                <button
                    onClick={() => setView('cycle')}
                    className={`flex-1 py-5 text-center text-[11px] font-black uppercase tracking-widest transition-all ${view === 'cycle' ? 'bg-pink-500 text-white' : 'text-[var(--foreground)]/40 hover:bg-[var(--secondary)]'}`}
                >
                    <Droplets className="w-4 h-4 inline mr-2" />
                    {t.cycle}
                </button>
            </div>

            <div className="p-6 space-y-4">
                {/* Month Navigation */}
                <div className="flex items-center justify-between">
                    <button onClick={() => setCurrentMonth(new Date(year, month - 1))} className="p-2 rounded-xl hover:bg-[var(--secondary)] transition">
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <h3 className="text-lg font-black text-[var(--foreground)]">
                        {months[month]} {year}
                    </h3>
                    <button onClick={() => setCurrentMonth(new Date(year, month + 1))} className="p-2 rounded-xl hover:bg-[var(--secondary)] transition">
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1">
                    {days.map(d => (
                        <div key={d} className="text-center text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/30 py-2">
                            {d}
                        </div>
                    ))}

                    {/* Empty cells for padding */}
                    {Array.from({ length: startPad }).map((_, i) => (
                        <div key={`pad-${i}`} />
                    ))}

                    {/* Day cells */}
                    {Array.from({ length: daysCount }).map((_, i) => {
                        const day = i + 1
                        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                        const practice = practiceMap.get(dateStr)
                        const isToday = dateStr === new Date().toISOString().split('T')[0]
                        const isPeriod = isPeriodDay(dateStr)
                        const isPredicted = isPredictedDay(dateStr)
                        const isMarking = markingPeriod === dateStr

                        return (
                            <button
                                key={day}
                                onClick={() => handleDayClick(day)}
                                className={`relative aspect-square rounded-xl flex flex-col items-center justify-center text-sm font-bold transition-all hover:scale-110
                                    ${isToday ? 'ring-2 ring-[var(--primary)] ring-offset-2' : ''}
                                    ${view === 'practice' && practice ? 'bg-emerald-500/20 text-emerald-700' : ''}
                                    ${view === 'cycle' && isPeriod ? 'bg-pink-500/30 text-pink-700' : ''}
                                    ${view === 'cycle' && isPredicted && !isPeriod ? 'bg-pink-500/10 text-pink-400 border border-dashed border-pink-300' : ''}
                                    ${isMarking ? 'bg-pink-500 text-white scale-110 shadow-lg' : ''}
                                    ${!practice && !isPeriod && !isPredicted && !isMarking ? 'text-[var(--foreground)]/60 hover:bg-[var(--secondary)]' : ''}
                                `}
                            >
                                <span className="text-xs">{day}</span>
                                {view === 'practice' && practice && (
                                    <span className="text-[8px] font-black text-emerald-600">{practice.minutes}m</span>
                                )}
                                {view === 'cycle' && isPeriod && (
                                    <Droplets className="w-3 h-3 text-pink-500 absolute bottom-1" />
                                )}
                            </button>
                        )
                    })}
                </div>

                {/* Cycle Controls */}
                {view === 'cycle' && (
                    <div className="space-y-4 pt-4 border-t border-[var(--border)]">
                        {markingPeriod && (
                            <div className="flex items-center justify-between bg-pink-50 rounded-xl px-4 py-3">
                                <p className="text-xs text-pink-600 font-bold">
                                    {t.markStart}: {markingPeriod} → {t.markEnd}
                                </p>
                                <button onClick={() => setMarkingPeriod(null)}>
                                    <X className="w-4 h-4 text-pink-400" />
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <label className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">{t.cycleLength}</label>
                            <input
                                type="number"
                                value={cycleData.cycleLength}
                                onChange={e => setCycleData(prev => ({ ...prev, cycleLength: parseInt(e.target.value) || 28 }))}
                                className="w-20 px-3 py-2 rounded-xl border border-[var(--border)] text-sm font-bold text-center bg-[var(--secondary)]/50"
                                min={20}
                                max={40}
                            />
                            <span className="text-xs text-[var(--foreground)]/40 font-bold">{t.days}</span>
                        </div>

                        {predictedStart && (
                            <p className="text-xs text-pink-500 font-bold flex items-center gap-2">
                                <Droplets className="w-3 h-3" />
                                {t.prediction}: {new Date(predictedStart).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'ru-RU')}
                            </p>
                        )}

                        <button
                            onClick={saveCycleData}
                            disabled={saving}
                            className="w-full py-3 bg-pink-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-pink-600 transition disabled:opacity-50"
                        >
                            {saving ? '...' : t.save}
                        </button>

                        {/* Legend */}
                        <div className="flex items-center gap-6 text-[10px] font-bold text-[var(--foreground)]/40">
                            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-pink-500/30" /> {lang === 'uz' ? 'Hayz kuni' : 'Менструация'}</span>
                            <span className="flex items-center gap-1"><div className="w-3 h-3 rounded border border-dashed border-pink-300 bg-pink-500/10" /> {t.prediction}</span>
                        </div>
                    </div>
                )}

                {/* Practice Legend */}
                {view === 'practice' && (
                    <div className="flex items-center gap-6 text-[10px] font-bold text-[var(--foreground)]/40 pt-4 border-t border-[var(--border)]">
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded bg-emerald-500/20" /> {t.practice}</span>
                        <span className="flex items-center gap-1"><div className="w-3 h-3 rounded ring-2 ring-[var(--primary)]" /> {lang === 'uz' ? 'Bugun' : 'Сегодня'}</span>
                    </div>
                )}
            </div>
        </div>
    )
}
