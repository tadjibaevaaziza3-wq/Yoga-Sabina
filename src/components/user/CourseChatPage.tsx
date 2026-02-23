'use client'

import React, { useState, useEffect, useRef } from 'react'
import { ArrowLeft, Send, MessageCircle, Users, Lock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useParams, useRouter } from 'next/navigation'

interface Course {
    id: string
    title: string
    titleRu?: string
    coverImage?: string
    _count: { courseChats: number }
}

interface ChatMessage {
    id: string
    message: string
    createdAt: string
    user: {
        id: string
        firstName: string | null
        lastName: string | null
        avatar: string | null
        telegramPhotoUrl: string | null
    }
}

export default function CourseChatPage() {
    const params = useParams()
    const router = useRouter()
    const lang = params?.lang as string || 'uz'

    const [courses, setCourses] = useState<Course[]>([])
    const [selectedCourse, setSelectedCourse] = useState<string | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [newMessage, setNewMessage] = useState('')
    const [loading, setLoading] = useState(true)
    const [sending, setSending] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const t = {
        title: lang === 'uz' ? 'Kurs Chatlari' : 'Чаты Курсов',
        subtitle: lang === 'uz' ? 'Faqat obunachilari uchun' : 'Только для подписчиков',
        noMessages: lang === 'uz' ? 'Hali xabarlar yo\'q. Birinchi bo\'ling!' : 'Сообщений пока нет. Будьте первым!',
        placeholder: lang === 'uz' ? 'Xabar yozing...' : 'Напишите сообщение...',
        send: lang === 'uz' ? 'Yuborish' : 'Отправить',
        back: lang === 'uz' ? 'Ortga' : 'Назад',
        noCourses: lang === 'uz' ? 'Siz hali birorta kursga obuna bo\'lmagansiz' : 'Вы ещё не подписаны ни на один курс',
        messages_count: lang === 'uz' ? 'xabar' : 'сообщ.',
        subscribedOnly: lang === 'uz' ? 'Bu chat faqat kurs obunachilari uchun' : 'Этот чат только для подписчиков курса'
    }

    useEffect(() => {
        fetchCourses()
    }, [])

    useEffect(() => {
        if (selectedCourse) {
            fetchMessages(selectedCourse)
            const interval = setInterval(() => fetchMessages(selectedCourse), 5000)
            return () => clearInterval(interval)
        }
    }, [selectedCourse])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/user/chat')
            const data = await res.json()
            if (data.success) setCourses(data.courses)
        } catch (err) {
            console.error('Failed to fetch courses:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchMessages = async (courseId: string) => {
        try {
            const res = await fetch(`/api/user/chat/${courseId}`)
            const data = await res.json()
            if (data.success) {
                setMessages(data.messages)
                setError(null)
            } else if (res.status === 403) {
                setError(t.subscribedOnly)
            }
        } catch (err) {
            console.error('Failed to fetch messages:', err)
        }
    }

    const sendMessage = async () => {
        if (!newMessage.trim() || !selectedCourse || sending) return
        setSending(true)
        try {
            const res = await fetch(`/api/user/chat/${selectedCourse}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage.trim() })
            })
            const data = await res.json()
            if (data.success) {
                setMessages(prev => [...prev, data.message])
                setNewMessage('')
            }
        } catch (err) {
            console.error('Failed to send message:', err)
        } finally {
            setSending(false)
        }
    }

    const selectedCourseData = courses.find(c => c.id === selectedCourse)

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-10 h-10 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[var(--background)]">
            <div className="max-w-4xl mx-auto pt-8 px-4">
                {/* Header */}
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/${lang}/account`} className="p-3 rounded-xl bg-[var(--card-bg)] border border-[var(--border)] hover:shadow transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-serif font-black text-[var(--foreground)]">{t.title}</h1>
                        <p className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 flex items-center gap-1">
                            <Lock className="w-3 h-3" /> {t.subtitle}
                        </p>
                    </div>
                </div>

                {!selectedCourse ? (
                    /* Course List */
                    <div className="space-y-4">
                        {courses.length === 0 ? (
                            <div className="bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border)] p-12 text-center">
                                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-[var(--foreground)]/20" />
                                <p className="text-sm font-bold text-[var(--foreground)]/40">{t.noCourses}</p>
                            </div>
                        ) : (
                            courses.map(course => (
                                <button
                                    key={course.id}
                                    onClick={() => setSelectedCourse(course.id)}
                                    className="w-full bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-6 flex items-center gap-5 hover:shadow-lg hover:-translate-y-0.5 transition-all text-left group"
                                >
                                    <div className="w-14 h-14 rounded-xl bg-[var(--primary)]/10 flex items-center justify-center overflow-hidden flex-shrink-0">
                                        {course.coverImage ? (
                                            <Image src={course.coverImage} alt="" width={56} height={56} className="object-cover w-full h-full" />
                                        ) : (
                                            <MessageCircle className="w-6 h-6 text-[var(--primary)]" />
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-[var(--foreground)] truncate group-hover:text-[var(--primary)] transition">
                                            {lang === 'ru' && course.titleRu ? course.titleRu : course.title}
                                        </h3>
                                        <p className="text-[10px] font-bold text-[var(--foreground)]/30 flex items-center gap-2 mt-1">
                                            <Users className="w-3 h-3" />
                                            {course._count.courseChats} {t.messages_count}
                                        </p>
                                    </div>
                                    <ArrowLeft className="w-5 h-5 text-[var(--foreground)]/20 rotate-180" />
                                </button>
                            ))
                        )}
                    </div>
                ) : (
                    /* Chat View */
                    <div className="bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border)] overflow-hidden flex flex-col" style={{ height: 'calc(100vh - 200px)' }}>
                        {/* Chat Header */}
                        <div className="p-5 border-b border-[var(--border)] flex items-center gap-4">
                            <button onClick={() => setSelectedCourse(null)} className="p-2 rounded-xl hover:bg-[var(--secondary)] transition">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-sm truncate">
                                    {selectedCourseData && (lang === 'ru' && selectedCourseData.titleRu ? selectedCourseData.titleRu : selectedCourseData.title)}
                                </h3>
                                <p className="text-[9px] font-bold text-[var(--foreground)]/30 uppercase tracking-wider">
                                    {messages.length} {t.messages_count}
                                </p>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-5 space-y-4">
                            {error ? (
                                <div className="text-center py-12">
                                    <Lock className="w-10 h-10 mx-auto mb-4 text-red-300" />
                                    <p className="text-sm font-bold text-red-500">{error}</p>
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="text-center py-12">
                                    <MessageCircle className="w-10 h-10 mx-auto mb-4 text-[var(--foreground)]/10" />
                                    <p className="text-sm font-bold text-[var(--foreground)]/30">{t.noMessages}</p>
                                </div>
                            ) : (
                                messages.map(msg => (
                                    <div key={msg.id} className="flex items-start gap-3 group animate-in fade-in slide-in-from-bottom-2">
                                        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 flex items-center justify-center flex-shrink-0 overflow-hidden">
                                            {msg.user.telegramPhotoUrl ? (
                                                <Image src={msg.user.telegramPhotoUrl} alt="" width={32} height={32} className="rounded-full" />
                                            ) : msg.user.avatar ? (
                                                <span className="text-lg">{msg.user.avatar}</span>
                                            ) : (
                                                <span className="text-xs font-black text-[var(--primary)]">
                                                    {msg.user.firstName?.[0] || '?'}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-black text-[var(--foreground)]">
                                                    {msg.user.firstName || 'User'} {msg.user.lastName?.[0] ? `${msg.user.lastName[0]}.` : ''}
                                                </span>
                                                <span className="text-[9px] font-bold text-[var(--foreground)]/20">
                                                    {new Date(msg.createdAt).toLocaleTimeString(lang === 'uz' ? 'uz-UZ' : 'ru-RU', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-[var(--foreground)]/80 leading-relaxed">{msg.message}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input */}
                        {!error && (
                            <div className="p-4 border-t border-[var(--border)]">
                                <div className="flex items-center gap-3">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={e => setNewMessage(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && sendMessage()}
                                        placeholder={t.placeholder}
                                        className="flex-1 px-5 py-3 rounded-xl border border-[var(--border)] bg-[var(--secondary)]/30 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30"
                                    />
                                    <button
                                        onClick={sendMessage}
                                        disabled={!newMessage.trim() || sending}
                                        className="p-3 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 disabled:opacity-40 transition shadow-lg"
                                    >
                                        <Send className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
