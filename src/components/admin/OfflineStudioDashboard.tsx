'use client';

/**
 * OfflineStudioDashboard — Admin analytics for offline yoga studios
 * 
 * Shows: per-studio subscribers, revenue, capacity/overload per time slot,
 * monthly revenue chart, and comparison between studios.
 */

import React, { useEffect, useState } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend
} from 'recharts';
import { MapPin, Users, DollarSign, Clock, AlertTriangle, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react';

interface TimeSlotData {
    timeSlot: string;
    subscribers: number;
    capacity: number;
    occupancyPercent: number;
    students: { name: string; endsAt: string }[];
}

interface StudioData {
    courseId: string;
    title: string;
    location: string;
    price: number;
    maxCapacity: number;
    totalSubscribers: number;
    totalRevenue: number;
    timeSlots: TimeSlotData[];
    unassignedCount: number;
}

interface OfflineStats {
    studios: StudioData[];
    monthlyChart: any[];
    kpis: {
        totalOfflineSubscribers: number;
        totalOfflineRevenue: number;
        totalStudios: number;
        totalAttended: number;
        totalAbsent: number;
        attendanceRate: number;
    };
}

const CHART_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

function CapacityBar({ current, max, label }: { current: number; max: number; label: string }) {
    const pct = Math.min(Math.round((current / max) * 100), 100);
    const isOverloaded = pct >= 85;
    const isFull = pct >= 100;

    return (
        <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-[var(--foreground)] flex items-center gap-1.5">
                    <Clock size={12} /> {label}
                </span>
                <span className={`font-black ${isFull ? 'text-red-500' : isOverloaded ? 'text-amber-500' : 'text-emerald-600'}`}>
                    {current}/{max}
                    {isFull && <span className="ml-1">🔴 TO'LIQ</span>}
                    {isOverloaded && !isFull && <span className="ml-1">⚠️</span>}
                </span>
            </div>
            <div className="w-full h-3 bg-[var(--foreground)]/10 rounded-full overflow-hidden">
                <div
                    className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : isOverloaded ? 'bg-amber-500' : 'bg-emerald-500'
                        }`}
                    style={{ width: `${pct}%` }}
                />
            </div>
        </div>
    );
}

export default function OfflineStudioDashboard() {
    const [data, setData] = useState<OfflineStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [expandedStudio, setExpandedStudio] = useState<string | null>(null);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/admin/offline-stats');
                const json = await res.json();
                if (json.success) setData(json);
            } catch (error) {
                console.error('Failed to fetch offline stats:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="p-12 text-center opacity-50 font-bold uppercase tracking-widest text-xs">
                Oflayn statistika yuklanmoqda...
            </div>
        );
    }

    if (!data || data.studios.length === 0) {
        return (
            <div className="text-center py-12 text-[var(--foreground)]/40">
                <MapPin size={48} className="mx-auto mb-4 opacity-30" />
                <p className="font-bold">Oflayn kurslar topilmadi</p>
            </div>
        );
    }

    const { studios, monthlyChart, kpis } = data;

    // Pie chart data for subscriber distribution
    const pieData = studios.map((s, i) => ({
        name: s.title,
        value: s.totalSubscribers,
        color: CHART_COLORS[i % CHART_COLORS.length],
    }));

    // Bar chart data for revenue comparison
    const revenueBarData = studios.map(s => ({
        name: s.title.length > 15 ? s.title.substring(0, 15) + '...' : s.title,
        revenue: s.totalRevenue,
        subscribers: s.totalSubscribers,
    }));

    const formatMoney = (n: number) => {
        if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
        if (n >= 1_000) return `${(n / 1_000).toFixed(0)}K`;
        return n.toString();
    };

    return (
        <div className="space-y-8">
            {/* Section Title */}
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg">
                    <MapPin size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-black text-[var(--foreground)]">Oflayn studiyalar</h2>
                    <p className="text-xs text-[var(--foreground)]/50">Studio statistikasi va sig'im nazorati</p>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[var(--card-bg)] p-5 rounded-2xl border border-[var(--border)] shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-emerald-500 rounded-xl flex items-center justify-center text-white">
                            <MapPin size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/50">Studiyalar</p>
                            <p className="text-xl font-black text-[var(--primary)]">{kpis.totalStudios}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--card-bg)] p-5 rounded-2xl border border-[var(--border)] shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-500 rounded-xl flex items-center justify-center text-white">
                            <Users size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/50">Obunachil</p>
                            <p className="text-xl font-black text-[var(--primary)]">{kpis.totalOfflineSubscribers}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--card-bg)] p-5 rounded-2xl border border-[var(--border)] shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-amber-500 rounded-xl flex items-center justify-center text-white">
                            <DollarSign size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/50">Daromad</p>
                            <p className="text-xl font-black text-[var(--primary)]">{formatMoney(kpis.totalOfflineRevenue)}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[var(--card-bg)] p-5 rounded-2xl border border-[var(--border)] shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-rose-500 rounded-xl flex items-center justify-center text-white">
                            <TrendingUp size={16} />
                        </div>
                        <div>
                            <p className="text-[9px] font-black uppercase tracking-widest text-[var(--foreground)]/50">Qatnov %</p>
                            <p className="text-xl font-black text-[var(--primary)]">{kpis.attendanceRate}%</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                {/* Revenue Comparison Bar Chart */}
                <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-[var(--foreground)]">
                        <DollarSign size={16} className="text-amber-500" />
                        Daromad taqqoslash (so'm)
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={revenueBarData} layout="vertical" margin={{ left: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="var(--border)" />
                                <XAxis type="number" fontSize={10} tickFormatter={formatMoney} stroke="var(--foreground)" opacity={0.5} />
                                <YAxis type="category" dataKey="name" fontSize={11} width={120} stroke="var(--foreground)" opacity={0.7} />
                                <Tooltip
                                    formatter={(value: number | string | undefined) => [`${Number(value || 0).toLocaleString()} so'm`, 'Daromad']}
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '12px' }}
                                />
                                <Bar dataKey="revenue" fill="#10b981" radius={[0, 8, 8, 0]} barSize={24} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subscriber Distribution Pie */}
                <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-[var(--foreground)]">
                        <Users size={16} className="text-blue-500" />
                        Obunachi taqsimoti
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={55}
                                    outerRadius={90}
                                    paddingAngle={3}
                                    dataKey="value"
                                    label={({ name, value }) => `${name}: ${value}`}
                                    labelLine={false}
                                >
                                    {pieData.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '12px' }} />
                                <Legend wrapperStyle={{ fontSize: '11px' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Per-Studio Capacity Cards */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold flex items-center gap-2 text-[var(--foreground)]">
                    <AlertTriangle size={16} className="text-amber-500" />
                    Studiya sig'imi va yuklanishi
                </h3>

                {studios.map((studio, idx) => {
                    const isExpanded = expandedStudio === studio.courseId;
                    const mostLoaded = studio.timeSlots.reduce((max, s) => s.occupancyPercent > max.occupancyPercent ? s : max, { occupancyPercent: 0, timeSlot: '-', subscribers: 0, capacity: 15, students: [] as any[] });
                    const hasOverload = studio.timeSlots.some(s => s.occupancyPercent >= 85);

                    return (
                        <div
                            key={studio.courseId}
                            className={`bg-[var(--card-bg)] rounded-2xl border shadow-sm overflow-hidden transition-all ${hasOverload ? 'border-amber-500/50' : 'border-[var(--border)]'
                                }`}
                        >
                            {/* Header */}
                            <button
                                onClick={() => setExpandedStudio(isExpanded ? null : studio.courseId)}
                                className="w-full flex items-center justify-between p-5 text-left hover:bg-[var(--foreground)]/3 transition-colors"
                            >
                                <div className="flex items-center gap-4 flex-1">
                                    <div
                                        className="w-3 h-12 rounded-full"
                                        style={{ backgroundColor: CHART_COLORS[idx % CHART_COLORS.length] }}
                                    />
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-[var(--foreground)]">{studio.title}</h4>
                                            {hasOverload && (
                                                <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 text-[9px] font-black rounded-full uppercase">
                                                    ⚠️ Yuklangan
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-4 mt-1 text-[11px] text-[var(--foreground)]/60">
                                            <span className="flex items-center gap-1"><MapPin size={11} /> {studio.location}</span>
                                            <span className="flex items-center gap-1"><Users size={11} /> {studio.totalSubscribers} ta obunachi</span>
                                            <span className="flex items-center gap-1"><DollarSign size={11} /> {studio.totalRevenue.toLocaleString()} so'm</span>
                                            {studio.unassignedCount > 0 && (
                                                <span className="text-amber-500 font-bold">{studio.unassignedCount} ta vaqt tayinlanmagan</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                            </button>

                            {/* Expanded */}
                            {isExpanded && (
                                <div className="border-t border-[var(--border)] p-5 space-y-4">
                                    {/* Capacity bars per time slot */}
                                    {studio.timeSlots.length > 0 ? (
                                        <div className="space-y-3">
                                            {studio.timeSlots.map(slot => (
                                                <div key={slot.timeSlot} className="space-y-2">
                                                    <CapacityBar
                                                        current={slot.subscribers}
                                                        max={slot.capacity}
                                                        label={slot.timeSlot}
                                                    />
                                                    {/* Student list */}
                                                    {slot.students.length > 0 && (
                                                        <div className="ml-6 flex flex-wrap gap-1.5">
                                                            {slot.students.map((st, i) => (
                                                                <span
                                                                    key={i}
                                                                    className="px-2 py-0.5 bg-[var(--foreground)]/5 rounded-lg text-[10px] font-medium text-[var(--foreground)]/70"
                                                                >
                                                                    {st.name}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-center text-[var(--foreground)]/40 text-sm py-4">
                                            Dars vaqtlari belgilanmagan
                                        </p>
                                    )}

                                    {/* Summary */}
                                    <div className="grid grid-cols-3 gap-3 pt-2">
                                        <div className="bg-emerald-50 dark:bg-emerald-500/10 rounded-xl p-3 text-center">
                                            <div className="text-lg font-black text-emerald-600">{studio.totalSubscribers}</div>
                                            <div className="text-[9px] font-bold text-emerald-600/70 uppercase">Jami obunachi</div>
                                        </div>
                                        <div className="bg-blue-50 dark:bg-blue-500/10 rounded-xl p-3 text-center">
                                            <div className="text-lg font-black text-blue-600">{formatMoney(studio.totalRevenue)}</div>
                                            <div className="text-[9px] font-bold text-blue-600/70 uppercase">Daromad</div>
                                        </div>
                                        <div className="bg-amber-50 dark:bg-amber-500/10 rounded-xl p-3 text-center">
                                            <div className="text-lg font-black text-amber-600">{studio.maxCapacity}</div>
                                            <div className="text-[9px] font-bold text-amber-600/70 uppercase">Max sig'im</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Monthly Revenue Chart */}
            {monthlyChart.length > 0 && (
                <div className="bg-[var(--card-bg)] p-6 rounded-2xl border border-[var(--border)] shadow-sm">
                    <h3 className="text-sm font-bold mb-4 flex items-center gap-2 text-[var(--foreground)]">
                        <TrendingUp size={16} className="text-emerald-500" />
                        Oylik daromad (so'm)
                    </h3>
                    <div className="h-[250px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyChart}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis dataKey="month" fontSize={10} stroke="var(--foreground)" opacity={0.5} />
                                <YAxis fontSize={10} tickFormatter={formatMoney} stroke="var(--foreground)" opacity={0.5} />
                                <Tooltip
                                    formatter={(value: number | string | undefined) => [`${Number(value || 0).toLocaleString()} so'm`]}
                                    contentStyle={{ backgroundColor: 'var(--card-bg)', borderRadius: '12px', border: '1px solid var(--border)', fontSize: '12px' }}
                                />
                                <Bar dataKey="total" fill="#10b981" radius={[8, 8, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}
        </div>
    );
}
