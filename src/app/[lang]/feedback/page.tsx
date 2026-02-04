"use client"

import { useState } from "react"
import { Star, Send, ChevronLeft, Camera } from "lucide-react"
import { Container } from "@/components/ui/Container"
import { Header } from "@/components/Header"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default function FeedbackPage({ params }: { params: { lang: string } }) {
    const { lang } = params
    const [rating, setRating] = useState(0)
    const [text, setText] = useState("")
    const [sending, setSending] = useState(false)
    const [status, setStatus] = useState<string | null>(null)

    const categories = ["Barchasi", "Vazn yo'qotish", "Mushaklar", "Salomatlik"]

    const handleSubmit = async () => {
        if (!text) return
        setSending(true)
        try {
            const res = await fetch("/api/social/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: "user_123", text, rating }) // Mock userId
            })
            if (res.ok) {
                setStatus("Rahmat! Sizning hikoyangiz boshqalarni ilhomlantiradi. ✨")
                setText("")
                setRating(0)
            }
        } catch (e) {
            setStatus("Xatolik yuz berdi. Iltimos, keyinroq urinib ko'ring.")
        } finally {
            setSending(false)
        }
    }

    return (
        <main className="min-h-screen bg-[#F5F8F8]">
            <Header lang={lang as any} dictionary={{ 'common': { 'home': 'Bosh sahifa' } }} />

            {/* Hero Section */}
            <section className="relative pt-32 pb-20">
                <Container>
                    <div className="bg-[#144243] rounded-[3rem] p-16 md:p-24 text-center relative overflow-hidden">
                        <div className="relative z-10 max-w-2xl mx-auto">
                            <h1 className="text-5xl md:text-7xl font-serif text-white mb-8">Mijozlarimizning muvaffaqiyat hikoyalari</h1>
                            <p className="text-white/60 text-lg font-medium mb-12 italic">Yoga va to'g'ri turmush tarzi orqali o'zgargan hayotlar</p>
                            <button className="btn-coral px-10 py-5 uppercase tracking-widest text-sm">O'z hikoyangizni ulashing</button>
                        </div>
                        {/* Abstract background elements */}
                        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                            <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl -mr-20 -mt-20" />
                            <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent rounded-full blur-3xl -ml-20 -mb-20" />
                        </div>
                    </div>
                </Container>
            </section>

            {/* Testimonials Grid */}
            <section className="pb-32">
                <Container>
                    <div className="mb-16">
                        <div className="flex flex-wrap gap-4 justify-center mb-16">
                            {categories.map((cat, i) => (
                                <button
                                    key={i}
                                    className={cn(
                                        "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                                        i === 0 ? "bg-primary text-white shadow-xl" : "bg-white text-primary/40 border border-primary/5 hover:bg-primary/5"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="bg-white p-10 rounded-[2.5rem] border border-primary/5 hover:shadow-2xl transition-all group">
                                    <div className="flex items-center gap-4 mb-6">
                                        <div className="w-12 h-12 rounded-full overflow-hidden bg-secondary">
                                            <Image src="/images/hero.png" alt="User" width={48} height={48} className="object-cover" />
                                        </div>
                                        <div>
                                            <div className="text-sm font-black text-primary">Anna K.</div>
                                            <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Toshkent, 28 yosh</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 mb-6">
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <Star key={s} className="w-3 h-3 fill-accent text-accent" />
                                        ))}
                                    </div>
                                    <p className="text-sm text-primary/70 leading-relaxed font-medium mb-8 italic">
                                        "Ushbu kurs men uchun haqiqiy kashfiyot bo'ldi. O'zimni ancha yengil va baxtli his qilyapman..."
                                    </p>
                                    <Link href="#" className="text-[10px] font-black text-primary uppercase tracking-[0.2em] hover:text-accent transition-colors">To'liq o'qish →</Link>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Feedback Form Section */}
                    <div className="max-w-4xl mx-auto pt-20 border-t border-primary/5">
                        <div className="bg-white rounded-[3rem] p-12 md:p-20 shadow-2xl shadow-primary/5 relative">
                            <h2 className="text-4xl font-serif text-primary mb-4 text-center">Fikringizni qoldiring</h2>
                            <p className="text-primary/40 text-sm font-bold uppercase tracking-widest mb-16 text-center italic">Sizning tarixingiz boshqalarga motivatsiya bo'lishi mumkin</p>

                            <div className="space-y-8">
                                <div className="grid md:grid-cols-2 gap-8">
                                    <input type="text" placeholder="Ismingiz" className="w-full bg-[#F5F8F8] border-0 rounded-2xl p-6 text-sm focus:ring-2 focus:ring-accent transition-all" />
                                    <input type="email" placeholder="Elektron pochta" className="w-full bg-[#F5F8F8] border-0 rounded-2xl p-6 text-sm focus:ring-2 focus:ring-accent transition-all" />
                                </div>

                                <div className="flex justify-center gap-4 py-8 border-y border-primary/5">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <button key={i} onClick={() => setRating(i)} className="transition-all active:scale-90">
                                            <Star className={`w-8 h-8 ${rating >= i ? "fill-accent text-accent" : "text-primary/5"}`} />
                                        </button>
                                    ))}
                                </div>

                                <textarea
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Muvaffaqiyat hikoyangizni yozing..."
                                    className="w-full bg-[#F5F8F8] border-0 rounded-[2rem] p-8 text-sm min-h-[180px] focus:ring-2 focus:ring-accent transition-all"
                                />

                                <div className="border-2 border-dashed border-primary/10 rounded-[2rem] p-12 text-center group hover:border-accent hover:bg-accent/5 transition-all cursor-pointer">
                                    <div className="w-12 h-12 bg-primary/5 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent/10">
                                        <Camera className="w-6 h-6 text-primary/20 group-hover:text-accent/40" />
                                    </div>
                                    <div className="text-[10px] font-black uppercase tracking-widest text-primary/40">Rasmingizni yuklang (ixtiyoriy)</div>
                                </div>

                                <button
                                    onClick={handleSubmit}
                                    disabled={sending || !text}
                                    className="btn-coral w-full py-6 text-sm uppercase tracking-widest shadow-2xl shadow-accent/20"
                                >
                                    {sending ? "YUBORILMOQDA..." : "HIKOYANI YUBORISH"}
                                </button>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    )
}
