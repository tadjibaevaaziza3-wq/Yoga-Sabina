"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Container } from "../ui/Container"
import { useDictionary } from "../providers/DictionaryProvider"
import Image from "next/image"

export function Hero({ photoUrl = "/images/hero-sabina.png" }: { photoUrl?: string }) {
    const { dictionary, lang } = useDictionary()

    return (
        <section className="relative bg-[var(--background)] text-[var(--foreground)] pt-64 pb-48 overflow-hidden">
            {/* Abstract Background Shapes */}
            <div className="absolute top-0 right-0 w-1/2 h-full bg-[var(--accent)]/[0.03] blur-3xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
            <div className="absolute bottom-0 left-0 w-1/3 h-1/2 bg-[var(--primary)]/[0.01] blur-3xl rounded-full -translate-x-1/2 translate-y-1/2"></div>

            <Container className="relative z-10">
                <div className="grid lg:grid-cols-2 gap-24 items-center">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex flex-col gap-6 mb-12">
                            <div className="inline-flex items-center gap-3 px-6 py-2 rounded-full bg-[var(--accent)]/5 border border-[var(--accent)]/10 w-fit">
                                <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse"></span>
                                <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--accent)]">
                                    {dictionary.landing.heroBadge || "Garmoniya va Go'zallik"}
                                </span>
                            </div>
                            <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--primary)]/40 ml-1">
                                By Sabina Polatova
                            </div>
                        </div>

                        <h1 className="text-7xl md:text-8xl lg:text-[10rem] font-editorial font-bold mb-12 leading-[0.8] tracking-tight text-[var(--primary)]">
                            {dictionary.landing.heroTitle}
                        </h1>

                        <p className="text-xl text-[var(--primary)]/50 mb-16 max-w-xl leading-relaxed font-medium tracking-wide">
                            {dictionary.landing.heroSubtitle}
                        </p>

                        <div className="flex flex-wrap gap-8">
                            <Link
                                href={`/${lang}/online-courses`}
                                className="group relative px-12 py-6 bg-[var(--primary)] text-white rounded-[2.5rem] font-bold text-xs uppercase tracking-[0.3em] overflow-hidden transition-all hover:scale-105 active:scale-95 shadow-2xl shadow-[var(--primary)]/10"
                            >
                                <span className="relative z-10">{dictionary.courses.online}</span>
                            </Link>
                            <button
                                className="px-12 py-6 border border-[var(--primary)]/10 text-[var(--primary)] rounded-[2.5rem] font-bold text-xs uppercase tracking-[0.3em] hover:bg-[var(--primary)]/5 transition-all"
                            >
                                {dictionary.common.about}
                            </button>
                        </div>

                        {/* Social Proof */}
                        <div className="mt-24 flex items-center gap-8">
                            <div className="flex -space-x-3">
                                {[
                                    "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop",
                                    "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop",
                                    "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                                ].map((url, i) => (
                                    <div key={i} className="w-10 h-10 rounded-full border-2 border-[var(--background)] overflow-hidden bg-[var(--accent)]/10">
                                        <Image src={url} alt="User" width={40} height={40} className="w-full h-full object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-[10px] font-bold text-[var(--primary)]/30 uppercase tracking-[0.2em]">
                                <span className="text-[var(--primary)] font-black mr-2">500+</span>
                                {dictionary.landing.happyClients || "Baxtli a'zolar"}
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Content - Trainer Portrait */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, delay: 0.2 }}
                        className="relative"
                    >
                        <div className="relative aspect-[4/5] rounded-[4rem] lg:rounded-[6rem] overflow-hidden shadow-soft group">
                            <Image
                                src={photoUrl}
                                alt="Sabina Polatova"
                                fill
                                className="object-cover transition-transform duration-1000 group-hover:scale-105"
                                style={{ objectPosition: 'center top' }}
                                priority
                            />
                            {/* Overlay Gradient - Softer */}
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/20 via-transparent to-transparent"></div>

                            {/* Float Badge - Ultra Minimalist */}
                            <div className="absolute bottom-10 left-10 right-10 p-10 bg-white/60 backdrop-blur-3xl border border-white/30 rounded-[3.5rem] shadow-xl">
                                <div className="text-[9px] font-bold uppercase tracking-[0.4em] text-[var(--accent)] mb-3">Sabina Polatova</div>
                                <div className="text-base font-serif italic text-[var(--primary)]/80 leading-snug">
                                    {lang === 'uz' ? '7 yillik tajribaga ega Yoga murabbiyi va Yoga-terapevt' : '7 лет опыта, Йога-тренер и Йога-терапевт'}
                                </div>
                            </div>
                        </div>

                        {/* Decorative Circles - Accent Tan */}
                        <div className="absolute -top-16 -right-16 w-64 h-64 bg-[var(--accent)]/5 blur-3xl rounded-full"></div>
                        <div className="absolute -bottom-16 -left-16 w-80 h-80 bg-[var(--accent)]/5 blur-3xl rounded-full"></div>
                    </motion.div>
                </div>
            </Container>
        </section>
    )
}


