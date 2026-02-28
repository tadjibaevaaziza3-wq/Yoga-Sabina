'use client';

import React, { useEffect, useState } from 'react';
import { Container } from "@/components/ui/Container";
import { BookOpen, Star, Search, ChevronLeft, Home, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams, useSearchParams } from 'next/navigation';

export default function TMACoursesPage() {
    const router = useRouter();
    const params = useParams();
    const lang = (params?.lang as string) || 'uz';
    const [courses, setCourses] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const searchParams = useSearchParams();
    const initialFilter = searchParams?.get('filter') || 'ALL';
    const [activeFilter, setActiveFilter] = useState(initialFilter);

    const [userData, setUserData] = useState<any>(null);

    const translations = {
        uz: {
            back: "ORQAGA",
            title: "Barcha Kurslar",
            searchPlaceholder: "Kursni qidirish...",
            filters: {
                ALL: "HAMMASI",
                ONLINE: "ONLAYN",
                OFFLINE: "OFFLAYN",
                CONSULTATION: "KONSULTATSIYA"
            },
            duration: "KUN",
            locked: "Yopiq tarkib",
            buy: "SOTIB OLISH",
            view: "KO'RISH",
            noCourses: "Hech qanday kurs topilmadi",
            nav: {
                panel: "Panel",
                courses: "Kurslar",
                profile: "Profil"
            }
        },
        ru: {
            back: "НАЗАД",
            title: "Все Курсы",
            searchPlaceholder: "Поиск курса...",
            filters: {
                ALL: "ВСЕ",
                ONLINE: "ОНЛАЙН",
                OFFLINE: "ОФЛАЙН",
                CONSULTATION: "КОНСУЛЬТАЦИЯ"
            },
            duration: "ДН.",
            locked: "Закрытый контент",
            buy: "КУПИТЬ",
            view: "СМОТРЕТЬ",
            noCourses: "Курсы не найдены",
            nav: {
                panel: "Панель",
                courses: "Курсы",
                profile: "Профиль"
            }
        }
    };

    const t = translations[lang as keyof typeof translations] || translations.uz;

    useEffect(() => {
        const loadInitialData = async () => {
            try {
                // Fetch user data and courses IN PARALLEL
                const [meRes, coursesRes] = await Promise.all([
                    fetch('/api/tma/me'),
                    fetch('/api/tma/courses')
                ]);

                if (meRes.ok) {
                    const meData = await meRes.json().catch(() => null);
                    if (meData?.success) setUserData(meData.user);
                }

                if (coursesRes.ok) {
                    const coursesData = await coursesRes.json().catch(() => null);
                    if (coursesData?.success) setCourses(coursesData.courses);
                }
            } catch (error) {
                console.error("Failed to load TMA courses data", error);
            }
        }
        loadInitialData()
    }, []);


    const activeSub = userData?.subscriptions?.find((s: any) => s.status === 'ACTIVE');

    const filteredCourses = courses.filter(c => {
        const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === 'ALL' ||
            (activeFilter === 'CONSULTATION' ? c.productType === 'CONSULTATION' : c.type === activeFilter);
        return matchesSearch && matchesFilter;
    });

    return (
        <main className="pb-32 bg-[#f6f9fe] min-h-screen">
            <Container className="pt-12 px-6 space-y-8">
                {/* Header */}
                <header className="space-y-6">
                    <button onClick={() => router.back()} className="text-[var(--primary)]/30 text-[10px] font-bold uppercase tracking-[0.4em] flex items-center gap-2">
                        <ChevronLeft className="w-4 h-4" /> {t.back}
                    </button>
                    <h2 className="text-4xl font-editorial font-bold text-[#114539] tracking-tight">{t.title}</h2>
                </header>

                {/* Search & Filters */}
                <div className="space-y-4">
                    <div className="relative">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-[#114539]/30" />
                        <input
                            type="text"
                            placeholder={t.searchPlaceholder}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-white border border-[#114539]/5 rounded-2xl py-5 pl-14 pr-6 text-sm shadow-soft focus:outline-none focus:ring-2 focus:ring-[#114539]/20"
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {['ALL', 'ONLINE', 'OFFLINE', 'CONSULTATION'].map(tag => (
                            <button
                                key={tag}
                                onClick={() => setActiveFilter(tag)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${activeFilter === tag
                                    ? 'bg-[#114539] text-white shadow-lg shadow-[#114539]/20'
                                    : 'bg-white text-[#114539]/40 border border-[#114539]/5'
                                    }`}
                            >
                                {t.filters[tag as keyof typeof t.filters]}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Course Grid */}
                <div className="grid gap-6">
                    {filteredCourses.map(course => (
                        <Link
                            key={course.id}
                            href={`/${lang}/tma/courses/${course.id}`}
                            className="block group active:scale-[0.98] transition-all duration-200"
                        >
                            <div className="bg-white p-6 rounded-[2.5rem] border border-[#114539]/5 shadow-soft space-y-6">
                                <div className="aspect-video rounded-[2rem] overflow-hidden relative shadow-inner">
                                    <Image
                                        src={course.coverImage || "/images/hero.png"}
                                        alt=""
                                        fill
                                        className="object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-105"
                                    />
                                    {(!activeSub && !course.isFree) && (
                                        <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px] flex items-center justify-center">
                                            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center">
                                                <Star className="w-6 h-6 text-white" />
                                            </div>
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-md px-3 py-1.5 rounded-full flex items-center gap-1.5 border border-white/20 shadow-sm">
                                        <Star className="w-3 h-3 text-[#114539] fill-current" />
                                        <span className="text-[10px] font-bold text-[#114539]">4.9</span>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-editorial font-bold text-[#114539] leading-tight">
                                            {lang === 'ru' && course.titleRu ? course.titleRu : course.title}
                                        </h3>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-[#114539]/5">
                                        <div className="flex flex-col">
                                            <div className="text-sm font-bold text-[#114539]">
                                                {new Intl.NumberFormat('uz-UZ').format(Number(course.price))} UZS
                                            </div>
                                        </div>
                                        <div className="text-[9px] font-black text-[#114539]/40 uppercase tracking-[0.2em]">
                                            {(!activeSub && !course.isFree) ? t.buy : t.view} →
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))}
                </div>
            </Container>

            {/* Bottom Nav Bar - Premium Floating */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[70%] max-w-sm bg-[#114539] text-white rounded-[2rem] p-4 shadow-2xl z-50 flex justify-around items-center bg-opacity-95 backdrop-blur-xl border border-white/10">
                <Link href={`/${lang}/tma/dashboard`} className="w-12 h-12 rounded-2xl flex items-center justify-center opacity-40 hover:opacity-100 transition-opacity">
                    <motion.div whileTap={{ scale: 0.9 }}>
                        <BookOpen className="w-5 h-5" />
                    </motion.div>
                </Link>
                <div className="w-[1px] h-6 bg-white/5"></div>
                <Link href={`/${lang}/tma/courses`} className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                    <motion.div whileTap={{ scale: 0.9 }}>
                        <Star className="w-5 h-5" />
                    </motion.div>
                </Link>
            </div>
        </main>
    );
}
