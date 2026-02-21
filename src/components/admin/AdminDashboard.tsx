'use client';

import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Users, CreditCard, Activity, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchStats() {
            try {
                const res = await fetch('/api/admin/analytics');
                const json = await res.json();
                setData(json);
            } catch (error) {
                console.error('Failed to fetch analytics:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchStats();
    }, []);

    if (loading) return <div className="p-12 text-center opacity-50 font-bold uppercase tracking-widest text-xs">Loading Analytics...</div>;

    const stats = [
        { label: 'Total Users', value: data?.kpis?.totalUsers || 0, icon: <Users className="w-5 h-5" />, color: 'bg-blue-500' },
        { label: 'Active Subs', value: data?.kpis?.activeSubscriptions || 0, icon: <CreditCard className="w-5 h-5" />, color: 'bg-emerald-500' },
        { label: 'Orders (7d)', value: data?.kpis?.recentOrders || 0, icon: <TrendingUp className="w-5 h-5" />, color: 'bg-amber-500' },
        { label: 'Live Events', value: data?.analytics?.length || 0, icon: <Activity className="w-5 h-5" />, color: 'bg-rose-500' },
    ];

    return (
        <div className="space-y-12">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-[var(--card-bg)] p-6 rounded-3xl border border-[var(--border)] shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className={`${stat.color} w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-lg`}>
                                {stat.icon}
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] opacity-60">{stat.label}</p>
                                <p className="text-2xl font-bold text-[var(--primary)]">{stat.value}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                <div className="bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
                    <h3 className="text-lg font-bold mb-8 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
                        User Activity (Last 7 Days)
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={data?.analytics || []}>
                                <defs>
                                    <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                                <XAxis
                                    dataKey="date"
                                    stroke="var(--accent)"
                                    fontSize={10}
                                    tickLine={false}
                                    axisLine={false}
                                    tickFormatter={(str) => str.split('-').slice(1).join('/')}
                                />
                                <YAxis stroke="var(--accent)" fontSize={10} tickLine={false} axisLine={false} />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: 'var(--card-bg)',
                                        borderRadius: '16px',
                                        border: '1px solid var(--border)',
                                        fontSize: '12px'
                                    }}
                                />
                                <Area type="monotone" dataKey="views" stroke="var(--primary)" fillOpacity={1} fill="url(#colorViews)" strokeWidth={3} />
                                <Area type="monotone" dataKey="appOpens" stroke="var(--accent)" fillOpacity={0} strokeDasharray="5 5" strokeWidth={2} />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm flex flex-col justify-center text-center">
                    <div className="max-w-xs mx-auto space-y-4">
                        <div className="w-16 h-16 bg-[var(--primary)]/10 rounded-3xl flex items-center justify-center text-[var(--primary)] mx-auto">
                            <Activity className="w-8 h-8" />
                        </div>
                        <h3 className="font-bold">Real-time Analytics Active</h3>
                        <p className="text-xs text-[var(--accent)] font-medium">
                            We are currently tracking your users' interactions across the platform and TMA.
                            Signed URLs from GCS are monitored for access security.
                        </p>
                        <button className="w-full py-4 bg-[var(--primary)] text-white rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-all">
                            View Full Report
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
