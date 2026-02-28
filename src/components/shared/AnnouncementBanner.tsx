'use client';

/**
 * AnnouncementBanner — reusable across Website, TMA, and User Panel
 * Fetches /api/announcements and displays them as dismissible cards
 */

import { useState, useEffect } from 'react';
import { X, Bell, Calendar, Tag, AlertTriangle, Clock, Video, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface Announcement {
    id: string;
    title: string;
    message: string;
    type: string;
    imageUrl?: string | null;
    targetUrl?: string | null;
    isPinned: boolean;
    createdAt: string;
}

const typeConfig: Record<string, { icon: any; bg: string; border: string; text: string; badge: string }> = {
    INFO: { icon: Bell, bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', badge: 'bg-blue-500' },
    MEETING: { icon: Calendar, bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', badge: 'bg-emerald-500' },
    PROMO: { icon: Tag, bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', badge: 'bg-amber-500' },
    URGENT: { icon: AlertTriangle, bg: 'bg-red-50', border: 'border-red-200', text: 'text-red-800', badge: 'bg-red-500' },
    SUB_EXPIRING: { icon: Clock, bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-800', badge: 'bg-orange-500' },
    FREE_LESSON: { icon: Video, bg: 'bg-purple-50', border: 'border-purple-200', text: 'text-purple-800', badge: 'bg-purple-500' },
    SALE: { icon: Sparkles, bg: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-800', badge: 'bg-pink-500' },
};

interface AnnouncementBannerProps {
    lang?: string;
    variant?: 'full' | 'compact'; // full = website, compact = TMA/panel
    maxItems?: number;
    className?: string;
}

export default function AnnouncementBanner({ lang = 'uz', variant = 'full', maxItems = 5, className = '' }: AnnouncementBannerProps) {
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load dismissed IDs from localStorage
        try {
            const saved = localStorage.getItem('dismissed-announcements');
            if (saved) setDismissed(new Set(JSON.parse(saved)));
        } catch { }

        fetch(`/api/announcements?lang=${lang}`)
            .then(r => r.json())
            .then(data => {
                if (data.success) setAnnouncements(data.announcements || []);
            })
            .catch(() => { })
            .finally(() => setLoading(false));
    }, [lang]);

    const dismiss = (id: string) => {
        const next = new Set(dismissed);
        next.add(id);
        setDismissed(next);
        try { localStorage.setItem('dismissed-announcements', JSON.stringify([...next])); } catch { }
    };

    const visible = announcements
        .filter(a => !dismissed.has(a.id))
        .slice(0, maxItems);

    if (loading || visible.length === 0) return null;

    return (
        <div className={`space-y-3 ${className}`}>
            {visible.map((a) => {
                const config = typeConfig[a.type] || typeConfig.INFO;
                const Icon = config.icon;

                if (variant === 'compact') {
                    // ── Compact: TMA / User Panel ──
                    return (
                        <div key={a.id} className={`relative ${config.bg} ${config.border} border rounded-2xl p-4 transition-all`}>
                            <button onClick={() => dismiss(a.id)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-black/5 transition-colors">
                                <X size={14} className="text-gray-400" />
                            </button>
                            <div className="flex items-start gap-3 pr-6">
                                <div className={`w-8 h-8 ${config.badge} rounded-xl flex items-center justify-center shrink-0`}>
                                    <Icon size={14} className="text-white" />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <h4 className={`text-xs font-bold ${config.text} truncate`}>{a.title}</h4>
                                    <p className={`text-[11px] ${config.text} opacity-70 mt-0.5 line-clamp-2`}>{a.message}</p>
                                    {a.targetUrl && (
                                        <Link href={a.targetUrl} className={`text-[10px] font-bold ${config.text} underline mt-1 inline-block`}>
                                            {lang === 'ru' ? 'Подробнее →' : 'Batafsil →'}
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                }

                // ── Full: Website ──
                return (
                    <div key={a.id} className={`relative ${config.bg} ${config.border} border rounded-[2rem] p-6 shadow-sm transition-all hover:shadow-md`}>
                        <button onClick={() => dismiss(a.id)} className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-black/5 transition-colors">
                            <X size={16} className="text-gray-400" />
                        </button>
                        <div className="flex items-start gap-5 pr-8">
                            <div className={`w-12 h-12 ${config.badge} rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-${config.badge}/20`}>
                                <Icon size={20} className="text-white" />
                            </div>
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    {a.isPinned && <span className="text-[10px]">📌</span>}
                                    <h3 className={`text-sm font-black ${config.text} uppercase tracking-wider`}>{a.title}</h3>
                                </div>
                                <p className={`text-sm ${config.text} opacity-80 leading-relaxed`}>{a.message}</p>
                                {a.targetUrl && (
                                    <Link href={a.targetUrl} className={`inline-flex items-center gap-2 mt-3 text-xs font-bold ${config.text} hover:underline`}>
                                        {lang === 'ru' ? 'Подробнее' : 'Batafsil'} →
                                    </Link>
                                )}
                            </div>
                            {a.imageUrl && (
                                <img src={a.imageUrl} alt="" className="w-16 h-16 rounded-xl object-cover shrink-0 hidden sm:block" />
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
