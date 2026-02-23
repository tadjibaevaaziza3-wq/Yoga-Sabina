"use client"

import { useState } from "react"
import { Search, Filter, Play, Lock, Users, BookOpen } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

interface CourseFilterGridProps {
    lang: 'uz' | 'ru'
    courses: {
        id: string
        title: string
        titleRu?: string | null
        description: string
        descriptionRu?: string | null
        coverImage?: string | null
        price?: number | null
        lessonCount: number
        freeLessons: number
        purchaseCount: number
        isUnlocked: boolean
    }[]
}

type FilterStatus = 'all' | 'unlocked' | 'locked' | 'has_free'

export default function CourseFilterGrid({ lang, courses }: CourseFilterGridProps) {
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState<FilterStatus>('all')

    const filtered = courses.filter(course => {
        const title = (lang === 'ru' && course.titleRu) ? course.titleRu : course.title
        const desc = (lang === 'ru' && course.descriptionRu) ? course.descriptionRu : course.description
        const matchesSearch = !search ||
            title.toLowerCase().includes(search.toLowerCase()) ||
            desc.toLowerCase().includes(search.toLowerCase())

        const matchesStatus =
            statusFilter === 'all' ||
            (statusFilter === 'unlocked' && course.isUnlocked) ||
            (statusFilter === 'locked' && !course.isUnlocked) ||
            (statusFilter === 'has_free' && course.freeLessons > 0)

        return matchesSearch && matchesStatus
    })

    const filterButtons: { key: FilterStatus, label: string }[] = [
        { key: 'all', label: lang === 'uz' ? 'Hammasi' : 'Все' },
        { key: 'unlocked', label: lang === 'uz' ? 'Mening' : 'Мои' },
        { key: 'has_free', label: lang === 'uz' ? 'Bepul darsli' : 'С бесп. уроком' },
        { key: 'locked', label: lang === 'uz' ? 'Premium' : 'Премиум' },
    ]

    return (
        <div className="space-y-5">
            {/* Search + Filter */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--foreground)]/20" />
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder={lang === 'uz' ? "Kurs qidirish..." : "Поиск курса..."}
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-[var(--foreground)]/[0.06] rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/15 placeholder:text-[var(--foreground)]/15"
                    />
                </div>
                <div className="flex gap-1.5 overflow-x-auto pb-1">
                    {filterButtons.map(btn => (
                        <button
                            key={btn.key}
                            onClick={() => setStatusFilter(btn.key)}
                            className={`px-3 py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${statusFilter === btn.key
                                    ? 'bg-[var(--primary)] text-white shadow-sm'
                                    : 'bg-white text-[var(--foreground)]/30 hover:text-[var(--foreground)]/50 border border-[var(--foreground)]/[0.06]'
                                }`}
                        >
                            {btn.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(course => {
                    const title = (lang === 'ru' && course.titleRu) ? course.titleRu : course.title
                    const desc = (lang === 'ru' && course.descriptionRu) ? course.descriptionRu : course.description

                    return (
                        <div key={course.id} className="group bg-white rounded-2xl border border-[var(--foreground)]/[0.04] overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
                            <div className="relative aspect-[16/10] bg-[var(--surface-warm)]">
                                {course.coverImage ? (
                                    <Image
                                        src={course.coverImage}
                                        alt={title}
                                        fill
                                        className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <Play className="w-10 h-10 text-[var(--foreground)]/10" />
                                    </div>
                                )}
                                <div className="absolute top-3 right-3">
                                    {course.isUnlocked ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/90 text-white text-[8px] font-bold uppercase tracking-wider backdrop-blur-sm">
                                            <Play className="w-3 h-3" /> {lang === 'uz' ? "Ochiq" : "Доступен"}
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[var(--primary)]/90 text-white text-[8px] font-bold uppercase tracking-wider backdrop-blur-sm">
                                            ✦ Premium
                                        </span>
                                    )}
                                </div>
                                {course.freeLessons > 0 && !course.isUnlocked && (
                                    <div className="absolute bottom-3 left-3">
                                        <span className="px-2 py-0.5 rounded-md bg-white/90 text-[var(--foreground)]/60 text-[8px] font-bold backdrop-blur-sm">
                                            {course.freeLessons} {lang === 'uz' ? "bepul dars" : "бесп. урок"}
                                        </span>
                                    </div>
                                )}
                            </div>

                            <div className="p-5 space-y-3">
                                <h3 className="font-bold text-sm text-[var(--foreground)] line-clamp-2 leading-tight">
                                    {title}
                                </h3>
                                <p className="text-[11px] text-[var(--foreground)]/30 line-clamp-2 leading-relaxed">
                                    {desc}
                                </p>

                                <div className="flex items-center gap-3 text-[9px] text-[var(--foreground)]/20 font-semibold">
                                    <span className="flex items-center gap-1">
                                        <Play className="w-3 h-3" /> {course.lessonCount} {lang === 'uz' ? "dars" : "уроков"}
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <Users className="w-3 h-3" /> {course.purchaseCount}
                                    </span>
                                </div>

                                <Link
                                    href={course.isUnlocked ? `/${lang}/learn/${course.id}` : `/${lang}/all-courses`}
                                    className={`block w-full text-center py-2.5 rounded-xl text-[9px] font-bold uppercase tracking-widest transition-all ${course.isUnlocked
                                        ? 'bg-[var(--primary)] text-white shadow-sm hover:shadow-md'
                                        : 'bg-[#c9a96e]/8 text-[#c9a96e] hover:bg-[#c9a96e]/15 border border-[#c9a96e]/10'
                                        }`}
                                >
                                    {course.isUnlocked
                                        ? (lang === 'uz' ? "Davom etish" : "Продолжить")
                                        : (lang === 'uz' ? "Batafsil" : "Подробнее")}
                                </Link>
                            </div>
                        </div>
                    )
                })}
            </div>

            {filtered.length === 0 && (
                <div className="text-center py-20">
                    <BookOpen className="w-10 h-10 mx-auto text-[var(--foreground)]/10 mb-3" />
                    <p className="text-sm text-[var(--foreground)]/20 font-medium">
                        {search
                            ? (lang === 'uz' ? "Natija topilmadi" : "Ничего не найдено")
                            : (lang === 'uz' ? "Hozircha kurslar yo'q" : "Пока нет курсов")}
                    </p>
                </div>
            )}
        </div>
    )
}
