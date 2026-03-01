"use client"

import { Container } from "../ui/Container"
import { motion } from "framer-motion"
import { useDictionary } from "../providers/DictionaryProvider"
import { CheckCircle2, Sparkles, Heart, Activity } from "lucide-react"
import { StructuredData } from "../seo/StructuredData"

interface AboutSectionProps {
    aboutText?: string;
    heroTitle?: string;
    missionText?: string;
}

export function AboutSection({ aboutText, heroTitle, missionText }: AboutSectionProps) {
    const { dictionary } = useDictionary()

    const features = [
        {
            icon: <Activity className="w-6 h-6 text-[var(--accent)]" />,
            title: dictionary.landing.features.item1,
            desc: dictionary.landing.features.item1Desc
        },
        {
            icon: <Sparkles className="w-6 h-6 text-[var(--accent)]" />,
            title: dictionary.landing.features.item2,
            desc: dictionary.landing.features.item2Desc
        }
    ]

    const personSchema = {
        "@context": "https://schema.org",
        "@type": "Person",
        "name": "Sabina Polatova",
        "jobTitle": "Yoga Therapist",
        "image": "https://baxtli-men.uz/images/hero-sabina.png",
        "description": "Сабина Полатова — сертифицированный йога-тренер и йога-терапевт с 7-летним стажем. Специалист по оздоровлению и внутреннему балансу для всех.",
        "sameAs": [
            "https://www.instagram.com/sabina_yogatrener?igsh=MXg2bXI0bXpkcnNzcQ==",
            "https://t.me/baxtlimen"
        ],
        "worksFor": {
            "@type": "Organization",
            "name": "Baxtli Men Academy"
        }
    };

    return (
        <section className="py-56 bg-[#faf9f0]/40 relative">
            <StructuredData data={personSchema} id="person-schema" />
            <Container>
                <div className="grid lg:grid-cols-2 gap-32 items-start">
                    {/* Detailed Description */}
                    <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="space-y-12"
                    >
                        <div className="space-y-8">
                            <h2 className="text-6xl md:text-8xl font-editorial font-bold text-[var(--primary)] leading-[0.9] tracking-tight">
                                {heroTitle || dictionary.landing.heroTitle}
                            </h2>
                            <div className="w-20 h-1 bg-[var(--accent)]/20 rounded-full" />
                        </div>

                        <div className="space-y-10">
                            <p className="text-2xl text-[var(--primary)]/60 font-medium leading-relaxed tracking-wide">
                                {aboutText || dictionary.landing.programDesc1 || dictionary.landing.heroSubtitle}
                            </p>
                            <p className="text-lg text-[var(--primary)]/50 leading-relaxed font-serif italic bg-white p-12 rounded-[5rem] border border-[var(--accent)]/5 shadow-soft">
                                {dictionary.landing.programDesc2}
                            </p>
                        </div>

                        <div className="flex items-center gap-10 p-12 bg-[var(--primary)] rounded-[5rem] text-white shadow-soft relative overflow-hidden group lg:translate-x-12 lg:-translate-y-8">
                            <div className="w-24 h-24 rounded-[2rem] bg-white/5 flex items-center justify-center shrink-0 border border-white/10 group-hover:scale-110 transition-transform">
                                <Heart className="w-12 h-12 text-[var(--accent)]/60 fill-current" />
                            </div>
                            <div className="relative z-10">
                                <div className="text-[10px] font-bold uppercase tracking-[0.5em] text-[var(--accent)]/60 mb-3">Missiya</div>
                                <div className="text-2xl font-serif italic text-white/90 leading-tight">
                                    {missionText || "Sog'lom ideal qomat, aqliy etuklik va ruhiy hotirjamlikka erishish."}
                                </div>
                            </div>
                            {/* Decorative background shape */}
                            <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 blur-3xl rounded-full"></div>
                        </div>
                    </motion.div>

                    {/* Features Grid */}
                    <div className="space-y-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="bg-white p-16 rounded-[5rem] shadow-soft border border-[var(--accent)]/5 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 w-48 h-48 bg-[var(--accent)]/5 rounded-full -mr-24 -mt-24 blur-3xl opacity-50" />

                            <h3 className="text-3xl font-editorial font-bold text-[var(--primary)] mb-12 tracking-tight">
                                {dictionary.landing.features.title}
                            </h3>

                            <div className="space-y-12">
                                {features.map((feature, i) => (
                                    <div key={i} className="flex gap-8 group">
                                        <div className="w-20 h-20 rounded-[1.5rem] bg-[var(--background)] flex items-center justify-center shrink-0 group-hover:bg-[var(--accent)] group-hover:text-white transition-all duration-500 shadow-sm">
                                            {feature.icon}
                                        </div>
                                        <div className="space-y-3">
                                            <h4 className="text-xl font-serif font-bold text-[var(--primary)] tracking-tight">{feature.title}</h4>
                                            <p className="text-base text-[var(--primary)]/50 font-medium leading-relaxed tracking-wide">{feature.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.2 }}
                            className="grid grid-cols-2 gap-8"
                        >
                            {[
                                "Gormonal tizim",
                                "Qon aylanishi",
                                "Metabolizm",
                                "Asab tizimi"
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 p-8 bg-white rounded-[2rem] border border-[var(--accent)]/5 shadow-soft group hover:bg-[var(--background)] transition-colors">
                                    <CheckCircle2 className="w-6 h-6 text-[var(--accent)] group-hover:scale-125 transition-transform" />
                                    <span className="text-base font-bold text-[var(--primary)]/70 uppercase tracking-widest text-[9px]">{item}</span>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div >
            </Container >
        </section >
    )
}


