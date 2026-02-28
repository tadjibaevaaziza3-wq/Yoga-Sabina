'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Loader2, LogIn, UserPlus, KeyRound, Eye, EyeOff, ShieldCheck } from 'lucide-react';
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
            createPasswordLabel: "Parol yarating",
            createPasswordPlaceholder: "Kamida 6 ta belgi",
            createPasswordHint: "Saytdan kirish uchun kerak bo'ladi",
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
            phoneError: "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak",
            telegramInfo: "Telegram ma'lumotlaringiz",
            forgotPassword: "Parolni unutdingizmi?",
            resetTitle: "Parolni tiklash",
            resetSubtitle: "Telefon raqamingizni kiriting. Yangi parol Telegram bot orqali yuboriladi.",
            resetBtn: "PAROLNI TIKLASH",
            resetSuccess: "Vaqtinchalik parol Telegram botga yuborildi! Uni kiriting va yangi parol yarating.",
            resetSuccessFallback: "Sizning vaqtinchalik parolingiz:",
            resetSuccessFallbackHint: "Ushbu parol bilan kiring, so'ngra yangi parol yarating.",
            resetError: "Parolni tiklashda xatolik yuz berdi.",
            backToLogin: "Kirishga qaytish",
            changePasswordTitle: "Yangi parol yarating",
            changePasswordSubtitle: "Xavfsizlik uchun vaqtinchalik parolni o'zgartiring. Keyingi safar shu parol bilan kirasiz.",
            newPasswordLabel: "Yangi parol",
            newPasswordPlaceholder: "Kamida 6 ta belgi",
            confirmPasswordLabel: "Parolni tasdiqlang",
            confirmPasswordPlaceholder: "Parolni qayta kiriting",
            changePasswordBtn: "PAROLNI O'ZGARTIRISH",
            passwordMismatch: "Parollar mos kelmaydi.",
            passwordTooShort: "Parol kamida 6 ta belgidan iborat bo'lishi kerak.",
            passwordChanged: "Parol muvaffaqiyatli o'zgartirildi!",
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
            createPasswordLabel: "Создайте пароль",
            createPasswordPlaceholder: "Минимум 6 символов",
            createPasswordHint: "Понадобится для входа на сайте",
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
            phoneError: "Номер телефона должен быть в формате +998XXXXXXXXX",
            telegramInfo: "Ваш Telegram",
            forgotPassword: "Забыли пароль?",
            resetTitle: "Сброс пароля",
            resetSubtitle: "Введите номер телефона. Новый пароль будет отправлен через Telegram-бот.",
            resetBtn: "СБРОСИТЬ ПАРОЛЬ",
            resetSuccess: "Временный пароль отправлен в Telegram-бот! Введите его и создайте новый пароль.",
            resetSuccessFallback: "Ваш временный пароль:",
            resetSuccessFallbackHint: "Войдите с этим паролем, затем создайте новый.",
            resetError: "Ошибка при сбросе пароля.",
            backToLogin: "Вернуться к входу",
            changePasswordTitle: "Создайте новый пароль",
            changePasswordSubtitle: "Для безопасности смените временный пароль. В следующий раз вы будете входить с новым паролем.",
            newPasswordLabel: "Новый пароль",
            newPasswordPlaceholder: "Минимум 6 символов",
            confirmPasswordLabel: "Подтвердите пароль",
            confirmPasswordPlaceholder: "Введите пароль ещё раз",
            changePasswordBtn: "СМЕНИТЬ ПАРОЛЬ",
            passwordMismatch: "Пароли не совпадают.",
            passwordTooShort: "Пароль должен содержать не менее 6 символов.",
            passwordChanged: "Пароль успешно изменён!",
        }
    };

    const t = translations[lang as 'uz' | 'ru'] || translations.uz;

    // Read initial mode from URL ?mode=login
    const initialMode = searchParams?.get('mode') === 'login' ? 'login' : 'register';

    const [mode, setMode] = useState<'register' | 'login' | 'reset' | 'change-password'>(initialMode as any);
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
    const [showPassword, setShowPassword] = useState(false);

    // Change password state
    const [tempPassword, setTempPassword] = useState(""); // the temp password user logged in with
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [resetTempPassword, setResetTempPassword] = useState<string | null>(null);

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

    // Phone validation helper
    const isPhoneValid = (p: string) => /^\+998\d{9}$/.test(p);

    // ─── REGISTER ───
    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tgUser?.id) { setError(t.errorId); return; }
        if (!isPhoneValid(phone)) { setError(t.phoneError); return; }
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
                    fullName, phone, password, location, healthGoals, lang
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

                // Check if user must change password
                if (data.forcePasswordChange) {
                    setTempPassword(password); // save the temp password for change-password API
                    setPassword("");
                    setMode('change-password');
                    return;
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

    // ─── RESET PASSWORD ───
    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!phone) return;
        setLoading(true);
        setError(null);

        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    phone,
                    telegramId: tgUser?.id,
                    telegramUsername: tgUser?.username,
                })
            });
            const data = await res.json();

            if (data.success) {
                setError(null);
                setMode('login');
                setPassword("");

                // Check if Telegram delivery succeeded
                if (data.sentViaTelegram === false && data.tempPassword) {
                    // Telegram failed — show the temp password directly in UI
                    setResetTempPassword(data.tempPassword);
                } else {
                    setResetTempPassword(null);
                    setError(t.resetSuccess);
                }
            } else {
                setError(data.error || t.resetError);
            }
        } catch {
            setError(t.errorServer);
        } finally {
            setLoading(false);
        }
    };

    // ─── CHANGE PASSWORD (after force-change) ───
    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (newPassword.length < 6) {
            setError(t.passwordTooShort);
            return;
        }
        if (newPassword !== confirmPassword) {
            setError(t.passwordMismatch);
            return;
        }

        setLoading(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword })
            });
            const data = await res.json();

            if (data.success) {
                router.push(`/${lang}/tma/dashboard`);
            } else {
                setError(data.error || t.resetError);
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

    // ─── Get current header based on mode ───
    const getHeader = () => {
        switch (mode) {
            case 'login': return { title: t.loginTitle, subtitle: t.loginSubtitle };
            case 'register': return { title: t.registerTitle, subtitle: t.registerSubtitle };
            case 'reset': return { title: t.resetTitle, subtitle: t.resetSubtitle };
            case 'change-password': return { title: t.changePasswordTitle, subtitle: t.changePasswordSubtitle };
        }
    };

    const header = getHeader();

    return (
        <div className="min-h-screen bg-[#f6f9fe] overflow-x-hidden">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 pt-12 space-y-8 min-h-screen"
            >
                {/* Header */}
                <div className="space-y-5">
                    <button onClick={() => {
                        if (mode === 'reset') { setMode('login'); setError(null); }
                        else if (mode === 'change-password') { /* can't go back from this */ }
                        else router.push(`/${lang}/tma`);
                    }} className="text-[#114539]/30 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> {mode === 'reset' ? t.backToLogin : t.back}
                    </button>
                    <h2 className="text-4xl font-editorial font-bold text-[#114539] leading-tight tracking-tight">
                        {header.title}
                    </h2>
                    <p className="text-[#114539]/50 text-sm font-medium leading-relaxed">
                        {header.subtitle}
                    </p>
                </div>

                {error && (
                    <div className={`p-4 rounded-2xl text-xs font-bold text-center leading-relaxed ${error === t.resetSuccess
                        ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                        : 'bg-amber-50 border border-amber-200 text-amber-700'
                        }`}>
                        {error}
                    </div>
                )}

                {/* Show temp password when Telegram delivery failed */}
                {resetTempPassword && mode === 'login' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-6 bg-emerald-50 border-2 border-emerald-300 rounded-3xl space-y-3"
                    >
                        <p className="text-emerald-700 text-xs font-bold text-center">
                            {t.resetSuccessFallback}
                        </p>
                        <div className="bg-white rounded-2xl py-4 px-6 text-center border border-emerald-200">
                            <span className="text-2xl font-mono font-black text-[#114539] tracking-[0.3em] select-all">
                                {resetTempPassword}
                            </span>
                        </div>
                        <p className="text-emerald-600 text-[10px] font-medium text-center">
                            {t.resetSuccessFallbackHint}
                        </p>
                    </motion.div>
                )}

                <AnimatePresence mode="wait">
                    {mode === 'change-password' ? (
                        /* ─── CHANGE PASSWORD FORM ─── */
                        <motion.form
                            key="change-password"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleChangePassword}
                            className="space-y-8"
                        >
                            {/* Security badge */}
                            <div className="p-5 bg-emerald-50 border border-emerald-200 rounded-3xl flex items-center gap-4">
                                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center shrink-0">
                                    <ShieldCheck className="w-6 h-6 text-emerald-600" />
                                </div>
                                <p className="text-[11px] text-emerald-700 font-medium leading-relaxed">
                                    {lang === 'uz'
                                        ? "Vaqtinchalik paroldan foydalanmang. Yangi xavfsiz parol yarating."
                                        : "Не используйте временный пароль. Создайте новый безопасный пароль."}
                                </p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.newPasswordLabel}</label>
                                    <div className="relative">
                                        <input required type={showNewPassword ? "text" : "password"} placeholder={t.newPasswordPlaceholder}
                                            value={newPassword} onChange={(e) => setNewPassword(e.target.value)} minLength={6}
                                            className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 pr-14 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                                        <button type="button" onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-[#114539]/30 hover:text-[#114539]/60 transition-colors">
                                            {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.confirmPasswordLabel}</label>
                                    <input required type="password" placeholder={t.confirmPasswordPlaceholder}
                                        value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} minLength={6}
                                        className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                                </div>
                            </div>

                            <button type="submit" disabled={loading || !newPassword || !confirmPassword}
                                className="w-full bg-[#114539] text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-xl disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><KeyRound className="w-4 h-4" /> {t.changePasswordBtn}</>}
                            </button>
                        </motion.form>

                    ) : mode === 'reset' ? (
                        /* ─── RESET PASSWORD FORM ─── */
                        <motion.form
                            key="reset"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleResetPassword}
                            className="space-y-8"
                        >
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.phoneLabel}</label>
                                    <input required type="tel" placeholder={t.phonePlaceholder} value={phone} onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                                </div>
                            </div>

                            <button type="submit" disabled={loading || !phone}
                                className="w-full bg-[#114539] text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-xl disabled:opacity-50 active:scale-95 transition-all flex items-center justify-center gap-3">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><KeyRound className="w-4 h-4" /> {t.resetBtn}</>}
                            </button>

                            <div className="text-center pt-2">
                                <button type="button" onClick={() => { setMode('login'); setError(null); }} className="text-[#114539] text-xs font-bold underline">
                                    {t.backToLogin}
                                </button>
                            </div>
                        </motion.form>

                    ) : mode === 'login' ? (
                        /* ─── LOGIN FORM ─── */
                        <motion.form
                            key="login"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            onSubmit={handleLogin}
                            className="space-y-8"
                        >
                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.phoneLabel}</label>
                                    <input required type="tel" placeholder={t.phonePlaceholder} value={phone} onChange={(e) => setPhone(e.target.value)}
                                        className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                                </div>
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between ml-4 mr-4">
                                        <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest">{t.passwordLabel}</label>
                                        <button type="button" onClick={() => { setMode('reset'); setError(null); }}
                                            className="text-[9px] font-bold text-[#114539] hover:underline opacity-70">
                                            {t.forgotPassword}
                                        </button>
                                    </div>
                                    <div className="relative">
                                        <input required type={showPassword ? "text" : "password"} placeholder={t.passwordPlaceholder} value={password} onChange={(e) => setPassword(e.target.value)}
                                            className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 pr-14 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-[#114539]/30 hover:text-[#114539]/60 transition-colors">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
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
                        </motion.form>
                    ) : (
                        /* ─── REGISTER FORM ─── */
                        <motion.form
                            key="register"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            onSubmit={handleRegister}
                            className="space-y-8"
                        >
                            <div className="space-y-6">
                                {/* Telegram Info Badge */}
                                {tgUser && (
                                    <div className="p-5 bg-blue-50 border border-blue-200 rounded-3xl space-y-3">
                                        <div className="text-[10px] font-black text-blue-600/70 uppercase tracking-widest">{t.telegramInfo}</div>
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shrink-0">
                                                <svg viewBox="0 0 24 24" className="w-6 h-6 text-blue-500" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" /></svg>
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <div className="text-sm font-bold text-[#114539]">
                                                    {tgUser.first_name} {tgUser.last_name || ''}
                                                </div>
                                                <div className="flex items-center gap-3 text-xs text-[#114539]/50 font-medium">
                                                    <span>ID: <span className="font-mono font-bold text-blue-600">{tgUser.id}</span></span>
                                                    {tgUser.username && (
                                                        <span>@<span className="font-bold text-blue-600">{tgUser.username}</span></span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.nameLabel}</label>
                                    <input required type="text" placeholder={t.namePlaceholder} value={fullName} onChange={(e) => setFullName(e.target.value)}
                                        className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.phoneLabel}</label>
                                    <input required type="tel" placeholder={t.phonePlaceholder} value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        minLength={12} maxLength={13}
                                        pattern="\+998\d{9}"
                                        className={`w-full bg-white border rounded-2xl py-6 px-8 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20 ${phone && !isPhoneValid(phone) ? 'border-red-300 bg-red-50/30' : 'border-[#114539]/5'}`} />
                                    {phone && !isPhoneValid(phone) && (
                                        <p className="text-[10px] text-red-500 font-bold ml-4 mt-1">{t.phoneError}</p>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.createPasswordLabel}</label>
                                    <div className="relative">
                                        <input required type={showPassword ? "text" : "password"} placeholder={t.createPasswordPlaceholder}
                                            value={password} onChange={(e) => setPassword(e.target.value)} minLength={6}
                                            className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 pr-14 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-5 top-1/2 -translate-y-1/2 text-[#114539]/30 hover:text-[#114539]/60 transition-colors">
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-[9px] text-[#114539]/40 font-medium ml-4">🌐 {t.createPasswordHint}</p>
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
                        </motion.form>
                    )}
                </AnimatePresence>
            </motion.div>
        </div>
    );
}
