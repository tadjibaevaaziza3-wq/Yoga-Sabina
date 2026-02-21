"use client"

import { Container } from "@/components/ui/Container"
import { Header } from "@/components/Header"
import { CourseCard } from "@/components/CourseCard"
import { motion } from "framer-motion"
import Image from "next/image"
import { useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Locale } from "@/dictionaries/get-dictionary"

interface CoursesClientProps {
    lang: Locale
    dictionary: any
}

export default function CoursesClient({ lang, dictionary }: CoursesClientProps) {
    const searchParams = useSearchParams()
    const initialType = (searchParams?.get('type') as any) || 'ALL'

    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<'ALL' | 'WOMEN' | 'MEN' | 'PREMIUM' | 'ONLINE' | 'OFFLINE'>(initialType)
    const [bannerUrl, setBannerUrl] = useState("/images/sabina-hero.jpg")

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/settings/public?keys=BANNER_ALL_COURSES')
                if (res.ok) {
                    const data = await res.json().catch(() => null)
                    if (data?.BANNER_ALL_COURSES) {
                        setBannerUrl(data.BANNER_ALL_COURSES)
                    }
                }
            } catch (e) {
                console.error("Courses banner fetch failed", e)
            }
        }
        fetchSettings()
    }, [])

    useEffect(() => {
        const typeParam = searchParams?.get('type')
        if (typeParam) setFilter(typeParam as any)
    }, [searchParams])

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const res = await fetch('/api/courses')
                if (res.ok) {
                    const data = await res.json().catch(() => null)
                    if (data?.success) {
                        setCourses(data.courses)
                    }
                }
            } catch (e) {
                console.error("Courses fetch failed", e)
            } finally {
                setLoading(false)
            }
        }
        loadCourses()
    }, [lang])

    const filteredCourses = courses.filter(course => {
        const title = (lang === 'ru' ? course.titleRu : course.title) || course.title
        const desc = (lang === 'ru' ? course.descriptionRu : course.description) || course.description

        if (filter === 'ALL') return true
        if (filter === 'ONLINE') return course.type === 'ONLINE'
        if (filter === 'OFFLINE') return course.type === 'OFFLINE'
        if (filter === 'WOMEN') return course.targetAudience === 'WOMEN' || (course.targetAudience === 'ALL' && (desc.toLowerCase().includes('женщин') || desc.toLowerCase().includes('аёл') || course.id.includes('women')))
        if (filter === 'MEN') return course.targetAudience === 'MEN' || (course.targetAudience === 'ALL' && (desc.toLowerCase().includes('мужчин') || desc.toLowerCase().includes('эркак') || course.id.includes('men')))
        if (filter === 'PREMIUM') return title.toLowerCase().includes('премиум') || Number(course.price) > 150000
        return true
    })

    return (
        <main className="min-h-screen bg-white">
            <Header />

            <section className="relative pt-32 pb-20 overflow-hidden">
                <Container>
                    <div className="relative bg-[#064e3b] rounded-[3rem] p-12 lg:p-20 flex flex-col lg:flex-row items-center justify-between gap-12 overflow-hidden shadow-2xl">
                        <div className="absolute top-[-20%] right-[-10%] w-[60%] h-[150%] bg-emerald-400/10 blur-[100px] rounded-full" />

                        <div className="relative z-10 max-w-xl text-center lg:text-left">
                            <motion.h1
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-4xl lg:text-6xl font-serif text-white leading-tight mb-6"
                            >
                                {lang === 'ru' ? 'Гармония тела и души' : 'Tana va ruh uyg\'unligi'}
                            </motion.h1>
                            <motion.p
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="text-lg text-[var(--secondary)]/70 mb-10 leading-relaxed font-medium"
                            >
                                {lang === 'ru'
                                    ? 'Авторские программы йоги и психологической поддержки от Сабины Полатовой для вашего здоровья и счастья.'
                                    : 'Sog\'ligingiz va baxtingiz uchun Sabina Polatovadan mualliflik yoga va psixologik yordam dasturlari.'}
                            </motion.p>
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="flex flex-wrap gap-4 justify-center lg:justify-start"
                            >
                                <button className="px-8 py-4 bg-white text-[var(--primary)] rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl hover:bg-[var(--secondary)] transition-all">
                                    {lang === 'ru' ? 'Выбрать программу' : 'Dasturni tanlang'}
                                </button>
                                <button className="px-8 py-4 border border-white/20 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-white/5 transition-all">
                                    {lang === 'ru' ? 'Подробнее обо мне' : 'Men haqimda'}
                                </button>
                            </motion.div>
                        </div>

                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.3, type: 'spring' }}
                            className="relative w-64 h-64 lg:w-96 lg:h-96"
                        >
                            <div className="absolute inset-0 bg-[var(--primary)]/50 rounded-full blur-2xl" />
                            <div className="relative w-full h-full rounded-full border-8 border-[var(--primary)]/30 overflow-hidden shadow-2xl">
                                <Image
                                    src={bannerUrl}
                                    alt="Sabina Polatova"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </motion.div>
                    </div>
                </Container>
            </section>

            <section className="pb-32">
                <Container>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-serif text-[var(--primary)] mb-4">{lang === 'ru' ? 'Найти программы' : 'Dasturlarni toping'}</h2>
                        <p className="text-[var(--primary)]/40 text-sm font-medium tracking-wide max-w-xl mx-auto">
                            {lang === 'ru'
                                ? 'Выберите курс, который подходит именно вам. От йоги до коуч-сессий для вашего здоровья.'
                                : 'Aynan sizga mos keladigan kursni tanlang. Yogadan tortib sog\'ligingiz uchun kouch-sessiyalarigacha.'}
                        </p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-3 mb-16">
                        {[
                            { id: 'ALL', label: lang === 'ru' ? 'Все курсы' : 'Barchasi' },
                            { id: 'WOMEN', label: lang === 'ru' ? 'Для женщин' : 'Ayollar uchun' },
                            { id: 'MEN', label: lang === 'ru' ? 'Для мужчин' : 'Erkaklar uchun' },
                            { id: 'PREMIUM', label: lang === 'ru' ? 'Премиум' : 'Premium' },
                        ].map(f => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id as any)}
                                className={`px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${filter === f.id
                                    ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/20"
                                    : "bg-[var(--secondary)] text-[var(--primary)]/40 border border-[var(--secondary)]/50 hover:bg-[var(--secondary)]"
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>

                    {loading ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
                        </div>
                    ) : (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-8">
                            {filteredCourses.map((course) => (
                                <CourseCard
                                    key={course.id}
                                    id={course.id}
                                    title={lang === 'ru' && course.titleRu ? course.titleRu : course.title}
                                    description={lang === 'ru' && course.descriptionRu ? course.descriptionRu : course.description}
                                    price={course.price.toString()}
                                    duration={course.durationDays?.toString() || course.durationLabel || '30'}
                                    type={course.type}
                                    features={lang === 'ru' && course.featuresRu ? course.featuresRu : course.features}
                                    lang={lang}
                                    dictionary={dictionary}
                                    targetAudience={course.targetAudience}
                                />
                            ))}
                        </div>
                    )}

                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="mt-32 relative bg-[#064e3b] rounded-[3rem] p-12 overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-[-50%] left-[-10%] w-[60%] h-[200%] bg-emerald-400/10 blur-[100px] rounded-full" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
                            <div>
                                <h3 className="text-2xl lg:text-3xl font-serif text-white mb-4">
                                    {lang === 'ru' ? 'Нужна индивидуальная помощь?' : 'Individual yordam kerakmi?'}
                                </h3>
                                <p className="text-[var(--secondary)]/60 font-medium mb-6 max-w-lg">
                                    {lang === 'ru'
                                        ? 'Если вы не знаете, какой курс выбрать, вы всегда можете записаться на консультацию с Сабиной.'
                                        : 'Qaysi kursni tanlashni bilmasangiz, har doim Sabina bilan maslahatlashish uchun ro\'yxatdan o\'tishingiz mumkin.'}
                                </p>
                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                    <span className="flex items-center gap-2 text-[var(--secondary)]/40 text-[10px] font-black uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                        {lang === 'ru' ? 'Консультации' : 'Konsultatsiyalar'}
                                    </span>
                                    <span className="flex items-center gap-2 text-[var(--secondary)]/40 text-[10px] font-black uppercase tracking-widest">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                                        {lang === 'ru' ? 'Онлайн и офлайн' : 'Onlayn va oflayn'}
                                    </span>
                                </div>
                            </div>
                            <button className="px-8 py-4 bg-[#d97706]/90 text-white rounded-2xl font-black text-sm uppercase tracking-widest shadow-xl hover:shadow-2xl hover:bg-orange-600 transition-all">
                                {lang === 'ru' ? 'Записаться на консультацию' : 'Konsultatsiyaga yozilish'}
                            </button>
                        </div>
                    </motion.div>
                </Container>
            </section>
        </main>
    )
}
