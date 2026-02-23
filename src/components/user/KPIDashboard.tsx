"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Activity, TrendingUp, Flame, Ruler, Weight, Plus, Save, X, Brain, Zap, Calendar } from "lucide-react"

interface Measurement {
    id: string
    date: string
    weight: number | null
    height: number | null
    belly: number | null
    hip: number | null
    chest: number | null
    waist: number | null
    mood: number | null
    energy: number | null
}

interface KPIData {
    totalYogaTime: number
    currentStreak: number
    longestStreak: number
    practiceCalendar: { date: string, minutes: number, sessions: number }[]
}

const PARAM_CONFIG = [
    { key: 'weight', label: { uz: 'Vazn (kg)', ru: 'Вес (кг)' }, color: '#8884d8', icon: <Weight className="w-4 h-4" /> },
    { key: 'belly', label: { uz: "Qorin (sm)", ru: 'Живот (см)' }, color: '#82ca9d', icon: <Ruler className="w-4 h-4" /> },
    { key: 'hip', label: { uz: "Son (sm)", ru: 'Бедра (см)' }, color: '#ffc658', icon: <Ruler className="w-4 h-4" /> },
    { key: 'waist', label: { uz: "Bel (sm)", ru: 'Талия (см)' }, color: '#ff7300', icon: <Ruler className="w-4 h-4" /> },
    { key: 'chest', label: { uz: "Ko'krak (sm)", ru: 'Грудь (см)' }, color: '#00C49F', icon: <Ruler className="w-4 h-4" /> },
    { key: 'mood', label: { uz: "Kayfiyat", ru: 'Настроение' }, color: '#F472B6', icon: <Brain className="w-4 h-4" /> },
    { key: 'energy', label: { uz: "Energiya", ru: 'Энергия' }, color: '#FBBF24', icon: <Zap className="w-4 h-4" /> },
]

type TimeRange = 'all' | 'week' | 'month' | '3months'

