'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface Consultation {
    id: string
    title: string
    description: string
    price: number
    consultationFormat: 'ONLINE' | 'OFFLINE'
}

export default function ConsultationsPage() {
    const [consultations, setConsultations] = useState<Consultation[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/consultations')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setConsultations(data.consultations)
                }
                setLoading(false)
            })
            .catch(err => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    if (loading) {
        return <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-gray-900 text-xl">Загрузка...</div>
        </div>
    }

    const onlineConsultation = consultations.find(c => c.consultationFormat === 'ONLINE')
    const offlineConsultation = consultations.find(c => c.consultationFormat === 'OFFLINE')

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section - Dark Green */}
            <section className="bg-gradient-to-r from-emerald-900 to-emerald-800 text-white py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                                Живые встречи и<br />
                                <span className="italic font-serif">глубокая</span> работа
                            </h1>
                            <p className="text-xl text-emerald-100 mb-8">
                                Персонализированные программы для вашего глубокого развития.
                                Начните трансформацию с индивидуального подхода уже сегодня.
                            </p>
                            <div className="flex gap-4">
                                {onlineConsultation && (
                                    <Link
                                        href={`/consultations/${onlineConsultation.id}`}
                                        className="bg-white text-emerald-900 px-8 py-3 rounded-full font-semibold hover:bg-emerald-50 transition"
                                    >
                                        Онлайн-сессия
                                    </Link>
                                )}
                                {offlineConsultation && (
                                    <Link
                                        href={`/consultations/${offlineConsultation.id}`}
                                        className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition"
                                    >
                                        Офлайн-сессия
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Circle Image Placeholder */}
                        <div className="flex justify-center">
                            <div className="w-80 h-80 rounded-full bg-white/10 backdrop-blur-sm border-4 border-white/20 overflow-hidden">
                                <img
                                    src="/api/placeholder/400/400"
                                    alt="Sabina Polatova"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Individual Sessions Section - Dark Green Card */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-br from-emerald-900 to-emerald-800 rounded-3xl p-12 text-white relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
                            <div className="absolute right-12 top-1/4 w-32 h-32 bg-white rounded-full"></div>
                            <div className="absolute right-24 bottom-1/4 w-24 h-64 bg-white rounded-full"></div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-emerald-300 text-sm font-medium mb-2">💫 ПСИХОЛОГИЧЕСКАЯ ПОДДЕРЖКА</p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                Индивидуальные сессии
                            </h2>
                            <p className="text-emerald-100 text-lg mb-8 max-w-2xl">
                                Глубокая работа с психологом: изменение бессознательных установок,
                                практические техники для трансформации вашей жизни.
                                90% сессии — психологические практики. Начните смотреть на жизнь по-другому 💫✨
                            </p>

                            {/* Consultation Options Grid */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {/* Online Consultation */}
                                {onlineConsultation && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-emerald-300 text-sm mb-1">Онлайн (Zoom)</p>
                                                <h3 className="text-2xl font-bold">1 сессия</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold">{(onlineConsultation.price / 1000000).toFixed(0)}M</p>
                                                <p className="text-emerald-200 text-sm">сўм</p>
                                            </div>
                                        </div>
                                        <ul className="text-emerald-100 text-sm space-y-2 mb-4">
                                            <li>• Первая сессия: 90 минут</li>
                                            <li>• Далее: по 60 минут</li>
                                            <li>• Практические упражнения</li>
                                            <li>• Поддержка 1-2 недели</li>
                                        </ul>
                                        <Link
                                            href={`/consultations/${onlineConsultation.id}`}
                                            className="block w-full bg-white text-emerald-900 text-center py-3 rounded-xl font-semibold hover:bg-emerald-50 transition"
                                        >
                                            Записаться
                                        </Link>
                                    </div>
                                )}

                                {/* Offline Consultation */}
                                {offlineConsultation && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-emerald-300 text-sm mb-1">Офлайн (Живая встреча)</p>
                                                <h3 className="text-2xl font-bold">1 сессия</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold">{(offlineConsultation.price / 1000000).toFixed(0)}M</p>
                                                <p className="text-emerald-200 text-sm">сўм</p>
                                            </div>
                                        </div>
                                        <ul className="text-emerald-100 text-sm space-y-2 mb-4">
                                            <li>• Первая сессия: 90 минут</li>
                                            <li>• Далее: по 60 минут</li>
                                            <li>• Практические упражнения</li>
                                            <li>• Поддержка 1-2 недели</li>
                                        </ul>
                                        <Link
                                            href={`/consultations/${offlineConsultation.id}`}
                                            className="block w-full bg-white text-emerald-900 text-center py-3 rounded-xl font-semibold hover:bg-emerald-50 transition"
                                        >
                                            Записаться
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link
                                href="https://t.me/Sabina_Polatova"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-white text-emerald-900 px-8 py-3 rounded-full font-semibold hover:bg-emerald-50 transition"
                            >
                                Записаться на консультацию
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-12 px-4 bg-gray-50">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-gray-600 mb-4">
                        Бошка саволлар:
                    </p>
                    <a
                        href="https://t.me/Sabina_Polatova"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-semibold text-lg"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.037.308.021.475z" />
                        </svg>
                        @Sabina_Polatova
                    </a>
                </div>
            </section>
        </div>
    )
}
