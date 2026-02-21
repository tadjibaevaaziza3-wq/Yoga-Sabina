'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Info, Sparkles, Clock } from 'lucide-react';

export default function AdminNotifications() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [hidden, setHidden] = useState<Record<string, boolean>>({});

    useEffect(() => {
        fetch('/api/tma/notifications')
            .then(res => res.json())
            .then(data => data.success && setNotifications(data.notifications));
    }, []);

    const visibleNotifications = notifications.filter(n => !hidden[n.id]);

    if (visibleNotifications.length === 0) return null;

    return (
        <section className="space-y-4">
            <div className="flex items-center gap-3">
                <Bell className="w-4 h-4 text-[#114539]" />
                <h3 className="text-[10px] font-bold uppercase tracking-widest text-[#114539]">Muhim xabarlar</h3>
            </div>

            <div className="space-y-3">
                <AnimatePresence>
                    {visibleNotifications.map((n) => (
                        <motion.div
                            key={n.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="relative bg-white p-5 rounded-[2rem] border border-[#114539]/10 shadow-soft overflow-hidden"
                        >
                            {/* Accent line */}
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#114539]" />

                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-2">
                                        <Sparkles className="w-3.5 h-3.5 text-[#114539]" />
                                        <span className="text-[10px] font-black text-[#114539] uppercase tracking-wider">YANGILIK</span>
                                    </div>
                                    <p className="text-xs text-[#114539]/70 leading-relaxed">{n.content}</p>
                                    <div className="flex items-center gap-2 pt-1">
                                        <Clock className="w-3 h-3 text-[#114539]/20" />
                                        <span className="text-[8px] font-bold text-[#114539]/20 uppercase">
                                            {new Date(n.createdAt).toLocaleDateString('uz-UZ')}
                                        </span>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setHidden(prev => ({ ...prev, [n.id]: true }))}
                                    className="p-2 hover:bg-[#114539]/5 rounded-full text-[#114539]/20 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </section>
    );
}
