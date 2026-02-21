"use client"

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Play, Lock, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

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
        <div className="grid md:grid-cols-2 gap-6">
            {courses.map((course) => (
                <Link key={course.id} href={`/${lang}/learn/${course.id}`} className="block group">
                    <motion.div
                        whileHover={{ y: -4 }}
                        className="relative bg-[var(--card-bg)] p-4 rounded-[2rem] border border-[var(--border)] shadow-sm hover:shadow-xl transition-all flex gap-4 overflow-hidden"
                    >
                        {/* Thumbnail */}
                        <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0">
                            {course.coverImage ? (
                                <Image
                                    src={course.coverImage}
                                    alt={course.title}
                                    fill
                                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full bg-[var(--secondary)] flex items-center justify-center">
                                    <Play className="w-8 h-8 text-[var(--primary)]/20" />
                                </div>
                            )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 flex flex-col justify-center">
                            <h4 className="font-serif font-bold text-[var(--foreground)] line-clamp-1 mb-1">
                                {course.title}
                            </h4>

                            <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--primary)]/60 uppercase tracking-wider mb-3">
                                <span>{course.completedCount}/{course.lessonCount} {lang === 'uz' ? 'Dars' : 'Уроков'}</span>
                            </div>

                            {/* Progress Bar */}
                            <div className="w-full h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: `${course.progress}%` }}
                                    className="h-full bg-[var(--primary)]"
                                />
                            </div>
                        </div>

                        {/* Action Icon */}
                        <div className="absolute top-4 right-4">
                            {course.progress >= 100 ? (
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                            ) : (
                                <Play className="w-5 h-5 text-[var(--primary)] opacity-0 group-hover:opacity-100 transition-opacity" />
                            )}
                        </div>
                    </motion.div>
                </Link>
            ))}
        </div>
    )
}
