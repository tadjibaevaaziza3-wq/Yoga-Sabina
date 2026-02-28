'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Users, Send, Share2, Scale, Activity, MessageSquare, Hash } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

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

interface CourseChat {
    courseId: string;
    courseTitle: string;
    messageCount: number;
}

interface Props {
    lang: 'uz' | 'ru';
    userId: string;
}

export default function CommunityClient({ lang, userId }: Props) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [courseChats, setCourseChats] = useState<CourseChat[]>([]);
    const [loading, setLoading] = useState(true);
    const [text, setText] = useState('');
    const [sending, setSending] = useState(false);
    const [activeTab, setActiveTab] = useState<'global' | 'courses'>('global');
    const [myStats, setMyStats] = useState<any>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const t = lang === 'ru' ? {
        title: 'Сообщество',
        subtitle: 'Общайтесь и поддерживайте',
        globalChat: 'Общий чат',
        courseChats: 'Чаты курсов',
        placeholder: 'Напишите сообщение...',
        shareKPI: 'Поделиться KPI',
        noMessages: 'Будьте первым!',
        noCourseChats: 'Подпишитесь на курс для доступа к чату',
        sharedStats: 'поделился результатами',
        weight: 'Вес',
        change: 'Изменение',
        mood: 'Настроение',
        messages_count: 'сообщений',
    } : {
        title: 'Jamoa',
        subtitle: "Bir-biringizni qo'llab-quvvatlang",
        globalChat: 'Umumiy chat',
        courseChats: 'Kurs chatlari',
        placeholder: 'Xabar yozing...',
        shareKPI: 'KPI ulashish',
        noMessages: "Birinchi bo'ling!",
        noCourseChats: "Chat uchun kursga obuna bo'ling",
        sharedStats: "natijalarini ulashdi",
        weight: 'Vazn',
        change: "O'zgarish",
        mood: 'Kayfiyat',
        messages_count: 'xabar',
    };

    const moodEmojis = ['😫', '😟', '😐', '🙂', '😄'];

    const fetchMessages = useCallback(async () => {
        try {
            const res = await fetch('/api/community/chat');
            const data = await res.json();
            if (data.success) setMessages(data.messages);
        } catch { } finally { setLoading(false); }
    }, []);

    const fetchCourseChats = useCallback(async () => {
        try {
            const res = await fetch('/api/user/chat/rooms');
            const data = await res.json();
            if (data.success) setCourseChats(data.rooms || []);
        } catch { }
    }, []);

    const fetchMyStats = useCallback(async () => {
        try {
            const res = await fetch('/api/user/body-tracking');
            const data = await res.json();
            if (data.success) setMyStats(data.stats);
        } catch { }
    }, []);

    useEffect(() => {
        fetchMessages();
        fetchCourseChats();
        fetchMyStats();
        const interval = setInterval(fetchMessages, 10000);
        return () => clearInterval(interval);
    }, [fetchMessages, fetchCourseChats, fetchMyStats]);

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
            if (data.success) { setText(''); fetchMessages(); }
        } catch { } finally { setSending(false); }
    };

    const handleShareKPI = async () => {
        if (!myStats?.latestWeight) return;
        setSending(true);
        try {
            await fetch('/api/community/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: `📊 ${t.sharedStats}`,
                    sharedKPI: { weight: myStats.latestWeight, weightChange: myStats.weightChange, mood: myStats.latestMood, entries: myStats.totalEntries },
                }),
            });
            fetchMessages();
        } catch { } finally { setSending(false); }
    };

    const getAvatar = (user: Message['user']) => {
        if (user.avatar) return <span className="text-lg">{user.avatar}</span>;
        if (user.telegramPhotoUrl) return <img src={user.telegramPhotoUrl} alt="" className="w-full h-full rounded-full object-cover" />;
        return <span className="text-xs font-black text-[var(--primary)]">{(user.firstName || '?')[0]}</span>;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="w-10 h-10 border-t-2 border-[var(--primary)] rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-[1000px] mx-auto px-6 py-8 space-y-6 pb-24">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div>
                    <h1 className="text-3xl font-editorial font-bold text-[var(--primary)]">{t.title}</h1>
                    <p className="text-xs text-[var(--primary)]/40 font-bold uppercase tracking-widest mt-1">{t.subtitle}</p>
                </div>
                <button onClick={handleShareKPI} disabled={sending || !myStats?.latestWeight}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[var(--primary)] hover:bg-[var(--primary)]/90 transition-all disabled:opacity-30">
                    <Share2 className="w-4 h-4" /> {t.shareKPI}
                </button>
            </div>

            {/* Tabs: Global / Course Chats */}
            <div className="flex bg-white rounded-2xl p-1 shadow-sm border border-[var(--primary)]/5">
                <button onClick={() => setActiveTab('global')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2
                        ${activeTab === 'global' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--primary)]/40'}`}>
                    <Users className="w-4 h-4" /> {t.globalChat}
                </button>
                <button onClick={() => setActiveTab('courses')}
                    className={`flex-1 py-3 text-[10px] font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2
                        ${activeTab === 'courses' ? 'bg-[var(--primary)] text-white shadow-md' : 'text-[var(--primary)]/40'}`}>
                    <MessageSquare className="w-4 h-4" /> {t.courseChats}
                </button>
            </div>

            {/* Global Chat */}
            {activeTab === 'global' && (
                <div className="bg-white rounded-2xl shadow-sm border border-[var(--primary)]/5 overflow-hidden">
                    <div className="h-[500px] overflow-y-auto p-4 space-y-3">
                        {messages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full gap-3">
                                <Users className="w-12 h-12 text-[var(--primary)]/10" />
                                <p className="text-[var(--primary)]/30 text-xs font-bold">{t.noMessages}</p>
                            </div>
                        ) : messages.map(msg => {
                            const isMe = msg.user.id === userId;
                            return (
                                <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                                    className={`flex gap-3 ${isMe ? 'flex-row-reverse' : ''}`}>
                                    <div className="w-9 h-9 rounded-full bg-[var(--primary)]/5 flex items-center justify-center flex-shrink-0 border border-[var(--primary)]/10 overflow-hidden">
                                        {getAvatar(msg.user)}
                                    </div>
                                    <div className={`max-w-[70%] rounded-2xl px-4 py-3 ${isMe ? 'bg-[var(--primary)] text-white' : 'bg-[var(--secondary)]/50 text-[var(--primary)]'}`}>
                                        <p className={`text-[9px] font-bold mb-1 ${isMe ? 'text-white/60' : 'text-[var(--primary)]/40'}`}>
                                            {msg.user.firstName || 'User'}
                                        </p>
                                        {msg.sharedKPI && (
                                            <div className={`rounded-xl p-3 mb-2 grid grid-cols-2 gap-2 ${isMe ? 'bg-white/10' : 'bg-white'}`}>
                                                {msg.sharedKPI.weight && (
                                                    <div className="text-center">
                                                        <p className={`text-sm font-black ${isMe ? 'text-white' : 'text-[var(--primary)]'}`}>{msg.sharedKPI.weight}</p>
                                                        <p className={`text-[7px] font-bold uppercase ${isMe ? 'text-white/50' : 'text-[var(--primary)]/30'}`}>{t.weight}</p>
                                                    </div>
                                                )}
                                                {msg.sharedKPI.weightChange != null && (
                                                    <div className="text-center">
                                                        <p className={`text-sm font-black ${msg.sharedKPI.weightChange <= 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                                            {msg.sharedKPI.weightChange > 0 ? '+' : ''}{msg.sharedKPI.weightChange}
                                                        </p>
                                                        <p className={`text-[7px] font-bold uppercase ${isMe ? 'text-white/50' : 'text-[var(--primary)]/30'}`}>{t.change}</p>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                        <p className="text-xs leading-relaxed">{msg.message}</p>
                                        <p className={`text-[8px] mt-1 ${isMe ? 'text-white/30' : 'text-[var(--primary)]/20'}`}>
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </p>
                                    </div>
                                </motion.div>
                            );
                        })}
                        <div ref={messagesEndRef} />
                    </div>
                    <form onSubmit={handleSend} className="flex gap-2 p-4 border-t border-[var(--primary)]/5">
                        <input type="text" value={text} onChange={(e) => setText(e.target.value)} placeholder={t.placeholder}
                            className="flex-1 bg-[var(--secondary)]/30 rounded-2xl py-3 px-5 text-xs font-medium text-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
                        <button type="submit" disabled={sending || !text.trim()}
                            className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white shadow-lg disabled:opacity-30 transition-all">
                            <Send className="w-4 h-4" />
                        </button>
                    </form>
                </div>
            )}

            {/* Course Chats List */}
            {activeTab === 'courses' && (
                <div className="space-y-3">
                    {courseChats.length === 0 ? (
                        <div className="bg-white rounded-2xl p-12 shadow-sm text-center">
                            <MessageSquare className="w-10 h-10 text-[var(--primary)]/10 mx-auto mb-3" />
                            <p className="text-[var(--primary)]/30 text-sm font-bold">{t.noCourseChats}</p>
                        </div>
                    ) : courseChats.map(cc => (
                        <Link key={cc.courseId} href={`/${lang}/chat?courseId=${cc.courseId}`}>
                            <motion.div whileHover={{ y: -2 }}
                                className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--primary)]/5 flex items-center gap-4 cursor-pointer hover:shadow-md transition-all">
                                <div className="w-12 h-12 rounded-xl bg-[var(--primary)]/5 flex items-center justify-center">
                                    <Hash className="w-5 h-5 text-[var(--primary)]" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-bold text-[var(--primary)]">{cc.courseTitle}</p>
                                    <p className="text-[10px] text-[var(--primary)]/40 font-bold">{cc.messageCount} {t.messages_count}</p>
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
}
