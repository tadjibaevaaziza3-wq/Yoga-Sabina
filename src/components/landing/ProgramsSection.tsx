'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Locale } from '@/dictionaries/get-dictionary'

interface Course {
    id: string
    title: string
    description: string
    price: number
    type: 'ONLINE' | 'OFFLINE'
    productType: string
    coverImage?: string
}

interface ProgramsSectionProps {
    lang: Locale
    dictionary: any
}

export function ProgramsSection({ lang, dictionary }: ProgramsSectionProps) {
    const [courses, setCourses] = useState<Course[]>([])
    const [activeTab, setActiveTab] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL')
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Fetch courses from API
        fetch('/api/courses')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCourses(data.courses.filter((c: Course) => c.productType === 'COURSE'))
                }
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const filteredCourses = courses.filter(course => {
        if (activeTab === 'ALL') return true
        return course.type === activeTab
    })

    const cardColors = [
        'bg-blue-50',
        'bg-pink-50',
        'bg-orange-50',
        'bg-emerald-50',
        'bg-purple-50'
    ]

    return (
        <section className="py-20 px-4 bg-white">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-12">
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Наши программы
                    </h2>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Выберите подходящую программу для начала вашего пути к гармонии.
                        Каждая программа — это путь к бережной работе с телом и сознанием.
                    </p>
                </div>

                {/* Programs Entry Points */}
                <div className="grid md:grid-cols-2 gap-12 mb-20">
                    {/* Online Preview */}
                    <div className="group relative bg-emerald-50 rounded-[3rem] p-12 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-900/10 border border-emerald-100/50">
                        <div className="relative z-10">
                            <span className="inline-block bg-white/80 backdrop-blur-md px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-emerald-900 mb-8">
                                💻 Онлайн курслар
                            </span>
                            <h3 className="text-4xl font-serif font-black text-emerald-900 mb-6Leading-tight">
                                Масофавий таълим
                            </h3>
                            <p className="text-emerald-900/60 mb-10 text-lg leading-relaxed max-w-md">
                                Дунёнинг исталган нуқтасидан туриб медитация ва йога билан шуғулланинг.
                            </p>
                            <Link
                                href={`/${lang}/online-courses`}
                                className="inline-flex items-center gap-4 bg-emerald-900 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-800 transition-all shadow-xl shadow-emerald-900/20"
                            >
                                Барчасини кўриш
                                <span className="text-xl">→</span>
                            </Link>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-white/20 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-emerald-200/40 transition-colors" />
                    </div>

                    {/* Offline Preview */}
                    <div className="group relative bg-emerald-900 rounded-[3rem] p-12 overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-900/40">
                        <div className="relative z-10">
                            <span className="inline-block bg-white/10 backdrop-blur-md px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest text-white mb-8">
                                🏢 Оффлайн курслар
                            </span>
                            <h3 className="text-4xl font-serif font-black text-white mb-6 leading-tight">
                                Жонли машғулотлар
                            </h3>
                            <p className="text-emerald-100/60 mb-10 text-lg leading-relaxed max-w-md">
                                Тошкентдаги студиямизда профессонал менторлар билан бирга шуғулланинг.
                            </p>
                            <Link
                                href={`/${lang}/offline-courses`}
                                className="inline-flex items-center gap-4 bg-white text-emerald-900 px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest text-xs hover:bg-emerald-50 transition-all shadow-xl shadow-emerald-900/20"
                            >
                                Барчасини кўриш
                                <span className="text-xl">→</span>
                            </Link>
                        </div>
                        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800/50 rounded-full -mr-20 -mt-20 blur-3xl group-hover:bg-emerald-700/60 transition-colors" />
                    </div>
                </div>

                {/* Consultation CTA Section - Dark Green */}
                <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl p-12 text-white text-center">
                    <h3 className="text-3xl md:text-4xl font-bold mb-4">
                        Нужна индивидуальная помощь?
                    </h3>
                    <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
                        Глубокая работа с психологом в формате индивидуальной сессии.
                        Онлайн или офлайн — выбирайте удобный формат.
                    </p>
                    <div className="flex flex-wrap justify-center gap-4">
                        <Link
                            href="/consultations"
                            className="bg-white text-emerald-900 px-8 py-3 rounded-full font-semibold hover:bg-emerald-50 transition"
                        >
                            Записаться на консультацию
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}
