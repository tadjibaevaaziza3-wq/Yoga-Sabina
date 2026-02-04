'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

interface Consultation {
    id: string
    title: string
    description: string
    price: number
    consultationFormat: 'ONLINE' | 'OFFLINE'
}

interface PageProps {
    params: Promise<{ id: string }>
}

export default function ConsultationDetailPage({ params }: PageProps) {
    const router = useRouter()
    const [consultation, setConsultation] = useState<Consultation | null>(null)
    const [loading, setLoading] = useState(true)
    const [id, setId] = useState<string>('')

    useEffect(() => {
        params.then(p => {
            setId(p.id)
            fetch(`/api/consultations/${p.id}`)
                .then(res => res.json())
                .then(data => {
                    if (data.success) {
                        setConsultation(data.consultation)
                    }
                    setLoading(false)
                })
                .catch(err => {
                    console.error(err)
                    setLoading(false)
                })
        })
    }, [params])

    const handlePurchase = async () => {
        // TODO: Integrate with PayMe
        // For now, just redirect to success page
        router.push(`/consultations/${id}/success`)
    }

    if (loading) {
        return <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-700 flex items-center justify-center">
            <div className="text-white text-xl">Загрузка...</div>
        </div>
    }

    if (!consultation) {
        return <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-700 flex items-center justify-center">
            <div className="text-white text-xl">Консультация не найдена</div>
        </div>
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-emerald-900 to-emerald-700 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Back Button */}
                <button
                    onClick={() => router.back()}
                    className="text-emerald-200 hover:text-white mb-6 flex items-center gap-2"
                >
                    ← Назад
                </button>

                {/* Card */}
                <motion.div
                    className="bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    {/* Format Badge */}
                    <div className="mb-6">
                        <span className={`inline-block px-6 py-3 rounded-full text-sm font-semibold ${consultation.consultationFormat === 'ONLINE'
                                ? 'bg-blue-500/20 text-blue-200 border border-blue-400/50'
                                : 'bg-coral-500/20 text-coral-200 border border-coral-400/50'
                            }`}>
                            {consultation.consultationFormat === 'ONLINE' ? '💻 ONLINE СЕССИЯ' : '🏢 ОФЛАЙН СЕССИЯ'}
                        </span>
                    </div>

                    {/* Title */}
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-6">
                        {consultation.title}
                    </h1>

                    {/* Price */}
                    <div className="mb-8">
                        <span className="text-5xl font-bold text-emerald-300">
                            {(consultation.price / 1000000).toFixed(1)}M
                        </span>
                        <span className="text-2xl text-emerald-200 ml-2">сўм</span>
                    </div>

                    {/* Description */}
                    <div className="bg-white/5 rounded-2xl p-6 mb-8">
                        <div className="text-emerald-100 whitespace-pre-line leading-relaxed">
                            {consultation.description}
                        </div>
                    </div>

                    {/* CTA Button */}
                    <button
                        onClick={handlePurchase}
                        className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        Оплатить через PayMe
                    </button>

                    {/* Info */}
                    <p className="text-center text-emerald-200 mt-6 text-sm">
                        Безопасная оплата через PayMe
                    </p>
                </motion.div>

                {/* Contact Info */}
                <motion.div
                    className="mt-8 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
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
