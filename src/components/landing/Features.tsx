"use client"

import { motion } from "framer-motion"
import { Container } from "../ui/Container"
import { Sparkles, Heart, Activity, Brain } from "lucide-react"

interface FeaturesProps {
    lang: string
    dictionary: any
}

export function Features({ lang, dictionary }: FeaturesProps) {
    const features = [
        {
            title: dictionary.landing.features.item1,
            desc: dictionary.landing.features.item1Desc,
            icon: <Brain className="w-8 h-8 text-[var(--accent)]" />,
        },
        {
            title: dictionary.landing.features.item2,
            desc: dictionary.landing.features.item2Desc,
            icon: <Activity className="w-8 h-8 text-[var(--accent)]" />,
        },
        {
            title: dictionary.landing.heroTitle.split("—")[0],
            desc: dictionary.landing.heroSubtitle,
            icon: <Heart className="w-8 h-8 text-[var(--accent)]" />,
        },
        {
            title: "Garmoniya",
            desc: "Tabiiy yosharish va go'zallik sari kompleks yo'l.",
            icon: <Sparkles className="w-8 h-8 text-[var(--accent)]" />,
        },
    ]

    return (
        <section className="py-32 bg-[var(--primary)] text-white relative overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('/images/noise.png')] opacity-5 mix-blend-overlay pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/4 w-96 h-96 bg-[var(--accent)]/10 rounded-full blur-[100px] pointer-events-none"></div>

            <Container className="relative z-10">
                <div className="text-center mb-20">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-5xl md:text-7xl font-editorial font-bold text-white mb-6 tracking-tight">
                            {dictionary.landing.features.title}
                        </h2>
                        <div className="w-24 h-1 bg-[var(--accent)] mx-auto rounded-full opacity-60" />
                    </motion.div>
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-[2.5rem] bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[var(--accent)]/30 transition-all duration-500 group backdrop-blur-sm"
                        >
                            <div className="mb-8 inline-flex p-4 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] group-hover:scale-110 transition-transform duration-500 border border-[var(--accent)]/10">
                                {feature.icon && typeof feature.icon !== 'string' ?
                                    <feature.icon.type {...feature.icon.props} className="w-8 h-8" /> :
                                    <span>{feature.icon || "✨"}</span>
                                }
                            </div>
                            <h3 className="text-2xl font-editorial font-bold text-white mb-4 tracking-wide">{feature.title}</h3>
                            <p className="text-base text-white/70 leading-relaxed font-light tracking-wide">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
