'use client';

import React, { useEffect, useState } from 'react';
import { Container } from "@/components/ui/Container";
import { ChevronLeft, Play, Clock, Star, Lock, CheckCircle2, Activity, BookOpen, MessageCircle, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from 'next/navigation';
import { CheckoutForm } from "@/components/checkout/CheckoutForm";

export default function TMACourseDetails() {
    const params = useParams();
    const router = useRouter();
    const lang = (params?.lang as string) || 'uz';
    const id = params?.id as string;
    const [course, setCourse] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [showCheckout, setShowCheckout] = useState(false);
    const [userData, setUserData] = useState<any>(null);

    const translations = {
        uz: {
            notFound: "Kurs topilmadi",
            return: "Kurslarga qaytish",
            content: "Kurs tarkibi",
            module: "MODUL",
            lesson: "DARS",
            min: "MIN",
            price: "Kurs narxi",
            buy: "HOZIR SOTIB OLISH",
            cancel: "BEKOR QILISH",
            viewing: "KO'RISHNI BOSHLASH",
            contact: "MENEDJER BILAN ALOQA",
            about: "KURS HAQIDA",
            features: "AFZALLIKLARI",
            back: "ORQAGA",
            nav: {
                panel: "Panel",
                courses: "Kurslar",
                profile: "Profil"
            }
        },
        ru: {
            notFound: "Курс не найден",
            return: "Вернуться к курсам",
            content: "Содержание курса",
            module: "МОДУЛЬ",
            lesson: "УРОК",
            min: "МИН",
            price: "Стоимость курса",
            buy: "КУПИТЬ СЕЙЧАС",
            cancel: "ОТМЕНА",
            viewing: "НАЧАТЬ ПРОСМОТР",
            contact: "СВЯЗАТЬСЯ С МЕНЕДЖЕРОМ",
            about: "О КУРСЕ",
            features: "ПРЕИМУЩЕСТВА",
            back: "НАЗАД",
            nav: {
                panel: "Панель",
                courses: "Курсы",
                profile: "Профиль"
            }
        }
    };

    const t = translations[lang as keyof typeof translations] || translations.uz;

    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                // Fetch User info
                const meRes = await fetch('/api/tma/me');
                if (meRes.ok) {
                    const meData = await meRes.json().catch(() => null);
                    if (meData?.success) setUserData(meData.user);
                }

                // Fetch Course info
                const courseRes = await fetch(`/api/tma/courses/${id}`);
                if (courseRes.ok) {
                    const courseData = await courseRes.json().catch(() => null);
                    if (courseData?.success) {
                        setCourse(courseData.course);
                    }
                }
            } catch (err) {
                console.error("Failed to load course details", err);
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f6f9fe] flex items-center justify-center">
                <div className="w-10 h-10 border-t-2 border-[#114539] rounded-full animate-spin" />
            </div>
        );
    }

    if (!course) {
        return (
            <div className="min-h-screen bg-[#f6f9fe] flex flex-col items-center justify-center p-8 text-center space-y-4">
                <h1 className="text-2xl font-editorial font-bold text-[#114539]">{t.notFound}</h1>
                <Link href={`/${lang}/tma/courses`} className="text-sm font-bold text-[#114539]/60 uppercase tracking-widest">{t.return}</Link>
            </div>
        );
    }

    const courseTitle = lang === 'ru' && course.titleRu ? course.titleRu : course.title;
    const courseDesc = lang === 'ru' && course.descriptionRu ? course.descriptionRu : course.description;
    const courseFeatures = (lang === 'ru' ? course.featuresRu : course.features) as string[] || [];

    return (
        <main className="pb-32 bg-[#f6f9fe] min-h-screen">
            {/* Sticky Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-[#114539]/5 p-6 flex items-center justify-between">
                <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white border border-[#114539]/10 flex items-center justify-center shadow-soft active:scale-90 transition-transform">
                    <ChevronLeft className="w-5 h-5 text-[#114539]" />
                </button>
                <div className="flex-1 px-4 truncate text-center">
                    <h2 className="text-sm font-editorial font-bold text-[#114539] truncate">
                        {courseTitle}
                    </h2>
                </div>
                <div className="w-10" />
            </div>

            <Container className="pt-8 px-6 space-y-10">
                {/* Hero Content Section */}
                <section className="space-y-8">
                    {course.coverImage ? (
                        <div className="aspect-[4/3] rounded-[2.5rem] overflow-hidden relative shadow-2xl border-4 border-white">
                            <Image
                                src={course.coverImage}
                                alt={courseTitle}
                                fill
                                className="object-cover"
                                priority
                            />
                            <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[#114539]/60 to-transparent" />
                        </div>
                    ) : (
                        <div className="h-2 w-12 bg-[#114539]/10 mx-auto rounded-full" />
                    )}

                    <div className="space-y-6">
                        <div className="space-y-3 text-center">
                            <div className="flex items-center justify-center gap-2">
                                <span className="px-3 py-1 bg-[#114539]/5 rounded-full text-[8px] font-black text-[#114539] uppercase tracking-[0.2em] border border-[#114539]/10">
                                    {course.type}
                                </span>
                            </div>
                            <h1 className="text-3xl font-editorial font-black text-[#114539] leading-tight px-4">
                                {courseTitle}
                            </h1>
                        </div>

                        {/* Detailed Description */}
                        <div className="bg-white rounded-[2.5rem] p-8 shadow-soft border border-[#114539]/5 space-y-6">
                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black text-[#114539]/40 uppercase tracking-[0.3em] flex items-center gap-2">
                                    <Activity className="w-3 h-3" />
                                    {t.about}
                                </h4>
                                <p className="text-sm text-[#114539] leading-relaxed font-medium whitespace-pre-line">
                                    {courseDesc || "Ushbu kurs sizga yoga olamiga eshiklarni ochadi va salomatligingizni yaxshilashda yordam beradi."}
                                </p>
                            </div>

                            {courseFeatures.length > 0 && (
                                <div className="space-y-4 pt-4 border-t border-[#114539]/5">
                                    <h4 className="text-[10px] font-black text-[#114539]/40 uppercase tracking-[0.3em]">
                                        {t.features}
                                    </h4>
                                    <div className="grid gap-3">
                                        {courseFeatures.map((feature, i) => (
                                            <div key={i} className="flex items-start gap-3">
                                                <div className="mt-1 w-4 h-4 rounded-full bg-[#114539]/10 flex items-center justify-center flex-shrink-0">
                                                    <CheckCircle2 className="w-2.5 h-2.5 text-[#114539]" />
                                                </div>
                                                <span className="text-xs font-bold text-[#114539]/80">{feature}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Modules & Lessons */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#114539]/50">{t.content}</h4>
                        <span className="text-[10px] font-black text-[#114539]/30 uppercase tracking-widest">{course.modules?.length || 0} {t.module}</span>
                    </div>

                    {/* Determine access once for the lesson list */}
                    {(() => {
                        const hasAccess = userData?.subscriptions?.some(
                            (s: any) => s.courseId === course.id && s.status === 'ACTIVE'
                        ) || userData?.purchases?.some(
                            (p: any) => p.courseId === course.id && p.status === 'PAID'
                        ) || course.isFree;

                        return (
                            <div className="space-y-4">
                                {course.modules?.map((module: any, idx: number) => (
                                    <div key={module.id} className="bg-white rounded-[2rem] border border-[#114539]/5 shadow-soft overflow-hidden">
                                        <div className="p-6 border-b border-[#114539]/5 bg-[#f6f9fe]/50 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-[#114539] flex items-center justify-center text-white text-[10px] font-bold">
                                                    {idx + 1}
                                                </div>
                                                <div>
                                                    <h5 className="font-bold text-[#114539] text-sm">
                                                        {lang === 'ru' && module.titleRu ? module.titleRu : module.title}
                                                    </h5>
                                                    <p className="text-[9px] font-bold text-[#114539]/40 uppercase tracking-widest">{module.lessons?.length || 0} {t.lesson}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="divide-y divide-[#114539]/5">
                                            {module.lessons?.map((lesson: any) => {
                                                const isAccessible = hasAccess || lesson.isFree;
                                                return (
                                                    <div
                                                        key={lesson.id}
                                                        className={`p-5 flex items-center justify-between transition-colors ${isAccessible ? 'active:bg-[#114539]/5 cursor-pointer' : 'opacity-60'}`}
                                                        onClick={() => {
                                                            if (isAccessible) {
                                                                window.location.href = `/${lang}/tma/player/${lesson.id}`;
                                                            }
                                                        }}
                                                    >
                                                        <div className="flex items-center gap-4">
                                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isAccessible ? 'bg-[#114539]/10' : 'bg-[#f6f9fe]'}`}>
                                                                {isAccessible
                                                                    ? <Play className="w-4 h-4 text-[#114539] fill-[#114539]" />
                                                                    : <Lock className="w-4 h-4 text-[#114539]/20" />
                                                                }
                                                            </div>
                                                            <div>
                                                                <div className="text-xs font-bold text-[#114539]">
                                                                    {lang === 'ru' && lesson.titleRu ? lesson.titleRu : lesson.title}
                                                                </div>
                                                                <div className="text-[9px] font-bold text-[#114539]/40 uppercase tracking-widest">
                                                                    {Math.floor(lesson.duration / 60)} {t.min}
                                                                </div>
                                                            </div>
                                                        </div>
                                                        {isAccessible && (
                                                            <div className="w-6 h-6 rounded-full bg-[#114539]/5 flex items-center justify-center">
                                                                <Play className="w-3 h-3 text-[#114539]/40" />
                                                            </div>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        );
                    })()}
                </section>

                {/* Secondary Actions */}
                <section className="grid gap-3 px-2">
                    <a
                        href="https://t.me/sabina_polatova"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-3 bg-white border border-[#114539]/10 p-5 rounded-2xl text-[10px] font-black text-[#114539] uppercase tracking-[0.2em] shadow-sm active:scale-95 transition-all"
                    >
                        <MessageCircle className="w-4 h-4" />
                        {t.contact}
                    </a>
                    <Link
                        href={`/${lang}/tma/courses`}
                        className="flex items-center justify-center gap-3 bg-white/50 border border-[#114539]/5 p-5 rounded-2xl text-[10px] font-black text-[#114539]/40 uppercase tracking-[0.2em] active:scale-95 transition-all"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        {t.back}
                    </Link>
                </section>

                {/* Main Action Bar */}
                {!showCheckout ? (
                    <section className="sticky bottom-24 bg-[#114539] border border-white/10 p-5 rounded-[2.5rem] shadow-2xl flex items-center justify-between gap-4 z-40">
                        {(() => {
                            const isSubscribed = userData?.subscriptions?.some(
                                (s: any) => s.courseId === course.id && s.status === 'ACTIVE'
                            ) || userData?.purchases?.some(
                                (p: any) => p.courseId === course.id && p.status === 'PAID'
                            ) || course.isFree;

                            if (isSubscribed) {
                                // Find first lesson ID
                                const firstLesson = course.modules?.[0]?.lessons?.[0];
                                return (
                                    <div className="w-full">
                                        <button
                                            onClick={() => {
                                                if (firstLesson) {
                                                    router.push(`/${lang}/tma/player/${firstLesson.id}`);
                                                }
                                            }}
                                            className="w-full bg-white text-[#114539] py-5 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg active:scale-95 transition-all flex items-center justify-center gap-3"
                                        >
                                            <Play className="w-4 h-4 fill-current" />
                                            {t.viewing}
                                        </button>
                                    </div>
                                );
                            }

                            return (
                                <>
                                    <div className="space-y-0.5 pl-4">
                                        <p className="text-[8px] font-bold text-white/40 uppercase tracking-[0.2em]">{t.price}</p>
                                        <h3 className="text-lg font-editorial font-bold text-white whitespace-nowrap">
                                            {course.price ? new Intl.NumberFormat('uz-UZ').format(Number(course.price)) : 0} UZS
                                        </h3>
                                    </div>
                                    <button
                                        onClick={() => setShowCheckout(true)}
                                        className="bg-white text-[#114539] px-6 py-4 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-lg active:scale-95 transition-all"
                                    >
                                        {t.buy}
                                    </button>
                                </>
                            );
                        })()}
                    </section>
                ) : (
                    <section className="pb-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <CheckoutForm
                            item={course}
                            lang={lang as 'uz' | 'ru'}
                            type="COURSE"
                            dictionary={{}} // Placeholder dictionary
                        />
                        <button
                            onClick={() => setShowCheckout(false)}
                            className="w-full mt-4 text-[10px] font-bold text-[#114539]/40 uppercase tracking-widest text-center"
                        >
                            {t.cancel}
                        </button>
                    </section>
                )}
            </Container>

        </main >
    );
}
