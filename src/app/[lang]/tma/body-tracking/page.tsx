'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { Container } from "@/components/ui/Container";
import { Scale, Ruler, TrendingDown, TrendingUp, Plus, ChevronLeft, Activity, BookOpen, Star, Users, Camera, Smile, Zap, ArrowLeft } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from 'next/navigation';

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

export default function BodyTrackingPage() {
    const params = useParams();
    const lang = (params?.lang as string) || 'uz';

    const [measurements, setMeasurements] = useState<Measurement[]>([]);
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [saving, setSaving] = useState(false);
    const [tab, setTab] = useState<'chart' | 'history' | 'photos'>('chart');

    // Form state
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
        subtitle: 'Следите за прогрессом',
        addEntry: 'Добавить замер',
        weight: 'Вес (кг)',
        belly: 'Живот (см)',
        hip: 'Бёдра (см)',
        chest: 'Грудь (см)',
        waist: 'Талия (см)',
        mood: 'Настроение',
        energy: 'Энергия',
        notes: 'Заметки',
        save: 'СОХРАНИТЬ',
        chart: 'График',
        history: 'История',
        photos: 'Фото',
        currentWeight: 'Текущий вес',
        weightChange: 'Изменение',
        entries: 'Записей',
        noData: 'Нет данных. Начните отслеживание!',
        cancel: 'Отмена',
        saved: 'Сохранено!',
        kg: 'кг',
    } : {
        title: 'Tana kuzatuvi',
        subtitle: "O'zgarishlaringizni kuzating",
        addEntry: "O'lchov qo'shish",
        weight: 'Vazn (kg)',
        belly: 'Qorin (sm)',
        hip: "Son (sm)",
        chest: "Ko'krak (sm)",
        waist: 'Bel (sm)',
        mood: 'Kayfiyat',
        energy: 'Energiya',
        notes: 'Izohlar',
        save: 'SAQLASH',
        chart: 'Grafik',
        history: 'Tarix',
        photos: 'Rasmlar',
        currentWeight: 'Hozirgi vazn',
        weightChange: "O'zgarish",
        entries: 'Yozuvlar',
        noData: "Ma'lumot yo'q. Kuzatuvni boshlang!",
        cancel: 'Bekor qilish',
        saved: 'Saqlandi!',
        kg: 'kg',
    };

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

    // Simple SVG line chart
    const WeightChart = () => {
        const weightData = measurements
            .filter(m => m.weight)
            .slice(0, 30)
            .reverse();

        if (weightData.length < 2) {
            return (
                <div className="bg-white rounded-3xl p-8 shadow-soft border border-[#114539]/5 flex items-center justify-center h-48">
                    <p className="text-[#114539]/30 text-xs font-bold">{t.noData}</p>
                </div>
            );
        }

        const weights = weightData.map(d => d.weight!);
        const min = Math.min(...weights) - 1;
        const max = Math.max(...weights) + 1;
        const range = max - min || 1;

        const w = 560, h = 160, pad = 30;
        const points = weightData.map((d, i) => ({
            x: pad + (i / (weightData.length - 1)) * (w - 2 * pad),
            y: pad + (1 - (d.weight! - min) / range) * (h - 2 * pad),
            weight: d.weight,
            date: new Date(d.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { day: 'numeric', month: 'short' }),
        }));

        const linePath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
        const areaPath = `${linePath} L ${points[points.length - 1].x} ${h - pad} L ${points[0].x} ${h - pad} Z`;

        return (
            <div className="bg-white rounded-3xl p-4 shadow-soft border border-[#114539]/5 overflow-hidden">
                <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-40">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#114539" stopOpacity="0.15" />
                            <stop offset="100%" stopColor="#114539" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    <path d={areaPath} fill="url(#chartGradient)" />
                    <path d={linePath} fill="none" stroke="#114539" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                    {points.map((p, i) => (
                        <g key={i}>
                            <circle cx={p.x} cy={p.y} r="4" fill="#114539" />
                            {i % Math.max(1, Math.floor(points.length / 5)) === 0 && (
                                <text x={p.x} y={h - 5} textAnchor="middle" fontSize="8" fill="#114539" opacity="0.4">{p.date}</text>
                            )}
                            {i === points.length - 1 && (
                                <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize="10" fontWeight="bold" fill="#114539">{p.weight} {t.kg}</text>
                            )}
                        </g>
                    ))}
                </svg>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f6f9fe] flex items-center justify-center">
                <div className="w-10 h-10 border-t-2 border-[#114539] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="pb-32 bg-[#f6f9fe] min-h-screen">
            <Container className="pt-8 px-6 space-y-6">
                {/* Header */}
                <header className="space-y-1">
                    <Link href={`/${lang}/tma/dashboard`} className="flex items-center gap-2 text-[#114539]/40 text-[10px] font-bold uppercase tracking-widest mb-4">
                        <ArrowLeft className="w-3 h-3" /> Panel
                    </Link>
                    <h1 className="text-3xl font-editorial font-bold text-[#114539]">{t.title}</h1>
                    <p className="text-[10px] font-bold text-[#114539]/40 uppercase tracking-widest">{t.subtitle}</p>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-3 gap-3">
                    <div className="bg-white rounded-2xl p-4 shadow-soft border border-[#114539]/5 text-center space-y-1">
                        <Scale className="w-5 h-5 text-[#114539] mx-auto" />
                        <p className="text-lg font-black text-[#114539]">{stats?.latestWeight || '—'}</p>
                        <p className="text-[8px] font-bold text-[#114539]/40 uppercase">{t.currentWeight}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-soft border border-[#114539]/5 text-center space-y-1">
                        {(stats?.weightChange || 0) <= 0
                            ? <TrendingDown className="w-5 h-5 text-emerald-500 mx-auto" />
                            : <TrendingUp className="w-5 h-5 text-amber-500 mx-auto" />}
                        <p className={`text-lg font-black ${(stats?.weightChange || 0) <= 0 ? 'text-emerald-600' : 'text-amber-600'}`}>
                            {stats?.weightChange != null ? `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange}` : '—'}
                        </p>
                        <p className="text-[8px] font-bold text-[#114539]/40 uppercase">{t.weightChange}</p>
                    </div>
                    <div className="bg-white rounded-2xl p-4 shadow-soft border border-[#114539]/5 text-center space-y-1">
                        <Activity className="w-5 h-5 text-[#114539] mx-auto" />
                        <p className="text-lg font-black text-[#114539]">{stats?.totalEntries || 0}</p>
                        <p className="text-[8px] font-bold text-[#114539]/40 uppercase">{t.entries}</p>
                    </div>
                </div>

                {/* Add Entry Button */}
                <motion.button
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setShowForm(!showForm)}
                    className="w-full btn-luxury py-5 text-[10px] flex items-center justify-center gap-3 uppercase tracking-widest shadow-xl"
                >
                    <Plus className="w-4 h-4" /> {showForm ? t.cancel : t.addEntry}
                </motion.button>

                {/* Entry Form */}
                <AnimatePresence>
                    {showForm && (
                        <motion.form
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            onSubmit={handleSave}
                            className="bg-white rounded-3xl p-6 shadow-soft border border-[#114539]/5 space-y-4 overflow-hidden"
                        >
                            <div className="grid grid-cols-2 gap-3">
                                {[
                                    { label: t.weight, value: weight, set: setWeight, icon: '⚖️' },
                                    { label: t.belly, value: belly, set: setBelly, icon: '📏' },
                                    { label: t.hip, value: hip, set: setHip, icon: '📐' },
                                    { label: t.chest, value: chest, set: setChest, icon: '📏' },
                                    { label: t.waist, value: waist, set: setWaist, icon: '📐' },
                                ].map((field) => (
                                    <div key={field.label} className="space-y-1">
                                        <label className="text-[8px] font-bold text-[#114539]/40 uppercase tracking-widest pl-2">{field.label}</label>
                                        <input
                                            type="number"
                                            step="0.1"
                                            value={field.value}
                                            onChange={(e) => field.set(e.target.value)}
                                            className="w-full bg-[#f6f9fe] rounded-xl py-3 px-4 text-sm font-medium text-[#114539] focus:outline-none focus:ring-2 focus:ring-[#114539]/20"
                                            placeholder="0.0"
                                        />
                                    </div>
                                ))}
                            </div>

                            {/* Mood & Energy */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-2">
                                    <label className="text-[8px] font-bold text-[#114539]/40 uppercase tracking-widest pl-2">{t.mood}</label>
                                    <div className="flex gap-1 justify-center">
                                        {moodEmojis.map((emoji, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setMood(i + 1)}
                                                className={`text-xl p-1 rounded-lg transition-all ${mood === i + 1 ? 'bg-[#114539]/10 scale-125' : 'opacity-40'}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[8px] font-bold text-[#114539]/40 uppercase tracking-widest pl-2">{t.energy}</label>
                                    <div className="flex gap-1 justify-center">
                                        {energyEmojis.map((emoji, i) => (
                                            <button
                                                key={i}
                                                type="button"
                                                onClick={() => setEnergy(i + 1)}
                                                className={`text-xl p-1 rounded-lg transition-all ${energy === i + 1 ? 'bg-[#114539]/10 scale-125' : 'opacity-40'}`}
                                            >
                                                {emoji}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Notes */}
                            <div className="space-y-1">
                                <label className="text-[8px] font-bold text-[#114539]/40 uppercase tracking-widest pl-2">{t.notes}</label>
                                <textarea
                                    value={notes}
                                    onChange={(e) => setNotes(e.target.value)}
                                    className="w-full bg-[#f6f9fe] rounded-xl py-3 px-4 text-sm font-medium text-[#114539] focus:outline-none focus:ring-2 focus:ring-[#114539]/20 min-h-[60px]"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full btn-luxury py-4 text-[10px] uppercase tracking-widest"
                            >
                                {saving ? '...' : t.save}
                            </button>
                        </motion.form>
                    )}
                </AnimatePresence>

                {/* Tabs */}
                <div className="flex bg-white rounded-2xl p-1 shadow-soft border border-[#114539]/5">
                    {(['chart', 'history', 'photos'] as const).map(t2 => (
                        <button
                            key={t2}
                            onClick={() => setTab(t2)}
                            className={`flex-1 py-3 text-[9px] font-bold uppercase tracking-widest rounded-xl transition-all
                                ${tab === t2 ? 'bg-[#114539] text-white' : 'text-[#114539]/40'}`}
                        >
                            {t2 === 'chart' ? t.chart : t2 === 'history' ? t.history : t.photos}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                {tab === 'chart' && <WeightChart />}

                {tab === 'history' && (
                    <div className="space-y-3">
                        {measurements.length === 0 ? (
                            <div className="bg-white rounded-3xl p-8 shadow-soft text-center">
                                <p className="text-[#114539]/30 text-xs font-bold">{t.noData}</p>
                            </div>
                        ) : measurements.map(m => (
                            <motion.div
                                key={m.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-white rounded-2xl p-4 shadow-soft border border-[#114539]/5"
                            >
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[9px] font-bold text-[#114539]/40 uppercase">
                                        {new Date(m.date).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </span>
                                    <div className="flex gap-1">
                                        {m.mood && <span className="text-sm">{moodEmojis[m.mood - 1]}</span>}
                                        {m.energy && <span className="text-sm">{energyEmojis[m.energy - 1]}</span>}
                                    </div>
                                </div>
                                <div className="grid grid-cols-5 gap-2 text-center">
                                    {[
                                        { label: t.weight, val: m.weight },
                                        { label: t.belly, val: m.belly },
                                        { label: t.hip, val: m.hip },
                                        { label: t.chest, val: m.chest },
                                        { label: t.waist, val: m.waist },
                                    ].map(f => (
                                        <div key={f.label}>
                                            <p className="text-sm font-black text-[#114539]">{f.val || '—'}</p>
                                            <p className="text-[7px] font-bold text-[#114539]/30 uppercase">{f.label.split(' ')[0]}</p>
                                        </div>
                                    ))}
                                </div>
                                {m.notes && <p className="text-[10px] text-[#114539]/50 mt-2 italic">{m.notes}</p>}
                            </motion.div>
                        ))}
                    </div>
                )}

                {tab === 'photos' && (
                    <div className="grid grid-cols-3 gap-2">
                        {measurements.filter(m => m.photoUrl).length === 0 ? (
                            <div className="col-span-3 bg-white rounded-3xl p-8 shadow-soft text-center">
                                <Camera className="w-8 h-8 text-[#114539]/20 mx-auto mb-2" />
                                <p className="text-[#114539]/30 text-xs font-bold">{t.noData}</p>
                            </div>
                        ) : measurements.filter(m => m.photoUrl).map(m => (
                            <div key={m.id} className="aspect-square rounded-2xl overflow-hidden bg-white shadow-soft border border-[#114539]/5">
                                <img src={m.photoUrl!} alt="" className="w-full h-full object-cover" />
                                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/50 to-transparent p-2">
                                    <p className="text-white text-[8px] font-bold">
                                        {new Date(m.date).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Container>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#114539]/5 p-6 pb-10 flex justify-around z-50">
                <Link href={`/${lang}/tma/dashboard`} className="flex flex-col items-center gap-2">
                    <Activity className="w-6 h-6 text-[#114539]/20" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]/20">Panel</span>
                </Link>
                <Link href={`/${lang}/tma/body-tracking`} className="flex flex-col items-center gap-2">
                    <Scale className="w-6 h-6 text-[#114539]" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]">Tana</span>
                </Link>
                <Link href={`/${lang}/tma/community`} className="flex flex-col items-center gap-2">
                    <Users className="w-6 h-6 text-[#114539]/20" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]/20">Jamoa</span>
                </Link>
                <Link href={`/${lang}/tma/profile`} className="flex flex-col items-center gap-2">
                    <Star className="w-6 h-6 text-[#114539]/20" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]/20">Profil</span>
                </Link>
            </div>
        </main>
    );
}
