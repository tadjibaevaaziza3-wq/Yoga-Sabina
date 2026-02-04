"use client"

import { motion } from "framer-motion"
import { Users, BookCheck, DollarSign, BarChart3, Mail, Phone, MapPin, HeartPulse } from "lucide-react"

export function AdminKPI() {
    const stats = [
        { label: "Jami foydalanuvchilar", val: "1,284", icon: <Users className="w-5 h-5" />, color: "bg-blue-500" },
        { label: "Sotilgan kurslar", val: "456", icon: <BookCheck className="w-5 h-5" />, color: "bg-green-500" },
        { label: "Umumiy daromad", val: "125.4 mln", icon: <DollarSign className="w-5 h-5" />, color: "bg-wellness-gold" },
        { label: "Faol obunalar", val: "312", icon: <BarChart3 className="w-5 h-5" />, color: "bg-purple-500" },
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
                <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white p-8 rounded-[2rem] border border-primary/5 shadow-sm hover:shadow-xl transition-all"
                >
                    <div className={`${stat.color} w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-4 premium-shadow`}>
                        {stat.icon}
                    </div>
                    <div className="text-xs font-black text-primary/30 uppercase tracking-widest mb-1">{stat.label}</div>
                    <div className="text-2xl font-black text-primary">{stat.val}</div>
                </motion.div>
            ))}
        </div>
    )
}

const mockUsers = [
    { id: 1, name: "Dilnoza Ahmedova", email: "dilnoza@mail.uz", phone: "+998 90 123 45 67", location: "Toshkent", health: "Bellarda og'riqlar, osteoxondroz", status: "Active" },
    { id: 2, name: "Jasur Komilov", email: "jasur@mail.uz", phone: "+998 93 456 78 90", location: "Samarqand", health: "Yelka qismidagi zo'riqish", status: "Active" },
    { id: 3, name: "Madina Bahromova", email: "madina@mail.uz", phone: "+998 90 765 43 21", location: "Buxoro", health: "Stress va uyqusizlik", status: "Expired" },
]

