'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, Play, ChevronDown, ChevronUp, BookOpen, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Lesson {
    id: string;
    title: string;
    description?: string;
    isFree: boolean;
    order: number;
}

interface Course {
    id: string;
    title: string;
    titleRu?: string;
    coverImage?: string;
    isUnlocked: boolean;
    lessonCount: number;
    lessons: Lesson[];
}

interface CourseInlineListProps {
    courses: Course[];
    lang: 'uz' | 'ru';
    dictionary: any;
}

export default function CourseInlineList({ courses, lang, dictionary }: CourseInlineListProps) {
    const [expandedCourse, setExpandedCourse] = useState<string | null>(null);

    const toggleExpand = (id: string) => {
        setExpandedCourse(expandedCourse === id ? null : id);
    };

    return (
        <div className="space-y-6">
            {courses.map((course) => (
                <div
                    key={course.id}
                    className={cn(
                        "bg-[var(--card-bg)] rounded-[2.5rem] border transition-all overflow-hidden",
                        course.isUnlocked ? "border-[var(--border)] shadow-sm hover:shadow-md" : "border-[var(--secondary)] bg-[var(--secondary)]/50 opacity-80"
                    )}
                >
                    <div className="p-8 flex gap-8 items-center relative">
                        {!course.isUnlocked && (
                            <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/5 flex-col gap-3">
                                <div className="w-10 h-10 bg-[var(--card-bg)] rounded-full flex items-center justify-center text-[var(--primary)] shadow-sm">
                                    <Lock className="w-5 h-5" />
                                </div>
                                <Link
                                    href={`/${lang}/courses/${course.id}`}
                                    className="px-6 py-2 bg-[var(--primary)] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:scale-105 transition-all shadow-lg"
                                >
                                    {lang === 'uz' ? "SOTIB OLISH" : "КУПИТЬ"}
                                </Link>
                            </div>
                        )}

                        <div className="relative w-48 h-32 rounded-3xl overflow-hidden shrink-0 shadow-inner">
                            <Image
                                src={course.coverImage || "/images/hero.png"}
                                alt={course.title}
                                fill
                                className="object-cover"
                            />
                        </div>

                        <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-xl font-serif font-black text-[var(--foreground)]">
                                    {lang === 'ru' && course.titleRu ? course.titleRu : course.title}
                                </h3>
                                {course.isUnlocked && (
                                    <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/10">
                                        {lang === 'uz' ? "FAOL" : "АКТИВЕН"}
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-6 text-[10px] font-bold text-[var(--primary)]/40 uppercase tracking-widest mb-6">
                                <div className="flex items-center gap-2">
                                    <BookOpen className="w-3 h-3" />
                                    {course.lessonCount} {dictionary.courses.lessons}
                                </div>
                                <div className="flex items-center gap-2">
                                    <Clock className="w-3 h-3" />
                                    {course.isUnlocked ? "O'zlashtirilmoqda" : "Yopiq"}
                                </div>
                            </div>

                            {course.isUnlocked && (
                                <button
                                    onClick={() => toggleExpand(course.id)}
                                    className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-[var(--primary)] hover:opacity-70 transition-opacity"
                                >
                                    {expandedCourse === course.id ? (
                                        <>HULOSANI YOPISH <ChevronUp className="w-4 h-4" /></>
                                    ) : (
                                        <>DASTURNI KO'RISH <ChevronDown className="w-4 h-4" /></>
                                    )}
                                </button>
                            )}
                        </div>
                    </div>

                    <AnimatePresence>
                        {expandedCourse === course.id && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="border-t border-[var(--border)] bg-[var(--secondary)]/10"
                            >
                                <div className="p-8 space-y-4">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-[var(--primary)]/40 mb-6">KURS DASTURI</h4>
                                    <div className="grid gap-3">
                                        {course.lessons.sort((a, b) => a.order - b.order).map((lesson, idx) => (
                                            <div
                                                key={lesson.id}
                                                className="group flex items-center justify-between p-5 bg-white rounded-2xl border border-[var(--border)] hover:border-[var(--primary)]/30 hover:shadow-lg hover:shadow-[var(--primary)]/5 transition-all cursor-pointer"
                                                onClick={() => window.location.href = `/${lang}/learn/${course.id}?lesson=${lesson.id}`}
                                            >
                                                <div className="flex items-center gap-5">
                                                    <div className="w-10 h-10 rounded-xl bg-[var(--secondary)] flex items-center justify-center text-[var(--primary)]/40 font-black text-xs group-hover:bg-[var(--primary)] group-hover:text-white transition-colors">
                                                        {idx + 1}
                                                    </div>
                                                    <div>
                                                        <h5 className="text-sm font-bold text-[var(--foreground)]">{lesson.title}</h5>
                                                        {lesson.description && (
                                                            <p className="text-[10px] text-[var(--foreground)]/40 font-medium">{lesson.description.substring(0, 60)}...</p>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-8 h-8 rounded-full border border-[var(--border)] flex items-center justify-center text-[var(--primary)]/20 group-hover:border-[var(--primary)] group-hover:text-[var(--primary)] transition-all">
                                                    <Play className="w-3 h-3 fill-current" />
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 pt-8 border-t border-[var(--border)] flex justify-center">
                                        <Link
                                            href={`/${lang}/learn/${course.id}`}
                                            className="px-12 py-5 bg-[var(--primary)] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--primary)]/20 hover:-translate-y-1 transition-all"
                                        >
                                            O'QISHNI BOSHLASH
                                        </Link>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
    );
}
