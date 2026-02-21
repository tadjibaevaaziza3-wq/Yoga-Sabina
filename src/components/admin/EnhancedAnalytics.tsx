"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, TrendingUp, Users, BookOpen, Activity } from "lucide-react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    AreaChart,
    Area
} from "recharts"

export function EnhancedAnalytics() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [days, setDays] = useState(30)

    useEffect(() => {
        fetchAnalytics()
    }, [days])

    const fetchAnalytics = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/analytics/engagement?days=${days}`)
            const json = await res.json()
            if (json.success) {
                setData(json)
            }
        } catch (error) {
            console.error('Error fetching analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading && !data) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-10">
            {/* Summary Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <MetricCard
                    title="Jami Foydalanuvchilar"
                    value={data?.totalUsers || 0}
                    icon={<Users className="w-5 h-5" />}
                    color="bg-blue-500"
                />
                <MetricCard
                    title="O&apos;rtacha DAU"
                    value={Math.round((data?.dau?.reduce((a: number, b: any) => a + b.count, 0) || 0) / (data?.dau?.length || 1))}
                    icon={<Activity className="w-5 h-5" />}
                    color="bg-emerald-500"
                />
                <MetricCard
                    title="Kurslardagi Faollik"
                    value={data?.heatmap?.length || 0}
                    icon={<BookOpen className="w-5 h-5" />}
                    color="bg-purple-500"
                />
            </div>

            {/* DAU Chart */}
            <div className="bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-xl font-serif font-black text-[var(--foreground)]">Kunlik Faol Foydalanuvchilar (DAU)</h3>
                        <p className="text-xs font-bold opacity-40 uppercase tracking-widest text-[var(--foreground)]">Oxirgi {days} kun</p>
                    </div>
                </div>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={data?.dau}>
                            <defs>
                                <linearGradient id="colorDau" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#114539" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#114539" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" opacity={0.5} />
                            <XAxis
                                dataKey="date"
                                fontSize={10}
                                tickFormatter={(val) => val.split('-').slice(1).join('/')}
                                axisLine={false}
                                tickLine={false}
                            />
                            <YAxis fontSize={10} axisLine={false} tickLine={false} />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '16px',
                                    border: 'none',
                                    boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                                    background: 'var(--card-bg)'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="count"
                                stroke="#114539"
                                strokeWidth={3}
                                fillOpacity={1}
                                fill="url(#colorDau)"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Course Progress Heatmap */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
                    <h3 className="text-xl font-serif font-black text-[var(--foreground)] mb-6">Kurslarni Tugatish</h3>
                    <div className="space-y-6">
                        {data?.heatmap.map((course: any) => (
                            <div key={course.title} className="space-y-2">
                                <div className="flex justify-between text-xs font-black uppercase tracking-widest">
                                    <span className="opacity-60 text-[var(--foreground)]">{course.title}</span>
                                    <span className="text-[var(--primary)]">{Math.round((course.completed / course.total) * 100)}%</span>
                                </div>
                                <div className="h-4 bg-[var(--primary)]/5 rounded-full overflow-hidden border border-[var(--border)]">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(course.completed / course.total) * 100}%` }}
                                        className="h-full bg-gradient-to-r from-[var(--primary)] to-emerald-400"
                                    />
                                </div>
                                <div className="flex justify-between text-[10px] opacity-40 font-bold">
                                    <span>{course.completed} tugatganlar</span>
                                    <span>{course.total} jami ko'rishlar</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Cohort Retention (Mock UI for now since DB is small) */}
                <div className="bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
                    <h3 className="text-xl font-serif font-black text-[var(--foreground)] mb-6">Retention (Kogorta)</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[10px] font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] border-b border-[var(--border)]">
                                    <th className="pb-4">Oy</th>
                                    <th className="pb-4">Hajmi</th>
                                    <th className="pb-4">M1</th>
                                    <th className="pb-4">M2</th>
                                    <th className="pb-4">M3</th>
                                </tr>
                            </thead>
                            <tbody className="text-xs font-bold text-[var(--foreground)]">
                                <tr className="border-b border-[var(--border)]/5">
                                    <td className="py-4">Yanvar</td>
                                    <td className="py-4">120</td>
                                    <td className="py-4 text-emerald-500 bg-emerald-500/5 text-center">100%</td>
                                    <td className="py-4 text-blue-500 bg-blue-500/5 text-center">45%</td>
                                    <td className="py-4 text-purple-500 bg-purple-500/5 text-center">32%</td>
                                </tr>
                                <tr className="border-b border-[var(--border)]/5">
                                    <td className="py-4">Fevral</td>
                                    <td className="py-4">85</td>
                                    <td className="py-4 text-emerald-500 bg-emerald-500/5 text-center">100%</td>
                                    <td className="py-4 text-blue-500 bg-blue-500/5 text-center">52%</td>
                                    <td className="py-4 opacity-20 text-center">-</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <p className="mt-6 text-[10px] opacity-40 leading-relaxed">
                        * M1, M2 - ro&apos;yxatdan o&apos;tganidan keyingi oylar davomida faollik ko&apos;rsatkichi.
                    </p>
                </div>
            </div>
        </div>
    )
}

function MetricCard({ title, value, icon, color }: any) {
    return (
        <div className="bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm relative overflow-hidden group">
            <div className={`absolute -right-4 -top-4 w-24 h-24 ${color} opacity-[0.03] rounded-full blur-2xl group-hover:opacity-[0.06] transition-opacity`} />
            <div className="flex items-center gap-4 mb-4">
                <div className={`w-10 h-10 rounded-xl ${color} text-white flex items-center justify-center shadow-lg shadow-black/5`}>
                    {icon}
                </div>
                <h4 className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">{title}</h4>
            </div>
            <p className="text-4xl font-black text-[var(--foreground)] tabular-nums">{value}</p>
        </div>
    )
}
