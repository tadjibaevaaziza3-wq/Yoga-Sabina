"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Trophy, Star, Sparkles, ArrowRight, Share2 } from "lucide-react"
import Link from "next/link"

interface CompletionCelebrationProps {
    isOpen: boolean
    onClose: () => void
    lessonTitle: string
    courseName?: string
    streak?: number
    lang: 'uz' | 'ru'
    nextLessonId?: string
    courseId?: string
}

const CONFETTI_COLORS = ['#c5a059', '#114539', '#FFD700', '#FF6B6B', '#4ECDC4', '#A78BFA', '#F97316']

function ConfettiPiece({ delay, x }: { delay: number, x: number }) {
    const color = CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)]
    const size = Math.random() * 8 + 4
    const rotation = Math.random() * 360

    return (
        <motion.div
            initial={{ y: -20, x, opacity: 1, rotate: 0 }}
            animate={{ y: 600, opacity: 0, rotate: rotation + 720 }}
            transition={{ duration: 2.5 + Math.random(), delay, ease: "easeIn" }}
            className="absolute top-0 pointer-events-none"
            style={{
                width: size,
                height: size * 1.5,
                backgroundColor: color,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                left: `${x}%`,
            }}
        />
    )
}

export function CompletionCelebration({
    isOpen,
    onClose,
    lessonTitle,
    courseName,
    streak = 0,
    lang,
    nextLessonId,
    courseId,
}: CompletionCelebrationProps) {
    const [confettiPieces, setConfettiPieces] = useState<{ id: number, delay: number, x: number }[]>([])

    useEffect(() => {
        if (isOpen) {
            const pieces = Array.from({ length: 50 }, (_, i) => ({
                id: i,
                delay: Math.random() * 0.5,
                x: Math.random() * 100,
            }))
            setConfettiPieces(pieces)
        }
    }, [isOpen])

    const motivations = {
        uz: [
            "Ajoyib! Siz zo'rsiz! 🔥",
            "Mukammal! Har bir dars — yangi qadam! ✨",
            "Tabriklaymiz! Davom eting! 🏆",
            "Sabr va mehnat — muvaffaqiyat kaliti! 💪",
            "Siz bugun o'z salomatligingizga sarmoya qildingiz! 🧘‍♂️",
        ],
        ru: [
            "Отлично! Вы молодец! 🔥",
            "Прекрасно! Каждый урок — новый шаг! ✨",
            "Поздравляем! Продолжайте! 🏆",
            "Терпение и труд — ключ к успеху! 💪",
            "Сегодня вы инвестировали в своё здоровье! 🧘‍♂️",
        ],
    }

    const motivation = motivations[lang][Math.floor(Math.random() * motivations[lang].length)]

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">

                    {/* Confetti */}
                    <div className="absolute inset-0 overflow-hidden pointer-events-none">
                        {confettiPieces.map(p => (
                            <ConfettiPiece key={p.id} delay={p.delay} x={p.x} />
                        ))}
                    </div>

                    <motion.div
                        initial={{ scale: 0.5, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.5, y: 50 }}
                        transition={{ type: "spring", damping: 15, stiffness: 300 }}
                        className="bg-white rounded-[2.5rem] p-8 md:p-10 w-full max-w-md shadow-2xl text-center relative overflow-hidden"
                    >
                        {/* Glow background */}
                        <div className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/5 to-transparent rounded-[2.5rem]" />

                        <div className="relative">
                            {/* Trophy */}
                            <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                                className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-[var(--accent)] to-yellow-300 rounded-full flex items-center justify-center shadow-lg shadow-[var(--accent)]/30"
                            >
                                <Trophy className="w-12 h-12 text-white" />
                            </motion.div>

                            {/* Title */}
                            <motion.h2 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                                className="text-2xl font-serif font-black text-[var(--foreground)] mb-2">
                                {lang === 'uz' ? "Dars yakunlandi!" : "Урок завершён!"}
                            </motion.h2>

                            {/* Lesson title */}
                            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}
                                className="text-sm text-[var(--primary)]/50 font-bold mb-4">
                                {lessonTitle}
                            </motion.p>

                            {/* Motivation */}
                            <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
                                className="text-lg font-bold text-[var(--primary)] mb-6">
                                {motivation}
                            </motion.p>

                            {/* Streak badge */}
                            {streak > 0 && (
                                <motion.div initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.9 }}
                                    className="inline-flex items-center gap-2 bg-orange-50 text-orange-600 px-5 py-2.5 rounded-full mb-6">
                                    <Sparkles className="w-4 h-4" />
                                    <span className="text-sm font-black">{streak} {lang === 'uz' ? "kunlik seriya!" : "дней подряд!"}</span>
                                    <Star className="w-4 h-4" />
                                </motion.div>
                            )}

                            {/* Actions */}
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }}
                                className="flex flex-col gap-3">
                                {nextLessonId && courseId && (
                                    <Link href={`/${lang}/learn/${courseId}?lesson=${nextLessonId}`}
                                        className="w-full bg-[var(--primary)] text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--primary)]/90 transition-all shadow-lg shadow-[var(--primary)]/20">
                                        {lang === 'uz' ? "Keyingi dars" : "Следующий урок"}
                                        <ArrowRight className="w-4 h-4" />
                                    </Link>
                                )}

                                <button onClick={onClose}
                                    className="w-full bg-[var(--background)] text-[var(--primary)] py-3.5 rounded-2xl font-bold text-sm border border-primary/10 hover:border-primary/20 transition-all">
                                    {lang === 'uz' ? "Yopish" : "Закрыть"}
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
