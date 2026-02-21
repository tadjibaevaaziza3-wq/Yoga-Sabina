"use client"

import { useState, useEffect, useRef } from "react"
import { Loader2, Search, MessageCircle, User, Calendar, Send, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"

interface ChatMessage {
    id: string
    courseId: string
    userId: string
    message: string
    createdAt: string
    user: { id: string; firstName: string; lastName: string; email: string; role: string }
}

interface CourseWithChats {
    id: string
    title: string
    messages: ChatMessage[]
}

export default function AdminChatPage() {
    const [courses, setCourses] = useState<CourseWithChats[]>([])
    const [loading, setLoading] = useState(true)
    const [activeCourseId, setActiveCourseId] = useState<string | null>(null)
    const [replyText, setReplyText] = useState("")
    const [sending, setSending] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetch('/api/admin/chat')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCourses(data.courses)
                    if (data.courses.length > 0) {
                        setActiveCourseId(data.courses[0].id)
                    }
                }
            })
            .finally(() => setLoading(false))
    }, [])

    const activeCourse = courses.find(c => c.id === activeCourseId)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [activeCourseId, courses])

    const handleSendReply = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!replyText.trim() || !activeCourseId || sending) return

        setSending(true)
        try {
            const res = await fetch('/api/admin/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ courseId: activeCourseId, message: replyText })
            })
            const data = await res.json()
            if (data.success) {
                setCourses(prev => prev.map(c =>
                    c.id === activeCourseId
                        ? { ...c, messages: [...c.messages, data.message] }
                        : c
                ))
                setReplyText("")
            }
        } catch (error) {
            console.error(error)
        } finally {
            setSending(false)
        }
    }

    return (
        <div className="p-8 min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)]">
            <div className="max-w-6xl mx-auto space-y-8 h-[calc(100vh-120px)] flex flex-col">
                <div>
                    <h1 className="text-4xl font-serif font-black text-[var(--foreground)] mb-2">Foydalanuvchi Chatlari</h1>
                    <p className="text-sm font-bold text-[var(--primary)] uppercase tracking-widest opacity-60">
                        Kurslar bo'yicha savollar va xabarlar
                    </p>
                </div>

                <div className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] shadow-xl shadow-[var(--glow)]/5 flex-1 flex overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center w-full h-full">
                            <Loader2 className="w-10 h-10 animate-spin text-[var(--primary)]" />
                        </div>
                    ) : courses.length === 0 ? (
                        <div className="text-center w-full flex flex-col items-center justify-center gap-4 py-20">
                            <div className="w-20 h-20 rounded-full bg-[var(--secondary)] flex items-center justify-center text-[var(--foreground)]/20 shadow-inner">
                                <MessageCircle className="w-10 h-10" />
                            </div>
                            <p className="text-[var(--foreground)]/40 text-sm font-bold uppercase tracking-widest">
                                Xabarlar yo'q
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Sidebar: Course List */}
                            <div className="w-1/3 border-r border-[var(--border)] bg-[var(--background)]/30 flex flex-col">
                                <div className="p-6 border-b border-[var(--border)]">
                                    <h3 className="font-black text-sm uppercase tracking-widest flex items-center gap-2">
                                        <BookOpen className="w-4 h-4" /> Kurslar
                                    </h3>
                                </div>
                                <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                                    {courses.map(course => (
                                        <button
                                            key={course.id}
                                            onClick={() => setActiveCourseId(course.id)}
                                            className={cn(
                                                "w-full text-left p-4 rounded-2xl transition-all border border-transparent",
                                                activeCourseId === course.id
                                                    ? "bg-[var(--primary)] text-white shadow-lg"
                                                    : "hover:bg-[var(--secondary)] text-[var(--foreground)] border-[var(--border)]/50"
                                            )}
                                        >
                                            <h4 className="font-bold text-sm truncate mb-1">{course.title}</h4>
                                            <p className={cn("text-[10px] font-black uppercase tracking-widest", activeCourseId === course.id ? "text-white/60" : "text-[var(--primary)]/50")}>
                                                {course.messages.length} xabar
                                            </p>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Main Chat Area */}
                            <div className="w-2/3 flex flex-col bg-[var(--card-bg)] relative">
                                {activeCourse ? (
                                    <>
                                        <div className="p-6 border-b border-[var(--border)] bg-[var(--background)]/50 flex items-center justify-between">
                                            <h2 className="font-serif font-bold text-xl truncate">{activeCourse.title}</h2>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-card">
                                            {activeCourse.messages.map(msg => {
                                                const isAdmin = msg.user.role === 'ADMIN' || msg.user.role === 'SUPER_ADMIN';

                                                return (
                                                    <div key={msg.id} className={cn("flex flex-col max-w-[80%]", isAdmin ? "ml-auto items-end" : "mr-auto items-start")}>
                                                        <div className={cn("flex items-center gap-2 mb-1", isAdmin ? "flex-row-reverse" : "")}>
                                                            <span className={cn("text-[10px] font-bold uppercase tracking-widest flex items-center gap-1", isAdmin ? "text-[var(--accent)]" : "text-[var(--foreground)]/60")}>
                                                                {isAdmin ? 'ADMIN' : `${msg.user.firstName || ''} ${msg.user.lastName || ''}`.trim() || msg.user.email}
                                                            </span>
                                                            <span className="text-[10px] text-[var(--foreground)]/30">
                                                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                        </div>
                                                        <div className={cn(
                                                            "p-4 rounded-2xl text-sm font-medium leading-relaxed border border-[var(--border)]/50",
                                                            isAdmin ? "bg-[var(--accent)] text-white rounded-tr-none border-transparent" : "bg-[var(--secondary)]/30 text-[var(--foreground)] rounded-tl-none"
                                                        )}>
                                                            {msg.message}
                                                        </div>
                                                    </div>
                                                )
                                            })}
                                            <div ref={messagesEndRef} />
                                        </div>

                                        <div className="p-6 border-t border-[var(--border)] bg-[var(--background)]/50">
                                            <form onSubmit={handleSendReply} className="flex gap-4">
                                                <input
                                                    type="text"
                                                    value={replyText}
                                                    onChange={e => setReplyText(e.target.value)}
                                                    placeholder="Javob yozish..."
                                                    className="flex-1 bg-[var(--card-bg)] border border-[var(--border)] rounded-full px-6 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all font-medium"
                                                    disabled={sending}
                                                />
                                                <button
                                                    type="submit"
                                                    disabled={sending || !replyText.trim()}
                                                    className="w-12 h-12 bg-[var(--accent)] text-white rounded-full flex items-center justify-center hover:bg-[var(--primary)] transition-all disabled:opacity-50 shadow-lg"
                                                >
                                                    <Send className="w-5 h-5" />
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-[var(--foreground)]/40 text-sm font-bold uppercase tracking-widest">
                                        Kursni tanlang
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
