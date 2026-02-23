"use client"

import { useState } from "react"
import { Locale } from "@/dictionaries/types"
import { Play, FileText, MessageCircle, Heart, Download, ChevronLeft, ChevronRight, Menu, X, Send, Paperclip, Search, Bookmark, BookmarkCheck, ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import EnhancedVideoPlayer from "../video/EnhancedVideoPlayer"
import CourseChat from "../user/CourseChat"
import LessonComments from "./LessonComments"

interface CourseLearningInterfaceProps {
    course: any
    user: any
    lang: Locale
    dictionary: any
}

export function CourseLearningInterface({ course, user, lang, dictionary }: CourseLearningInterfaceProps) {
    const [activeLessonId, setActiveLessonId] = useState<string>(course.lessons[0]?.id)
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [activeTab, setActiveTab] = useState<'details' | 'chat' | 'files'>('details')
    const [chatOpen, setChatOpen] = useState(false)
    const [chatInput, setChatInput] = useState("")
    const [searchQuery, setSearchQuery] = useState("")
    const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({})

    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: lang === 'uz' ? "Assalomu alaykum! Kurs bo'yicha qanday yordam bera olaman?" : "Здравствуйте! Чем могу помочь по курсу?" }
    ])
    const [isAiTyping, setIsAiTyping] = useState(false)

    // Init likes & favorites tracking
    const [likedLessons, setLikedLessons] = useState<Record<string, boolean>>(
        course.lessons.reduce((acc: any, l: any) => ({ ...acc, [l.id]: l.likes?.length > 0 }), {})
    )
    const [favoriteLessons, setFavoriteLessons] = useState<Record<string, boolean>>(
        course.lessons.reduce((acc: any, l: any) => ({ ...acc, [l.id]: l.favoritedBy?.length > 0 }), {})
    )
    const [likeCounts, setLikeCounts] = useState<Record<string, number>>(
        course.lessons.reduce((acc: any, l: any) => ({ ...acc, [l.id]: l._count?.likes || 0 }), {})
    )

    const activeLesson = course.lessons.find((l: any) => l.id === activeLessonId)
    const activeLessonIndex = course.lessons.findIndex((l: any) => l.id === activeLessonId)

    const handleNext = () => {
        if (activeLessonIndex < course.lessons.length - 1) {
            setActiveLessonId(course.lessons[activeLessonIndex + 1].id)
        }
    }

    const handlePrev = () => {
        if (activeLessonIndex > 0) {
            setActiveLessonId(course.lessons[activeLessonIndex - 1].id)
        }
    }

    const handleLike = async () => {
        if (!activeLessonId) return
        const isLiked = likedLessons[activeLessonId]

        // Optimistic update
        setLikedLessons(prev => ({ ...prev, [activeLessonId]: !isLiked }))
        setLikeCounts(prev => ({ ...prev, [activeLessonId]: (prev[activeLessonId] || 0) + (isLiked ? -1 : 1) }))

        try {
            const res = await fetch(`/api/lessons/${activeLessonId}/like`, {
                method: isLiked ? 'DELETE' : 'POST'
            })
            if (!res.ok) throw new Error('Failed to toggle like')
        } catch (error) {
            // Revert on error
            setLikedLessons(prev => ({ ...prev, [activeLessonId]: isLiked }))
            setLikeCounts(prev => ({ ...prev, [activeLessonId]: (prev[activeLessonId] || 0) + (isLiked ? 1 : -1) }))
        }
    }

    const handleFavorite = async () => {
        if (!activeLessonId) return
        const isFavorited = favoriteLessons[activeLessonId]

        // Optimistic update
        setFavoriteLessons(prev => ({ ...prev, [activeLessonId]: !isFavorited }))

        try {
            const res = await fetch(`/api/lessons/${activeLessonId}/favorite`, {
                method: isFavorited ? 'DELETE' : 'POST'
            })
            if (!res.ok) throw new Error('Failed to toggle favorite')
        } catch (error) {
            // Revert on error
            setFavoriteLessons(prev => ({ ...prev, [activeLessonId]: isFavorited }))
        }
    }

    const sendMessage = async () => {
        if (!chatInput.trim()) return
        const userMsg = chatInput
        setMessages(prev => [...prev, { role: 'user', text: userMsg }])
        setChatInput("")
        setIsAiTyping(true)

        try {
            const history = messages.map(m => ({
                role: m.role === 'ai' ? 'assistant' : 'user',
                content: m.text
            }))

            const response = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg,
                    lang,
                    history
                })
            })

            const data = await response.json()

            if (data.success) {
                setMessages(prev => [...prev, { role: 'ai', text: data.response }])
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: lang === 'uz' ? "Kechirasiz, xatolik yuz berdi." : "Извините, произошла ошибка." }])
            }
        } catch (error) {
            console.error(error)
            setMessages(prev => [...prev, { role: 'ai', text: lang === 'uz' ? "Tarmoq xatosi." : "Ошибка сети." }])
        } finally {
            setIsAiTyping(false)
        }
    }

    const completedLessonIds = user.progress?.map((p: any) => p.lessonId) || []
    const completedCount = course.lessons.filter((l: any) => completedLessonIds.includes(l.id)).length
    const progressPercent = course.lessons.length > 0 ? Math.round((completedCount / course.lessons.length) * 100) : 0

    // Filter and group lessons
    const filteredLessons = course.lessons.filter((l: any) =>
        l.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.description?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const modules = course.modules || []
    const groupedLessons = modules.map((m: any) => ({
        ...m,
        lessons: filteredLessons.filter((l: any) => l.moduleId === m.id)
    })).filter((m: any) => m.lessons.length > 0)

    const unassignedLessons = filteredLessons.filter((l: any) => !l.moduleId)

    const toggleModule = (moduleId: string) => {
        setExpandedModules(prev => ({ ...prev, [moduleId]: prev[moduleId] === false ? true : false }))
    }

    // Helper for rendering lesson item
    const renderLessonItem = (lesson: any, globalIdx: number) => {
        const isCompleted = completedLessonIds.includes(lesson.id)
        const progressData = lesson.enhancedProgress?.[0] || lesson.progress?.[0]
        const isUnfinished = !isCompleted && progressData && progressData.progress > 0

        return (
            <button
                key={lesson.id}
                onClick={() => setActiveLessonId(lesson.id)}
                className={cn(
                    "w-full text-left p-3 rounded-2xl flex items-center gap-4 transition-all relative mt-1 group",
                    activeLessonId === lesson.id
                        ? "bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20"
                        : "hover:bg-[var(--secondary)]/60 text-[var(--foreground)]"
                )}
            >
                {/* Thumbnail / Status Icon */}
                <div className="relative w-20 aspect-video rounded-lg overflow-hidden bg-[var(--background)] shrink-0 border border-[var(--border)]/10">
                    {lesson.thumbnailUrl ? (
                        <img
                            src={lesson.thumbnailUrl}
                            alt={lesson.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[var(--secondary)]/30">
                            <Play className={cn("w-4 h-4", activeLessonId === lesson.id ? "text-white/40" : "text-[var(--primary)]/20")} />
                        </div>
                    )}

                    {isCompleted && (
                        <div className="absolute inset-0 bg-emerald-500/20 flex items-center justify-center">
                            <div className="bg-emerald-500 text-white rounded-full p-0.5 shadow-lg">
                                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                </svg>
                            </div>
                        </div>
                    )}

                    {isUnfinished && (
                        <div className="absolute bottom-0 left-0 h-1 bg-orange-400" style={{ width: `${(progressData.progress / (lesson.duration || 1)) * 100}%` }} />
                    )}
                </div>

                <div className="flex-1 min-w-0 py-1">
                    <h4 className={cn(
                        "text-[11px] font-bold leading-tight mb-1 line-clamp-2",
                        activeLessonId === lesson.id ? "text-white" : "text-[var(--foreground)]"
                    )}>
                        {lesson.title}
                    </h4>
                    <div className="flex items-center gap-2">
                        <span className={cn(
                            "text-[9px] font-black uppercase tracking-widest opacity-40",
                            activeLessonId === lesson.id ? "text-white" : "text-[var(--primary)]"
                        )}>
                            {lesson.duration > 0 ? `${Math.floor(lesson.duration / 60)} min` : (lang === 'uz' ? 'Yangi' : 'Новый')}
                        </span>
                        {isUnfinished && (
                            <span className="text-[9px] font-bold text-orange-400 uppercase tracking-tighter">Davom etish</span>
                        )}
                    </div>
                </div>
            </button>
        )
    }

    return (
        <div className="h-screen flex bg-[var(--background)] overflow-hidden">
            {/* Sidebar (Lessons List) */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 320 : 0, opacity: sidebarOpen ? 1 : 0 }}
                className="bg-[var(--card-bg)] text-[var(--foreground)] flex-shrink-0 flex flex-col border-r border-[var(--border)] relative z-20"
            >
                <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                        <Link href={`/${lang}/my-courses`} className="p-1.5 hover:bg-[var(--secondary)] rounded-lg transition-colors shrink-0" title={lang === 'uz' ? 'Kurslarim' : 'Мои курсы'}>
                            <ArrowLeft className="w-4 h-4 text-[var(--primary)]" />
                        </Link>
                        <h2 className="font-serif font-black text-lg line-clamp-1 text-[var(--foreground)]">{course.title}</h2>
                    </div>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[var(--foreground)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-4 border-b border-[var(--border)]">
                    <div className="relative">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--foreground)]/40" />
                        <input
                            type="text"
                            placeholder={lang === 'uz' ? "Dars qidirish..." : "Поиск уроков..."}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 bg-[var(--background)] border border-[var(--border)] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--foreground)]"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    {/* KPI Block */}
                    {!searchQuery && (
                        <div className="mb-6 bg-[var(--secondary)]/30 rounded-xl p-4 border border-[var(--border)]">
                            <div className="flex items-center justify-between mb-2">
                                <span className="text-xs font-bold text-[var(--foreground)] opacity-80">{lang === 'uz' ? 'Kurs jarayoni' : 'Прогресс курса'}</span>
                                <span className="text-xs font-black text-[var(--primary)]">{progressPercent}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-[var(--secondary)] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all duration-1000 ease-out"
                                    style={{ width: `${progressPercent}%` }}
                                />
                            </div>
                            <div className="mt-3 flex items-center justify-between">
                                <span className="text-[10px] font-bold tracking-widest uppercase text-[var(--foreground)]/40">
                                    {completedCount} / {course.lessons.length} {lang === 'uz' ? 'dars yakunlandi' : 'уроков завершено'}
                                </span>
                                {(() => {
                                    const totalTrainingSecs = course.lessons.reduce((sum: number, l: any) => {
                                        const prog = l.enhancedProgress?.[0] || l.progress?.[0]
                                        return sum + (prog?.progress || 0)
                                    }, 0)
                                    if (totalTrainingSecs > 0) {
                                        const hrs = Math.floor(totalTrainingSecs / 3600)
                                        const mins = Math.floor((totalTrainingSecs % 3600) / 60)
                                        return (
                                            <span className="text-[10px] font-black text-[var(--accent)]">
                                                ⏱ {hrs > 0 ? `${hrs}s ${mins}m` : `${mins} min`}
                                            </span>
                                        )
                                    }
                                    return null
                                })()}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {groupedLessons.map((module: any) => (
                            <div key={module.id} className="space-y-1">
                                <button
                                    onClick={() => toggleModule(module.id)}
                                    className="w-full flex items-center justify-between py-2 text-sm font-bold text-[var(--foreground)] hover:text-[var(--primary)] transition-colors"
                                >
                                    <span className="truncate pr-2">{module.title}</span>
                                    {expandedModules[module.id] === false ? <ChevronRight className="w-4 h-4 shrink-0" /> : <ChevronLeft className="w-4 h-4 shrink-0 -rotate-90" />}
                                </button>

                                {expandedModules[module.id] !== false && (
                                    <div className="space-y-1 ml-2 border-l-2 border-[var(--secondary)] pl-2">
                                        {module.lessons.map((lesson: any) =>
                                            renderLessonItem(lesson, course.lessons.findIndex((l: any) => l.id === lesson.id))
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {unassignedLessons.length > 0 && (
                            <div className="space-y-1 mt-4 pt-4 border-t border-[var(--border)]">
                                {unassignedLessons.map((lesson: any) =>
                                    renderLessonItem(lesson, course.lessons.findIndex((l: any) => l.id === lesson.id))
                                )}
                            </div>
                        )}

                        {filteredLessons.length === 0 && (
                            <p className="text-center text-[var(--foreground)]/40 text-sm py-4">
                                {lang === 'uz' ? 'Dars topilmadi' : 'Уроки не найдены'}
                            </p>
                        )}
                    </div>
                </div>
                <div className="p-4 border-t border-[var(--border)]">
                    <Link href={`/${lang}/account`} className="flex items-center justify-center gap-2 w-full py-3 text-center rounded-xl bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-xs font-bold uppercase tracking-widest text-[var(--primary)] transition-all">
                        <ArrowLeft className="w-3.5 h-3.5" />
                        {lang === 'uz' ? "Asosiy sahifa" : "Главная"}
                    </Link>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 flex flex-col h-full relative bg-[var(--background)]">
                {/* Header */}
                <header className="h-20 bg-[var(--background)] border-b border-[var(--border)] flex items-center justify-between px-8 shrink-0">
                    <div className="flex items-center gap-6">
                        {!sidebarOpen && (
                            <button onClick={() => setSidebarOpen(true)} className="p-3 hover:bg-[var(--secondary)] rounded-xl text-[var(--foreground)] transition-colors">
                                <Menu className="w-6 h-6" />
                            </button>
                        )}
                        <h3 className="font-bold text-xl text-[var(--foreground)] truncate max-w-xl font-serif">{activeLesson?.title}</h3>
                    </div>
                    <div className="flex items-center gap-3 block sm:flex">
                        <button
                            onClick={handlePrev}
                            disabled={activeLessonIndex === 0}
                            className="p-3 rounded-xl hover:bg-[var(--secondary)] disabled:opacity-30 transition-all text-[var(--foreground)] border border-[var(--border)]"
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={activeLessonIndex === course.lessons.length - 1}
                            className="p-3 rounded-xl hover:bg-[var(--secondary)] disabled:opacity-30 transition-all text-[var(--foreground)] border border-[var(--border)]"
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* Content Area */}
                <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-12 custom-scrollbar">
                    <div className="max-w-5xl mx-auto space-y-6 sm:space-y-10">
                        {/* Video Player */}
                        <div className="bg-black rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[var(--primary)]/10 relative group border border-[var(--border)]">
                            {activeLesson?.videoUrl ? (
                                activeLesson.videoUrl.includes('youtu') ? (
                                    <div className="aspect-video w-full h-full">
                                        <iframe
                                            src={`https://www.youtube.com/embed/${activeLesson.videoUrl.split('v=')[1]?.split('&')[0] || activeLesson.videoUrl.split('/').pop()}`}
                                            className="w-full h-full"
                                            allowFullScreen
                                            title={activeLesson.title}
                                        />
                                    </div>
                                ) : (
                                    <EnhancedVideoPlayer
                                        lessonId={activeLesson.id}
                                        assetId={activeLesson.id}
                                        userId={user.id}
                                        email={user.email}
                                        className="w-full"
                                        onComplete={handleNext}
                                    />
                                )
                            ) : (
                                <div className="aspect-video absolute inset-0 flex items-center justify-center text-white/30 font-black uppercase tracking-widest text-center">
                                    No Video Available
                                </div>
                            )}
                        </div>

                        {/* Controls / Stats */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex overflow-x-auto gap-2 p-1 bg-[var(--card-bg)] sm:rounded-full rounded-2xl border border-[var(--border)] custom-scrollbar">
                                <button
                                    className={cn(
                                        "px-6 sm:px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all shrink-0",
                                        activeTab === 'details' ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--foreground)]/60 hover:bg-[var(--secondary)]"
                                    )}
                                    onClick={() => setActiveTab('details')}
                                >
                                    Details
                                </button>
                                <button
                                    className={cn(
                                        "px-6 sm:px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all shrink-0",
                                        activeTab === 'files' ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--foreground)]/60 hover:bg-[var(--secondary)]"
                                    )}
                                    onClick={() => setActiveTab('files')}
                                >
                                    Files ({activeLesson?.assets?.length || 0})
                                </button>
                            </div>

                            {/* Interaction Buttons */}
                            <div className="flex items-center gap-2 self-start sm:self-auto">
                                <button
                                    onClick={handleLike}
                                    className={cn(
                                        "flex items-center gap-2 px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all",
                                        likedLessons[activeLessonId]
                                            ? "bg-red-50 text-red-500 hover:bg-red-100"
                                            : "bg-[var(--card-bg)] text-[var(--foreground)]/60 hover:bg-[var(--secondary)] border border-[var(--border)]"
                                    )}
                                >
                                    <Heart className={cn("w-4 h-4", likedLessons[activeLessonId] ? "fill-current" : "")} />
                                    <span className="hidden sm:inline">Like</span>
                                    {likeCounts[activeLessonId] > 0 && <span className="ml-1 opacity-70">({likeCounts[activeLessonId]})</span>}
                                </button>
                                <button
                                    onClick={handleFavorite}
                                    className={cn(
                                        "flex items-center gap-2 px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all",
                                        favoriteLessons[activeLessonId]
                                            ? "bg-yellow-50 text-yellow-600 hover:bg-yellow-100"
                                            : "bg-[var(--card-bg)] text-[var(--foreground)]/60 hover:bg-[var(--secondary)] border border-[var(--border)]"
                                    )}
                                >
                                    {favoriteLessons[activeLessonId] ? <BookmarkCheck className="w-4 h-4 fill-current" /> : <Bookmark className="w-4 h-4" />}
                                    <span className="hidden sm:inline">Save</span>
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="bg-[var(--card-bg)] p-6 sm:p-10 rounded-3xl sm:rounded-[2.5rem] min-h-[300px] border border-[var(--border)] shadow-sm">
                            {activeTab === 'details' && (
                                <div className="space-y-12">
                                    <div className="space-y-6">
                                        <h2 className="text-2xl sm:text-3xl font-serif font-black text-[var(--foreground)]">{activeLesson?.title}</h2>
                                        <p className="text-[var(--foreground)]/70 leading-relaxed text-base sm:text-lg">{activeLesson?.description}</p>
                                        {activeLesson?.content && (
                                            <div className="prose prose-emerald max-w-none text-[var(--foreground)]/80">
                                                {activeLesson.content}
                                            </div>
                                        )}
                                    </div>

                                    {/* Lesson Comments Section */}
                                    {activeLessonId && (
                                        <div className="pt-8 border-t border-[var(--border)]">
                                            <LessonComments lessonId={activeLessonId} lang={lang} currentUser={user} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'files' && (
                                <div className="space-y-4">
                                    {activeLesson?.assets?.map((asset: any) => (
                                        <div key={asset.id} className="flex items-center justify-between p-4 sm:p-6 bg-[var(--background)] rounded-2xl hover:bg-[var(--secondary)]/30 transition-all group border border-[var(--border)] flex-wrap gap-4">
                                            <div className="flex items-center gap-4 sm:gap-6">
                                                <div className="w-12 h-12 bg-[var(--card-bg)] rounded-xl flex items-center justify-center text-[var(--primary)] shadow-sm font-black text-xs border border-[var(--border)] shrink-0">
                                                    {asset.type}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-[var(--foreground)] text-sm sm:text-base mb-1 line-clamp-1">{asset.name}</h5>
                                                    <p className="text-[10px] text-[var(--primary)]/40 font-bold uppercase tracking-widest">{asset.type} • {asset.size ? (asset.size / 1024 / 1024).toFixed(1) + ' MB' : 'Link'}</p>
                                                </div>
                                            </div>
                                            <a href={asset.url} target="_blank" rel="noopener noreferrer" className="w-10 h-10 sm:w-12 sm:h-12 bg-[var(--primary)] rounded-full flex items-center justify-center text-white shadow-lg opacity-100 sm:opacity-0 group-hover:opacity-100 transition-all sm:hover:scale-110 shrink-0">
                                                <Download className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </a>
                                        </div>
                                    ))}
                                    {(!activeLesson?.assets || activeLesson.assets.length === 0) && (
                                        <p className="text-center text-[var(--foreground)]/40 py-10 font-bold uppercase tracking-widest text-xs">No files attached</p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'chat' && (
                                <CourseChat courseId={course.id} currentUserId={user.id} />
                            )}
                        </div>
                    </div>
                </div>

                {/* AI Chat Widget */}
                <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end transition-all ${chatOpen ? 'w-[calc(100vw-3rem)] sm:w-[350px]' : 'w-auto'}`}>
                    <AnimatePresence>
                        {chatOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                className="bg-[var(--card-bg)] w-full h-[400px] sm:h-[500px] rounded-3xl sm:rounded-[2rem] shadow-2xl mb-4 overflow-hidden border border-[var(--border)] flex flex-col"
                            >
                                <div className="bg-[var(--primary)] p-4 text-white flex justify-between items-center shrink-0">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                                            ✨
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">AI Assistant</h4>
                                            <p className="text-[10px] text-[var(--accent)]/40">Online</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setChatOpen(false)} className="text-white/50 hover:text-white p-2">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background)] custom-scrollbar">
                                    {messages.map((m, i) => (
                                        <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                                            <div className={cn(
                                                "max-w-[85%] sm:max-w-[80%] p-3 rounded-2xl text-sm font-medium",
                                                m.role === 'user' ? "bg-[var(--primary)] text-white rounded-tr-none" : "bg-[var(--card-bg)] shadow-sm text-[var(--foreground)] rounded-tl-none border border-[var(--border)]"
                                            )}>
                                                {m.text}
                                            </div>
                                        </div>
                                    ))}
                                    {isAiTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-[var(--card-bg)] shadow-sm text-[var(--foreground)] rounded-2xl rounded-tl-none border border-[var(--border)] p-3">
                                                <div className="flex gap-1">
                                                    <span className="w-1.5 h-1.5 bg-[var(--primary)]/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-1.5 h-1.5 bg-[var(--primary)]/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-1.5 h-1.5 bg-[var(--primary)]/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-3 bg-[var(--card-bg)] border-t border-[var(--border)] flex gap-2 shrink-0">
                                    <input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Savol bering..."
                                        className="flex-1 bg-[var(--background)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--foreground)] placeholder:text-[var(--foreground)]/30"
                                    />
                                    <button onClick={sendMessage} className="w-10 h-10 shrink-0 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center hover:bg-[var(--primary)] transition-all">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {!chatOpen && (
                        <button
                            onClick={() => setChatOpen(true)}
                            className="w-14 h-14 sm:w-16 sm:h-16 bg-[var(--primary)] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all hover:bg-[var(--primary)]"
                        >
                            <MessageCircle className="w-6 h-6 sm:w-8 sm:h-8" />
                        </button>
                    )}
                </div>
            </main>
        </div>
    )
}