export function UserList() {
    return (
        <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-sm overflow-hidden">
            <div className="p-8 border-b border-primary/5 flex items-center justify-between">
                <h3 className="text-xl font-bold text-primary">Foydalanuvchilar ro'yxati</h3>
            </div>
            <div className="overflow-x-auto">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-secondary/30 text-[10px] font-black uppercase tracking-widest text-primary/40">
                            <th className="px-8 py-4">Foydalanuvchi</th>
                            <th className="px-8 py-4">Aloqa</th>
                            <th className="px-8 py-4">Manzil</th>
                            <th className="px-8 py-4">Sog'lig'i</th>
                            <th className="px-8 py-4">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                        {mockUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-secondary/10 transition-colors">
                                <td className="px-8 py-6">
                                    <div className="font-bold text-primary">{user.name}</div>
                                    <div className="text-xs text-primary/40">{user.email}</div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-sm text-primary/70 mb-1">
                                        <Phone className="w-3 h-3 text-wellness-gold" />
                                        {user.phone}
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-primary/70">
                                        <Mail className="w-3 h-3 text-wellness-gold" />
                                        {user.email}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <div className="flex items-center gap-2 text-sm text-primary/70">
                                        <MapPin className="w-3 h-3 text-wellness-gold" />
                                        {user.location}
                                    </div>
                                </td>
                                <td className="px-8 py-6 max-w-[200px]">
                                    <div className="flex items-start gap-2 text-xs text-primary/70 italic leading-relaxed">
                                        <HeartPulse className="w-3 h-3 text-red-400 shrink-0 mt-0.5" />
                                        {user.health}
                                    </div>
                                </td>
                                <td className="px-8 py-6">
                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${user.status === "Active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                                        }`}>
                                        {user.status}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}

import { useState } from "react"
import { Send, Image as ImageIcon, Video, Music, Info } from "lucide-react"

export function BroadcastTool() {
    const [type, setType] = useState<'TEXT' | 'PHOTO' | 'VIDEO' | 'AUDIO'>('TEXT')
    const [content, setContent] = useState('')
    const [mediaUrl, setMediaUrl] = useState('')
    const [target, setTarget] = useState('ALL')
    const [sending, setSending] = useState(false)
    const [status, setStatus] = useState<string | null>(null)

    const handleSend = async () => {
        if (!content) return
        setSending(true)
        setStatus("Yuborilmoqda...")
        try {
            const res = await fetch('/api/admin/broadcast', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type, content, mediaUrl, target })
            })
            const data = await res.json()
            if (data.success) {
                setStatus(`Muvaffaqiyatli: ${data.successCount} ta foydalanuvchiga yuborildi`)
                setContent('')
                setMediaUrl('')
            } else {
                setStatus(`Xatolik: ${data.error}`)
            }
        } catch (err) {
            setStatus("Tarmoq xatoligi")
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="bg-white rounded-[2.5rem] border border-primary/5 shadow-sm p-8">
            <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center">
                    <Send className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="text-xl font-bold text-primary">Telegram Raxshilka</h3>
                    <p className="text-xs text-primary/40 font-bold uppercase tracking-widest">Foydalanuvchilarga xabar yuborish</p>
                </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-2 block">Xabar turi</label>
                        <div className="grid grid-cols-4 gap-2">
                            {[
                                { id: 'TEXT', icon: <Info className="w-4 h-4" />, label: 'Matn' },
                                { id: 'PHOTO', icon: <ImageIcon className="w-4 h-4" />, label: 'Rasm' },
                                { id: 'VIDEO', icon: <Video className="w-4 h-4" />, label: 'Video' },
                                { id: 'AUDIO', icon: <Music className="w-4 h-4" />, label: 'Audio' },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setType(item.id as any)}
                                    className={`flex flex-col items-center justify-center gap-2 p-4 rounded-2xl border transition-all ${type === item.id ? "bg-primary text-white border-primary" : "bg-white text-primary/40 border-primary/5 hover:border-primary/20"
                                        }`}
                                >
                                    {item.icon}
                                    <span className="text-[10px] font-black uppercase tracking-tighter">{item.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-2 block">Xabar matni</label>
                        <textarea
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Xabarni kiriting..."
                            className="w-full bg-secondary/20 rounded-2xl p-4 text-sm min-h-[120px] focus:outline-none focus:ring-2 focus:ring-wellness-gold transition-all"
                        />
                    </div>

                    {type !== 'TEXT' && (
                        <div>
                            <label className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-2 block">Media URL (Supabase Link)</label>
                            <input
                                type="text"
                                value={mediaUrl}
                                onChange={(e) => setMediaUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full bg-secondary/20 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-wellness-gold transition-all"
                            />
                        </div>
                    )}
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="text-[10px] font-black uppercase tracking-widest text-primary/30 mb-2 block">Target (Kimga)</label>
                        <select
                            value={target}
                            onChange={(e) => setTarget(e.target.value)}
                            className="w-full bg-secondary/20 rounded-2xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-wellness-gold transition-all appearance-none"
                        >
                            <option value="ALL">Barcha foydalanuvchilar</option>
                            <option value="LEADS">Faqat qiziqqanlar (Sotib olmaganlar)</option>
                        </select>
                    </div>

                    <div className="p-6 bg-wellness-gold/10 border border-wellness-gold/20 rounded-2xl">
                        <div className="flex items-center gap-2 mb-2">
                            <Info className="w-4 h-4 text-wellness-gold" />
                            <span className="text-xs font-bold text-wellness-gold">Eslatma</span>
                        </div>
                        <p className="text-xs text-wellness-gold/80 leading-relaxed">
                            Xabar barcha tanlangan foydalanuvchilarga bot orqali yuboriladi. Rasm va videolar uchun Supabase Storage havolasidan foydalaning.
                        </p>
                    </div>

                    <button
                        onClick={handleSend}
                        disabled={sending || !content}
                        className="w-full py-5 bg-primary text-white font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-wellness-gold disabled:opacity-50 transition-all active:scale-95 flex items-center justify-center gap-3"
                    >
                        {sending ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send className="w-4 h-4" />}
                        Xabarni yuborish
                    </button>

                    {status && (
                        <div className="text-center text-xs font-bold text-primary/60 animate-pulse">
                            {status}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