export default function KPIDashboard({ lang }: { lang: 'uz' | 'ru' }) {
    const [measurements, setMeasurements] = useState<Measurement[]>([])
    const [kpi, setKpi] = useState<KPIData | null>(null)
    const [activeParam, setActiveParam] = useState('weight')
    const [timeRange, setTimeRange] = useState<TimeRange>('all')
    const [showForm, setShowForm] = useState(false)
    const [formData, setFormData] = useState({ weight: '', height: '', belly: '', hip: '', chest: '', waist: '', mood: '', energy: '' })
    const [saving, setSaving] = useState(false)
    const [loading, setLoading] = useState(true)

    const fetchData = useCallback(async () => {
        try {
            const [mRes, kRes] = await Promise.all([
                fetch('/api/user/measurements'),
                fetch('/api/user/kpi'),
            ])
            const mData = await mRes.json()
            const kData = await kRes.json()
            if (mData.success) setMeasurements(mData.measurements)
            if (kData.success) setKpi(kData.kpi)
        } catch { } finally { setLoading(false) }
    }, [])

    useEffect(() => { fetchData() }, [fetchData])

    const handleSave = async () => {
        setSaving(true)
        try {
            const payload: Record<string, number> = {}
            if (formData.weight) payload.weight = parseFloat(formData.weight)
            if (formData.height) payload.height = parseFloat(formData.height)
            if (formData.belly) payload.belly = parseFloat(formData.belly)
            if (formData.hip) payload.hip = parseFloat(formData.hip)
            if (formData.chest) payload.chest = parseFloat(formData.chest)
            if (formData.waist) payload.waist = parseFloat(formData.waist)
            if (formData.mood) payload.mood = parseInt(formData.mood)
            if (formData.energy) payload.energy = parseInt(formData.energy)

            if (Object.keys(payload).length === 0) return

            await fetch('/api/user/measurements', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
            setShowForm(false)
            setFormData({ weight: '', height: '', belly: '', hip: '', chest: '', waist: '', mood: '', energy: '' })
            fetchData()
        } catch { } finally { setSaving(false) }
    }

    // Filter by time range
    const filteredMeasurements = useMemo(() => {
        if (timeRange === 'all') return measurements
        const now = new Date()
        const cutoff = new Date()
        if (timeRange === 'week') cutoff.setDate(now.getDate() - 7)
        else if (timeRange === 'month') cutoff.setMonth(now.getMonth() - 1)
        else if (timeRange === '3months') cutoff.setMonth(now.getMonth() - 3)
        return measurements.filter(m => new Date(m.date) >= cutoff)
    }, [measurements, timeRange])

    const activeConfig = PARAM_CONFIG.find(p => p.key === activeParam)!
    const chartData = filteredMeasurements
        .filter(m => (m as any)[activeParam] !== null)
        .map(m => ({
            date: new Date(m.date).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'ru-RU', { month: 'short', day: 'numeric' }),
            value: (m as any)[activeParam] as number,
        }))

    const latestMeasurement = measurements.length > 0 ? measurements[measurements.length - 1] : null
    const previousMeasurement = measurements.length > 1 ? measurements[measurements.length - 2] : null

    const getChange = (key: string) => {
        if (!latestMeasurement || !previousMeasurement) return null
        const curr = (latestMeasurement as any)[key]
        const prev = (previousMeasurement as any)[key]
        if (curr === null || prev === null || typeof curr !== 'number' || typeof prev !== 'number') return null
        return +(curr - prev).toFixed(1)
    }

    const timeRanges: { key: TimeRange, label: { uz: string, ru: string } }[] = [
        { key: 'week', label: { uz: 'Hafta', ru: 'Неделя' } },
        { key: 'month', label: { uz: 'Oy', ru: 'Месяц' } },
        { key: '3months', label: { uz: '3 oy', ru: '3 мес' } },
        { key: 'all', label: { uz: 'Barchasi', ru: 'Все' } },
    ]

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Title */}
            <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                    <h1 className="text-3xl font-serif font-black text-[var(--foreground)]">
                        {lang === 'uz' ? "Mening ko'rsatkichlarim" : 'Мои показатели'}
                    </h1>
                    <p className="text-xs font-bold text-[var(--primary)]/30 uppercase tracking-widest mt-1">
                        {lang === 'uz' ? "Tana o'lchamlari va yoga statistikasi" : 'Измерения тела и статистика йоги'}
                    </p>
                </div>
                <button onClick={() => setShowForm(true)}
                    className="flex items-center gap-2 bg-[var(--primary)] text-white px-5 py-3 rounded-2xl font-bold text-sm hover:bg-[var(--primary)]/90 transition-all shadow-lg shadow-[var(--primary)]/20">
                    <Plus className="w-4 h-4" />
                    {lang === 'uz' ? "O'lchov qo'shish" : 'Добавить замер'}
                </button>
            </div>

            {/* Yoga Stats Cards */}
            {kpi && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                        { label: lang === 'uz' ? "Jami yoga vaqti" : "Общее время йоги", val: `${Math.round((kpi.totalYogaTime || 0) / 60)} min`, icon: <Activity className="w-5 h-5" />, color: "bg-blue-500" },
                        { label: lang === 'uz' ? "Joriy seriya" : "Текущая серия", val: `${kpi.currentStreak} ${lang === 'uz' ? 'kun' : 'дн'}`, icon: <Flame className="w-5 h-5" />, color: "bg-orange-500" },
                        { label: lang === 'uz' ? "Eng uzun seriya" : "Лучшая серия", val: `${kpi.longestStreak} ${lang === 'uz' ? 'kun' : 'дн'}`, icon: <TrendingUp className="w-5 h-5" />, color: "bg-green-500" },
                        { label: lang === 'uz' ? "Bugungi vazn" : "Текущий вес", val: latestMeasurement?.weight ? `${latestMeasurement.weight} kg` : "—", icon: <Weight className="w-5 h-5" />, color: "bg-purple-500" },
                    ].map((stat, i) => (
                        <motion.div key={i} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.1 }}
                            className="bg-white p-5 rounded-[2rem] premium-shadow border border-primary/5">
                            <div className={`w-10 h-10 ${stat.color} text-white rounded-xl flex items-center justify-center mb-3`}>{stat.icon}</div>
                            <div className="text-[9px] font-black text-primary/30 uppercase tracking-widest mb-1">{stat.label}</div>
                            <div className="text-2xl font-black text-[var(--primary)]">{stat.val}</div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Time Range Filter */}
            <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[var(--primary)]/30" />
                {timeRanges.map(tr => (
                    <button key={tr.key} onClick={() => setTimeRange(tr.key)}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${timeRange === tr.key
                            ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                            : 'text-[var(--primary)]/30 hover:text-[var(--primary)]/60'
                            }`}>
                        {tr.label[lang]}
                    </button>
                ))}
            </div>

            {/* Parameter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {PARAM_CONFIG.map(p => (
                    <button key={p.key} onClick={() => setActiveParam(p.key)}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold whitespace-nowrap transition-all ${activeParam === p.key
                            ? 'bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20'
                            : 'bg-white text-[var(--primary)]/60 border border-primary/5 hover:border-primary/20'
                            }`}>
                        {p.icon}
                        {p.label[lang]}
                        {getChange(p.key) !== null && (
                            <span className={`text-[10px] ${getChange(p.key)! > 0 ? (p.key === 'mood' || p.key === 'energy' ? 'text-green-400' : 'text-red-400') : getChange(p.key)! < 0 ? (p.key === 'mood' || p.key === 'energy' ? 'text-red-400' : 'text-green-400') : 'text-gray-400'}`}>
                                {getChange(p.key)! > 0 ? '+' : ''}{getChange(p.key)}
                            </span>
                        )}
                    </button>
                ))}
            </div>

            {/* Line Chart */}
            <div className="bg-white p-6 md:p-8 rounded-[2.5rem] premium-shadow border border-primary/5">
                <h3 className="text-lg font-bold text-[var(--primary)] mb-6">{activeConfig.label[lang]}</h3>
                {chartData.length > 0 ? (
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#114539', fontSize: 11, fontWeight: 700 }} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#114539', fontSize: 11, fontWeight: 700 }} domain={['dataMin - 2', 'dataMax + 2']} />
                                <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 40px rgba(0,0,0,0.1)', padding: '12px 20px' }} />
                                <Line type="monotone" dataKey="value" stroke={activeConfig.color} strokeWidth={3} dot={{ fill: activeConfig.color, strokeWidth: 2, r: 5 }} activeDot={{ r: 7, strokeWidth: 0 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                ) : (
                    <div className="text-center py-16 text-[var(--primary)]/30">
                        <Ruler className="w-12 h-12 mx-auto mb-4 opacity-30" />
                        <p className="text-sm font-bold">{lang === 'uz' ? "Hali o'lchov qo'shilmagan" : 'Замеры пока не добавлены'}</p>
                        <p className="text-xs mt-1 opacity-60">{lang === 'uz' ? "Yuqoridagi tugma orqali qo'shing" : 'Добавьте через кнопку выше'}</p>
                    </div>
                )}
            </div>

            {/* Add Measurement Modal */}
            <AnimatePresence>
                {showForm && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowForm(false)}>
                        <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
                            className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-serif font-black text-[var(--foreground)]">
                                    {lang === 'uz' ? "Bugungi o'lchov" : 'Замер на сегодня'}
                                </h3>
                                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-gray-100 rounded-full"><X className="w-5 h-5" /></button>
                            </div>

                            <div className="space-y-4">
                                {[
                                    { key: 'weight', label: lang === 'uz' ? 'Vazn (kg)' : 'Вес (кг)', placeholder: '65.5', type: 'number', step: '0.1' },
                                    { key: 'height', label: lang === 'uz' ? "Bo'y (sm)" : 'Рост (см)', placeholder: '170', type: 'number', step: '0.1' },
                                    { key: 'belly', label: lang === 'uz' ? 'Qorin (sm)' : 'Живот (см)', placeholder: '80', type: 'number', step: '0.1' },
                                    { key: 'hip', label: lang === 'uz' ? "Son (sm)" : 'Бедра (см)', placeholder: '95', type: 'number', step: '0.1' },
                                    { key: 'waist', label: lang === 'uz' ? 'Bel (sm)' : 'Талия (см)', placeholder: '70', type: 'number', step: '0.1' },
                                    { key: 'chest', label: lang === 'uz' ? "Ko'krak (sm)" : 'Грудь (см)', placeholder: '90', type: 'number', step: '0.1' },
                                ].map(field => (
                                    <div key={field.key}>
                                        <label className="text-[10px] font-black text-[var(--primary)]/40 uppercase tracking-widest mb-1 block">{field.label}</label>
                                        <input type={field.type} step={field.step} placeholder={field.placeholder}
                                            value={(formData as Record<string, string>)[field.key]}
                                            onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                            className="w-full bg-[var(--background)] border border-[var(--primary)]/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                        />
                                    </div>
                                ))}

                                {/* Mood & Energy with emoji scales */}
                                <div>
                                    <label className="text-[10px] font-black text-[var(--primary)]/40 uppercase tracking-widest mb-2 block">
                                        {lang === 'uz' ? 'Kayfiyat' : 'Настроение'}
                                    </label>
                                    <div className="flex gap-2">
                                        {['😔', '😕', '😐', '🙂', '😄'].map((emoji, i) => (
                                            <button key={i} type="button" onClick={() => setFormData(prev => ({ ...prev, mood: String(i + 1) }))}
                                                className={`w-12 h-12 rounded-xl text-xl flex items-center justify-center transition-all ${formData.mood === String(i + 1) ? 'bg-pink-100 scale-110 ring-2 ring-pink-400' : 'bg-[var(--background)] hover:bg-pink-50'}`}>
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <label className="text-[10px] font-black text-[var(--primary)]/40 uppercase tracking-widest mb-2 block">
                                        {lang === 'uz' ? 'Energiya darajasi' : 'Уровень энергии'}
                                    </label>
                                    <div className="flex gap-2">
                                        {['⚡', '⚡⚡', '⚡⚡⚡', '🔋', '🔋🔋'].map((emoji, i) => (
                                            <button key={i} type="button" onClick={() => setFormData(prev => ({ ...prev, energy: String(i + 1) }))}
                                                className={`flex-1 h-12 rounded-xl text-sm flex items-center justify-center transition-all ${formData.energy === String(i + 1) ? 'bg-yellow-100 scale-105 ring-2 ring-yellow-400' : 'bg-[var(--background)] hover:bg-yellow-50'}`}>
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <button onClick={handleSave} disabled={saving}
                                className="w-full mt-6 bg-[var(--primary)] text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--primary)]/90 transition-all disabled:opacity-50">
                                <Save className="w-4 h-4" />
                                {saving ? (lang === 'uz' ? "Saqlanmoqda..." : 'Сохраняем...') : (lang === 'uz' ? "Saqlash" : 'Сохранить')}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
