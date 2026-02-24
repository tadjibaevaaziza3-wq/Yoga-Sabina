"use client"

import React, { useState, useEffect } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Star, MessageCircle, Camera, CheckCircle2, ChevronRight, Quote } from "lucide-react"
import { Container } from "@/components/ui/Container"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { useDictionary } from "@/components/providers/DictionaryProvider"
import { useParams } from "next/navigation"
import { toast } from "sonner"

export default function AboutPage() {
    const { dictionary, lang } = useDictionary()
    const [user, setUser] = useState<any>(null)
    const [feedback, setFeedback] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [filter, setFilter] = useState("all")

    const [form, setForm] = useState({
        name: "",
        email: "",
        message: "",
        rating: 5
    })
    const [photo, setPhoto] = useState<File | null>(null)
    const [photoPreview, setPhotoPreview] = useState<string | null>(null)
    const [bannerUrl, setBannerUrl] = useState("/images/feedback-hero-bg.jpg")

    useEffect(() => {
        const loadData = async () => {
            // Fetch session
            try {
                const sessionRes = await fetch('/api/auth/me')
                const sessionData = await sessionRes.json()
                if (sessionData.success && sessionData.user) {
                    setUser(sessionData.user)
                    setForm(prev => ({
                        ...prev,
                        name: `${sessionData.user.firstName || ''} ${sessionData.user.lastName || ''}`.trim(),
                        email: sessionData.user.email || ''
                    }))
                }

                const res = await fetch('/api/feedback')
                if (res.ok) {
                    const data = await res.json()
                    setFeedback(data)
                }

                const settingsRes = await fetch('/api/settings/public?keys=BANNER_ABOUT_US')
                const settingsData = await settingsRes.json()
                if (settingsData.BANNER_ABOUT_US) {
                    setBannerUrl(settingsData.BANNER_ABOUT_US)
                }
            } catch (err) {
                console.error("Failed to load feedback")
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [])

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                toast.error(lang === 'uz' ? 'Rasm hajmi 10MB dan oshmasligi kerak' : 'Размер фото не должен превышать 10МБ')
                return
            }
            setPhoto(file)
            setPhotoPreview(URL.createObjectURL(file))
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user) {
            toast.error(lang === 'uz' ? "Iltimos, avval tizimga kiring" : "Пожалуйста, сначала войдите в систему")
            return
        }

        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append('userId', user.id)
            formData.append('message', form.message)
            formData.append('rating', String(form.rating))
            if (photo) {
                formData.append('photo', photo)
            }

            const res = await fetch('/api/feedback', {
                method: 'POST',
                body: formData
            })

            if (res.ok) {
                toast.success(dictionary?.about.feedbackSuccess || "Success")
                setForm(prev => ({ ...prev, message: "", rating: 5 }))
                setPhoto(null)
                setPhotoPreview(null)
            } else {
                toast.error("Error submitting feedback")
            }
        } catch (err) {
            toast.error("Error submitting feedback")
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!dictionary) return null

    const filters = [
        { id: "all", label: dictionary.about.all },
        { id: "yoga", label: dictionary.about.yoga },
        { id: "psychology", label: dictionary.about.psychology },
        { id: "meditation", label: dictionary.about.meditation }
    ]

    return (
        <main className="min-h-screen pt-40 bg-[#f8faf9]">
            {/* Hero Section */}
            <section className="mb-24 px-4">
                <Container>
                    <div className="relative rounded-[3.5rem] overflow-hidden bg-[var(--primary)] min-h-[500px] flex items-center">
                        <Image
                            src={bannerUrl} // Dynamic banner from settings
                            alt="Background"
                            fill
                            className="object-cover opacity-30 mix-blend-overlay"
                        />
                        <div className="relative z-10 w-full max-w-3xl mx-auto text-center px-8 py-20">
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="space-y-8"
                            >
                                <h1 className="text-4xl md:text-7xl font-serif font-black text-white leading-tight">
                                    {dictionary.about.heroTitle}
                                </h1>
                                <p className="text-xl md:text-2xl text-[var(--secondary)]/80 font-medium leading-relaxed">
                                    {dictionary.about.heroSubtitle}
                                </p>
                                <div className="pt-8">
                                    <Button
                                        onClick={() => document.getElementById('feedback-form')?.scrollIntoView({ behavior: 'smooth' })}
                                        className="bg-[#ff7d52] hover:bg-[#ff6a38] text-white rounded-2xl px-10 py-8 text-lg font-bold transition-transform hover:scale-105 shadow-2xl shadow-orange-500/30"
                                    >
                                        {dictionary.about.shareStory}
                                    </Button>
                                </div>
                            </motion.div>
                        </div>

                        {/* Floating elements like in screenshot */}
                        <div className="absolute -bottom-12 -left-12 w-64 h-64 bg-[var(--accent)]/20 rounded-full blur-3xl animate-pulse" />
                        <div className="absolute -top-12 -right-12 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
                    </div>
                </Container>
            </section>

            {/* Filter Chips */}
            <section className="mb-16 px-4">
                <Container>
                    <div className="flex flex-wrap gap-3 justify-center">
                        {filters.map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id)}
                                className={`px-6 py-2.5 rounded-full text-sm font-bold transition-all ${filter === f.id
                                    ? "bg-[var(--accent)] text-white shadow-lg shadow-[var(--accent)]/20"
                                    : "bg-white text-[var(--primary)]/40 hover:bg-[var(--secondary)]"
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Feedback Grid */}
            <section className="mb-32 px-4">
                <Container>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {isLoading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-[2.5rem] p-8 h-80 animate-pulse border border-[var(--secondary)]" />
                            ))
                        ) : feedback.length > 0 ? (
                            feedback.map((item, idx) => (
                                <motion.div
                                    key={item.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-white rounded-[2.5rem] p-10 relative group hover:shadow-2xl hover:shadow-[var(--primary)]/5 transition-all duration-500 border border-[var(--secondary)]/50"
                                >
                                    <Quote className="absolute top-8 right-10 w-12 h-12 text-[var(--accent)]/5 group-hover:text-[var(--accent)]/10 transition-colors" />

                                    {item.photoUrl && (
                                        <div className="mb-6 rounded-2xl overflow-hidden">
                                            <img src={item.photoUrl} alt="" className="w-full h-48 object-cover" />
                                        </div>
                                    )}

                                    <div className="flex items-center gap-4 mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-[var(--secondary)] flex items-center justify-center relative overflow-hidden">
                                            <div className="text-[var(--accent)] font-black text-xl">
                                                {item.user.firstName?.[0] || 'U'}
                                            </div>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-[var(--primary)]">
                                                {item.user.firstName} {item.user.lastName}
                                            </h4>
                                            <p className="text-xs text-[var(--primary)]/40 font-bold uppercase tracking-widest">
                                                {item.user.profile?.location || 'O‘zbekiston'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex gap-1 mb-6">
                                        {[...Array(5)].map((_, i) => (
                                            <Star key={i} className={`w-4 h-4 ${i < item.rating ? "text-[#ffd700] fill-[#ffd700]" : "text-[var(--secondary)] fill-[var(--secondary)]"}`} />
                                        ))}
                                    </div>

                                    <p className="text-[var(--primary)]/80 leading-loose text-[15px] font-medium italic">
                                        "{item.message}"
                                    </p>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20">
                                <MessageCircle className="w-16 h-16 text-[var(--secondary)] mx-auto mb-6" />
                                <p className="text-[var(--primary)]/40 font-bold">Hozircha fikrlar mavjud emas.</p>
                            </div>
                        )}
                    </div>
                </Container>
            </section>

            {/* Submit Feedback Form */}
            <section id="feedback-form" className="pb-32 px-4">
                <Container>
                    <div className="max-w-4xl mx-auto bg-white rounded-[4rem] p-12 md:p-20 shadow-2xl shadow-[var(--primary)]/5 border border-[var(--secondary)]">
                        <div className="text-center mb-16 space-y-4">
                            <h2 className="text-3xl md:text-5xl font-serif font-black text-[var(--primary)]">
                                {dictionary.about.leaveFeedback}
                            </h2>
                            <p className="text-[var(--primary)]/60 font-medium">
                                {lang === 'uz'
                                    ? "Sizning hikoyangiz boshqalarga sog'lom turmush tarziga yo'l olishda ilhom bo'lishi mumkin."
                                    : "Ваша история может вдохновить других начать путь к здоровому образу жизни."}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-10">
                            <div className="grid md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                                        {dictionary.about.nameLabel}
                                    </label>
                                    <Input
                                        value={form.name}
                                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                                        className="rounded-3xl bg-[var(--secondary)]/30 border-none h-16 px-8 font-bold text-[var(--primary)]"
                                        placeholder="Ism Familiya"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                                        {dictionary.about.emailLabel}
                                    </label>
                                    <Input
                                        type="email"
                                        value={form.email}
                                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                                        className="rounded-3xl bg-[var(--secondary)]/30 border-none h-16 px-8 font-bold text-[var(--primary)]"
                                        placeholder="your@email.com"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[11px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                                    {dictionary.about.messageLabel}
                                </label>
                                <textarea
                                    required
                                    value={form.message}
                                    onChange={(e) => setForm({ ...form, message: e.target.value })}
                                    className="w-full rounded-[2.5rem] bg-[var(--secondary)]/30 border-none min-h-[200px] p-8 font-medium text-[var(--primary)] leading-relaxed resize-none focus:ring-2 focus:ring-[var(--accent)] outline-none"
                                    placeholder={lang === 'uz' ? "O'z natijalaringiz haqida so'zlab bering..." : "Расскажите о ваших результатах..."}
                                />
                            </div>

                            <label className="bg-[var(--secondary)]/30 rounded-[2.5rem] p-10 border border-[var(--secondary)]/50 cursor-pointer hover:border-[var(--accent)]/30 transition-colors block">
                                <input
                                    type="file"
                                    accept="image/png,image/jpeg,image/webp"
                                    onChange={handlePhotoChange}
                                    className="hidden"
                                />
                                {photoPreview ? (
                                    <div className="flex flex-col items-center gap-4">
                                        <img src={photoPreview} alt="Preview" className="w-32 h-32 object-cover rounded-2xl" />
                                        <p className="text-sm font-bold text-[var(--accent)]">
                                            {photo?.name}
                                        </p>
                                        <p className="text-[11px] font-bold text-[var(--primary)]/30 uppercase tracking-widest">
                                            {lang === 'uz' ? 'Boshqa rasm tanlash uchun bosing' : 'Нажмите чтобы выбрать другое фото'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center text-[var(--accent)] shadow-sm">
                                            <Camera className="w-8 h-8" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-bold text-[var(--primary)] mb-1">
                                                {lang === 'uz' ? "Rasmni yuklash (ixtiyoriy)" : "Загрузите фото (необязательно)"}
                                            </p>
                                            <p className="text-[11px] font-bold text-[var(--primary)]/30 uppercase tracking-widest">
                                                PNG, JPG up to 10MB
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </label>

                            <div className="flex items-center gap-4 px-4">
                                <input type="checkbox" required className="w-5 h-5 rounded-lg border-emerald-200 text-[var(--accent)] focus:ring-[var(--accent)]" />
                                <span className="text-sm text-[var(--primary)]/60 font-medium leading-tight">
                                    {lang === 'uz'
                                        ? "Men ushbu fikrning saytda e'lon qilinishiga rozilik beraman."
                                        : "Я даю согласие на публикацию моего отзыва на сайте."}
                                </span>
                            </div>

                            <Button
                                type="submit"
                                disabled={isSubmitting || !user}
                                className="w-full bg-[#ff7d52] hover:bg-[#ff6a38] text-white rounded-[2rem] py-10 text-xl font-black uppercase tracking-widest transition-all hover:scale-[1.02] shadow-2xl shadow-orange-500/20 disabled:opacity-50"
                            >
                                {isSubmitting ? (lang === 'uz' ? "Yuborilmoqda..." : "Отправка...") : dictionary.about.submitBtn}
                            </Button>
                        </form>
                    </div>
                </Container>
            </section>

            {/* Simple footer metadata */}
            <div className="border-t border-[var(--secondary)] py-12">
                <Container>
                    <div className="flex flex-col md:flex-row justify-between items-center gap-8 opacity-40">
                        <p className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-[0.3em]">
                            ©2026 Baxtli Men. Barcha huquqlar himoyalangan.
                        </p>
                        <div className="flex gap-8 text-[11px] font-black uppercase tracking-widest text-[var(--primary)]">
                            <a href="https://instagram.com/sabinapolatova" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">Instagram</a>
                            <a href="https://t.me/sabinapolatova" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">Telegram</a>
                            <a href="https://facebook.com/sabinapolatova" target="_blank" rel="noopener noreferrer" className="hover:text-[var(--accent)] transition-colors">Facebook</a>
                        </div>
                    </div>
                </Container>
            </div>
        </main>
    )
}
