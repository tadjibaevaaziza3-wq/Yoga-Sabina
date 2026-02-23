"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Sparkles, Loader2, Phone, Crown } from "lucide-react"

interface AIAgentProps {
    lang: "uz" | "ru"
}

interface Message {
    role: 'user' | 'assistant'
    content: string
}

const QUICK_ACTIONS = {
    uz: [
        { label: "Bel og'rig'i", query: "Bel og'rig'i uchun qanday mashqlar qilish kerak?" },
        { label: "Stress", query: "Stressni kamaytirishda yoga qanday yordam beradi?" },
        { label: "Kurslar", query: "Qanday kurslar bor va narxlari qancha?" },
        { label: "Murabbiy bilan bog'lanish", query: "Sabina murabbiy bilan qanday bog'lanaman?" },
    ],
    ru: [
        { label: "Боль в спине", query: "Какие упражнения помогут при боли в спине?" },
        { label: "Стресс", query: "Как йога помогает справиться со стрессом?" },
        { label: "Курсы", query: "Какие курсы есть и сколько стоят?" },
        { label: "Связаться с тренером", query: "Как связаться с тренером Сабиной?" },
    ],
}

export function AIAgent({ lang }: AIAgentProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [userData, setUserData] = useState<any>(null)
    const [isSubscribed, setIsSubscribed] = useState(false)
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const [historyLoaded, setHistoryLoaded] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // ─── Auth: try web auth, fallback to TMA ───
    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Try web auth first
                let res = await fetch('/api/auth/me')
                let data = await res.json()

                if (!data.user) {
                    // Fallback to TMA auth
                    res = await fetch('/api/tma/me')
                    data = await res.json()
                    if (data.success && data.user) {
                        data = { user: data.user }
                    }
                }

                if (data.user) {
                    setUserData(data.user)
                }
            } catch {
                // Anonymous user — that's OK
            }
        }
        fetchUser()
    }, [])

    // ─── Load conversation history from DB on first open ───
    const loadHistory = useCallback(async () => {
        if (historyLoaded) return
        try {
            const res = await fetch('/api/ai/chat')
            const data = await res.json()
            if (data.success && data.history?.length > 0) {
                setMessages(data.history)
                setHistoryLoaded(true)
                return
            }
        } catch { /* ignore */ }

        // Set welcome message if no history
        const name = userData?.firstName
        setMessages([{
            role: 'assistant',
            content: lang === 'uz'
                ? `Assalomu alaykum${name ? `, ${name}` : ''}! 🙏\n\nMen Sabina Polatova — yoga terapevti va "Baxtli Men" platformasi yordamchisiman.\n\nYoga, salomatlik yoki kurslarimiz haqida savolingiz bormi? Yordam berishdan xursandman!`
                : `Здравствуйте${name ? `, ${name}` : ''}! 🙏\n\nЯ — Сабина Полатова, йога-терапевт и помощник платформы "Baxtli Men".\n\nЕсть вопросы о йоге, здоровье или наших курсах? Буду рада помочь!`
        }])
        setHistoryLoaded(true)
    }, [historyLoaded, userData, lang])

    useEffect(() => {
        if (isOpen) loadHistory()
    }, [isOpen, loadHistory])

    // ─── Auto-scroll ───
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping, isOpen])

    // ─── Send message ───
    const handleSend = async (text?: string) => {
        const msgText = text || input.trim()
        if (!msgText || isTyping) return

        setMessages(prev => [...prev, { role: 'user', content: msgText }])
        setInput("")
        setIsTyping(true)

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: msgText,
                    lang,
                    history: messages
                })
            })

            const data = await res.json()

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
                if (data.isSubscribed !== undefined) {
                    setIsSubscribed(data.isSubscribed)
                }
            } else {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: lang === 'uz' ? "Kechirasiz, xatolik yuz berdi. Iltimos, qaytadan urinib ko'ring." : "Извините, произошла ошибка. Попробуйте ещё раз."
                }])
            }
        } catch {
            setMessages(prev => [...prev, {
                role: 'assistant',
                content: lang === 'uz' ? "Tarmoq xatosi. Internetni tekshiring." : "Ошибка сети. Проверьте интернет."
            }])
        } finally {
            setIsTyping(false)
        }
    }

    const showQuickActions = messages.length <= 1

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 w-20 h-20 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-3xl hover:scale-110 active:scale-95 transition-all z-50 premium-shadow border-4 border-white/20 group"
            >
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                <MessageCircle className="w-10 h-10" />
                {/* Pulse indicator */}
                <span className="absolute top-0 right-0 w-5 h-5 bg-[var(--accent)] rounded-full animate-pulse border-2 border-white" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-28 right-8 w-[360px] md:w-[420px] h-[540px] bg-white rounded-[2.5rem] shadow-2xl z-[60] flex flex-col overflow-hidden border border-primary/5"
                    >
                        {/* Header */}
                        <div className="p-6 bg-[var(--primary)] text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-white/10 rounded-xl">
                                    <Sparkles className="w-5 h-5 text-[var(--accent)]" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="font-serif font-black text-lg italic leading-none">Baxtli AI</h3>
                                        {isSubscribed && (
                                            <span className="flex items-center gap-1 bg-[var(--accent)]/30 text-[var(--accent)] text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">
                                                <Crown className="w-2.5 h-2.5" /> VIP
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-[9px] opacity-60 font-bold uppercase tracking-widest mt-0.5">Sabina Polatova • Yoga Terapevt</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages */}
                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-3 bg-secondary/5 scroll-smooth">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[85%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm whitespace-pre-line ${m.role === 'user'
                                        ? 'bg-[var(--primary)] text-white rounded-br-none'
                                        : 'bg-white text-[var(--foreground)] rounded-bl-none border border-primary/5'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}

                            {/* Quick Action Buttons */}
                            {showQuickActions && !isTyping && (
                                <div className="pt-2 space-y-2">
                                    <p className="text-[9px] font-bold uppercase tracking-widest text-[var(--foreground)]/30 px-1">
                                        {lang === 'uz' ? "Tez savollar:" : "Быстрые вопросы:"}
                                    </p>
                                    <div className="flex flex-wrap gap-2">
                                        {QUICK_ACTIONS[lang].map((action, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => handleSend(action.query)}
                                                className="px-3 py-2 bg-[var(--primary)]/5 hover:bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold rounded-xl transition-all border border-[var(--primary)]/10 hover:border-[var(--primary)]/20"
                                            >
                                                {action.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Typing indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-primary/5 shadow-sm flex items-center gap-3">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce" />
                                        </div>
                                        <span className="text-[9px] opacity-40 font-bold uppercase tracking-widest">
                                            {lang === 'uz' ? "Sabina javob yozmoqda..." : "Сабина набирает ответ..."}
                                        </span>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Contact CTA bar */}
                        <div className="px-5 py-2 bg-[var(--primary)]/3 border-t border-[var(--primary)]/5 flex items-center justify-center gap-2">
                            <Phone className="w-3 h-3 text-[var(--primary)]/50" />
                            <a
                                href="https://t.me/baxtli_men_admin"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[9px] font-bold uppercase tracking-widest text-[var(--primary)]/50 hover:text-[var(--primary)] transition-colors"
                            >
                                {lang === 'uz' ? "Murabbiy bilan bog'lanish" : "Связаться с тренером"}
                            </a>
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-primary/5 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={lang === 'uz' ? "Savolingizni yozing..." : "Задайте свой вопрос..."}
                                className="flex-1 bg-[var(--background)] border border-[var(--primary)]/10 rounded-2xl px-5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all font-medium text-[var(--foreground)]"
                            />
                            <button
                                onClick={() => handleSend()}
                                disabled={isTyping || !input.trim()}
                                className="w-12 h-12 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center hover:bg-[var(--primary)]/90 transition-all disabled:opacity-50 shadow-lg shadow-[var(--primary)]/20"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
