"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { ChevronRight, Heart, Sparkles, User, Users } from "lucide-react"
import { Locale } from "@/dictionaries/types"
import { cn } from "@/lib/utils"

interface CourseCardProps {
    id: string
    title: string
    description: string
    price: string
    duration: string
    type: 'ONLINE' | 'OFFLINE'
    imageUrl?: string
    features?: any
    lang: Locale
    dictionary: any
    targetAudience?: 'MEN' | 'WOMEN' | 'ALL'
}

export function CourseCard({
    id,
    title,
    description,
    price,
    duration,
    type,
    imageUrl,
    features,
    lang,
    dictionary,
    targetAudience
}: CourseCardProps) {
    const isRecommended = id === "happy-women-club-premium" || id === "face-yoga"
    const displayFeatures = features && Array.isArray(features) ? features.slice(0, 3) : []

    // Colors adjusted to match screenshot
    const styles = {
        men: {
            bg: 'bg-[#e0f2fe]', // Light blue
            header: 'bg-[#0ea5e9]', // Bright blue
            icon: <Users className="w-12 h-12 text-white/20" />,
            tag: lang === 'ru' ? 'ДЛЯ МУЖЧИН' : 'ERKAKLAR UCHUN'
        },
        women: {
            bg: 'bg-[#fce7f3]', // Light pink
            header: 'bg-[#ec4899]', // Pink
            icon: <Sparkles className="w-12 h-12 text-white/20" />,
            tag: lang === 'ru' ? 'ЖЕНЩИНАМ' : 'AYOLLARGA'
        },
        recommended: {
            bg: 'bg-[#fefce8]', // Light yellow
            header: 'bg-[#eab308]', // Yellow
            icon: <Heart className="w-12 h-12 text-white/20" />,
            tag: lang === 'ru' ? 'РЕКОМЕНДУЕМ' : 'TAVSIYA ETAMIZ'
        },
        general: {
            bg: 'bg-[#f0fdf4]', // Light green
            header: 'bg-[#22c55e]', // Green
            icon: <User className="w-12 h-12 text-white/20" />,
            tag: type === 'ONLINE' ? (lang === 'ru' ? 'ОНЛАЙН' : 'ONLAYN') : (lang === 'ru' ? 'ОФФЛАЙН' : 'OFFLAYN')
        }
    }

    let resolvedAudience = targetAudience;
    if (!targetAudience || targetAudience === 'ALL') {
        if (id.includes('men') && !id.includes('women')) resolvedAudience = 'MEN';
        else if (id.includes('women')) resolvedAudience = 'WOMEN';
    }

    const currentStyle = resolvedAudience === 'MEN' ? styles.men :
        (resolvedAudience === 'WOMEN' ? styles.women :
            (isRecommended ? styles.recommended : styles.general))

    return (
        <Link href={`/${lang}/courses/${id}`} className="block h-full">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -5 }}
                className={cn(
                    "rounded-[2.5rem] overflow-hidden flex flex-col h-full transition-all duration-300 shadow-sm hover:shadow-xl border border-[var(--secondary)] bg-white cursor-pointer",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2",
                )}
            >
                {/* Header Block with Image or Icon */}
                <div className={cn("h-64 relative overflow-hidden bg-[var(--secondary)]", !imageUrl && currentStyle.header)}>
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={title}
                            fill
                            className="object-cover object-top group-hover:scale-105 transition-transform duration-500"
                        />
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            {currentStyle.icon}
                        </div>
                    )}

                    {/* Overlay Tag */}
                    <div className="absolute top-4 left-6 z-10">
                        <span className={cn(
                            "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest text-white shadow-lg",
                            currentStyle.header
                        )}>
                            {currentStyle.tag}
                        </span>
                    </div>

                    {/* Decorative overlay when image exists */}
                    {imageUrl && <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />}
                </div>

                <div className="p-8 pb-10 flex flex-col flex-1">
                    <div className="mb-6 flex-1">
                        <h3 className="text-xl font-bold text-[var(--primary)] leading-tight mb-3">
                            {title}
                        </h3>
                        <p className="text-[13px] text-[var(--primary)]/60 font-medium leading-relaxed line-clamp-3 mb-6">
                            {description}
                        </p>

                        {/* Features checklist from screenshot */}
                        <div className="space-y-2">
                            {displayFeatures.length > 0 ? (
                                displayFeatures.map((feat, idx) => (
                                    <div key={idx} className="flex items-start gap-2">
                                        <div className="w-1 h-1 rounded-full bg-[var(--accent)] mt-1.5 shrink-0" />
                                        <span className="text-[11px] font-bold text-[var(--primary)]/40 uppercase tracking-wide leading-tight">
                                            {feat}
                                        </span>
                                    </div>
                                ))
                            ) : (
                                [1, 2].map((i) => (
                                    <div key={i} className="flex items-center gap-2">
                                        <div className="w-1 h-1 rounded-full bg-[var(--accent)]" />
                                        <span className="text-[11px] font-bold text-[var(--primary)]/40 uppercase tracking-wide">
                                            {lang === 'ru' ? 'Краткое описание бонуса' : 'Afzalliklari haqida qisqacha'}
                                        </span>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-[var(--secondary)] flex items-center justify-between">
                        <div>
                            <div suppressHydrationWarning className="text-[16px] font-black text-[var(--primary)] tracking-tight">
                                {new Intl.NumberFormat(lang === 'uz' ? 'uz-UZ' : 'ru-RU').format(Number(price))} UZS
                            </div>
                        </div>

                        <div
                            className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center transition-all shadow-lg shadow-[var(--primary)]/20"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </div>
                    </div>
                </div>
            </motion.div>
        </Link>
    )
}


