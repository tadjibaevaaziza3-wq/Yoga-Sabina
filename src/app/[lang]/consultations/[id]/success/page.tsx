'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function ConsultationSuccessPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-[var(--primary)] to-[var(--primary)] flex items-center justify-center px-4 py-12">
            <motion.div
                className="max-w-2xl w-full bg-white/10 backdrop-blur-md rounded-3xl p-8 md:p-12 border border-white/20 text-center"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
            >
                {/* Success Icon */}
                <motion.div
                    className="mb-6"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                >
                    <div className="w-24 h-24 mx-auto bg-[var(--accent)]/20 rounded-full flex items-center justify-center border-4 border-emerald-400">
                        <span className="text-5xl">✓</span>
                    </div>
                </motion.div>

                {/* Title */}
                <motion.h1
                    className="text-3xl md:text-4xl font-bold text-white mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                >
                    Оплата получена!
                </motion.h1>

                {/* Message */}
                <motion.div
                    className="bg-white/5 rounded-2xl p-6 mb-8"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    <p className="text-[var(--secondary)] text-lg leading-relaxed mb-4">
                        Тўлов ўтқазилгандан кейин, вакт ва кунини белгилаб оламиз.
                    </p>
                    <p className="text-emerald-200 text-base">
                        Я свяжусь с вами для согласования даты и времени консультации.
                    </p>
                </motion.div>

                {/* Telegram CTA */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="space-y-4"
                >
                    <a
                        href="https://t.me/Sabina_Polatova"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 px-8 rounded-xl text-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                    >
                        📱 Написать @Sabina_Polatova
                    </a>

                    <Link
                        href="/consultations"
                        className="block text-emerald-200 hover:text-white transition-colors"
                    >
                        ← Вернуться к консультациям
                    </Link>
                </motion.div>

                {/* Additional Info */}
                <motion.div
                    className="mt-8 pt-6 border-t border-white/10"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <p className="text-emerald-300 text-sm">
                        Спасибо за доверие! 💫✨
                    </p>
                </motion.div>
            </motion.div>
        </div>
    )
}
