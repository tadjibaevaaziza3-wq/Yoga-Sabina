"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'

interface Course {
    id: string
    title: string
    coverImage: string | null
    lessonCount: number
    completedCount: number
    progress: number // 0-100
    isUnlock: boolean
}

interface MyCoursesGridProps {
    courses: Course[]
    lang: string
}

export default function MyCoursesGrid({ courses, lang }: MyCoursesGridProps) {
    if (courses.length === 0) {
        return (
            <div className="p-8 text-center bg-[var(--secondary)] rounded-[2.5rem] border border-[var(--border)]">
                <p className="text-[var(--primary)]/60 font-medium">
                    {lang === 'uz' ? "Sizda hali faol kurslar yo'q" : "У вас пока нет активных курсов"}
                </p>
                <Link
                    href="#all-courses"
                    className="mt-4 inline-block px-6 py-3 bg-[var(--primary)] text-white rounded-xl font-bold text-xs uppercase tracking-widest"
                >
                    {lang === 'uz' ? "Kurs tanlash" : "Выбрать курс"}
                </Link>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
                <Link key={course.id} href={`/${lang}/learn/${course.id}`} className="block group">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={{ y: -4 }}
                        className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] shadow-sm hover:shadow-xl hover:shadow-[var(--primary)]/10 transition-all overflow-hidden"
                    >
                        {/* Thumbnail — 16:9 */}
                        <div className="relative aspect-video overflow-hidden bg-[var(--secondary)]">
                            {course.coverImage ? (
                                <Image
                                    src={course.coverImage}
                                    alt={course.title}
                                    fill
                                    loading={index === 0 ? 'eager' : 'lazy'}
                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex items-center justify-center">
                                    <Play className="w-10 h-10 text-[var(--primary)]/30" />
                                </div>
                            )}

                            {/* Hover play overlay */}
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 shadow-lg">
                                    {course.progress >= 100
                                        ? <CheckCircle className="w-6 h-6 text-emerald-500" />
                                        : <Play className="w-5 h-5 text-[var(--primary)] fill-current ml-0.5" />
                                    }
                                </div>
                            </div>

                            {/* Lesson count badge */}
                            <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-md">
                                {course.lessonCount} {lang === 'uz' ? 'dars' : 'урок'}
                            </div>

                            {/* Progress bar overlay */}
                            <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                <div
                                    className="h-full bg-[var(--primary)] transition-all duration-500"
                                    style={{ width: `${course.progress}%` }}
                                />
                            </div>
                        </div>

                        {/* Card body */}
                        <div className="p-4 space-y-2">
                            <h4 className="font-bold text-[var(--foreground)] line-clamp-2 text-sm leading-snug">
                                {course.title}
                            </h4>
                            <div className="flex items-center justify-between text-[11px] text-[var(--foreground)]/50 font-medium">
                                <span>{course.completedCount}/{course.lessonCount} {lang === 'uz' ? 'dars' : 'урок'}</span>
                                <span>{course.progress}%</span>
                            </div>
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>
    )
}

