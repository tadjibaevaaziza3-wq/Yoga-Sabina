
"use client"

import { useState } from "react"
import { Locale } from "@/dictionaries/types"
import { Play, FileText, MessageCircle, Heart, Download, ChevronLeft, ChevronRight, Menu, X, Send, Paperclip } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { EnhancedVideoPlayer } from "../video/EnhancedVideoPlayer"
import CourseChat from "../user/CourseChat"

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
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', text: string }[]>([
        { role: 'ai', text: lang === 'uz' ? "Assalomu alaykum! Kurs bo'yicha qanday yordam bera olaman?" : "Здравствуйте! Чем могу помочь по курсу?" }
    ])
    const [chatInput, setChatInput] = useState("")

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

    const [isAiTyping, setIsAiTyping] = useState(false)

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

    return (
        <div className="h-screen flex bg-[var(--background)] overflow-hidden">
            {/* Sidebar (Lessons List) */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 320 : 0, opacity: sidebarOpen ? 1 : 0 }}
                className="bg-[var(--card-bg)] text-[var(--foreground)] flex-shrink-0 flex flex-col border-r border-[var(--border)]"
            >
                <div className="p-6 border-b border-[var(--border)] flex items-center justify-between">
                    <h2 className="font-serif font-black text-lg line-clamp-1 text-[var(--foreground)]">{course.title}</h2>
                    <button onClick={() => setSidebarOpen(false)} className="lg:hidden text-[var(--foreground)]">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                    {/* KPI Block */}
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
                        <div className="mt-3 text-[10px] font-bold tracking-widest uppercase text-[var(--foreground)]/40 text-center">
                            {completedCount} / {course.lessons.length} {lang === 'uz' ? 'dars yakunlandi' : 'уроков завершено'}
                        </div>
                    </div>

                    {course.lessons.map((lesson: any, idx: number) => (
                        <button
                            key={lesson.id}
                            onClick={() => setActiveLessonId(lesson.id)}
                            className={cn(
                                "w-full text-left p-4 rounded-xl flex items-start gap-3 transition-all",
                                activeLessonId === lesson.id
                                    ? "bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30"
                                    : "hover:bg-[var(--secondary)] text-[var(--foreground)]/70"
                            )}
                        >
                            <div className={cn(
                                "w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 mt-0.5",
                                activeLessonId === lesson.id ? "bg-white text-[var(--primary)]" : "bg-[var(--secondary)] text-[var(--primary)]"
                            )}>
                                {completedLessonIds.includes(lesson.id) ? "✓" : (idx + 1)}
                            </div>
                            <div>
                                <h4 className={cn("text-xs font-bold leading-tight mb-1", activeLessonId === lesson.id ? "text-white" : "text-[var(--foreground)]")}>{lesson.title}</h4>
                                <p className={cn("text-[10px] font-mono", activeLessonId === lesson.id ? "text-white/70" : "text-[var(--primary)]/40")}>{Math.floor(lesson.duration / 60)} min</p>
                            </div>
                        </button>
                    ))}
                </div>
                <div className="p-4 border-t border-[var(--border)]">
                    <Link href={`/${lang}/account`} className="block w-full py-3 text-center rounded-xl bg-[var(--secondary)] hover:bg-[var(--secondary)]/80 text-xs font-bold uppercase tracking-widest text-[var(--primary)] transition-all">
                        {lang === 'uz' ? "Chiqish" : "Выйти"}
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
                    <div className="flex items-center gap-3">
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
                <div className="flex-1 overflow-y-auto p-6 lg:p-12 custom-scrollbar">
                    <div className="max-w-5xl mx-auto space-y-10">
                        {/* Video Player */}
                        <div className="bg-black rounded-[2.5rem] overflow-hidden shadow-2xl shadow-[var(--primary)]/10 relative group border border-[var(--border)]">
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
                                        userPhone={user.phone || ''}
                                        email={user.email}
                                        className="w-full"
                                        poster={activeLesson.coverImage || course.coverImage}
                                    />
                                )
                            ) : (
                                <div className="aspect-video absolute inset-0 flex items-center justify-center text-white/30 font-black uppercase tracking-widest">
                                    No Video
                                </div>
                            )}
                        </div>

                        {/* Controls / Stats */}
                        <div className="flex items-center justify-between">
                            <div className="flex gap-4 p-1 bg-[var(--card-bg)] rounded-full border border-[var(--border)]">
                                <button
                                    className={cn(
                                        "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                                        activeTab === 'details' ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--foreground)]/60 hover:bg-[var(--secondary)]"
                                    )}
                                    onClick={() => setActiveTab('details')}
                                >
                                    Details
                                </button>
                                <button
                                    className={cn(
                                        "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                                        activeTab === 'files' ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--foreground)]/60 hover:bg-[var(--secondary)]"
                                    )}
                                    onClick={() => setActiveTab('files')}
                                >
                                    Files ({activeLesson?.assets?.length || 0})
                                </button>
                                <button
                                    className={cn(
                                        "px-8 py-3 rounded-full text-xs font-black uppercase tracking-widest transition-all",
                                        activeTab === 'chat' ? "bg-[var(--primary)] text-white shadow-lg" : "text-[var(--foreground)]/60 hover:bg-[var(--secondary)]"
                                    )}
                                    onClick={() => setActiveTab('chat')}
                                >
                                    {lang === 'uz' ? 'Kurs Chati' : 'Чат курса'}
                                </button>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-red-50 text-red-500 font-bold text-xs uppercase tracking-widest hover:bg-red-100 transition-all">
                                    <Heart className="w-4 h-4 fill-current" /> Like
                                </button>
                            </div>
                        </div>

                        {/* Tab Content */}
                        <div className="bg-[var(--card-bg)] p-10 rounded-[2.5rem] min-h-[300px] border border-[var(--border)] shadow-sm">
                            {activeTab === 'details' && (
                                <div className="space-y-6">
                                    <h2 className="text-3xl font-serif font-black text-[var(--foreground)]">{activeLesson?.title}</h2>
                                    <p className="text-[var(--foreground)]/70 leading-relaxed text-lg">{activeLesson?.description}</p>
                                    {activeLesson?.content && (
                                        <div className="prose prose-emerald max-w-none text-[var(--foreground)]/80">
                                            {activeLesson.content}
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'files' && (
                                <div className="space-y-4">
                                    {activeLesson?.assets?.map((asset: any) => (
                                        <div key={asset.id} className="flex items-center justify-between p-6 bg-[var(--background)] rounded-2xl hover:bg-[var(--secondary)]/30 transition-all group border border-[var(--border)]">
                                            <div className="flex items-center gap-6">
                                                <div className="w-12 h-12 bg-[var(--card-bg)] rounded-xl flex items-center justify-center text-[var(--primary)] shadow-sm font-black text-xs border border-[var(--border)]">
                                                    {asset.type}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-[var(--foreground)] text-base mb-1">{asset.name}</h5>
                                                    <p className="text-[10px] text-[var(--primary)]/40 font-bold uppercase tracking-widest">{asset.type} • {asset.size ? (asset.size / 1024 / 1024).toFixed(1) + ' MB' : 'Link'}</p>
                                                </div>
                                            </div>
                                            <a href={asset.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-[var(--primary)] rounded-full flex items-center justify-center text-white shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:scale-110">
                                                <Download className="w-5 h-5" />
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

                {/* Chat Widget */}
                <div className={`fixed bottom-6 right-6 z-50 flex flex-col items-end transition-all ${chatOpen ? 'w-[350px]' : 'w-auto'}`}>
                    <AnimatePresence>
                        {chatOpen && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 20, scale: 0.9 }}
                                className="bg-[var(--card-bg)] w-full h-[500px] rounded-[2rem] shadow-2xl mb-4 overflow-hidden border border-[var(--border)] flex flex-col"
                            >
                                <div className="bg-[var(--primary)] p-4 text-white flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white/10 rounded-full flex items-center justify-center">
                                            ✨
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-sm">AI Assistant</h4>
                                            <p className="text-[10px] text-[var(--accent)]/40">Online</p>
                                        </div>
                                    </div>
                                    <button onClick={() => setChatOpen(false)} className="text-white/50 hover:text-white">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[var(--background)] custom-scrollbar">
                                    {messages.map((m, i) => (
                                        <div key={i} className={cn("flex", m.role === 'user' ? "justify-end" : "justify-start")}>
                                            <div className={cn(
                                                "max-w-[80%] p-3 rounded-2xl text-sm font-medium",
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
                                <div className="p-3 bg-[var(--card-bg)] border-t border-[var(--border)] flex gap-2">
                                    <input
                                        value={chatInput}
                                        onChange={(e) => setChatInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                                        placeholder="Savol bering..."
                                        className="flex-1 bg-[var(--background)] rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 text-[var(--foreground)] placeholder:text-[var(--foreground)]/30"
                                    />
                                    <button onClick={sendMessage} className="w-10 h-10 bg-[var(--primary)] text-white rounded-xl flex items-center justify-center hover:bg-[var(--primary)] transition-all">
                                        <Send className="w-4 h-4" />
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    {!chatOpen && (
                        <button
                            onClick={() => setChatOpen(true)}
                            className="w-16 h-16 bg-[var(--primary)] text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-all hover:bg-[var(--primary)]"
                        >
                            <MessageCircle className="w-8 h-8" />
                        </button>
                    )}
                </div>
            </main>
        </div>
    )
}


