'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronLeft, Loader2, LogIn, UserPlus } from 'lucide-react';
import Link from 'next/link';

export default function TMARegisterPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const lang = (params?.lang as string) || 'uz';

    const translations = {
        uz: {
            back: "ORQAGA",
            registerTitle: "Keling, tanishamiz",
            registerSubtitle: "Davom etish uchun quyidagi ma'lumotlarni to'ldiring.",
            loginTitle: "Kirish",
            loginSubtitle: "Saytda ro'yxatdan o'tgan bo'lsangiz, telefon va parol bilan kiring.",
            nameLabel: "Ism va familiya",
            namePlaceholder: "✨ Ismingiz",
            phoneLabel: "Telefon raqam",
            phonePlaceholder: "+998 90 123 45 67",
            passwordLabel: "Parol",
            passwordPlaceholder: "Parolingizni kiriting",
            locationLabel: "Shahar",
            locationPlaceholder: "Toshkent",
            goalsLabel: "Maqsadlaringiz",
            goalsPlaceholder: "Masalan: Ozish, stressni yo'qotish...",
            offerPrefix: "Men ",
            offerLink: "Ommaviy oferta",
            offerSuffix: " shartlariga roziman",
            submit: "RO'YXATDAN O'TISH",
            loginBtn: "KIRISH",
            switchToLogin: "Allaqachon ro'yxatdan o'tganmisiz?",
            switchToLoginLink: "Kirish",
            switchToRegister: "Hali ro'yxatdan o'tmaganmisiz?",
            switchToRegisterLink: "Ro'yxatdan o'tish",
            phoneExistsMsg: "Bu raqam allaqachon ro'yxatdan o'tgan. Parolingiz bilan kiring:",
            errorId: "Telegram ID aniqlanmadi. Iltimos, qaytadan urinib ko'ring.",
            errorServer: "Serverga ulanishda xatolik yuz berdi.",
            defaultError: "Ro'yxatdan o'tishda xatolik yuz berdi.",
            loginError: "Telefon yoki parol noto'g'ri.",
            errorInit: "Telegram foydalanuvchi ma'lumotlari topilmadi.",
        },
        ru: {
            back: "НАЗАД",
            registerTitle: "Давайте познакомимся",
            registerSubtitle: "Пожалуйста, заполните следующие данные, чтобы продолжить.",
            loginTitle: "Вход",
            loginSubtitle: "Если вы уже зарегистрированы на сайте, войдите по номеру и паролю.",
            nameLabel: "Имя и фамилия",
            namePlaceholder: "✨ Ваше имя",
            phoneLabel: "Номер телефона",
            phonePlaceholder: "+998 90 123 45 67",
            passwordLabel: "Пароль",
            passwordPlaceholder: "Введите ваш пароль",
            locationLabel: "Город",
            locationPlaceholder: "Ташкент",
            goalsLabel: "Ваши цели",
            goalsPlaceholder: "Например: Похудение, снятие стресса...",
            offerPrefix: "Я согласен с условиями ",
            offerLink: "Публичной оферты",
            offerSuffix: "",
            submit: "ЗАРЕГИСТРИРОВАТЬСЯ",
            loginBtn: "ВОЙТИ",
            switchToLogin: "Уже зарегистрированы?",
            switchToLoginLink: "Войти",
            switchToRegister: "Ещё не зарегистрированы?",
            switchToRegisterLink: "Регистрация",
            phoneExistsMsg: "Этот номер уже зарегистрирован. Войдите с паролем:",
            errorId: "ID Telegram не определен. Попробуйте еще раз.",
            errorServer: "Произошла ошибка при подключении к серверу.",
            defaultError: "Произошла ошибка при регистрации.",
            loginError: "Неверный номер или пароль.",
            errorInit: "Данные пользователя Telegram не найдены.",
        }
    };

    const t = translations[lang as 'uz' | 'ru'] || translations.uz;

    // Read initial mode from URL ?mode=login
    const initialMode = searchParams?.get('mode') === 'login' ? 'login' : 'register';

    const [mode, setMode] = useState<'register' | 'login'>(initialMode as any);
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [location, setLocation] = useState("");
    const [healthGoals, setHealthGoals] = useState("");
    const [agreeToOffer, setAgreeToOffer] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [tgUser, setTgUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initTMA = async () => {
            const isDev = window.location.hostname === 'localhost';
            let currentTgUser = null;

            if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
                const tg = (window as any).Telegram.WebApp;
                tg.expand();
                const user = tg.initDataUnsafe?.user;
                if (user) {
                    currentTgUser = user;
                } else if (isDev) {
                    currentTgUser = { id: 12345678, first_name: "Test", last_name: "User", username: "testuser" };
                }
            } else if (isDev) {
                currentTgUser = { id: 12345678, first_name: "Test", last_name: "User", username: "testuser" };
            }

            if (currentTgUser) {
                setTgUser(currentTgUser);
                setFullName((currentTgUser.first_name || "") + " " + (currentTgUser.last_name || ""));

                // Check if user is already registered
                try {
                    const res = await fetch(`/api/tma/register?telegramId=${currentTgUser.id}`);
                    const data = await res.json();
                    if (data.success && data.isRegistered) {
                        router.push(`/${lang}/tma/dashboard`);
                        return;
                    }
                } catch (err) {
                    console.error("Auth check error:", err);
                }
            } else if (!isDev) {
                setError(t.errorInit);
            }

            setInitializing(false);
        };

        initTMA();
    }, []);

    // ─── REGISTER ───
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tgUser?.id) { setError(t.errorId); return; }
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/tma/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId: tgUser.id,
                    telegramUsername: tgUser.username,
                    firstName: tgUser.first_name,
                    lastName: tgUser.last_name,
                    fullName, phone, location, healthGoals, lang
                })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                router.push(`/${lang}/tma/dashboard`);
            } else {
                // If phone already exists, switch to login
                if (res.status === 409 || (data.error && (
                    data.error.toLowerCase().includes('allaqachon') ||
                    data.error.toLowerCase().includes('уже зарегистрирован') ||
                    data.error.toLowerCase().includes('phone')
                ))) {
                    setMode('login');
                    setError(t.phoneExistsMsg);
                } else {
                    setError(data.error || t.defaultError);
                }
            }
        } catch {
            setError(t.errorServer);
        } finally {
            setLoading(false);
        }
    };

    // ─── LOGIN ───
    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ login: phone, password })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                // Link telegramId to the existing user
                if (tgUser?.id) {
                    try {
                        await fetch('/api/tma/register', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                telegramId: tgUser.id,
                                telegramUsername: tgUser.username,
                                firstName: tgUser.first_name,
                                lastName: tgUser.last_name,
                                phone, lang
                            })
                        });
                    } catch { /* not critical */ }
                }
                router.push(`/${lang}/tma/dashboard`);
            } else {
                setError(data.error || t.loginError);
            }
        } catch {
            setError(t.errorServer);
        } finally {
            setLoading(false);
        }
    };

    if (initializing) {
        return (
            <div className="min-h-screen bg-[#f6f9fe] flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#114539]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#f6f9fe] overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 pt-12 space-y-8 min-h-screen"
            >
                {/* Header */}
                <div className="space-y-5">
                    <button onClick={() => router.push(`/${lang}/tma`)} className="text-[#114539]/30 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> {t.back}
                    </button>
                    <h2 className="text-4xl font-editorial font-bold text-[#114539] leading-tight tracking-tight">
                        {mode === 'login' ? t.loginTitle : t.registerTitle}
                    </h2>
                    <p className="text-[#114539]/50 text-sm font-medium leading-relaxed">
                        {mode === 'login' ? t.loginSubtitle : t.registerSubtitle}
                    </p>
                </div>

                {error && (
                    <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-amber-700 text-xs font-bold text-center leading-relaxed">
                        {error}
                    </div>
                )}

                {mode === 'login' ? (
                    /* ─── LOGIN FORM ─── */
                    <form onSubmit={handleLogin} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.phoneLabel}</label>
                                <input required type="tel" placeholder={t.phonePlaceholder} value={phone} onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.passwordLabel}</label>
                                <input required type="password" placeholder={t.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                            </div>
                        </div>

                        <button type="submit" disabled={loading || !phone || !password}
                            className="w-full bg-[#114539] text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-xl disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-4 h-4" /> {t.loginBtn}</>}
                        </button>

                        <div className="text-center pt-2">
                            <span className="text-[#114539]/40 text-xs font-medium">{t.switchToRegister} </span>
                            <button type="button" onClick={() => { setMode('register'); setError(null); }} className="text-[#114539] text-xs font-bold underline">
                                {t.switchToRegisterLink}
                            </button>
                        </div>
                    </form>
                ) : (
                    /* ─── REGISTER FORM ─── */
                    <form onSubmit={handleRegister} className="space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.nameLabel}</label>
                                <input required type="text" placeholder={t.namePlaceholder} value={fullName} onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.phoneLabel}</label>
                                <input required type="tel" placeholder={t.phonePlaceholder} value={phone} onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.locationLabel}</label>
                                <input required type="text" placeholder={t.locationPlaceholder} value={location} onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.goalsLabel}</label>
                                <textarea required placeholder={t.goalsPlaceholder} value={healthGoals} onChange={(e) => setHealthGoals(e.target.value)}
                                    className="w-full bg-white border border-[#114539]/5 rounded-[2.5rem] py-6 px-8 text-[#0b0c10] shadow-soft min-h-[140px] focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                            </div>
                        </div>

                        <div className="p-6 bg-white rounded-3xl border border-[#114539]/5 shadow-soft flex items-start gap-4">
                            <input type="checkbox" required id="tma-offer" checked={agreeToOffer} onChange={(e) => setAgreeToOffer(e.target.checked)} className="mt-1 w-5 h-5 accent-[#114539]" />
                            <label htmlFor="tma-offer" className="text-xs font-medium text-[#114539]/60 leading-snug">
                                {t.offerPrefix}
                                <Link href={`/${lang}/legal/public-offer`} className="text-[#114539] font-bold underline">
                                    {t.offerLink}
                                </Link>
                                {t.offerSuffix}
                            </label>
                        </div>

                        <button type="submit" disabled={!agreeToOffer || loading || initializing || !tgUser?.id}
                            className="w-full bg-[#114539] text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-xl disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3">
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><UserPlus className="w-4 h-4" /> {t.submit}</>}
                        </button>

                        <div className="text-center pt-2">
                            <span className="text-[#114539]/40 text-xs font-medium">{t.switchToLogin} </span>
                            <button type="button" onClick={() => { setMode('login'); setError(null); }} className="text-[#114539] text-xs font-bold underline">
                                {t.switchToLoginLink}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
