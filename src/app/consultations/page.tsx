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
        return <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-700 flex items-center justify-center">
            <div className="text-white text-xl">Загрузка...</div>
        </div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-700 py-12 px-4">
            {/* Hero Section */}
            <div className="max-w-6xl mx-auto mb-12">
                <motion.h1
                    className="text-4xl md:text-5xl font-bold text-white text-center mb-6"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    Психологическая Консультация (женская)
                </motion.h1>
                <motion.p
                    className="text-lg text-emerald-100 text-center max-w-3xl mx-auto"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    📚 Сессияларим 90% психологик техникадардан иборат. Ҳаётга бошқача қарашни бошлайсиз💫✨
                </motion.p>
            </div>

            {/* Consultations Grid */}
            <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
                {consultations.map((consultation, index) => (
                    <motion.div
                        key={consultation.id}
                        className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:border-white/40 transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        {/* Format Badge */}
                        <div className="mb-4">
                            <span className={`inline-block px-4 py-2 rounded-full text-sm font-semibold ${consultation.consultationFormat === 'ONLINE'
                                    ? 'bg-blue-500/20 text-blue-200 border border-blue-400/50'
                                    : 'bg-coral-500/20 text-coral-200 border border-coral-400/50'
                                }`}>
                                {consultation.consultationFormat === 'ONLINE' ? '💻 ONLINE' : '🏢 OFFLINE'}
                            </span>
                        </div>

                        {/* Title */}
                        <h3 className="text-2xl font-bold text-white mb-4">
                            {consultation.title}
                        </h3>

                        {/* Price */}
                        <div className="mb-6">
                            <span className="text-4xl font-bold text-emerald-300">
                                {(consultation.price / 1000000).toFixed(0)}M
                            </span>
                            <span className="text-emerald-200 ml-2">сўм</span>
                        </div>

                        {/* Short Description */}
                        <p className="text-emerald-100 mb-6 line-clamp-3">
                            {consultation.description}
                        </p>

                        {/* CTA Button */}
                        <Link
                            href={`/consultations/${consultation.id}`}
                            className="block w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-semibold py-3 px-6 rounded-xl text-center transition-all duration-300 transform hover:scale-105"
                        >
                            Подробнее
                        </Link>
                    </motion.div>
                ))}
            </div>

            {/* Footer Info */}
            <div className="max-w-4xl mx-auto mt-12 text-center">
                <motion.div
                    className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                >
                    <p className="text-emerald-100 mb-2">
                        Бошка саволлар:
                    </p>
                    <a
                        href="https://t.me/Sabina_Polatova"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block text-emerald-300 hover:text-emerald-200 font-semibold text-lg"
                    >
                        @Sabina_Polatova
                    </a>
                </motion.div>
            </div>
        </div>
    )
}
