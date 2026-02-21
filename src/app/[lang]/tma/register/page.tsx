'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, Loader2, Play, Users } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function TMARegisterPage() {
    const router = useRouter();
    const params = useParams();
    const lang = (params?.lang as string) || 'uz';
    const videoRef = useRef<HTMLVideoElement>(null);

    const translations = {
        uz: {
            back: "ORQAGA",
            title: "Baxtli Men",
            tagline: "PREMIUM YOGA VA SALOMATLIK",
            stats: "500+ A'ZOLAR",
            introTitle: "Mening metodim bilan tanishing",
            introLabel: "INTRO VIDEO",
            bio: "Sabina Polatova — 7 yillik tajribaga ega sertifikatlangan yoga-trener va yoga-terapevt. Salomatlik va barcha uchun ichki muvozanat bo'yicha mutaxassis.",
            cta: "BOSHLASH",
            registerTitle: "Keling, tanishamiz",
            registerSubtitle: "Davom etish uchun quyidagi ma'lumotlarni to'ldiring.",
            nameLabel: "Ism va familiya",
            namePlaceholder: "Sabina Polatova",
            phoneLabel: "Telefon raqam",
            phonePlaceholder: "+998 90 123 45 67",
            locationLabel: "Shahar",
            locationPlaceholder: "Toshkent",
            goalsLabel: "Maqsadlaringiz",
            goalsPlaceholder: "Masalan: Ozish, stressni yo'qotish...",
            offerPrefix: "Men ",
            offerLink: "Ommaviy oferta",
            offerSuffix: " shartlariga roziman",
            submit: "RO'YXATDAN O'TISH",
            errorInit: "Telegram foydalanuvchi ma'lumotlari topilmadi. Iltimos, Telegram orqali kiring.",
            errorEnv: "Telegram Mini App muhiti topilmadi.",
            errorId: "Telegram ID aniqlanmadi. Iltimos, qaytadan urinib ko'ring.",
            errorServer: "Serverga ulanishda xatolik yuz berdi.",
            defaultError: "Ro'yxatdan o'tishda xatolik yuz berdi.",
            devMode: "Development Mode: Mock User Active"
        },
        ru: {
            back: "НАЗАД",
            title: "Baxtli Men",
            tagline: "ПРЕМИАЛЬНАЯ ЙОГА И ЗДОРОВЬЕ",
            stats: "500+ УЧАСТНИКОВ",
            introTitle: "Познакомьтесь с моим методом",
            introLabel: "ИНТРО ВИДЕО",
            bio: "Сабина Полатова — сертифицированный йога-тренер и йога-терапевт с 7-летним стажем. Специалист по оздоровлению и внутреннему балансу для всех.",
            cta: "НАЧАТЬ",
            registerTitle: "Давайте познакомимся",
            registerSubtitle: "Пожалуйста, заполните следующие данные, чтобы продолжить.",
            nameLabel: "Имя и фамилия",
            namePlaceholder: "Сабина Полатова",
            phoneLabel: "Номер телефона",
            phonePlaceholder: "+998 90 123 45 67",
            locationLabel: "Город",
            locationPlaceholder: "Ташкент",
            goalsLabel: "Ваши цели",
            goalsPlaceholder: "Например: Похудение, снятие стресса...",
            offerPrefix: "Я согласен с условиями ",
            offerLink: "Публичной оферты",
            offerSuffix: "",
            submit: "ЗАРЕГИСТРИРОВАТЬСЯ",
            errorInit: "Данные пользователя Telegram не найдены. Пожалуйста, войдите через Telegram.",
            errorEnv: "Среда Telegram Mini App не найдена.",
            errorId: "ID Telegram не определен. Пожалуйста, попробуйте еще раз.",
            errorServer: "Произошла ошибка при подключении к серверу.",
            defaultError: "Произошла ошибка при регистрации.",
            devMode: "Режим разработки: активен тестовый пользователь"
        }
    };

    const t = translations[lang as 'uz' | 'ru'] || translations.uz;

    const [step, setStep] = useState<'intro' | 'form'>('intro');
    const [phone, setPhone] = useState("");
    const [fullName, setFullName] = useState("");
    const [location, setLocation] = useState("");
    const [healthGoals, setHealthGoals] = useState("");
    const [agreeToOffer, setAgreeToOffer] = useState(false);
    const [loading, setLoading] = useState(false);
    const [initializing, setInitializing] = useState(true);
    const [tgUser, setTgUser] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

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
                        return; // Stop initialization if redirecting
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

    const toggleVideo = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!tgUser?.id) {
            setError(t.errorId);
            return;
        }
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
                    fullName,
                    phone,
                    location,
                    healthGoals,
                    lang
                })
            });

            const data = await res.json();

            if (res.ok && data.success) {
                router.push(`/${lang}/tma/dashboard`);
            } else {
                setError(data.error || t.defaultError);
            }
        } catch (err) {
            console.error("Register Error:", err);
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
            <AnimatePresence mode="wait">
                {step === 'intro' ? (
                    <motion.div
                        key="intro"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0, x: -50 }}
                        className="flex flex-col min-h-screen"
                    >
                        {/* Header Section */}
                        <div className="pt-12 px-8 flex items-center gap-6">
                            <div className="relative w-20 h-20">
                                <Image src="/images/logo.png" alt="Logo" fill className="object-contain" priority />
                            </div>
                            <div className="space-y-0.5">
                                <h1 className="text-4xl font-editorial font-bold text-[#114539] tracking-tight">{t.title}</h1>
                                <p className="text-[9px] font-black text-[#114539]/40 uppercase tracking-[0.2em]">{t.tagline}</p>
                            </div>
                        </div>

                        <div className="mt-6 border-y border-[#114539]/10 py-4 flex justify-center">
                            <div className="flex items-center gap-2 text-[10px] font-black text-[#114539]/60 uppercase tracking-widest">
                                <Users className="w-3 h-3" />
                                <span>{t.stats}</span>
                            </div>
                        </div>

                        {/* Video Card Container */}
                        <div className="px-8 mt-10">
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                className="relative aspect-[3/4] rounded-[3.5rem] overflow-hidden shadow-2xl premium-shadow"
                            >
                                <video
                                    ref={videoRef}
                                    src="/videos/intro.mp4"
                                    className="w-full h-full object-cover"
                                    playsInline
                                    loop
                                    poster="/images/hero-sabina.png"
                                />
                                <div className={`absolute inset-0 bg-gradient-to-t from-[#114539] via-transparent to-transparent flex flex-col justify-end p-10 transition-opacity duration-500 ${isPlaying ? 'opacity-0' : 'opacity-100'}`}>
                                    <button
                                        onClick={toggleVideo}
                                        className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center mb-6 group active:scale-90 transition-all"
                                    >
                                        <Play className="w-6 h-6 text-white fill-white" />
                                    </button>
                                    <div className="space-y-1">
                                        <p className="text-[9px] font-black text-white/60 uppercase tracking-[0.2em]">{t.introLabel}</p>
                                        <h3 className="text-2xl font-editorial font-bold text-white leading-tight">{t.introTitle}</h3>
                                    </div>
                                </div>
                                {isPlaying && (
                                    <div
                                        onClick={toggleVideo}
                                        className="absolute inset-0 z-10"
                                    />
                                )}
                            </motion.div>
                        </div>

                        {/* Bio and Footer */}
                        <div className="px-10 mt-10 space-y-12 flex-1 flex flex-col justify-between pb-12">
                            <p className="text-center text-[#114539]/60 text-sm font-medium leading-relaxed italic">
                                "{t.bio}"
                            </p>

                            <button
                                onClick={() => setStep('form')}
                                className="w-full bg-[#d8cfc4] text-[#114539] font-black text-[11px] uppercase tracking-[0.3em] py-7 rounded-[2rem] shadow-xl active:scale-95 transition-all"
                            >
                                {t.cta}
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key="form"
                        initial={{ opacity: 0, x: 50 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="p-8 pt-12 space-y-10 min-h-screen"
                    >
                        <div className="space-y-6">
                            <button onClick={() => setStep('intro')} className="text-[#114539]/30 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2">
                                <ChevronRight className="w-4 h-4 rotate-180" /> {t.back}
                            </button>
                            <h2 className="text-4xl font-editorial font-bold text-[#114539] leading-tight tracking-tight" dangerouslySetInnerHTML={{ __html: t.registerTitle.replace(',', ',<br />') }} />
                            <p className="text-[#114539]/50 text-sm font-medium leading-relaxed">{t.registerSubtitle}</p>
                        </div>

                        <form onSubmit={handleRegister} className="space-y-8">
                            {error && (
                                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-bold uppercase tracking-widest text-center">
                                    {error}
                                </div>
                            )}

                            <div className="space-y-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.nameLabel}</label>
                                    <input required type="text" placeholder={t.namePlaceholder} value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.phoneLabel}</label>
                                    <input required type="tel" placeholder={t.phonePlaceholder} value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.locationLabel}</label>
                                    <input required type="text" placeholder={t.locationPlaceholder} value={location} onChange={(e) => setLocation(e.target.value)} className="w-full bg-white border border-[#114539]/5 rounded-2xl py-6 px-8 text-[#0b0c10] shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-[#114539]/60 uppercase tracking-widest ml-4">{t.goalsLabel}</label>
                                    <textarea required placeholder={t.goalsPlaceholder} value={healthGoals} onChange={(e) => setHealthGoals(e.target.value)} className="w-full bg-white border border-[#114539]/5 rounded-[2.5rem] py-6 px-8 text-[#0b0c10] shadow-soft min-h-[140px] focus:outline-none focus:ring-2 focus:ring-[#114539]/20" />
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

                            <button type="submit" disabled={!agreeToOffer || loading || initializing || !tgUser?.id} className="w-full bg-[#114539] text-white py-7 rounded-[2rem] font-black uppercase tracking-[0.3em] text-[11px] shadow-xl disabled:opacity-50 active:scale-95 transition-all">
                                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : t.submit}
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
