"use client"

import React, { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Lock } from "lucide-react"
import CoursePurchaseModal from "./CoursePurchaseModal"

interface CourseListClientProps {
    courses: any[]
    lang: string
    dictionary: any
}

export default function CourseListClient({ courses, lang, dictionary }: CourseListClientProps) {
    const [selectedCourse, setSelectedCourse] = useState<any | null>(null)

    return (
        <>
            <div className="space-y-6">
                {courses.map((course) => (
                    <div
                        key={course.id}
                        className={`bg-[var(--card-bg)] p-8 rounded-[2.5rem] border ${course.isUnlocked ? 'border-[var(--border)]' : 'border-[var(--secondary)] bg-[var(--secondary)]/50'} flex flex-col md:flex-row gap-8 items-center group shadow-sm hover:shadow-md hover:shadow-[var(--primary)]/10 transition-all relative overflow-hidden`}
                    >

                        {!course.isUnlocked && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-[var(--card-bg)] p-6 rounded-3xl shadow-xl flex flex-col items-center gap-3 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                    <div className="w-12 h-12 bg-[var(--secondary)] rounded-full flex items-center justify-center text-[var(--primary)]">
                                        <Lock className="w-6 h-6" />
                                    </div>
                                    <p className="text-xs font-black uppercase tracking-widest text-[var(--primary)]">
                                        {lang === 'uz' ? "Yopiq kurs" : "Курс закрыт"}
                                    </p>
                                    <button
                                        onClick={() => setSelectedCourse(course)}
                                        className="px-8 py-3 bg-[var(--primary)] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[var(--primary)]/90 transition-all shadow-lg"
                                    >
                                        {(dictionary as any).common?.buy || (lang === 'uz' ? "Sotib olish" : "Купить")}
                                    </button>
                                </div>
                            </div>
                        )}

                        <div className="relative w-full md:w-48 h-32 rounded-3xl overflow-hidden shrink-0">
                            <Image
                                src={course.coverImage || "/images/hero.png"}
                                alt={course.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="flex-1 w-full">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-serif font-black text-[var(--foreground)]">
                                    {lang === 'ru' && course.titleRu ? course.titleRu : course.title}
                                </h3>
                                {course.isUnlocked && (
                                    <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full">
                                        {(dictionary as any).subscriptions?.activeStatus || (lang === 'uz' ? "FAOL" : "АКТИВЕН")}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="flex-1 h-1 bg-[var(--secondary)] rounded-full overflow-hidden">
                                    <div className={`h-full bg-[var(--primary)] w-[${course.progress || 0}%]`} />
                                </div>
                                <span className="text-[10px] font-black text-[var(--primary)]/40 uppercase tracking-widest">
                                    {course.lessonCount} {dictionary.courses.lessons}
                                </span>
                            </div>

                            <div className="flex items-center gap-4">
                                {course.isUnlocked ? (
                                    <>
                                        <Link
                                            href={`/${lang}/learn/${course.id}`}
                                            className="inline-flex items-center justify-center px-10 py-4 bg-[var(--primary)] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-[var(--primary)]/20 hover:bg-[var(--primary)]/90 transition-all"
                                        >
                                            {lang === 'uz' ? "Davom ettirish" : "Продолжить"}
                                        </Link>
                                        <p className="hidden md:block text-[10px] font-bold italic opacity-40 text-[var(--foreground)] max-w-[200px]">
                                            "{(dictionary as any).subscriptions?.sabinaMessage || (lang === 'uz' ? "Siz bilan birgaman" : "Я с вами")} " — Sabina
                                        </p>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setSelectedCourse(course)}
                                        className="inline-flex items-center justify-center px-10 py-4 bg-[var(--secondary)] text-[var(--primary)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--secondary)]/80 transition-all"
                                    >
                                        {(dictionary as any).common?.buy || (lang === 'uz' ? "Sotib olish" : "Купить")}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}

                {courses.length === 0 && (
                    <div className="p-20 text-center bg-[var(--card-bg)] rounded-[3rem] border-2 border-dashed border-[var(--secondary)]">
                        <p className="text-[var(--primary)]/30 font-black uppercase tracking-widest text-xs">
                            {lang === 'uz' ? "Kurslar topilmadi" : "Курсы не найдены"}
                        </p>
                    </div>
                )}
            </div>

            <CoursePurchaseModal
                isOpen={!!selectedCourse}
                onClose={() => setSelectedCourse(null)}
                course={selectedCourse}
                lang={lang}
                dictionary={dictionary}
            />
        </>
    )
}
