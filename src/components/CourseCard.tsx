"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"
import { Clock, BookOpen, ChevronRight } from "lucide-react"
import { Locale } from "@/dictionaries/get-dictionary"
import { cn } from "@/lib/utils"

interface CourseCardProps {
    id: string
    title: string
    description: string
    price: string
    duration: string
    type: 'ONLINE' | 'OFFLINE'
    imageUrl?: string
    lang: Locale
    dictionary: any
}

export function CourseCard({
    id,
    title,
    description,
    price,
    duration,
    type,
    imageUrl,
    lang,
    dictionary
}: CourseCardProps) {
    const isRecommended = id === "happy-women-club-premium" || id === "face-yoga"

    // Background based on ID or type
    const getBgColor = () => {
        if (id.includes('men')) return 'bg-blue-50'
        if (id.includes('women')) return 'bg-pink-50'
        if (id.includes('face')) return 'bg-yellow-50'
        if (id.includes('dance')) return 'bg-purple-50'
        return 'bg-green-50'
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className={cn(
                "rounded-[2.5rem] overflow-hidden flex flex-col h-full transition-all group border border-primary/5",
                getBgColor(),
                isRecommended ? "ring-2 ring-accent/20" : ""
            )}
        >
            <div className="p-10 flex flex-col flex-1 relative">
                {isRecommended && (
                    <div className="absolute top-6 right-8 bg-[#FFD700]/20 text-[#B8860B] text-[8px] font-black uppercase tracking-widest px-3 py-1 rounded-full border border-[#FFD700]/30 shadow-sm">
                        REKОMENDUYEM
                    </div>
                )}

                <div className="flex flex-col h-full">
                    <div className="mb-12">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/40 mb-4 block">
                            {type === 'ONLINE' ? 'ONLAYN KURSLAR' : 'OFFLAYN DASHAR'}
                        </span>
                        <h3 className="text-2xl font-serif text-primary leading-tight mb-4">
                            {title}
                        </h3>
                        <p className="text-sm text-primary/60 font-medium mb-8 leading-relaxed line-clamp-3">
                            {description}
                        </p>
                    </div>

                    <div className="space-y-3 mb-12">
                        {[1, 2].map((i) => (
                            <div key={i} className="flex items-start gap-3">
                                <span className="w-4 h-4 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                </span>
                                <span className="text-[12px] font-bold text-primary/60 tracking-tight">Kengaytirilgan o'quv dasturi</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-auto flex items-end justify-between">
                        <div>
                            <div className="text-[14px] font-black text-primary/40 uppercase tracking-widest mb-1">{price} UZS</div>
                            <div className="text-[10px] font-bold text-primary/20 uppercase tracking-widest">30 kunlik kirish</div>
                        </div>

                        <Link
                            href={`/${lang}/courses/${id}`}
                            className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center hover:bg-accent transition-all active:scale-90"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </Link>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}
