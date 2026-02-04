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

                {/* Tabs */}
                <div className="flex justify-center gap-4 mb-12">
                    <button
                        onClick={() => setActiveTab('ALL')}
                        className={`px-6 py-2 rounded-lg font-semibold transition ${activeTab === 'ALL'
                                ? 'bg-emerald-800 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        ВСЕ КУРСЫ
                    </button>
                    <button
                        onClick={() => setActiveTab('ONLINE')}
                        className={`px-6 py-2 rounded-lg font-semibold transition ${activeTab === 'ONLINE'
                                ? 'bg-emerald-800 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        ОНЛАЙН КУРС
                    </button>
                    <button
                        onClick={() => setActiveTab('OFFLINE')}
                        className={`px-6 py-2 rounded-lg font-semibold transition ${activeTab === 'OFFLINE'
                                ? 'bg-emerald-800 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                    >
                        ОФЛАЙН КУРС
                    </button>
                </div>

                {/* Courses Grid */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="text-gray-500">Загрузка...</div>
                    </div>
                ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
                        {filteredCourses.map((course, index) => (
                            <motion.div
                                key={course.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className={`${cardColors[index % cardColors.length]} rounded-3xl p-6 hover:shadow-lg transition-shadow`}
                            >
                                {/* Badge */}
                                <div className="inline-block bg-white px-4 py-1 rounded-full text-xs font-semibold text-gray-700 mb-4">
                                    {course.type === 'ONLINE' ? '💻 ONLINE' : '🏢 OFFLINE'}
                                </div>

                                {/* Title */}
                                <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight">
                                    {course.title}
                                </h3>

                                {/* Description */}
                                <p className="text-sm text-gray-600 mb-4 line-clamp-3">
                                    {course.description}
                                </p>

                                {/* Features */}
                                <ul className="text-xs text-gray-700 space-y-2 mb-6">
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                        Психологическая работа
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600"></span>
                                        Практические упражнения
                                    </li>
                                </ul>

                                {/* Price & CTA */}
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-2xl font-bold text-gray-900">
                                            {(course.price / 1000).toFixed(0)}K
                                        </p>
                                        <p className="text-xs text-gray-500">сўм</p>
                                    </div>
                                    <Link
                                        href={`/${lang}/courses/${course.id}`}
                                        className="w-10 h-10 bg-emerald-800 text-white rounded-full flex items-center justify-center hover:bg-emerald-900 transition"
                                    >
                                        →
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}

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
