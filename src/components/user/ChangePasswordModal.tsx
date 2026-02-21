"use client"

import React, { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Save, Loader2, AlertCircle, CheckCircle2 } from "lucide-react"

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    lang: string;
}

export function ChangePasswordModal({ isOpen, onClose, lang }: ChangePasswordModalProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    const handleSave = async () => {
        setMessage(null);

        if (!currentPassword || !newPassword || !confirmPassword) {
            setMessage({ type: 'error', text: lang === 'uz' ? "Barcha maydonlarni to'ldiring" : "Заполните все поля" });
            return;
        }

        if (newPassword !== confirmPassword) {
            setMessage({ type: 'error', text: lang === 'uz' ? "Yangi parollar mos kelmadi" : "Новые пароли не совпадают" });
            return;
        }

        if (newPassword.length < 6) {
            setMessage({ type: 'error', text: lang === 'uz' ? "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak" : "Новый пароль должен содержать не менее 6 символов" });
            return;
        }

        setIsSaving(true);
        try {
            const res = await fetch('/api/user/password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const data = await res.json();

            if (data.success) {
                setMessage({ type: 'success', text: lang === 'uz' ? "Parol muvaffaqiyatli o'zgartirildi!" : "Пароль успешно изменен!" });
                setTimeout(() => {
                    onClose();
                    setCurrentPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setMessage(null);
                }, 2000);
            } else {
                throw new Error(data.error);
            }
        } catch (error: any) {
            setMessage({ type: 'error', text: error.message || (lang === 'uz' ? "Xatolik yuz berdi" : "Произошла ошибка") });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 sm:p-12">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative z-10"
                    >
                        <div className="p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-2xl font-serif italic text-[var(--primary)]">
                                    {lang === 'uz' ? "Parolni o'zgartirish" : "Изменить пароль"}
                                </h3>
                                <button onClick={onClose} className="text-[var(--primary)]/40 hover:text-[var(--primary)] transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--primary)]/40 ml-4">
                                        {lang === 'uz' ? "Joriy parol" : "Текущий пароль"}
                                    </label>
                                    <input
                                        type="password"
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        className="w-full h-14 px-6 rounded-2xl bg-[var(--secondary)] border-none text-[var(--primary)] font-medium focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--primary)]/40 ml-4">
                                        {lang === 'uz' ? "Yangi parol" : "Новый пароль"}
                                    </label>
                                    <input
                                        type="password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="w-full h-14 px-6 rounded-2xl bg-[var(--secondary)] border-none text-[var(--primary)] font-medium focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] uppercase font-black tracking-[0.2em] text-[var(--primary)]/40 ml-4">
                                        {lang === 'uz' ? "Yangi parolni takrorlang" : "Подтвердите новый пароль"}
                                    </label>
                                    <input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="w-full h-14 px-6 rounded-2xl bg-[var(--secondary)] border-none text-[var(--primary)] font-medium focus:ring-2 focus:ring-[var(--primary)]/20 transition-all text-sm"
                                        placeholder="••••••••"
                                    />
                                </div>

                                {message && (
                                    <div className={`p-4 rounded-2xl flex items-center gap-3 text-xs font-bold leading-relaxed ${message.type === 'success' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                                        {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 flex-shrink-0" />}
                                        {message.text}
                                    </div>
                                )}

                                <button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="w-full h-14 mt-4 bg-[var(--primary)] text-white rounded-2xl font-black text-xs uppercase tracking-[0.3em] shadow-xl shadow-[var(--primary)]/20 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-4"
                                >
                                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                                    {lang === 'uz' ? "SAQLASH" : "СОХРАНИТЬ"}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
