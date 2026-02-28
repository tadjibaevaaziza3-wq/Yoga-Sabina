"use client"

import { Container } from "../ui/Container"
import { motion } from "framer-motion"
import { useDictionary } from "../providers/DictionaryProvider"
import Image from "next/image"

interface TrainerSectionProps {
    photoUrl?: string;
    trainerName?: string;
    trainerBio?: string;
}

export function TrainerSection({ photoUrl = "/images/trainer-sabina.png", trainerName, trainerBio }: TrainerSectionProps) {
    const { dictionary } = useDictionary()

    return (
        <section className="py-40 bg-[var(--secondary)] relative overflow-hidden">
            <Container>
                <div className="grid lg:grid-cols-12 gap-12 items-center">
                    {/* Left Side: Photo (Spans 5 cols) */}
                    <div className="lg:col-span-5 relative z-10">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                            className="relative aspect-[3/4] rounded-[2rem] overflow-hidden shadow-2xl shadow-[var(--primary)]/20"
                        >
                            <Image
                                src={photoUrl}
                                alt={trainerName || 'Sabina Polatova'}
                                fill
                                className="object-cover"
                                style={{ objectPosition: 'center top' }}
                            />
                            {/* Inner Border for framing */}
                            <div className="absolute inset-4 border border-white/20 rounded-[1.5rem] z-20"></div>
                        </motion.div>

                        {/* Decorative Circle behind */}
                        <div className="absolute top-10 -left-10 w-full h-full bg-[var(--accent)]/20 rounded-full blur-[80px] -z-10"></div>
                    </div>

                    {/* Right Side: Editorial Content (Spans 7 cols) */}
                    <div className="lg:col-span-7 relative">
                        <div className="relative z-10 space-y-10 pl-0 lg:pl-10">
                            <div>
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    className="flex items-center gap-4 mb-4"
                                >
                                    <span className="h-px w-12 bg-[var(--primary)]"></span>
                                    <span className="text-sm font-bold uppercase tracking-[0.3em] text-[var(--primary)]">
                                        {dictionary.landing.trainerTitle}
                                    </span>
                                </motion.div>

                                <motion.h3
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.1 }}
                                    className="text-6xl md:text-8xl font-editorial font-bold text-[var(--primary)] leading-none tracking-tight mb-8"
                                >
                                    {(trainerName || dictionary.landing.trainerName || 'Sabina Polatova').split(' ')[0]} <br />
                                    <span className="text-[var(--accent)] italic font-light">{(trainerName || dictionary.landing.trainerName || 'Sabina Polatova').split(' ')[1]}</span>
                                </motion.h3>
                            </div>

                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl md:text-2xl text-[var(--primary)]/70 font-light leading-relaxed font-sans max-w-2xl"
                            >
                                <p className="mb-6">{trainerBio || dictionary.landing.trainerBio1}</p>
                            </motion.div>

                            {/* Magazine Pull Quote */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.3 }}
                                className="border-l-4 border-[var(--accent)] pl-8 py-2 max-w-xl"
                            >
                                <p className="text-2xl md:text-3xl font-editorial italic text-[var(--primary)] leading-tight" style={{ fontFamily: 'var(--font-playfair)' }}>
                                    "{dictionary.landing.trainerBio2}"
                                </p>
                            </motion.div>

                            {/* Signature Block */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                whileInView={{ opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="pt-8 flex flex-wrap gap-6 items-center"
                            >
                                <div className="flex gap-3">
                                    {["Yoga-terapiya", "Mindfulness", "Holistic Health"].map((tag, i) => (
                                        <span key={i} className="px-4 py-2 border border-[var(--primary)]/10 rounded-full text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]/60">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                                <div className="h-px bg-[var(--primary)]/10 flex-1"></div>
                                <span className="italic text-2xl text-[var(--accent)]" style={{ fontFamily: 'var(--font-playfair)' }}>{(trainerName || 'Sabina Polatova').split(' ')[0].charAt(0)}. {(trainerName || 'Sabina Polatova').split(' ').pop()?.charAt(0)}.</span>
                            </motion.div>
                        </div>
                    </div>
                </div>
            </Container>
        </section>
    )
}
