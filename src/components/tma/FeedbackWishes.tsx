'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, MessageSquare, Send, CheckCircle2, Loader2 } from 'lucide-react';

export default function FeedbackWishes() {
    const [message, setMessage] = useState("");
    const [type, setType] = useState<"FEEDBACK" | "WISH">("FEEDBACK");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;
        setLoading(true);

        try {
            const res = await fetch('/api/feedback', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `${type === 'WISH' ? '[WISH] ' : ''}${message}`,
                    rating: 5 // Default for simple feedback
                })
            });

            if (res.ok) {
                setSubmitted(true);
                setMessage("");
                setTimeout(() => setSubmitted(false), 5000);
            }
        } catch (err) {
            console.error("Feedback Error:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white p-8 rounded-[2.5rem] border border-[#114539]/5 shadow-soft space-y-8 relative overflow-hidden">
            <div className="space-y-2">
                <h3 className="text-2xl font-editorial font-bold text-[#114539]">Fikr va Tilaklar</h3>
                <p className="text-[10px] font-bold text-[#114539]/40 uppercase tracking-widest leading-relaxed">
                    Platformani yaxshilashda yordam bering. Sizning fikringiz biz uchun muhim.
                </p>
            </div>

            <div className="flex gap-2">
                {[
                    { id: 'FEEDBACK', label: 'Fikr-mulohaza', icon: MessageSquare },
                    { id: 'WISH', label: 'Istaklar', icon: Sparkles }
                ].map((item) => (
                    <button
                        key={item.id}
                        onClick={() => setType(item.id as any)}
                        className={`flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl text-[9px] font-bold uppercase tracking-widest transition-all ${type === item.id
                                ? 'bg-[#114539] text-white shadow-lg'
                                : 'bg-[#f6f9fe] text-[#114539]/40 border border-[#114539]/5'
                            }`}
                    >
                        <item.icon className="w-3.5 h-3.5" />
                        {item.label}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="relative">
                    <textarea
                        required
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        placeholder={type === 'WISH' ? "Kurslarda nimalarni ko'rishni xohlaysiz?..." : "Tajribangiz haqida yozing..."}
                        className="w-full bg-[#f6f9fe] border border-[#114539]/5 rounded-[2rem] py-6 px-8 text-xs text-[#0b0c10] shadow-inner min-h-[150px] focus:outline-none focus:ring-2 focus:ring-[#114539]/20 transition-all placeholder:text-[#114539]/20"
                    />
                </div>

                <button
                    type="submit"
                    disabled={loading || submitted}
                    className="btn-luxury w-full py-6 text-[10px] shadow-xl active:scale-[0.98] transition-all flex items-center justify-center gap-3"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : submitted ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" /> YUBORILDI
                        </>
                    ) : (
                        <>
                            <Send className="w-4 h-4" /> YUBORISH
                        </>
                    )}
                </button>
            </form>

            <AnimatePresence>
                {submitted && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center text-center p-8 space-y-4"
                    >
                        <div className="w-16 h-16 bg-[#114539]/5 rounded-full flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-[#114539]" />
                        </div>
                        <h4 className="text-xl font-editorial font-bold text-[#114539]">Rahmat!</h4>
                        <p className="text-xs font-medium text-[#114539]/50">Sizning xabaringiz trenerga yuborildi. Biz birga o'samiz.</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
