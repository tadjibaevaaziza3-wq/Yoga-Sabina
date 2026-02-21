"use client"

import { Container } from "../ui/Container"
import { motion } from "framer-motion"
import { Play } from "lucide-react"
import { useState } from "react"
import { useDictionary } from "../providers/DictionaryProvider"

export function IntroSection({ videoUrl = "/intro-video.mp4", bannerUrl = "/images/hero.png" }: { videoUrl?: string, bannerUrl?: string }) {
    const { dictionary } = useDictionary()
    const [isPlaying, setIsPlaying] = useState(false)

    return (
        <section className="relative pt-32 pb-40 overflow-hidden min-h-[90vh] flex items-center justify-center">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[120%] h-[120%] bg-gradient-to-b from-[#f6f9fe] via-[#f0f4f8] to-[#f6f9fe] -z-10" />
            <div className="absolute top-20 left-10 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[120px] -z-10" />
            <div className="absolute bottom-20 right-10 w-96 h-96 bg-[var(--primary)]/5 rounded-full blur-[120px] -z-10" />

            <Container className="relative">
                <div className="max-w-5xl mx-auto text-center mb-24 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="inline-block"
                    >
                        <h2 className="text-6xl md:text-[8rem] font-editorial font-bold text-[var(--primary)] mb-8 tracking-[-0.03em] leading-[0.9]">
                            {dictionary.landing.introTitle || "Kurs haqida video-tanishtiruv"}
                        </h2>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.15 }}
                        className="text-xl md:text-3xl text-[var(--primary)]/60 font-light tracking-wide max-w-3xl mx-auto leading-relaxed font-sans"
                    >
                        {dictionary.landing.introSubtitle}
                    </motion.p>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="relative max-w-6xl mx-auto aspect-video rounded-[3rem] overflow-hidden shadow-2xl shadow-[var(--primary)]/10 border border-[var(--primary)]/5 group bg-white"
                >
                    {!isPlaying ? (
                        <div className="absolute inset-0 flex items-center justify-center z-10">
                            <div className="absolute inset-0 bg-black/5 group-hover:bg-black/10 transition-colors duration-700"></div>

                            {/* Cinematic Play Button */}
                            <button
                                onClick={() => setIsPlaying(true)}
                                className="w-28 h-28 md:w-36 md:h-36 rounded-full bg-white/90 backdrop-blur-xl text-[var(--primary)] flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 z-20 group/btn relative overflow-hidden shadow-2xl"
                            >
                                <div className="absolute inset-0 bg-[var(--accent)]/20 scale-0 group-hover/btn:scale-100 transition-transform duration-500 rounded-full" />
                                <Play className="w-10 h-10 md:w-14 md:h-14 fill-current text-[var(--primary)] relative z-10 ml-2" />
                            </button>
                        </div>
                    ) : null}

                    {isPlaying && (
                        <video
                            autoPlay
                            controls
                            className="w-full h-full object-cover"
                            onPause={() => setIsPlaying(false)}
                        >
                            <source src={videoUrl} type="video/mp4" />
                        </video>
                    )}

                    {/* Thumbnail placeholder */}
                    {!isPlaying && (
                        <div className="w-full h-full relative">
                            <div className="absolute inset-0 bg-gradient-to-t from-[var(--primary)]/20 to-transparent z-[1]" />
                            <div className="w-full h-full bg-cover bg-center transition-transform duration-1000 scale-100 group-hover:scale-105" style={{ backgroundImage: `url(${bannerUrl})` }}></div>
                        </div>
                    )}
                </motion.div>
            </Container>
        </section >
    )
}


