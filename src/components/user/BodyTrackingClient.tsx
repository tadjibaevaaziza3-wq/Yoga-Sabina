'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Scale, TrendingDown, TrendingUp, Plus, Activity, Camera, ArrowLeft, Download, Share2, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface Measurement {
    id: string;
    date: string;
    weight: number | null;
    height: number | null;
    belly: number | null;
    hip: number | null;
    chest: number | null;
    waist: number | null;
    notes: string | null;
    photoUrl: string | null;
    mood: number | null;
    energy: number | null;
}

const moodEmojis = ['😫', '😟', '😐', '🙂', '😄'];
const energyEmojis = ['🔋', '⚡', '💪', '🔥', '⚡️'];

const PARAM_COLORS: Record<string, string> = {
    weight: '#114539',
    belly: '#e57373',
    hip: '#7986cb',
    chest: '#81c784',
    waist: '#ffb74d',
};

const PARAM_LABELS = {
    uz: { weight: 'Vazn (kg)', belly: 'Qorin (sm)', hip: 'Son (sm)', chest: "Ko'krak (sm)", waist: 'Bel (sm)' },
    ru: { weight: 'Вес (кг)', belly: 'Живот (см)', hip: 'Бёдра (см)', chest: 'Грудь (см)', waist: 'Талия (см)' },
};

interface Props {
    lang: 'uz' | 'ru';
}

