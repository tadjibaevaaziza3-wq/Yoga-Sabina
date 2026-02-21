"use client"

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useDictionary } from '../providers/DictionaryProvider'
import Image from 'next/image'
import { Container } from '../ui/Container'

interface Course {
    id: string
    title: string
    titleRu?: string
    description: string
    descriptionRu?: string
    price: number
    type: 'ONLINE' | 'OFFLINE'
    productType: string
    coverImage?: string
    features?: any
    durationDays?: number
    durationLabel?: string
}

export function ProgramsSection({
    onlineBgUrl = "/images/online-bg.jpg",
    offlineBgUrl = "/images/offline-bg.jpg",
    consultationBgUrl = "/images/consultation-bg.jpg",
    isConsultationEnabled = true
}: {
    onlineBgUrl?: string,
    offlineBgUrl?: string,
    consultationBgUrl?: string,
    isConsultationEnabled?: boolean
}) {
    const { dictionary, lang } = useDictionary()
    const [courses, setCourses] = useState<Course[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
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

    return (
        <section className="py-40 bg-[var(--background)] relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute top-0 left-0 w-full h-full opacity-30 pointer-events-none"
                style={{ backgroundImage: 'radial-gradient(circle at 50% 50%, var(--accent) 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

            <Container className="relative z-10">
                {/* Section Header */}
                <div className="text-center mb-40">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-[var(--accent)] font-bold uppercase tracking-[0.6em] text-[10px] mb-6 block">
                            The Collection
                        </span>
                        <h2 className="text-6xl md:text-9xl font-editorial font-bold text-[var(--primary)] mb-8 tracking-tighter leading-[0.85]">
                            {dictionary.courses.title}
                        </h2>
                        <div className="w-px h-24 bg-[var(--primary)]/20 mx-auto mt-12"></div>
                    </motion.div>
                </div>

                {/* Programs Entry Points - Magazine Style */}
                <div className="space-y-40">
                    {/* Online Choice Card */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="group relative"
                    >
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div className="relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden rounded-[3rem] shadow-2xl">
                                <Image
                                    src={onlineBgUrl}
                                    alt="Online Yoga"
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-[var(--primary)]/10 group-hover:bg-transparent transition-colors duration-700"></div>
                            </div>

                            <div className="space-y-10 lg:-ml-24 relative z-10 bg-[var(--background)]/90 backdrop-blur-sm p-12 lg:p-20 rounded-[3rem] shadow-soft border border-[var(--primary)]/5">
                                <span className="inline-block px-6 py-2 rounded-full border border-[var(--primary)]/20 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--primary)]">
                                    Volume 01
                                </span>
                                <h3 className="text-5xl md:text-7xl font-editorial font-bold text-[var(--primary)] leading-[0.9] tracking-tight">
                                    {dictionary.courses.onlineTitle}
                                </h3>
                                <p className="text-[var(--primary)]/60 text-xl font-medium leading-relaxed max-w-md tracking-wide">
                                    {dictionary.courses.onlineDesc}
                                </p>
                                <Link
                                    href={`/${lang}/online-courses`}
                                    className="inline-flex items-center gap-4 text-[var(--primary)] font-bold uppercase tracking-[0.3em] text-[11px] group/btn mt-8"
                                >
                                    <span>{dictionary.courses.details}</span>
                                    <span className="w-12 h-px bg-[var(--primary)] group-hover/btn:w-20 transition-all duration-300"></span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>

                    {/* Offline Choice Card - Reversed */}
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="group relative"
                    >
                        <div className="grid lg:grid-cols-2 gap-20 items-center">
                            <div className="lg:order-2 relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden rounded-[3rem] shadow-2xl">
                                <Image
                                    src={offlineBgUrl}
                                    alt="Offline Yoga"
                                    fill
                                    className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                />
                                <div className="absolute inset-0 bg-[var(--primary)]/10 group-hover:bg-transparent transition-colors duration-700"></div>
                            </div>

                            <div className="lg:order-1 space-y-10 lg:-mr-24 relative z-10 bg-[var(--background)]/90 backdrop-blur-sm p-12 lg:p-20 rounded-[3rem] shadow-soft border border-[var(--primary)]/5 text-right items-end flex flex-col">
                                <span className="inline-block px-6 py-2 rounded-full border border-[var(--primary)]/20 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--primary)]">
                                    Volume 02
                                </span>
                                <h3 className="text-5xl md:text-7xl font-editorial font-bold text-[var(--primary)] leading-[0.9] tracking-tight">
                                    {dictionary.courses.offlineTitle}
                                </h3>
                                <p className="text-[var(--primary)]/60 text-xl font-medium leading-relaxed max-w-md tracking-wide ml-auto">
                                    {dictionary.courses.offlineDesc}
                                </p>
                                <Link
                                    href={`/${lang}/offline-courses`}
                                    className="inline-flex items-center gap-4 text-[var(--primary)] font-bold uppercase tracking-[0.3em] text-[11px] group/btn mt-8 flex-row-reverse"
                                >
                                    <span>{dictionary.courses.details}</span>
                                    <span className="w-12 h-px bg-[var(--primary)] group-hover/btn:w-20 transition-all duration-300"></span>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                    {/* Consultation Choice Card (Volume 03) */}
                    {isConsultationEnabled && (
                        <motion.div
                            initial={{ opacity: 0, y: 40 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="group relative"
                        >
                            <div className="grid lg:grid-cols-2 gap-20 items-center">
                                <div className="relative aspect-[4/5] lg:aspect-[3/4] overflow-hidden rounded-[3rem] shadow-2xl">
                                    <Image
                                        src={consultationBgUrl}
                                        alt="Consultation"
                                        fill
                                        className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                    />
                                    <div className="absolute inset-0 bg-[var(--primary)]/10 group-hover:bg-transparent transition-colors duration-700"></div>
                                </div>

                                <div className="space-y-10 lg:-ml-24 relative z-10 bg-[var(--background)]/90 backdrop-blur-sm p-12 lg:p-20 rounded-[3rem] shadow-soft border border-[var(--primary)]/5">
                                    <span className="inline-block px-6 py-2 rounded-full border border-[var(--primary)]/20 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--primary)]">
                                        Volume 03
                                    </span>
                                    <h3 className="text-4xl md:text-6xl font-editorial font-bold text-[var(--primary)] leading-[0.9] tracking-tight">
                                        {lang === 'uz' ? 'Individual Konsultatsiya' : 'Индивидуальная Консультация'}
                                    </h3>
                                    <p className="text-[var(--primary)]/60 text-xl font-medium leading-relaxed max-w-md tracking-wide">
                                        {lang === 'uz' ? "Sizning shaxsiy ehtiyojlaringizga moslashtirilgan yakkama-yakka yordam." : "Индивидуальная помощь, адаптированная к вашим личным потребностям."}
                                    </p>
                                    <Link
                                        href={`/${lang}/consultations`}
                                        className="inline-flex items-center gap-4 text-[var(--primary)] font-bold uppercase tracking-[0.3em] text-[11px] group/btn mt-8"
                                    >
                                        <span>{lang === 'uz' ? 'Batafsil' : 'Подробнее'}</span>
                                        <span className="w-12 h-px bg-[var(--primary)] group-hover/btn:w-20 transition-all duration-300"></span>
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </div>
            </Container>
        </section>
    )
}
