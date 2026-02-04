"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Container } from "../ui/Container"
import { Locale } from "@/dictionaries/get-dictionary"

interface HeroProps {
    lang: Locale
    dictionary: any
}

export function Hero({ lang, dictionary }: HeroProps) {
    return (
        <section className="relative bg-gradient-to-r from-emerald-900 to-emerald-800 text-white py-24 overflow-hidden">
            {/* Video Background with Overlay */}
            <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
                <video
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-full object-cover"
                >
                    <source src="/intro-video.mp4" type="video/mp4" />
                </video>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 to-emerald-900/90"></div>
            </div>

            <Container className="relative z-10">
                <div className="grid lg:grid-cols-2 gap-12 items-center min-h-[600px]">
                    {/* Left Content */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                            Гармония тела и<br />
                            <span className="italic font-serif font-normal">души</span>
                        </h1>

                        <p className="text-xl text-emerald-100 mb-8 max-w-xl leading-relaxed">
                            Онлайн-курсы и офлайн-программы с применением психологической
                            работы, йоги и дыхания для женщин. Ваша жизнь изменится уж сегодня.
                        </p>

                        <div className="flex flex-wrap gap-4">
                            <Link
                                href={`/${lang}/online-courses`}
                                className="bg-white text-emerald-900 px-8 py-3 rounded-full font-bold hover:bg-emerald-50 transition shadow-xl shadow-emerald-900/10"
                            >
                                Online Kurslar
                            </Link>
                            <Link
                                href={`/${lang}/offline-courses`}
                                className="border-2 border-white text-white px-8 py-3 rounded-full font-bold hover:bg-white/10 transition"
                            >
                                Offline Kurslar
                            </Link>
                        </div>
                    </motion.div>

                    {/* Right Content - Circle Image */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="flex justify-center lg:justify-end"
                    >
                        <div className="relative w-96 h-96">
                            {/* Glowing Background */}
                            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-emerald-400/20 to-emerald-600/20 blur-3xl"></div>

                            {/* Circle Image Container */}
                            <div className="relative w-full h-full rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                                <img
                                    src="/images/hero.png"
                                    alt="Sabina Polatova"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Container>

            {/* Bottom Wave Decoration */}
            <div className="absolute bottom-0 left-0 right-0">
                <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                    <path d="M0 0L60 10C120 20 240 40 360 46.7C480 53 600 47 720 43.3C840 40 960 40 1080 46.7C1200 53 1320 67 1380 73.3L1440 80V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0V0Z" fill="white" />
                </svg>
            </div>
        </section>
    )
}