export default function BodyTrackingClient({ lang }: Props) {
    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [activeParam, setActiveParam] = useState<string>('weight');
    const [tab, setTab] = useState<'charts' | 'history' | 'photos'>('charts');

    // Form
    const [weight, setWeight] = useState('');
    const [belly, setBelly] = useState('');
    const [hip, setHip] = useState('');
    const [chest, setChest] = useState('');
    const [waist, setWaist] = useState('');
    const [mood, setMood] = useState(3);
    const [energy, setEnergy] = useState(3);
    const [notes, setNotes] = useState('');

    const t = lang === 'ru' ? {
        title: 'Трекер тела',
        subtitle: 'Отслеживайте изменения каждый день',
        addEntry: 'Добавить замер',
        save: 'Сохранить',
        export: 'Экспорт CSV',
        share: 'Поделиться',
        charts: 'Графики',
        history: 'История',
        photos: 'Фото',
        currentWeight: 'Текущий вес',
        weightChange: 'Изменение',
        entries: 'Записей',
        noData: 'Нет данных. Начните отслеживание!',
        cancel: 'Отмена',
        mood: 'Настроение',
        energy: 'Энергия',
        notes: 'Заметки',
        selectParam: 'Выберите параметр',
        kg: 'кг',
    } : {
        title: 'Tana kuzatuvi',
        subtitle: "Har kuni o'zgarishlaringizni kuzating",
        addEntry: "O'lchov qo'shish",
        save: 'Saqlash',
        export: 'CSV eksport',
        share: 'Ulashish',
        charts: 'Grafiklar',
        history: 'Tarix',
        photos: 'Rasmlar',
        currentWeight: 'Hozirgi vazn',
        weightChange: "O'zgarish",
        entries: 'Yozuvlar',
        noData: "Ma'lumot yo'q. Kuzatuvni boshlang!",
        cancel: 'Bekor qilish',
        mood: 'Kayfiyat',
        energy: 'Energiya',
        notes: 'Izohlar',
        selectParam: 'Parametrni tanlang',
        kg: 'kg',
    };

    const paramLabels = PARAM_LABELS[lang];

    const fetchData = useCallback(async () => {
        try {
            const res = await fetch('/api/user/body-tracking');
            const data = await res.json();
            if (data.success) {
                setMeasurements(data.measurements);
                setStats(data.stats);
            }
        } catch { } finally { setLoading(false); }
    }, []);

    useEffect(() => { fetchData(); }, [fetchData]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/user/body-tracking', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ weight, belly, hip, chest, waist, mood, energy, notes }),
            });
            const data = await res.json();
            if (data.success) {
                setShowForm(false);
                setWeight(''); setBelly(''); setHip(''); setChest(''); setWaist(''); setNotes('');
                fetchData();
            }
        } catch { } finally { setSaving(false); }
    };

    // Export CSV
    const handleExport = () => {
        if (measurements.length === 0) return;
        const headers = ['Date', 'Weight', 'Belly', 'Hip', 'Chest', 'Waist', 'Mood', 'Energy', 'Notes'];
        const rows = measurements.map(m => [
            new Date(m.date).toLocaleDateString(),
            m.weight || '', m.belly || '', m.hip || '', m.chest || '', m.waist || '',
            m.mood || '', m.energy || '', m.notes || '',
        ]);
        const csv = [headers, ...rows].map(r => r.join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `body-tracking-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    // Share to community
    const handleShare = async () => {
        if (!stats?.latestWeight) return;
        try {
            await fetch('/api/community/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `📊 ${lang === 'ru' ? 'Мои результаты' : 'Mening natijalarim'}`,
                    sharedKPI: {
                        weight: stats.latestWeight,
                        weightChange: stats.weightChange,
                        mood: stats.latestMood,
                        energy: stats.latestEnergy,
                        entries: stats.totalEntries,
                    },
                }),
            });
            alert(lang === 'ru' ? '✅ Отправлено в сообщество!' : "✅ Jamoaga jo'natildi!");
        } catch { }
    };

    // SVG Line Chart for a single parameter
    const ParameterChart = ({ param }: { param: string }) => {
        const data = measurements
            .filter(m => (m as any)[param] != null)
            .slice(0, 30)
            .reverse();

        if (data.length < 2) {
            return (
                <div className="flex items-center justify-center h-48 bg-[var(--secondary)]/30 rounded-2xl">
                    <p className="text-[var(--primary)]/30 text-xs font-bold">{t.noData}</p>
                </div>
            );
        }

        const values = data.map(d => (d as any)[param] as number);
        const min = Math.min(...values) - 1;
        const max = Math.max(...values) + 1;
        const range = max - min || 1;

        const w = 600, h = 200, pad = 40;
        const points = data.map((d, i) => ({
            x: pad + (i / (data.length - 1)) * (w - 2 * pad),
            y: pad + (1 - ((d as any)[param] - min) / range) * (h - 2 * pad),
            value: (d as any)[param],
            date: new Date(d.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { day: 'numeric', month: 'short' }),
        }));

        const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        const areaPath = `${linePath} L ${points[points.length - 1].x} ${h - pad} L ${points[0].x} ${h - pad} Z`;
        const color = PARAM_COLORS[param] || '#114539';

        return (
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-[var(--primary)]/5">
                <div className="flex justify-between items-center mb-2">
                    <h4 className="text-xs font-black text-[var(--primary)] uppercase tracking-widest">
                        {(paramLabels as any)[param]}
                    </h4>
                    <span className="text-lg font-black" style={{ color }}>{values[values.length - 1]}</span>
                </div>
                <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-48">
                    <defs>
                        <linearGradient id={`grad-${param}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.15" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {/* Grid lines */}
                    {[0.25, 0.5, 0.75].map(frac => (
                        <line key={frac} x1={pad} y1={pad + frac * (h - 2 * pad)} x2={w - pad} y2={pad + frac * (h - 2 * pad)} stroke="#e0e0e0" strokeDasharray="4" />
                    ))}
                    <path d={areaPath} fill={`url(#grad-${param})`} />
                    <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => (
                        <g key={i}>
                            <circle cx={p.x} cy={p.y} r="4" fill={color} />
                            {i % Math.max(1, Math.floor(points.length / 6)) === 0 && (
                                <text x={p.x} y={h - 8} textAnchor="middle" fontSize="9" fill={color} opacity="0.5">{p.date}</text>
                            )}
                            {i === points.length - 1 && (
                                <text x={p.x} y={p.y - 12} textAnchor="middle" fontSize="11" fontWeight="bold" fill={color}>{p.value}</text>
                            )}
                        </g>
                    ))}
                    {/* Y-axis labels */}
                    {[0, 0.5, 1].map(frac => {
                        const val = (min + frac * range).toFixed(1);
                        return <text key={frac} x={pad - 5} y={pad + (1 - frac) * (h - 2 * pad) + 4} textAnchor="end" fontSize="9" fill="#999">{val}</text>;
                    })}
                </svg>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-t-2 border-[var(--primary)] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-[1200px] mx-auto px-6 py-8 space-y-8 pb-24">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-editorial font-bold text-[var(--primary)]">{t.title}</h1>
                    <p className="text-xs text-[var(--primary)]/40 font-bold uppercase tracking-widest mt-1">{t.subtitle}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[var(--primary)]/60 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all border border-[var(--primary)]/10">
                        <Download className="w-4 h-4" /> {t.export}
                    </button>
                    <button onClick={handleShare} disabled={!stats?.latestWeight} className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary)]/90 transition-all disabled:opacity-30">
                        <Share2 className="w-4 h-4" /> {t.share}
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-3 gap-4">
                <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--primary)]/5 text-center space-y-2">
                    <Scale className="w-6 h-6 text-[var(--primary)] mx-auto" />
                    <p className="text-2xl font-black text-[var(--primary)]">{stats?.latestWeight || '—'}</p>
                    <p className="text-[9px] font-bold text-[var(--primary)]/40 uppercase tracking-widest">{t.currentWeight}</p>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--primary)]/5 text-center space-y-2">
                    {(stats?.weightChange || 0) <= 0
                        ? <TrendingDown className="w-6 h-6 text-emerald-500 mx-auto" />
                        : <TrendingUp className="w-6 h-6 text-amber-500 mx-auto" />}
                    <p className={`text-2xl font-black ${(stats?.weightChange || 0) <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                        {stats?.weightChange != null ? `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange}` : '—'}
                    </p>
                    <p className="text-[9px] font-bold text-[var(--primary)]/40 uppercase tracking-widest">{t.weightChange}</p>
                </motion.div>
                <motion.div whileHover={{ y: -2 }} className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--primary)]/5 text-center space-y-2">
                    <Activity className="w-6 h-6 text-[var(--primary)] mx-auto" />
                    <p className="text-2xl font-black text-[var(--primary)]">{stats?.totalEntries || 0}</p>
                    <p className="text-[9px] font-bold text-[var(--primary)]/40 uppercase tracking-widest">{t.entries}</p>
                </motion.div>
            </div>

            {/* Add Entry Button */}
            <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowForm(!showForm)}
                className="w-full bg-[var(--primary)] text-white py-4 rounded-2xl text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all"
            >
                {showForm ? <ChevronUp className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                {showForm ? t.cancel : t.addEntry}
            </motion.button>

            {/* Entry Form */}
            <AnimatePresence>
                {showForm && (
                    <motion.form
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        onSubmit={handleSave}
                        className="bg-white rounded-2xl p-6 shadow-sm border border-[var(--primary)]/5 space-y-5 overflow-hidden"
                    >
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {[
                                { label: paramLabels.weight, value: weight, set: setWeight },
                                { label: paramLabels.belly, value: belly, set: setBelly },
                                { label: paramLabels.hip, value: hip, set: setHip },
                                { label: paramLabels.chest, value: chest, set: setChest },
                                { label: paramLabels.waist, value: waist, set: setWaist },
                            ].map(field => (
                                <div key={field.label} className="space-y-1">
                                    <label className="text-[9px] font-bold text-[var(--primary)]/40 uppercase tracking-widest">{field.label}</label>
                                    <input
                                        type="number"
                                        step="0.1"
                                        value={field.value}
                                        onChange={(e) => field.set(e.target.value)}
                                        className="w-full bg-[var(--secondary)]/30 rounded-xl py-3 px-4 text-sm font-medium text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                                        placeholder="0.0"
                                    />
                                </div>
                            ))}
                        </div>

                        {/* Mood & Energy */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-[var(--primary)]/40 uppercase tracking-widest">{t.mood}</label>
                                <div className="flex gap-2 justify-center">
                                    {moodEmojis.map((emoji, i) => (
                                        <button key={i} type="button" onClick={() => setMood(i + 1)}
                                            className={`text-2xl p-2 rounded-xl transition-all ${mood === i + 1 ? 'bg-[var(--primary)]/10 scale-125 ring-2 ring-[var(--primary)]/20' : 'opacity-40 hover:opacity-70'}`}>{emoji}</button>
                                    ))}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-bold text-[var(--primary)]/40 uppercase tracking-widest">{t.energy}</label>
                                <div className="flex gap-2 justify-center">
                                    {energyEmojis.map((emoji, i) => (
                                        <button key={i} type="button" onClick={() => setEnergy(i + 1)}
                                            className={`text-2xl p-2 rounded-xl transition-all ${energy === i + 1 ? 'bg-[var(--primary)]/10 scale-125 ring-2 ring-[var(--primary)]/20' : 'opacity-40 hover:opacity-70'}`}>{emoji}</button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-bold text-[var(--primary)]/40 uppercase tracking-widest">{t.notes}</label>
                            <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
                                className="w-full bg-[var(--secondary)]/30 rounded-xl py-3 px-4 text-sm font-medium text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 min-h-[60px]" />
                        </div>

                        <button type="submit" disabled={saving}
                            className="w-full bg-[var(--primary)] text-white py-4 rounded-xl text-xs font-bold uppercase tracking-widest disabled:opacity-50">
                            {saving ? '...' : t.save}
                        </button>
                    </motion.form>
                )}
            </AnimatePresence>

            {/* Tabs */}
            <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-[var(--primary)]/5">
                {(['charts', 'history', 'photos'] as const).map(tabKey => (
                    <button key={tabKey} onClick={() => setTab(tabKey)}
                        className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all
                            ${tab === tabKey ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--primary)]/40 hover:text-[var(--primary)]'}`}>
                        {tabKey === 'charts' ? t.charts : tabKey === 'history' ? t.history : t.photos}
                    </button>
                ))}
            </div>

            {/* Charts Tab — Per-parameter line diagrams */}
            {tab === 'charts' && (
                <div className="space-y-4">
                    {/* Parameter selector pills */}
                    <div className="flex gap-2 flex-wrap">
                        {Object.entries(PARAM_COLORS).map(([key, color]) => (
                            <button key={key} onClick={() => setActiveParam(key)}
                                className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border
                                    ${activeParam === key ? 'text-white shadow-md' : 'opacity-50 hover:opacity-80 border-transparent'}`}
                                style={activeParam === key ? { backgroundColor: color, borderColor: color } : { borderColor: color + '30', color }}>
                                {(paramLabels as any)[key]}
                            </button>
                        ))}
                    </div>

                    {/* Active parameter chart */}
                    <ParameterChart param={activeParam} />

                    {/* All parameters overview */}
                    <h3 className="text-xs font-bold text-[var(--primary)]/40 uppercase tracking-widest pt-4">{t.selectParam}</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(PARAM_COLORS).filter(k => k !== activeParam).map(param => (
                            <div key={param} onClick={() => setActiveParam(param)} className="cursor-pointer hover:shadow-md transition-all">
                                <ParameterChart param={param} />
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* History Tab */}
            {tab === 'history' && (
                <div className="space-y-3">
                    {measurements.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                            <p className="text-[var(--primary)]/30 text-sm font-bold">{t.noData}</p>
                        </div>
                    ) : measurements.map(m => (
                        <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--primary)]/5">
                            <div className="flex justify-between items-center mb-3">
                                <span className="text-[10px] font-bold text-[var(--primary)]/40 uppercase tracking-widest">
                                    {new Date(m.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                                <div className="flex gap-1">
                                    {m.mood && <span className="text-lg">{moodEmojis[m.mood - 1]}</span>}
                                    {m.energy && <span className="text-lg">{energyEmojis[m.energy - 1]}</span>}
                                </div>
                            </div>
                            <div className="grid grid-cols-5 gap-3 text-center">
                                {Object.entries(PARAM_COLORS).map(([key, color]) => (
                                    <div key={key}>
                                        <p className="text-lg font-black" style={{ color }}>{(m as any)[key] || '—'}</p>
                                        <p className="text-[8px] font-bold text-[var(--primary)]/30 uppercase">{(paramLabels as any)[key].split(' ')[0]}</p>
                                    </div>
                                ))}
                            </div>
                            {m.notes && <p className="text-xs text-[var(--primary)]/50 mt-3 italic border-t border-[var(--primary)]/5 pt-2">{m.notes}</p>}
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Photos Tab */}
            {tab === 'photos' && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                    {measurements.filter(m => m.photoUrl).length === 0 ? (
                        <div className="col-span-full bg-white rounded-2xl p-12 shadow-sm text-center">
                            <Camera className="w-10 h-10 text-[var(--primary)]/20 mx-auto mb-3" />
                            <p className="text-[var(--primary)]/30 text-sm font-bold">{t.noData}</p>
                        </div>
                    ) : measurements.filter(m => m.photoUrl).map(m => (
                        <div key={m.id} className="aspect-square rounded-2xl overflow-hidden bg-white shadow-sm border border-[var(--primary)]/5 relative">
                            <img src={m.photoUrl!} alt="" className="w-full h-full object-cover" />
                            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-3">
                                <p className="text-white text-xs font-bold">{new Date(m.date).toLocaleDateString()}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
