"use client"

import { motion } from "framer-motion"
import { Lock, Crown, ArrowRight } from "lucide-react"
import Link from "next/link"

interface SubscriptionGateProps {
    isSubscribed: boolean
    children: React.ReactNode
    lang: 'uz' | 'ru'
    featureName?: string
}

export function SubscriptionGate({ isSubscribed, children, lang, featureName }: SubscriptionGateProps) {
    if (isSubscribed) return <>{children}</>

    return (
        <div className="relative min-h-[60vh] flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center max-w-md mx-auto px-6"
            >
                <div className="w-20 h-20 bg-[var(--accent)]/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Lock className="w-10 h-10 text-[var(--accent)]" />
                </div>

                <h2 className="text-2xl font-serif font-black text-[var(--foreground)] mb-3">
                    {lang === 'uz' ? "Premium kontent" : "Премиум контент"}
                </h2>

                <p className="text-sm text-[var(--foreground)]/50 mb-2">
                    {lang === 'uz'
                        ? `${featureName || "Bu bo'lim"} faqat premium obunachilarga ochiq.`
                        : `${featureName || "Этот раздел"} доступен только премиум подписчикам.`}
                </p>

                <p className="text-xs text-[var(--foreground)]/30 mb-8">
                    {lang === 'uz'
                        ? "Obunani faollashtiring va barcha kurs, video va AI maslahatlardan foydalaning!"
                        : "Активируйте подписку и получите доступ ко всем курсам, видео и AI-консультациям!"}
                </p>

                <div className="flex flex-col gap-3">
                    <Link href={`/${lang}/all-courses`}
                        className="bg-[var(--primary)] text-white py-3.5 px-8 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--primary)]/90 transition-all shadow-lg shadow-[var(--primary)]/20">
                        <Crown className="w-4 h-4" />
                        {lang === 'uz' ? "Obunani faollashtirish" : "Активировать подписку"}
                        <ArrowRight className="w-4 h-4" />
                    </Link>

                    <a href="https://t.me/baxtli_men_admin" target="_blank" rel="noopener noreferrer"
                        className="text-sm font-bold text-[var(--accent)] hover:underline">
                        {lang === 'uz' ? "Admin bilan bog'lanish" : "Связаться с администратором"}
                    </a>
                </div>
            </motion.div>
        </div>
    )
}
