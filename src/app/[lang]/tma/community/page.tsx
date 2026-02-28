'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Container } from "@/components/ui/Container";
import { Users, Send, Share2, Scale, Activity, Star, ArrowLeft, TrendingDown, Smile } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useParams } from 'next/navigation';

interface Message {
    id: string;
    message: string;
    sharedKPI: any;
    photoUrl: string | null;
    createdAt: string;
    user: {
        id: string;
        firstName: string | null;
        lastName: string | null;
        avatar: string | null;
        telegramPhotoUrl: string | null;
    };
}

export default function CommunityPage() {
    const params = useParams();
    const lang = (params?.lang as string) || 'uz';
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [currentUserId, setCurrentUserId] = useState<string | null>(null);
    const [myStats, setMyStats] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const t = lang === 'ru' ? {
        title: 'Сообщество',
        subtitle: 'Общайтесь и поддерживайте друг друга',
        placeholder: 'Напишите сообщение...',
        send: 'Отправить',
        shareKPI: 'Поделиться KPI',
        noMessages: 'Еще нет сообщений. Будьте первым!',
        weight: 'Вес',
        change: 'Изменение',
        mood: 'Настроение',
        energy: 'Энергия',
        sharedStats: 'поделился(ась) результатами',
    } : {
        title: 'Jamoa',
        subtitle: "Bir-biringizni qo'llab-quvvatlang",
        placeholder: 'Xabar yozing...',
        send: 'Yuborish',
        shareKPI: 'KPI ulashish',
        noMessages: "Hali xabarlar yo'q. Birinchi bo'ling!",
        weight: 'Vazn',
        change: "O'zgarish",
        mood: 'Kayfiyat',
        energy: 'Energiya',
        sharedStats: "natijalarini ulashdi",
    };

    const moodEmojis = ['😫', '😟', '😐', '🙂', '😄'];

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch('/api/community/chat');
            const data = await res.json();
            if (data.success) setMessages(data.messages);
        } catch { } finally { setLoading(false); }
    }, []);

    const fetchMyStats = useCallback(async () => {
        try {
            const res = await fetch('/api/user/body-tracking');
            const data = await res.json();
            if (data.success) setMyStats(data.stats);
        } catch { }
    }, []);

    const fetchCurrentUser = useCallback(async () => {
        try {
            const res = await fetch('/api/tma/me');
            const data = await res.json();
            if (data.success) setCurrentUserId(data.user.id);
        } catch { }
    }, []);

    useEffect(() => {
        fetchMessages();
        fetchMyStats();
        fetchCurrentUser();
        // Poll for new messages every 10s
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, [fetchMessages, fetchMyStats, fetchCurrentUser]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!text.trim()) return;
        setSending(true);
        try {
            const res = await fetch('/api/community/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: text }),
            });
            const data = await res.json();
            if (data.success) {
                setText('');
                fetchMessages();
            }
        } catch { } finally { setSending(false); }
    };

    const handleShareKPI = async () => {
        if (!myStats) return;
        setSending(true);
        try {
            const res = await fetch('/api/community/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `📊 ${t.sharedStats}`,
                    sharedKPI: {
                        weight: myStats.latestWeight,
                        weightChange: myStats.weightChange,
                        mood: myStats.latestMood,
                        energy: myStats.latestEnergy,
                        entries: myStats.totalEntries,
                    },
                }),
            });
            const data = await res.json();
            if (data.success) fetchMessages();
        } catch { } finally { setSending(false); }
    };

    const getAvatar = (user: Message['user']) => {
        if (user.avatar) return <span className="text-lg">{user.avatar}</span>;
        if (user.telegramPhotoUrl) return <img src={user.telegramPhotoUrl} alt="" className="w-full h-full rounded-full object-cover" />;
        return <span className="text-xs font-black text-[#114539]">{(user.firstName || '?')[0]}</span>;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f6f9fe] flex items-center justify-center">
                <div className="w-10 h-10 border-t-2 border-[#114539] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <main className="pb-32 bg-[#f6f9fe] min-h-screen flex flex-col">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-xl border-b border-[#114539]/5 px-6 pt-8 pb-4 space-y-1">
                <Link href={`/${lang}/tma/dashboard`} className="flex items-center gap-2 text-[#114539]/40 text-[10px] font-bold uppercase tracking-widest mb-2">
                    <ArrowLeft className="w-3 h-3" /> Panel
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-editorial font-bold text-[#114539]">{t.title}</h1>
                        <p className="text-[9px] font-bold text-[#114539]/40 uppercase tracking-widest">{t.subtitle}</p>
                    </div>
                    <button
                        onClick={handleShareKPI}
                        disabled={sending || !myStats?.latestWeight}
                        className="flex items-center gap-2 bg-[#114539]/5 hover:bg-[#114539]/10 px-4 py-2 rounded-xl text-[9px] font-bold text-[#114539] uppercase tracking-widest transition-all disabled:opacity-30"
                    >
                        <Share2 className="w-3 h-3" /> {t.shareKPI}
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
                {messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-3">
                        <Users className="w-12 h-12 text-[#114539]/10" />
                        <p className="text-[#114539]/30 text-xs font-bold text-center">{t.noMessages}</p>
                    </div>
                ) : messages.map(msg => {
                    const isMe = msg.user.id === currentUserId;
                    return (
                        <motion.div
                            key={msg.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-2 ${isMe ? 'flex-row-reverse' : ''}`}
                        >
                            {/* Avatar */}
                            <div className="w-8 h-8 rounded-full bg-[#114539]/5 flex items-center justify-center flex-shrink-0 border border-[#114539]/10 overflow-hidden">
                                {getAvatar(msg.user)}
                            </div>

                            {/* Bubble */}
                            <div className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-soft ${isMe ? 'bg-[#114539] text-white' : 'bg-white border border-[#114539]/5 text-[#114539]'}`}>
                                <p className={`text-[9px] font-bold mb-1 ${isMe ? 'text-white/60' : 'text-[#114539]/40'}`}>
                                    {msg.user.firstName || 'User'}
                                </p>

                                {/* KPI Card */}
                                {msg.sharedKPI && (
                                    <div className={`rounded-xl p-3 mb-2 grid grid-cols-2 gap-2 ${isMe ? 'bg-white/10' : 'bg-[#f6f9fe]'}`}>
                                        {msg.sharedKPI.weight && (
                                            <div className="text-center">
                                                <p className={`text-sm font-black ${isMe ? 'text-white' : 'text-[#114539]'}`}>{msg.sharedKPI.weight}</p>
                                                <p className={`text-[7px] font-bold uppercase ${isMe ? 'text-white/50' : 'text-[#114539]/30'}`}>{t.weight}</p>
                                            </div>
                                        )}
                                        {msg.sharedKPI.weightChange != null && (
                                            <div className="text-center">
                                                <p className={`text-sm font-black ${msg.sharedKPI.weightChange <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                    {msg.sharedKPI.weightChange > 0 ? '+' : ''}{msg.sharedKPI.weightChange}
                                                </p>
                                                <p className={`text-[7px] font-bold uppercase ${isMe ? 'text-white/50' : 'text-[#114539]/30'}`}>{t.change}</p>
                                            </div>
                                        )}
                                        {msg.sharedKPI.mood && (
                                            <div className="text-center">
                                                <p className="text-lg">{moodEmojis[msg.sharedKPI.mood - 1]}</p>
                                                <p className={`text-[7px] font-bold uppercase ${isMe ? 'text-white/50' : 'text-[#114539]/30'}`}>{t.mood}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <p className="text-xs leading-relaxed">{msg.message}</p>
                                <p className={`text-[8px] mt-1 ${isMe ? 'text-white/30' : 'text-[#114539]/20'}`}>
                                    {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </p>
                            </div>
                        </motion.div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white/80 backdrop-blur-xl border-t border-[#114539]/5 px-4 py-3 pb-24">
                <form onSubmit={handleSend} className="flex gap-2">
                    <input
                        type="text"
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        placeholder={t.placeholder}
                        className="flex-1 bg-[#f6f9fe] rounded-2xl py-3 px-5 text-xs font-medium text-[#114539] focus:outline-none focus:ring-2 focus:ring-[#114539]/20"
                    />
                    <button
                        type="submit"
                        disabled={sending || !text.trim()}
                        className="w-12 h-12 rounded-2xl bg-[#114539] flex items-center justify-center text-white shadow-xl disabled:opacity-30 transition-all"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </form>
            </div>

            {/* Bottom Nav */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#114539]/5 p-6 pb-10 flex justify-around z-50">
                <Link href={`/${lang}/tma/dashboard`} className="flex flex-col items-center gap-2">
                    <Activity className="w-6 h-6 text-[#114539]/20" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]/20">Panel</span>
                </Link>
                <Link href={`/${lang}/tma/body-tracking`} className="flex flex-col items-center gap-2">
                    <Scale className="w-6 h-6 text-[#114539]/20" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]/20">Tana</span>
                </Link>
                <Link href={`/${lang}/tma/community`} className="flex flex-col items-center gap-2">
                    <Users className="w-6 h-6 text-[#114539]" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]">Jamoa</span>
                </Link>
                <Link href={`/${lang}/tma/profile`} className="flex flex-col items-center gap-2">
                    <Star className="w-6 h-6 text-[#114539]/20" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]/20">Profil</span>
                </Link>
            </div>
        </main>
    );
}
