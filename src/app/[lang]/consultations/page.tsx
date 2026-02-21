'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import Image from 'next/image'
import { Header } from '@/components/Header'
import { useDictionary } from '@/components/providers/DictionaryProvider'

import { consultationsData } from "@/lib/data/consultations"

interface Consultation {
    id: string
    title: string
    description: string
    price: string | number
    type?: 'ONLINE' | 'OFFLINE'
    image?: string
    consultationFormat?: 'ONLINE' | 'OFFLINE'
}

export default function ConsultationsPage() {
    const { dictionary, lang } = useDictionary()
    const [consultations, setConsultations] = useState<Consultation[]>([])
    const [loading, setLoading] = useState(true)
    const [bannerUrl, setBannerUrl] = useState("/images/trainer-sabina.png")

    useEffect(() => {
        const fetchConsultations = async () => {
            try {
                const res = await fetch('/api/consultations')
                if (res.ok) {
                    const data = await res.json().catch(() => null)
                    if (data?.success && data.consultations && data.consultations.length > 0) {
                        setConsultations(data.consultations)
                    } else {
                        setConsultations(consultationsData[lang] as any)
                    }
                } else {
                    setConsultations(consultationsData[lang] as any)
                }
            } catch (err) {
                console.error("Consultations fetch failed", err)
                setConsultations(consultationsData[lang] as any)
            } finally {
                setLoading(false)
            }
        }
        fetchConsultations()
    }, [lang])

    if (loading) {
        return <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-gray-900 text-xl">{dictionary.consultations.loading}</div>
        </div>
    }

    const onlineConsultation = consultations.find(c => c.consultationFormat === 'ONLINE' || c.type === 'ONLINE')
    const offlineConsultation = consultations.find(c => c.consultationFormat === 'OFFLINE' || c.type === 'OFFLINE')

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section - Dark Green */}
            <section className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)] text-white pt-32 pb-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-12 items-center">
                        <div>
                            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                                {dictionary.consultations.heroTitle}
                            </h1>
                            <p className="text-xl text-[var(--secondary)] mb-8">
                                {dictionary.consultations.heroSubtitle}
                            </p>
                            <div className="flex gap-4">
                                {onlineConsultation && (
                                    <Link
                                        href={`/${lang}/consultations/${onlineConsultation.id}`}
                                        className="bg-white text-[var(--primary)] px-8 py-3 rounded-full font-semibold hover:bg-[var(--secondary)] transition"
                                    >
                                        {dictionary.consultations.onlineSession}
                                    </Link>
                                )}
                                {offlineConsultation && (
                                    <Link
                                        href={`/${lang}/consultations/${offlineConsultation.id}`}
                                        className="border-2 border-white text-white px-8 py-3 rounded-full font-semibold hover:bg-white/10 transition"
                                    >
                                        {dictionary.consultations.offlineSession}
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Circle Image Portrait */}
                        <div className="flex justify-center">
                            <div className="w-80 h-80 rounded-[3rem] bg-white/10 backdrop-blur-sm border border-white/20 overflow-hidden group shadow-2xl relative">
                                <Image
                                    src={bannerUrl}
                                    alt="Sabina Polatova"
                                    fill
                                    className="w-full h-full object-cover object-top transition-transform duration-700 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-[var(--primary)]/10 group-hover:bg-transparent transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Individual Sessions Section - Dark Green Card */}
            <section className="py-20 px-4">
                <div className="max-w-7xl mx-auto">
                    <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary)] rounded-3xl p-12 text-white relative overflow-hidden">
                        {/* Background Decoration */}
                        <div className="absolute right-0 top-0 w-1/3 h-full opacity-10">
                            <div className="absolute right-12 top-1/4 w-32 h-32 bg-white rounded-full"></div>
                            <div className="absolute right-24 bottom-1/4 w-24 h-64 bg-white rounded-full"></div>
                        </div>

                        <div className="relative z-10">
                            <p className="text-emerald-300 text-sm font-medium mb-2">{dictionary.consultations.psychologicalSupport}</p>
                            <h2 className="text-4xl md:text-5xl font-bold mb-6">
                                {dictionary.consultations.individualSessions}
                            </h2>
                            <p className="text-[var(--secondary)] text-lg mb-8 max-w-2xl">
                                {dictionary.consultations.sessionsDescription}
                            </p>

                            {/* Consultation Options Grid */}
                            <div className="grid md:grid-cols-2 gap-6 mb-8">
                                {/* Online Consultation */}
                                {onlineConsultation && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-emerald-300 text-sm mb-1">{dictionary.consultations.onlineZoom}</p>
                                                <h3 className="text-2xl font-bold">{dictionary.consultations.oneSession}</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold">{typeof onlineConsultation.price === 'number' ? (onlineConsultation.price / 1000000).toFixed(0) + 'M' : onlineConsultation.price}</p>
                                                <p className="text-emerald-200 text-sm">{dictionary.consultations.uzs}</p>
                                            </div>
                                        </div>
                                        <ul className="text-[var(--secondary)] text-sm space-y-2 mb-4">
                                            <li>{dictionary.consultations.firstSession90}</li>
                                            <li>{dictionary.consultations.nextSessions60}</li>
                                            <li>{dictionary.consultations.practicalExercises}</li>
                                            <li>{dictionary.consultations.support1_2weeks}</li>
                                        </ul>
                                        <Link
                                            href={`/${lang}/consultations/${onlineConsultation.id}`}
                                            className="block w-full bg-white text-[var(--primary)] text-center py-3 rounded-xl font-semibold hover:bg-[var(--secondary)] transition"
                                        >
                                            {dictionary.consultations.bookSession}
                                        </Link>
                                    </div>
                                )}

                                {/* Offline Consultation */}
                                {offlineConsultation && (
                                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 hover:border-white/40 transition">
                                        <div className="flex items-start justify-between mb-4">
                                            <div>
                                                <p className="text-emerald-300 text-sm mb-1">{dictionary.consultations.offlineLive}</p>
                                                <h3 className="text-2xl font-bold">{dictionary.consultations.oneSession}</h3>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-3xl font-bold">{typeof offlineConsultation.price === 'number' ? (offlineConsultation.price / 1000000).toFixed(0) + 'M' : offlineConsultation.price}</p>
                                                <p className="text-emerald-200 text-sm">{dictionary.consultations.uzs}</p>
                                            </div>
                                        </div>
                                        <ul className="text-[var(--secondary)] text-sm space-y-2 mb-4">
                                            <li>{dictionary.consultations.firstSession90}</li>
                                            <li>{dictionary.consultations.nextSessions60}</li>
                                            <li>{dictionary.consultations.practicalExercises}</li>
                                            <li>{dictionary.consultations.support1_2weeks}</li>
                                        </ul>
                                        <Link
                                            href={`/${lang}/consultations/${offlineConsultation.id}`}
                                            className="block w-full bg-white text-[var(--primary)] text-center py-3 rounded-xl font-semibold hover:bg-[var(--secondary)] transition"
                                        >
                                            {dictionary.consultations.bookSession}
                                        </Link>
                                    </div>
                                )}
                            </div>

                            <Link
                                href={dictionary.common.telegramBot}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-white text-[var(--primary)] px-8 py-3 rounded-full font-semibold hover:bg-[var(--secondary)] transition"
                            >
                                {dictionary.consultations.bookViaBot}
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section className="py-12 px-4 bg-gray-50">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-gray-600 mb-4">
                        {dictionary.consultations.otherQuestions}
                    </p>
                    <a
                        href={`https://t.me/${dictionary.common.adminContact.replace('@', '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary)] font-semibold text-lg"
                    >
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.562 8.161c-.18 1.897-.962 6.502-1.359 8.627-.168.9-.5 1.201-.82 1.23-.697.064-1.226-.461-1.901-.903-1.056-.692-1.653-1.123-2.678-1.799-1.185-.781-.417-1.21.258-1.911.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.139-5.062 3.345-.479.329-.913.489-1.302.481-.428-.008-1.252-.241-1.865-.44-.752-.244-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.831-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.477-1.635.099-.002.321.023.465.141.121.099.155.232.171.326.016.094.037.308.021.475z" />
                        </svg>
                        {dictionary.common.adminContact}
                    </a>
                </div>
            </section>
        </div>
    )
}
