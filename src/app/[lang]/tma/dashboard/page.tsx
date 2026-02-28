'use client';

import React, { useEffect, useState } from 'react';
import { Container } from "@/components/ui/Container";
import { BookOpen, Star, Clock, Play, ChevronRight, Video, Users, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useParams } from 'next/navigation';
import AnnouncementBanner from '@/components/shared/AnnouncementBanner';

export default function TMADashboard() {
    const params = useParams();
    const lang = (params?.lang as string) || 'uz';
    const [loading, setLoading] = useState(true)
    const [banners, setBanners] = useState<{ [key: string]: string }>({
        BANNER_TMA_DASHBOARD: "/images/hero-sabina.png",
        FRONTEND_TRAINER_PHOTO: "/images/trainer-portrait.png",
        FRONTEND_VIDEO_BANNER: "/images/sabina-intro.png",
        IS_CONSULTATION_ENABLED: "true",
        TMA_DASHBOARD_ONLINE_IMAGE: "/images/courses/woman-premium.jpg",
        TMA_DASHBOARD_OFFLINE_IMAGE: "/images/studios/doyoga.jpg",
        TMA_DASHBOARD_BADGE_TEXT: "✦ Premium Yoga Platform",
        TMA_CONTACT_TELEGRAM: "@sabina_polatova",
    })
    const [user, setUser] = useState<any>(null);

    const translations = {
        uz: {
            continueWatching: "Ko'rishni davom eting",
            lesson: "Dars",
            coursesTitle: "O'quv kurslari",
            seeAll: "Hammasi",
            lessons: "DARS",
            hours: "SOAT",
            noCourses: "Hozircha kurslar yo'q",
            viewCourses: "Kurslarni ko'rish",
            dashboard: "Asosiy",
            tagline: "YOGA VA SALOMATLIK",
            courses: "Kurslar",
            profile: "Profil",
            body: "Tana",
            community: "Jamoa",
            categories: {
                online: "Onlayn Kurslar",
                offline: "Offline Kurslar",
                consultations: "Konsultatsiyalar",
                contact: "Admin bilan bog'lanish"
            }
        },
        ru: {
            continueWatching: "Продолжить просмотр",
            lesson: "Урок",
            coursesTitle: "Учебные курсы",
            seeAll: "Все",
            lessons: "УРОКОВ",
            hours: "ЧАСА",
            noCourses: "Пока нет курсов",
            viewCourses: "Смотреть курсы",
            dashboard: "Главная",
            tagline: "ЙОГА И ЗДОРОВЬЕ",
            courses: "Курсы",
            profile: "Профиль",
            body: "Тело",
            community: "Сообщество",
            categories: {
                online: "Онлайн Курсы",
                offline: "Оффлайн Курсы",
                consultations: "Консультации",
                contact: "Связаться с админом"
            }
        }
    };

    const t = translations[lang as keyof typeof translations] || translations.uz;

    useEffect(() => {
        const fetchAll = async () => {
            try {
                // Fetch banners and user data IN PARALLEL
                const [bannersRes, meRes] = await Promise.all([
                    fetch('/api/settings/public?keys=BANNER_TMA_DASHBOARD,FRONTEND_TRAINER_PHOTO,FRONTEND_VIDEO_BANNER,IS_CONSULTATION_ENABLED,TMA_DASHBOARD_ONLINE_IMAGE,TMA_DASHBOARD_OFFLINE_IMAGE,TMA_DASHBOARD_BADGE_TEXT,TMA_CONTACT_TELEGRAM'),
                    fetch('/api/tma/me')
                ]);

                if (bannersRes.ok) {
                    const data = await bannersRes.json();
                    setBanners(prev => ({ ...prev, ...data }));
                }

                if (meRes.ok) {
                    const meData = await meRes.json().catch(() => null);
                    if (meData?.success) setUser(meData.user);
                }
            } catch (err) {
                console.error('TMA dashboard fetch error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f6f9fe] flex items-center justify-center">
                <div className="w-10 h-10 border-t-2 border-[#114539] rounded-full animate-spin" />
            </div>
        );
    }


    return (
        <main className="pb-32 bg-[#f6f9fe] min-h-screen relative overflow-x-hidden">
            {/* Background Gradient Accents */}
            <div className="absolute top-0 right-0 w-[120%] h-[40%] bg-[#114539]/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 -z-10"></div>

            <Container className="pt-8 px-6 space-y-8">
                {/* Branding Header */}
                <header className="flex flex-col items-center text-center space-y-4">
                    <div className="w-full flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative w-10 h-10">
                                <Image src="/images/logo.png" alt="Logo" fill className="object-contain" />
                            </div>
                            <div className="text-left">
                                <h1 className="text-lg font-black text-[#114539] tracking-tight uppercase leading-none">Baxtli Men</h1>
                                <p className="text-[9px] font-bold text-[#114539]/50 tracking-[0.2em] uppercase">{t.tagline}</p>
                            </div>
                        </div>
                        {user?.name && (
                            <div className="text-right">
                                <p className="text-[9px] font-bold text-[#114539]/40 uppercase tracking-widest">Salom,</p>
                                <p className="text-sm font-black text-[#114539] leading-none">{user.name.split(' ')[0]}</p>
                            </div>
                        )}
                    </div>

                    {/* Premium Badge */}
                    <div className="w-full bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-[#114539]/5 shadow-soft">
                        <span className="text-[9px] font-bold text-[#114539]/50 uppercase tracking-[0.3em]">{banners.TMA_DASHBOARD_BADGE_TEXT}</span>
                    </div>
                </header>

                {/* 📢 Announcements */}
                <AnnouncementBanner lang={lang as string} variant="compact" maxItems={3} />


                {/* 2×2 Categories Grid */}
                <section className="grid grid-cols-2 gap-3">
                    {/* Online Courses */}
                    <Link href={`/${lang}/tma/courses?filter=ONLINE`} className="col-span-2 block group">
                        <motion.div whileTap={{ scale: 0.98 }} className="relative h-36 rounded-[2rem] overflow-hidden shadow-lg border border-white/10">
                            <Image src={banners.TMA_DASHBOARD_ONLINE_IMAGE} alt="Online" fill className="object-cover object-[center_35%] transition-transform duration-700 group-active:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-r from-[#114539]/80 via-[#114539]/30 to-transparent" />
                            <div className="absolute inset-0 p-5 flex items-end">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Video className="w-3.5 h-3.5 text-white/70" />
                                        <span className="text-[9px] font-bold text-white/60 uppercase tracking-[0.2em]">{lang === 'ru' ? 'онлайн' : 'online'}</span>
                                    </div>
                                    <h3 className="text-xl font-editorial font-bold text-white leading-tight">{t.categories.online}</h3>
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Offline */}
                    <Link href={`/${lang}/tma/courses?filter=OFFLINE`} className="block group">
                        <motion.div whileTap={{ scale: 0.98 }} className="relative h-36 rounded-[2rem] overflow-hidden shadow-lg border border-white/10">
                            <Image src={banners.TMA_DASHBOARD_OFFLINE_IMAGE} alt="Offline" fill className="object-cover object-[center_40%] transition-transform duration-700 group-active:scale-105" />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#114539]/80 to-[#114539]/20" />
                            <div className="absolute inset-0 p-4 flex items-end">
                                <div>
                                    <Users className="w-3.5 h-3.5 text-white/70 mb-1" />
                                    <h3 className="text-sm font-editorial font-bold text-white leading-tight">{t.categories.offline}</h3>
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {/* Consultations */}
                    {banners.IS_CONSULTATION_ENABLED !== "false" ? (
                        <Link href={`/${lang}/tma/courses?filter=CONSULTATION`} className="block group">
                            <motion.div whileTap={{ scale: 0.98 }} className="relative h-36 rounded-[2rem] overflow-hidden shadow-lg border border-white/10">
                                <Image src={banners.FRONTEND_TRAINER_PHOTO} alt="Consultations" fill className="object-cover object-[center_25%] transition-transform duration-700 group-active:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#114539]/80 to-[#114539]/20" />
                                <div className="absolute inset-0 p-4 flex items-end">
                                    <div>
                                        <MessageCircle className="w-3.5 h-3.5 text-white/70 mb-1" />
                                        <h3 className="text-sm font-editorial font-bold text-white leading-tight">{t.categories.consultations}</h3>
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    ) : (
                        <a href={`https://t.me/${banners.TMA_CONTACT_TELEGRAM.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="block group">
                            <motion.div whileTap={{ scale: 0.98 }} className="relative h-36 rounded-[2rem] overflow-hidden shadow-lg border border-white/10">
                                <Image src={banners.FRONTEND_VIDEO_BANNER} alt="Contact" fill className="object-cover object-[center_15%] transition-transform duration-700 group-active:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#114539]/80 to-[#114539]/20" />
                                <div className="absolute inset-0 p-4 flex items-end">
                                    <div>
                                        <Send className="w-3.5 h-3.5 text-white/70 mb-1" />
                                        <h3 className="text-sm font-editorial font-bold text-white leading-tight">{t.categories.contact}</h3>
                                    </div>
                                </div>
                            </motion.div>
                        </a>
                    )}
                </section>

                {/* Contact Admin - always show */}
                {banners.IS_CONSULTATION_ENABLED !== "false" && (
                    <a href={`https://t.me/${banners.TMA_CONTACT_TELEGRAM.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="block">
                        <motion.div whileTap={{ scale: 0.98 }} className="flex items-center gap-4 bg-white rounded-2xl p-5 border border-[#114539]/5 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-[#114539]/5 flex items-center justify-center">
                                <Send className="w-4 h-4 text-[#114539]" />
                            </div>
                            <div className="flex-1">
                                <p className="text-xs font-black text-[#114539] uppercase tracking-widest">{t.categories.contact}</p>
                                <p className="text-[9px] text-[#114539]/40 font-bold">{banners.TMA_CONTACT_TELEGRAM}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[#114539]/30" />
                        </motion.div>
                    </a>
                )}

                {/* Web User Panel link — opens login in browser */}
                <a href={`/${lang}/login`} target="_blank" rel="noopener noreferrer" className="block">
                    <motion.div whileTap={{ scale: 0.98 }} className="flex items-center gap-4 bg-gradient-to-r from-[#114539] to-[#1a6b54] rounded-2xl p-5 shadow-lg border border-white/10">
                        <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                            <BookOpen className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-black text-white uppercase tracking-widest">
                                {lang === 'uz' ? 'Shaxsiy kabinet' : 'Личный кабинет'}
                            </p>
                            <p className="text-[9px] text-white/50 font-bold">
                                {lang === 'uz' ? 'Kirish va kurslarni ko\'ring' : 'Войдите и смотрите курсы'}
                            </p>
                        </div>
                        <ChevronRight className="w-4 h-4 text-white/50" />
                    </motion.div>
                </a>
            </Container>


            {/* Bottom Nav Bar */}
            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-[#0d2e28]/95 backdrop-blur-xl text-white rounded-2xl shadow-2xl z-50 flex items-center border border-white/10 overflow-hidden">
                <Link href={`/${lang}/tma/dashboard`} className="flex-1 flex flex-col items-center gap-1 py-4 bg-white/10">
                    <BookOpen className="w-5 h-5" />
                    <span className="text-[7px] font-bold uppercase tracking-widest opacity-90">{t.dashboard}</span>
                </Link>
                <div className="w-[1px] h-10 bg-white/10" />
                <Link href={`/${lang}/tma/courses`} className="flex-1 flex flex-col items-center gap-1 py-4 opacity-50 hover:opacity-80 transition-opacity">
                    <Star className="w-5 h-5" />
                    <span className="text-[7px] font-bold uppercase tracking-widest">{t.courses}</span>
                </Link>
                <div className="w-[1px] h-10 bg-white/10" />
                <Link href={`/${lang}/tma/profile`} className="flex-1 flex flex-col items-center gap-1 py-4 opacity-50 hover:opacity-80 transition-opacity">
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="4" /><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" /></svg>
                    <span className="text-[7px] font-bold uppercase tracking-widest">{t.profile}</span>
                </Link>
            </div>
        </main >
    );
}
