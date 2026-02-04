"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Container } from "../ui/Container"
import { Locale } from "@/dictionaries/get-dictionary"

interface HeroProps {
    lang: Locale
    dictionary: any
}

export function Hero({ lang, dictionary }: HeroProps) {
    return (
        <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-background">
            <Container className="relative z-10">
                <div className="grid lg:grid-cols-2 gap-20 items-center">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <div className="flex items-center gap-3 mb-8">
                            <span className="w-2 h-2 rounded-full bg-accent animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/40">
                                Garmoniya tana va ruhiyat
                            </span>
                        </div>

                        <h1 className="text-6xl md:text-8xl font-serif text-primary mb-10 leading-[1.05] tracking-tight">
                            Baxt sari o'z <br />
                            yo'lingizni <span className="text-secondary-foreground italic font-normal">anglang</span>
                        </h1>

                        <p className="text-lg text-primary/60 mb-12 max-w-lg leading-relaxed font-medium">
                            Akademiya metodikasi asosi va Sabina Polatovadan individual maslahatlar.
                            O'zingizni kashf eting va ichki xotirjamlikka erishing.
                        </p>

                        <div className="flex flex-wrap gap-6 mb-16">
                            <button className="btn-primary py-5 px-10 text-sm uppercase tracking-widest shadow-2xl shadow-primary/20">
                                {dictionary.common.buy}
                            </button>
                            <button className="px-10 py-5 rounded-full border border-primary/10 text-primary font-black text-sm uppercase tracking-widest hover:bg-primary/5 transition-all">
                                {dictionary.common.about}
                            </button>
                        </div>

                        {/* Social Proof */}
                        <div className="flex items-center gap-4">
                            <div className="flex -space-x-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="w-12 h-12 rounded-full border-4 border-white overflow-hidden bg-secondary">
                                        <Image src={`/images/hero.png`} alt="User" width={48} height={48} className="object-cover" />
                                    </div>
                                ))}
                            </div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-primary/40 leading-tight">
                                500+ dan ortiq <br /> o'quvchilar biz bilan
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className="relative"
                    >
                        <div className="relative aspect-[4/5] w-full max-w-[550px] mx-auto rounded-[3rem] overflow-hidden premium-shadow">
                            <Image
                                src="/images/hero.png"
                                alt="Sabina Polatova"
                                fill
                                className="object-cover"
                                priority
                            />
                        </div>

                        {/* Overlapping Info Card */}
                        <motion.div
                            initial={{ x: 30, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            className="absolute -bottom-8 -right-8 lg:right-4 bg-white/90 backdrop-blur-xl p-6 rounded-[2rem] shadow-2xl border border-white/20 min-w-[280px]"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white p-2">
                                    <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="invert" />
                                </div>
                                <div>
                                    <div className="text-xs font-black uppercase tracking-widest text-primary leading-none mb-1">Sabina Polatova</div>
                                    <div className="text-[10px] font-bold text-primary/40 uppercase tracking-widest">Yoga Murabbiyi</div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </Container>
        </section>
    )
}
