"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Sparkles, Loader2 } from "lucide-react"

interface AIAgentProps {
    lang: "uz" | "ru"
}

interface Message {
    role: 'user' | 'assistant'
    content: string
}

export function AIAgent({ lang }: AIAgentProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [userData, setUserData] = useState<any>(null)
    const [messages, setMessages] = useState<Message[]>([])

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch('/api/tma/me')
                const data = await res.json()
                if (data.success && data.user) {
                    setUserData(data.user)
                    setMessages([
                        {
                            role: 'assistant',
                            content: lang === 'uz'
                                ? `Assalomu alaykum, ${data.user.firstName}! Men Sabina Polatova — Yoga & Wellness akademiyasining sun'iy intellekt yordamchisiman. Yoga yoki salomatlik haqida qanday savolingiz bor? 🙏`
                                : `Здравствуйте, ${data.user.firstName}! Я ИИ-помощник Академии Йоги и Здоровья Сабины Полатовой. Какие у вас есть вопросы о йоге или здоровье? 🙏`
                        }
                    ])
                } else {
                    setMessages([
                        {
                            role: 'assistant',
                            content: lang === 'uz'
                                ? "Assalomu alaykum! Men Sabina Polatova — Yoga & Wellness akademiyasining sun'iy intellekt yordamchisiman. Yoga, salomatlik yoki kurslarimiz haqida qanday savolingiz bor? 🙏"
                                : "Здравствуйте! Я ИИ-помощник Академии Йоги и Здоровья Сабины Полатовой. Какие у вас есть вопросы о йоге, здоровье или наших курсах? 🙏"
                        }
                    ])
                }
            } catch {
                setMessages([
                    {
                        role: 'assistant',
                        content: lang === 'uz'
                            ? "Assalomu alaykum! Men Sabina Polatova murabbiyingizning sun'iy intellekt yordamchisiman. Yoga, salomatlik yoki kurslarimiz haqida qanday savolingiz bor? 🙏"
                            : "Здравствуйте! Я ИИ-помощник вашего тренера Сабины Полатовой. Какие у вас есть вопросы о йоге, здоровье или наших курсах? 🙏"
                    }
                ])
            }
        }
        fetchUser()
    }, [lang])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping, isOpen])

    const handleSend = async () => {
        if (!input.trim() || isTyping) return

        const userMessage = input
        setMessages(prev => [...prev, { role: 'user', content: userMessage }])
        setInput("")
        setIsTyping(true)

        try {
            const res = await fetch('/api/ai/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    lang,
                    history: messages // Sending conversation history
                })
            })

            const data = await res.json()

            if (data.success) {
                setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
            } else {
                setMessages(prev => [...prev, { role: 'assistant', content: lang === 'uz' ? "Kechirasiz, xatolik yuz berdi." : "Извините, произошла ошибка." }])
            }
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: lang === 'uz' ? "Tarmoq xatosi." : "Ошибка сети." }])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 w-20 h-20 rounded-full bg-[var(--primary)] text-white flex items-center justify-center shadow-3xl hover:scale-110 active:scale-95 transition-all z-50 premium-shadow border-4 border-white/20 group"
            >
                <div className="absolute inset-0 rounded-full bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
                <MessageCircle className="w-10 h-10" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-28 right-8 w-[350px] md:w-[400px] h-[500px] bg-white rounded-[2.5rem] shadow-2xl z-[60] flex flex-col overflow-hidden border border-primary/5"
                    >
                        <div className="p-8 bg-[var(--primary)] text-white flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 bg-white/10 rounded-xl">
                                    <Sparkles className="w-6 h-6 text-[var(--accent)]" />
                                </div>
                                <div>
                                    <h3 className="font-serif font-black text-xl italic leading-none">Baxtli AI</h3>
                                    <p className="text-[10px] opacity-60 font-bold uppercase tracking-widest mt-1">Sabina Polatova</p>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-secondary/5 scroll-smooth">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-[var(--primary)] text-white rounded-br-none' : 'bg-white text-[var(--foreground)] rounded-bl-none border border-primary/5'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white p-4 rounded-2xl rounded-bl-none border border-primary/5 shadow-sm flex items-center gap-3 animate-pulse">
                                        <div className="flex gap-1">
                                            <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:-0.3s]" />
                                            <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce [animation-delay:-0.15s]" />
                                            <div className="w-1.5 h-1.5 bg-[var(--primary)] rounded-full animate-bounce" />
                                        </div>
                                        <span className="text-[10px] opacity-40 font-bold uppercase tracking-widest">Sabina o'ylamoqda...</span>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-6 bg-white border-t border-primary/5 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder={lang === 'uz' ? "Savolingizni yozing..." : "Задайте свой вопрос..."}
                                className="flex-1 bg-[var(--background)] border border-[var(--primary)]/10 rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 transition-all font-medium text-[var(--foreground)]"
                            />
                            <button
                                onClick={handleSend}
                                disabled={isTyping}
                                className="w-14 h-14 rounded-2xl bg-[var(--primary)] text-white flex items-center justify-center hover:bg-[var(--primary)]/90 transition-all disabled:opacity-50 shadow-lg shadow-[var(--primary)]/20"
                            >
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    )
}


