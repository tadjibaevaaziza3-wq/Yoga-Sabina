"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Lock, CheckCircle2 } from "lucide-react"
import { CheckoutForm } from "@/components/checkout/CheckoutForm"
import Image from "next/image"

interface CoursePurchaseModalProps {
    course: any
    isOpen: boolean
    onClose: () => void
    lang: string
    dictionary: any
}

export default function CoursePurchaseModal({ course, isOpen, onClose, lang, dictionary }: CoursePurchaseModalProps) {
    if (!isOpen) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative w-full max-w-4xl bg-[var(--background)] rounded-[3rem] overflow-hidden shadow-2xl border border-[var(--border)] max-h-[90vh] overflow-y-auto custom-scrollbar"
                >
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 z-10 p-2 bg-[var(--secondary)] rounded-full text-[var(--primary)] hover:scale-110 transition-transform"
                    >
                        <X className="w-5 h-5" />
                    </button>

                    <div className="grid md:grid-cols-[400px_1fr] h-full">
                        {/* Course Info */}
                        <div className="bg-[var(--secondary)]/30 p-8 md:p-12 space-y-8 border-r border-[var(--border)]">
                            <div className="relative aspect-video rounded-3xl overflow-hidden shadow-lg mb-6">
                                <Image
                                    src={course.coverImage || "/images/hero.png"}
                                    alt={course.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-black uppercase tracking-widest rounded-full">
                                        {course.type}
                                    </span>
                                    <span className="text-[10px] font-bold text-[var(--primary)]/40 uppercase tracking-widest">
                                        {course.lessonCount} {dictionary.courses.lessons}
                                    </span>
                                </div>
                                <h2 className="text-3xl font-serif font-black text-[var(--foreground)] leading-tight">
                                    {lang === 'ru' && course.titleRu ? course.titleRu : course.title}
                                </h2>
                                <p className="text-sm text-[var(--foreground)]/60 leading-relaxed font-medium line-clamp-4 italic">
                                    "{(lang === 'ru' ? course.descriptionRu : course.description) || dictionary.landing.heroSubtitle}"
                                </p>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-[var(--primary)]/5">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40">
                                        {lang === 'uz' ? "Narxi" : "Цена"}
                                    </span>
                                    <span className="text-2xl font-black text-[var(--primary)]">
                                        {new Intl.NumberFormat().format(course.price)} UZS
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Checkout Form */}
                        <div className="p-8 md:p-12">
                            <div className="max-w-md mx-auto">
                                <header className="text-center mb-10">
                                    <div className="w-16 h-16 bg-[var(--primary)]/5 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <Lock className="w-8 h-8 text-[var(--primary)]" />
                                    </div>
                                    <h3 className="text-xl font-serif font-black text-[var(--foreground)] mb-2">
                                        {lang === 'uz' ? "Kursga kirish" : "Доступ к курсу"}
                                    </h3>
                                    <p className="text-xs font-bold text-[var(--primary)]/40 uppercase tracking-widest">
                                        {lang === 'uz' ? "Xavfsiz to'lov tizimi" : "Безопасная оплата"}
                                    </p>
                                </header>

                                <CheckoutForm
                                    item={course}
                                    lang={lang}
                                    type="course"
                                    dictionary={dictionary}
                                />
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
