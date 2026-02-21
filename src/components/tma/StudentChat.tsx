'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, User as UserIcon, Heart, MessageCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function StudentChat() {
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [userData, setUserData] = useState<any>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const [isLoading, setIsLoading] = useState(false);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/tma/chat');
            const data = await res.json();
            if (data.success) {
                setMessages(data.messages);
            }
        } catch (err) {
            console.error("Chat fetch error:", err);
        }
    };

    useEffect(() => {
        fetch('/api/tma/me')
            .then(res => res.json())
            .then(data => data.success && setUserData(data.user));

        fetchMessages();
        const interval = setInterval(fetchMessages, 4000); // Poll every 4s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !userData || isLoading) return;

        const text = newMessage;
        setNewMessage("");
        setIsLoading(true);

        try {
            // 1. Send message to regular chat API
            const res = await fetch('/api/tma/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await res.json();
            if (data.success) {
                setMessages(prev => [...prev, data.message]);

                // 2. If message contains keywords or is addressed to AI/Sabina, get AI response
                const aiTriggers = ['sabina', 'yordam', 'savol', 'qanday', 'yordam bering', 'pomogite', 'kak'];
                const shouldTriggerAI = aiTriggers.some(trigger => text.toLowerCase().includes(trigger));

                if (shouldTriggerAI) {
                    const aiRes = await fetch('/api/ai/chat', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            message: text,
                            history: messages.slice(-5).map(m => ({ role: m.userId === userData.id ? 'user' : 'assistant', content: m.message }))
                        })
                    });
                    const aiData = await aiRes.json();

                    if (aiData.success) {
                        // Create a virtual message from "Sabina" (AI)
                        // In a production app, the AI would also post to /api/tma/chat as a system user
                        // Here we just add it to the local state for immediate feedback
                        const aiMessage = {
                            id: 'ai-' + Date.now(),
                            userId: 'ai-assistant',
                            message: aiData.response,
                            createdAt: new Date().toISOString(),
                            user: {
                                firstName: 'Sabina (AI)',
                                role: 'ADMIN'
                            }
                        };

                        // Also save AI response to chat for others to see
                        await fetch('/api/tma/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ text: aiData.response, isAi: true })
                        });

                        setMessages(prev => [...prev, aiMessage]);
                    }
                }
            }
        } catch (err) {
            console.error("Chat send error:", err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div id="support" className="flex flex-col h-[500px] bg-white rounded-[2.5rem] border border-[#114539]/5 shadow-soft overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-[#114539]/5 flex items-center justify-between bg-[#f6f9fe]">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#114539] flex items-center justify-center text-white shadow-lg shadow-[#114539]/20">
                        <MessageCircle className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="text-sm font-editorial font-bold text-[#114539]">Talabalar jamiyati</h4>
                        <p className="text-[10px] font-bold text-[#114539]/40 uppercase tracking-widest">Jonli chat</p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
                <AnimatePresence>
                    {messages.map((msg) => {
                        const isMe = userData && msg.userId === userData.id;
                        const isTrainer = msg.user?.role === 'ADMIN' || msg.user?.role === 'SUPER_ADMIN';
                        const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                        return (
                            <motion.div
                                key={msg.id}
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                            >
                                <div className={`flex items-end gap-2 max-w-[85%] ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                                    {!isMe && (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm overflow-hidden ${isTrainer ? 'bg-[#114539]' : 'bg-[#114539]/10'}`}>
                                            {msg.user?.avatar ? (
                                                <span className="text-lg">{msg.user.avatar}</span>
                                            ) : (
                                                <UserIcon className={`w-4 h-4 ${isTrainer ? 'text-white' : 'text-[#114539]'}`} />
                                            )}
                                        </div>
                                    )}
                                    <div className={`space-y-1 ${isMe ? 'items-end' : 'items-start'}`}>
                                        <div className="flex items-center gap-2 px-2">
                                            <span className="text-[9px] font-black text-[#114539]/40 uppercase tracking-widest">{msg.user?.firstName || "Talaba"}</span>
                                            {isTrainer && <span className="text-[8px] px-1.5 py-0.5 bg-[#114539] text-white rounded-full font-bold uppercase tracking-widest">Trener</span>}
                                        </div>
                                        <div className={`p-4 rounded-2xl text-xs font-medium leading-relaxed shadow-sm ${isMe
                                            ? 'bg-[#114539] text-white rounded-tr-none'
                                            : isTrainer
                                                ? 'bg-[#114539]/5 border border-[#114539]/10 text-[#114539] rounded-tl-none'
                                                : 'bg-[#f6f9fe] text-[#114539] rounded-tl-none'
                                            }`}>
                                            {msg.message}
                                        </div>
                                        <div className="flex items-center gap-3 px-2">
                                            <span className="text-[8px] font-bold text-[#114539]/20 uppercase">{formattedTime}</span>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        );
                    })}
                </AnimatePresence>
            </div>

            {/* Input Area */}
            <form onSubmit={handleSendMessage} className="p-4 bg-[#f6f9fe] border-t border-[#114539]/5">
                <div className="relative flex items-center gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Xabaringizni yozing..."
                        className="flex-1 bg-white border border-[#114539]/5 rounded-2xl py-4 pl-6 pr-4 text-xs shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || !newMessage.trim()}
                        className="w-12 h-12 shrink-0 bg-[#114539] rounded-2xl flex items-center justify-center text-white shadow-lg shadow-[#114539]/20 active:scale-90 disabled:opacity-50 transition-all cursor-pointer z-10"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </form>
        </div>
    );
}
