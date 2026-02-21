"use client"

import { useState } from "react"
import { Star, Camera } from "lucide-react"
import { motion } from "framer-motion"
import Image from "next/image"
import { cn } from "@/lib/utils"

export function TestimonialsSection({ lang, dictionary }: { lang: string, dictionary: any }) {
    const [rating, setRating] = useState(0)
    const [text, setText] = useState("")
    const [sending, setSending] = useState(false)
    const [status, setStatus] = useState<string | null>(null)

    const categories = lang === 'uz'
        ? ["Barchasi", "Vazn yo'qotish", "Mushaklar", "Salomatlik"]
        : ["Все", "Похудение", "Мышцы", "Здоровье"]

    const testimonials = [
        {
            name: "Anna K.",
            location: lang === 'uz' ? "Toshkent, 28 yosh" : "Ташкент, 28 лет",
            text: lang === 'uz'
                ? "\"Ushbu kurs men uchun haqiqiy kashfiyot bo'ldi. O'zimni ancha yengil va baxtli his qilyapman...\""
                : "\"Этот курс стал для меня настоящим открытием. Я чувствую себя намного легче и счастливее...\"",
            rating: 5
        },
        {
            name: "Malika R.",
            location: lang === 'uz' ? "Samarqand, 32 yosh" : "Самарканд, 32 года",
            text: lang === 'uz'
                ? "\"Sabinaning yondashuvi shunchaki ajoyib. Har bir dars yangi quvvat bag'ishlaydi.\""
                : "\"Подход Сабины просто великолепен. Каждый урок дает новый заряд энергии.\"",
            rating: 5
        }
    ]

    const handleSubmit = async () => {
        if (!text) return
        setSending(true)
        try {
            const res = await fetch("/api/social/feedback", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId: "user_123", text, rating })
            })
            if (res.ok) {
                setStatus(lang === 'uz' ? "Rahmat! ✨" : "Спасибо! ✨")
                setText("")
                setRating(0)
            }
        } catch (e) {
            setStatus(lang === 'uz' ? "Xatolik yuz berdi." : "Произошла ошибка.")
        } finally {
            setSending(false)
        }
    }

    return (
        <section className="py-32 bg-[#F5F8F8]">
            <div className="container mx-auto px-4">
                <div className="text-center mb-16">
                    <h2 className="text-4xl md:text-5xl font-serif font-black text-[var(--primary)] mb-4">
                        {lang === 'uz' ? "Mijozlarimiz fikrlari" : "Отзывы наших клиентов"}
                    </h2>
                    <p className="text-[var(--primary)]/40 text-sm font-bold uppercase tracking-widest italic">
                        {lang === 'uz' ? "Haqiqiy natijalar va o'zgarishlar" : "Реальные результаты и изменения"}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8 mb-20">
                    {testimonials.map((t, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="bg-white p-10 rounded-[2.5rem] border border-[var(--primary)]/5 shadow-sm hover:shadow-xl transition-all"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 rounded-full overflow-hidden bg-[var(--secondary)] flex items-center justify-center">
                                    <span className="text-[var(--primary)] font-bold">{t.name[0]}</span>
                                </div>
                                <div>
                                    <div className="text-sm font-black text-[var(--primary)]">{t.name}</div>
                                    <div className="text-[10px] font-bold text-[var(--primary)]/40 uppercase tracking-widest">{t.location}</div>
                                </div>
                            </div>
                            <div className="flex gap-1 mb-6">
                                {[...Array(t.rating)].map((_, s) => (
                                    <Star key={s} className="w-3 h-3 fill-[var(--accent)]/60 text-[var(--accent)]/60" />
                                ))}
                            </div>
                            <p className="text-sm text-[var(--primary)]/70 leading-relaxed font-medium italic">
                                {t.text}
                            </p>
                        </motion.div>
                    ))}
                </div>

                {/* Feedback Form */}
                <div className="max-w-2xl mx-auto bg-white rounded-[3rem] p-12 shadow-2xl shadow-[var(--primary)]/5">
                    <h3 className="text-2xl font-serif text-[var(--primary)] mb-8 text-center">
                        {lang === 'uz' ? "Fikringizni qoldiring" : "Оставьте свой отзыв"}
                    </h3>

                    <div className="space-y-6">
                        <div className="flex justify-center gap-4 py-4 mb-4 border-b border-[var(--primary)]/5">
                            {[1, 2, 3, 4, 5].map((i) => (
                                <button key={i} onClick={() => setRating(i)} className="transition-all active:scale-90">
                                    <Star className={`w-8 h-8 ${rating >= i ? "fill-[var(--accent)]/60 text-[var(--accent)]/60" : "text-[var(--primary)]/5"}`} />
                                </button>
                            ))}
                        </div>

                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder={lang === 'uz' ? "Hikoyangizni yozing..." : "Напишите вашу историю..."}
                            className="w-full bg-[#F5F8F8] border-0 rounded-[2rem] p-6 text-sm min-h-[120px] focus:ring-2 focus:ring-[var(--accent)] transition-all"
                        />

                        {status && <p className="text-center text-[var(--accent)] text-sm font-bold">{status}</p>}

                        <button
                            onClick={handleSubmit}
                            disabled={sending || !text}
                            className="w-full py-5 bg-[var(--primary)] text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] shadow-xl hover:bg-[var(--primary)] disabled:opacity-50 transition-all"
                        >
                            {sending ? (lang === 'uz' ? "YUBORILMOQDA..." : "ОТПРАВКА...") : (lang === 'uz' ? "YUBORISH" : "ОТПРАВИТЬ")}
                        </button>
                    </div>
                </div>
            </div>
        </section>
    )
}


