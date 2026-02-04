"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { MessageCircle, X, Send, Sparkles } from "lucide-react"
import { findBestFAQMatch, Locale } from "@/lib/ai/faq-engine"

interface AIAgentProps {
    lang: Locale
}

export function AIAgent({ lang }: AIAgentProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: lang === 'uz'
                ? "Salom! Men Baxtli Men platformasining sun'iy intellekt yordamchisiman. Yoga yoki sog'lom turmush tarzi haqida savolingiz bormi?"
                : "Привет! Я ИИ-помощник платформы Baxtli Men. У вас есть вопросы о йоге или здоровом образе жизни?"
        }
    ])
    const [input, setInput] = useState("")

    const handleSend = () => {
        if (!input.trim()) return
        const userMessage = { role: 'user', content: input }
        setMessages(prev => [...prev, userMessage])
        setInput("")

        // Local FAQ Logic
        setTimeout(() => {
            const answer = findBestFAQMatch(input, lang)
            setMessages(prev => [...prev, { role: 'assistant', content: answer }])
        }, 600)
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-8 right-8 w-16 h-16 rounded-full bg-wellness-gold text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all z-50 premium-shadow"
            >
                <MessageCircle className="w-8 h-8" />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="fixed bottom-28 right-8 w-[350px] md:w-[400px] h-[500px] bg-white rounded-[2.5rem] shadow-2xl z-[60] flex flex-col overflow-hidden border border-primary/5"
                    >
                        <div className="p-6 bg-primary text-white flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Sparkles className="w-5 h-5 text-wellness-gold" />
                                <h3 className="font-serif text-lg">AI FAQ Agent</h3>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/10 rounded-full">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-secondary/10">
                            {messages.map((m, i) => (
                                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-[80%] p-4 rounded-2xl text-sm font-medium leading-relaxed ${m.role === 'user' ? 'bg-primary text-white' : 'bg-white text-primary shadow-sm'
                                        }`}>
                                        {m.content}
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="p-6 bg-white border-t border-primary/5 flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Savolingizni yozing..."
                                className="flex-1 bg-secondary/20 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-wellness-gold transition-all"
                            />
                            <button
                                onClick={handleSend}
                                className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center hover:bg-wellness-gold transition-all"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence >
        </>
    )
}
