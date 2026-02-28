"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { User, Camera, Check, X, Smile, Save, Loader2 } from "lucide-react"

const AVATARS = ["🧘‍♀️", "🧘‍♂️", "✨", "🌸", "🌿", "🌊", "☀️", "🌙", "💎", "🕊️", "🦁", "🦋", "🦢", "🌈"]

interface ProfileSettingsProps {
    user: any
    lang: string
    onUpdate?: (updatedUser: any) => void
}

export function ProfileSettings({ user, lang, onUpdate }: ProfileSettingsProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [firstName, setFirstName] = useState(user?.firstName || "")
    const [avatar, setAvatar] = useState(user?.avatar || "👤")
    const [isSaving, setIsSaving] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

    const handleSave = async () => {
        setIsSaving(true)
        setMessage(null)
        try {
            const res = await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ firstName, avatar })
            })
            const data = await res.json()
            if (data.success) {
                setMessage({ type: 'success', text: lang === 'uz' ? "Profil yangilandi!" : "Профиль обновлен!" })
                if (onUpdate) onUpdate(data.user)
                setTimeout(() => setIsOpen(false), 1500)
            } else {
                throw new Error(data.error)
            }
        } catch (error) {
            setMessage({ type: 'error', text: lang === 'uz' ? "Xatolik yuz berdi" : "Произошла ошибка" })
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="flex items-center gap-4 text-[var(--foreground)]/40 font-bold text-sm hover:text-[var(--primary)] transition-colors"
            >
                <User className="w-5 h-5" /> {lang === 'uz' ? "Profil sozlamalari" : "Настройки профиля"}
            </button>

            <AnimatePresence>
                {isOpen && (
                    <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />

                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="bg-white w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl relative z-10"
                        >
                            <div className="p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-3xl font-serif italic text-[var(--primary)]">
                                        {lang === 'uz' ? "Profilni tahrirlash" : "Редактировать профиль"}
                                    </h3>
                                    <button onClick={() => setIsOpen(false)} className="text-[var(--primary)]/40 hover:text-[var(--primary)] transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-8">
                                    {/* Avatar Selector */}
                                    <div className="flex flex-col items-center gap-6">
                                        <div className="w-24 h-24 rounded-full bg-[var(--secondary)] flex items-center justify-center text-5xl shadow-inner border border-[var(--primary)]/5">
                                            {avatar}
                                        </div>
                                        <div className="grid grid-cols-7 gap-3">
                                            {AVATARS.map(emoji => (
                                                <button
                                                    key={emoji}
                                                    onClick={() => setAvatar(emoji)}
                                                    className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all ${avatar === emoji ? 'bg-[var(--primary)] text-white scale-110 shadow-lg' : 'bg-[var(--secondary)]/50 hover:bg-[var(--secondary)]'}`}
                                                >
                                                    {emoji}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Name Input */}
                                    <div className="space-y-2">
                                        <label className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--primary)]/40 ml-4">
                                            {lang === 'uz' ? "Ismingiz" : "Ваше имя"}
                                        </label>
                                        <input
                                            type="text"
                                            value={firstName}
                                            onChange={(e) => setFirstName(e.target.value)}
                                            className="w-full h-16 px-8 rounded-2xl bg-[var(--secondary)] border-none text-[var(--primary)] font-bold focus:ring-2 focus:ring-[var(--primary)]/20 transition-all"
                                            placeholder="..."
                                        />
                                    </div>

                                    {/* Telegram Info (read-only) */}
                                    {(user?.telegramId || user?.telegramUsername) && (
                                        <div className="p-5 bg-blue-50 border border-blue-200 rounded-2xl space-y-3">
                                            <div className="text-[10px] uppercase font-black tracking-[0.2em] text-blue-500/70">
                                                Telegram
                                            </div>
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                                                    <svg viewBox="0 0 24 24" className="w-5 h-5 text-blue-500" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" /></svg>
                                                </div>
                                                <div className="flex-1 space-y-1 min-w-0">
                                                    {user.telegramUsername && (
                                                        <div className="text-sm font-bold text-[var(--primary)] truncate">
                                                            @{user.telegramUsername}
                                                        </div>
                                                    )}
                                                    {user.telegramId && (
                                                        <div className="text-xs text-[var(--primary)]/50 font-medium">
                                                            ID: <span className="font-mono font-bold text-blue-600">{user.telegramId}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {message && (
                                        <div className={`p-4 rounded-2xl text-center text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                            {message.text}
                                        </div>
                                    )}

                                    <button
                                        onClick={handleSave}
                                        disabled={isSaving}
                                        className="w-full h-16 bg-[var(--primary)] text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4"
                                    >
                                        {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                                        {lang === 'uz' ? "SAQLASH" : "СОХРАНИТЬ"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    )
}
