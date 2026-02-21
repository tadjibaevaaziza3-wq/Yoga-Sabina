"use client"

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { motion } from "framer-motion"
import { Activity, TrendingUp, Calendar, Weight } from "lucide-react"

const data = [
    { name: 'Du', min: 20 },
    { name: 'Se', min: 45 },
    { name: 'Ch', min: 30 },
    { name: 'Pa', min: 60 },
    { name: 'Ju', min: 35 },
    { name: 'Sh', min: 50 },
    { name: 'Ya', min: 40 },
]

export function UserKPI() {
    return (
        <div className="space-y-8">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "O'rtacha vaqt", val: "45 min", icon: <TrendingUp className="w-5 h-5" />, color: "bg-blue-500" },
                    { label: "Jami mashq", val: "128 s", icon: <Activity className="w-5 h-5" />, color: "bg-green-500" },
                    { label: "Vazn", val: "62 kg", icon: <Weight className="w-5 h-5" />, color: "bg-purple-500" },
                    { label: "Siklgacha", val: "12 kun", icon: <Calendar className="w-5 h-5" />, color: "bg-wellness-gold" },
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white p-6 rounded-[2rem] premium-shadow border border-primary/5"
                    >
                        <div className={`w-10 h-10 ${stat.color} text-white rounded-xl flex items-center justify-center mb-4`}>
                            {stat.icon}
                        </div>
                        <div className="text-[10px] font-black text-primary/30 uppercase tracking-widest mb-1">{stat.label}</div>
                        <div className="text-2xl font-black text-primary">{stat.val}</div>
                    </motion.div>
                ))}
            </div>

            {/* Chart */}
            <div className="bg-white p-8 md:p-10 rounded-[2.5rem] premium-shadow border border-primary/5">
                <h3 className="text-xl font-bold text-primary mb-8">Haftalik faollik</h3>
                <div className="h-[300px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                            <XAxis
                                dataKey="name"
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#114539', fontSize: 12, fontWeight: 700 }}
                                dy={10}
                            />
                            <YAxis
                                axisLine={false}
                                tickLine={false}
                                tick={{ fill: '#114539', fontSize: 12, fontWeight: 700 }}
                            />
                            <Tooltip
                                contentStyle={{
                                    borderRadius: '20px',
                                    border: 'none',
                                    boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
                                    padding: '12px 20px'
                                }}
                            />
                            <Line
                                type="monotone"
                                dataKey="min"
                                stroke="#114539"
                                strokeWidth={4}
                                dot={{ fill: '#c5a059', strokeWidth: 2, r: 6 }}
                                activeDot={{ r: 8, strokeWidth: 0 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    )
}


