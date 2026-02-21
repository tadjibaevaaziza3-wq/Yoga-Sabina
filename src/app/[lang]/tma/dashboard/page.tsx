'use client';

import React, { useEffect, useState } from 'react';
import { Container } from "@/components/ui/Container";
import { BookOpen, Star, Clock, Play, ChevronRight, Video, Users, MessageCircle, Send } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { useParams } from 'next/navigation';

export default function TMADashboard() {
    const params = useParams();
    const lang = (params?.lang as string) || 'uz';
    const [loading, setLoading] = useState(true)
    const [banners, setBanners] = useState<{ [key: string]: string }>({
        BANNER_TMA_DASHBOARD: "/images/hero-sabina.png",
        FRONTEND_TRAINER_PHOTO: "/images/trainer-portrait.png",
        FRONTEND_VIDEO_BANNER: "/images/sabina-intro.png",
        IS_CONSULTATION_ENABLED: "true"
    })

    useEffect(() => {
        const fetchBanners = async () => {
            try {
                const res = await fetch('/api/settings/public?keys=BANNER_TMA_DASHBOARD,FRONTEND_TRAINER_PHOTO,FRONTEND_VIDEO_BANNER,IS_CONSULTATION_ENABLED')
                const data = await res.json()
                setBanners(prev => ({
                    ...prev,
                    ...data
                }))
            } catch (e) {
                console.error("TMA banner fetch failed", e)
            }
        }
        fetchBanners()
    }, []);
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
        const fetchData = async () => {
            try {
                const meRes = await fetch('/api/tma/me');
                if (meRes.ok) {
                    const meData = await meRes.json().catch(() => null);
                    if (meData?.success) setUser(meData.user);
                }
            } catch (err) {
                console.error('Fetch error:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
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
                    <div className="relative w-20 h-20">
                        <Image
                            src="/images/logo.png"
                            alt="Logo"
                            fill
                            className="object-contain"
                        />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-[#114539] tracking-tight uppercase">Baxtli Men</h1>
                        <div className="h-0.5 w-12 bg-[#114539] mx-auto my-1"></div>
                        <p className="text-[10px] font-bold text-[#114539]/60 tracking-[0.2em] uppercase">{t.tagline}</p>
                    </div>

                    {/* Dashboard Hero Banner */}
                    <div className="relative w-full h-[320px] rounded-[3rem] overflow-hidden shadow-2xl border border-white/20 mt-4 group">
                        <Image
                            src={banners.BANNER_TMA_DASHBOARD}
                            alt="Sabina Polatova"
                            fill
                            className="object-cover object-top transition-transform duration-[2s] group-hover:scale-110"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#114539]/80 via-transparent to-transparent"></div>
                        <div className="absolute bottom-10 left-10 right-10 flex flex-col items-center">
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 }}
                                className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full border border-white/20 mb-3"
                            >
                                <span className="text-[10px] font-bold text-white uppercase tracking-widest">Premium Yoga Platform</span>
                            </motion.div>
                        </div>
                    </div>
                </header>

                {/* Continue Watching Section */}
                {user?.recentProgress?.[0] && (
                    <Link href={`/${lang}/tma/player/${user.recentProgress[0].lessonId}`} className="block group">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="relative bg-white p-6 rounded-[2rem] shadow-xl border border-[#114539]/10 flex items-center justify-between overflow-hidden"
                        >
                            <div className="relative z-10 flex flex-col gap-2 max-w-[70%]">
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                                    <h4 className="text-[9px] font-black uppercase tracking-[0.2em] text-[#114539]/60">
                                        {t.continueWatching}
                                    </h4>
                                </div>
                                <div>
                                    <h3 className="text-lg font-serif font-black text-[#114539] leading-tight line-clamp-1">
                                        {user.recentProgress[0].lesson.title}
                                    </h3>
                                    <p className="text-[10px] font-bold text-[#114539]/40 line-clamp-1">
                                        {user.recentProgress[0].lesson.course.title}
                                    </p>
                                </div>
                                <div className="flex items-center gap-3 mt-1">
                                    <div className="px-4 py-2 bg-[#114539] text-white rounded-lg font-bold text-[9px] uppercase tracking-widest flex items-center gap-1.5 shadow-lg">
                                        <Play className="w-2.5 h-2.5 fill-current" />
                                        Play
                                    </div>
                                    <div className="text-[9px] font-bold text-[#114539]/40">
                                        {Math.round((user.recentProgress[0].progress / user.recentProgress[0].duration) * 100)}%
                                    </div>
                                </div>
                            </div>

                            {/* Circular Progress or Thumbnail */}
                            <div className="relative w-16 h-16 rounded-2xl overflow-hidden shadow-lg border border-white/20">
                                {user.recentProgress[0].lesson.course.coverImage && (
                                    <Image
                                        src={user.recentProgress[0].lesson.course.coverImage}
                                        alt="Cover"
                                        fill
                                        className="object-cover"
                                    />
                                )}
                                <div className="absolute inset-0 bg-[#114539]/20 flex items-center justify-center">
                                    <Play className="w-6 h-6 text-white drop-shadow-md" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>
                )}

                {/* 4 Categories Grid - Hero Entry Point */}
                <section className="grid grid-cols-1 gap-6">
                    <Link href={`/${lang}/tma/courses?filter=ONLINE`} className="block group">
                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-xl border border-white/20"
                        >
                            <Image
                                src="/images/courses/woman-premium.jpg"
                                alt="Online"
                                fill
                                className="object-cover object-[center_35%] transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#114539] via-[#114539]/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
                                <div className="space-y-1">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2">
                                        <Video className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-editorial font-bold text-white leading-tight">{t.categories.online}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    <Link href={`/${lang}/tma/courses?filter=OFFLINE`} className="block group">
                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-xl border border-white/20"
                        >
                            <Image
                                src="/images/studios/doyoga.jpg"
                                alt="Offline"
                                fill
                                className="object-cover object-[center_40%] transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#114539] via-[#114539]/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
                                <div className="space-y-1">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2">
                                        <Users className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-editorial font-bold text-white leading-tight">{t.categories.offline}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    </Link>

                    {banners.IS_CONSULTATION_ENABLED !== "false" && (
                        <Link href={`/${lang}/tma/courses?filter=CONSULTATION`} className="block group">
                            <motion.div
                                whileTap={{ scale: 0.98 }}
                                className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-xl border border-white/20"
                            >
                                <Image
                                    src={banners.FRONTEND_TRAINER_PHOTO}
                                    alt="Consultations"
                                    fill
                                    className="object-cover object-[center_25%] transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-[#114539] via-[#114539]/40 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
                                    <div className="space-y-1">
                                        <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2">
                                            <MessageCircle className="w-5 h-5 text-white" />
                                        </div>
                                        <h3 className="text-2xl font-editorial font-bold text-white leading-tight">{t.categories.consultations}</h3>
                                    </div>
                                    <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                        <ChevronRight className="w-6 h-6 text-white" />
                                    </div>
                                </div>
                            </motion.div>
                        </Link>
                    )}

                    <a href="https://t.me/sabina_polatova" target="_blank" rel="noopener noreferrer" className="block group">
                        <motion.div
                            whileTap={{ scale: 0.98 }}
                            className="relative h-48 rounded-[2.5rem] overflow-hidden shadow-xl border border-white/20"
                        >
                            <Image
                                src={banners.FRONTEND_VIDEO_BANNER}
                                alt="Contact"
                                fill
                                className="object-cover object-[center_15%] transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#114539] via-[#114539]/40 to-transparent"></div>
                            <div className="absolute bottom-0 left-0 p-8 w-full flex justify-between items-end">
                                <div className="space-y-1">
                                    <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center mb-2">
                                        <Send className="w-5 h-5 text-white" />
                                    </div>
                                    <h3 className="text-2xl font-editorial font-bold text-white leading-tight">{t.categories.contact}</h3>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-white/20 transition-colors">
                                    <ChevronRight className="w-6 h-6 text-white" />
                                </div>
                            </div>
                        </motion.div>
                    </a>
                </section>
            </Container>


            {/* Bottom Nav Bar - Premium Floating */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[70%] max-w-sm bg-[#114539] text-white rounded-[2rem] p-4 shadow-2xl z-50 flex justify-around items-center bg-opacity-95 backdrop-blur-xl border border-white/10">
                <Link href={`/${lang}/tma/dashboard`} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <motion.div whileTap={{ scale: 0.9 }}>
                        <BookOpen className="w-5 h-5" />
                    </motion.div>
                </Link>
                <div className="w-[1px] h-6 bg-white/5"></div>
                <Link href={`/${lang}/tma/courses`} className="w-12 h-12 rounded-2xl flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                    <motion.div whileTap={{ scale: 0.9 }}>
                        <Star className="w-5 h-5" />
                    </motion.div>
                </Link>
            </div>
        </main>
    );
}
