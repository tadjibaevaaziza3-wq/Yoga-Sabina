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
            icon: <Brain className="w-8 h-8 text-wellness-gold" />,
        },
        {
            title: dictionary.landing.features.item2,
            desc: dictionary.landing.features.item2Desc,
            icon: <Activity className="w-8 h-8 text-wellness-gold" />,
        },
        {
            title: dictionary.landing.heroTitle.split("—")[0],
            desc: dictionary.landing.heroSubtitle,
            icon: <Heart className="w-8 h-8 text-wellness-gold" />,
        },
        {
            title: "Garmoniya",
            desc: "Tabiiy yosharish va go'zallik sari kompleks yo'l.",
            icon: <Sparkles className="w-8 h-8 text-wellness-gold" />,
        },
    ]

    return (
        <section className="py-24 bg-white">
            <Container>
                <div className="text-center mb-16">
                    <h2 className="text-4xl font-serif text-primary mb-4">{dictionary.landing.features.title}</h2>
                    <div className="w-24 h-1 bg-wellness-gold mx-auto rounded-full" />
                </div>

                <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {features.map((feature, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: index * 0.1 }}
                            className="p-8 rounded-3xl bg-secondary/50 border border-primary/5 hover:border-wellness-gold/30 hover:bg-white hover:shadow-2xl transition-all group"
                        >
                            <div className="mb-6 inline-flex p-4 rounded-2xl bg-white shadow-sm group-hover:scale-110 transition-transform">
                                {feature.icon}
                            </div>
                            <h3 className="text-xl font-bold text-primary mb-3">{feature.title}</h3>
                            <p className="text-sm text-primary/60 leading-relaxed">{feature.desc}</p>
                        </motion.div>
                    ))}
                </div>
            </Container>
        </section>
    )
}
