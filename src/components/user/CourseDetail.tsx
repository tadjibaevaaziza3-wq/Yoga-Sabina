'use client';

/**
 * Course Detail Component — SALES ONLY
 * 
 * Website is for selling courses only.
 * No video playback. Videos are only in User Panel (/learn/).
 * Active subscribers see prolong option.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, CheckCircle, Clock, FileText, MessageSquare, Users, MapPin, Calendar, Play, RefreshCw } from 'lucide-react';

// Sub-components
import { CourseHeader } from './CourseHeader';
import { PurchaseBanner } from './PurchaseBanner';

interface Lesson {
    id: string;
    title: string;
    description?: string;
    duration?: number;
    order: number;
    isFree: boolean;
}

interface Course {
    id: string;
    title: string;
    titleRu?: string;
    description: string;
    descriptionRu?: string;
    price: number;
    type: 'ONLINE' | 'OFFLINE';
    coverImage?: string;
    durationDays?: number;
    durationLabel?: string;
    location?: string;
    locationRu?: string;
    schedule?: string;
    scheduleRu?: string;
    times?: string;
    timesRu?: string;
    features?: string[];
    featuresRu?: string[];
    lessons: Lesson[];
}

interface CourseDetailProps {
    courseId: string;
    lang?: 'uz' | 'ru';
    userId?: string;
    userEmail?: string;
    userNumber?: number;
}

export default function CourseDetail({ courseId, lang = 'uz', userId }: CourseDetailProps) {
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourse();
    }, [courseId]);

    const fetchCourse = async (retries = 3) => {
        try {
            setLoading(true);
            const res = await fetch(`/api/courses/${courseId}`);
            if (!res.ok) throw new Error('Course not found');
            const data = await res.json();

            setCourse(data.course || data);
            setHasAccess(data.hasAccess || false);
        } catch (error) {
            if (retries > 0) {
                await new Promise(r => setTimeout(r, 500));
                return fetchCourse(retries - 1);
            }
        } finally {
            setLoading(false);
        }
    };

    const handlePurchase = () => {
        router.push(`/${lang}/checkout?id=${courseId}&type=course`);
    };

    const handleProlong = () => {
        router.push(`/${lang}/checkout?id=${courseId}&type=course&from=prolong`);
    };

    const getText = (uz: string, ru?: string) => {
        return lang === 'ru' && ru ? ru : uz;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
            </div>
        );
    }

    if (!course) {
        return (
            <div className="text-center py-16">
                <p className="text-xl text-gray-600 dark:text-gray-400">
                    {lang === 'ru' ? 'Курс не найден' : 'Kurs topilmadi'}
                </p>
            </div>
        );
    }

    return (
        <div className="bg-[#F8FAFA] min-h-screen">
            <div className="max-w-7xl mx-auto px-4 pt-32 pb-16">

                {/* Course Header */}
                <CourseHeader
                    title={getText(course.title, course.titleRu)}
                    description={getText(course.description, course.descriptionRu)}
                    type={course.type}
                    lang={lang}
                />

                {/* Detailed Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Features List */}
                    <div className="bg-[var(--primary)] rounded-[3rem] p-12 text-white shadow-2xl shadow-[var(--primary)]/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-sm font-black text-[var(--accent)]/40 uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                                <CheckCircle size={18} className="text-[var(--accent)]/60" />
                                {lang === 'ru' ? 'ОСОБЕННОСТИ КУРСА' : 'KURS AFZALLIKLARI'}
                            </h3>
                            <p className="text-[var(--secondary)]/70 text-sm font-medium leading-relaxed mb-8 pb-8 border-b border-white/10">
                                {getText(course.description, course.descriptionRu)}
                            </p>
                            <ul className="space-y-4">
                                {(lang === 'uz' ? course.features : (course.featuresRu || course.features))?.map((feature: string, idx: number) => (
                                    <li key={idx} className="flex items-start gap-4">
                                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] mt-2 shrink-0" />
                                        <span className="text-[var(--secondary)]/80 text-sm font-medium">{feature}</span>
                                    </li>
                                )) || (
                                        <li className="text-sm text-[var(--accent)]/50 italic">
                                            {lang === 'ru' ? 'Информация скоро будет добавлена' : 'Ma\'lumot tez kunda qo\'shiladi'}
                                        </li>
                                    )}
                            </ul>
                        </div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-white/10 transition-all" />
                    </div>

                    {/* Program Info Card */}
                    <div className="bg-white rounded-[3rem] p-12 border border-[var(--secondary)] shadow-xl shadow-[var(--primary)]/5 space-y-6">
                        <h3 className="text-sm font-black text-[var(--primary)] uppercase tracking-[0.3em] mb-8 text-primary/40">
                            {lang === 'ru' ? 'ИНФОРМАЦИЯ О ПРОГРАММЕ' : 'DASTUR HAQIDA MA\'LUMOT'}
                        </h3>

                        <div className="flex items-center gap-4 p-3 bg-[var(--secondary)]/50 rounded-xl">
                            <Clock className="text-[var(--accent)] w-5 h-5" />
                            <div>
                                <div className="text-[10px] font-black text-[var(--primary)]/40 uppercase tracking-widest">
                                    {lang === 'ru' ? 'Длительность' : 'Davomiyligi'}
                                </div>
                                <div className="text-sm font-bold text-[var(--primary)]">
                                    {course.durationLabel || `${course.durationDays} ${lang === 'uz' ? 'kun' : 'дней'}`}
                                </div>
                            </div>
                        </div>

                        {course.type === 'OFFLINE' && (
                            <>
                                <div className="flex items-center gap-4 p-3 bg-blue-50/50 rounded-xl">
                                    <MapPin className="text-blue-600 w-5 h-5" />
                                    <div>
                                        <div className="text-[10px] font-black text-blue-900/40 uppercase tracking-widest">
                                            {lang === 'ru' ? 'Локация' : 'Manzil'}
                                        </div>
                                        <div className="text-sm font-bold text-blue-900">
                                            {getText(course.location || "", course.locationRu)}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 p-3 bg-orange-50/50 rounded-xl">
                                    <Calendar className="text-orange-600 w-5 h-5" />
                                    <div>
                                        <div className="text-[10px] font-black text-orange-900/40 uppercase tracking-widest">
                                            {lang === 'ru' ? 'Расписание' : 'Jadval'}
                                        </div>
                                        <div className="text-sm font-bold text-orange-900">
                                            {getText(course.schedule || "", course.scheduleRu)} {course.times && `(${getText(course.times, course.timesRu)})`}
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        <div className="flex items-center gap-4 p-3 bg-purple-50/50 rounded-xl">
                            <Users className="text-purple-600 w-5 h-5" />
                            <div>
                                <div className="text-[10px] font-black text-purple-900/40 uppercase tracking-widest">
                                    {lang === 'ru' ? 'Формат' : 'Format'}
                                </div>
                                <div className="text-sm font-bold text-purple-900 uppercase">
                                    {course.type}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Purchase / Prolong Section */}
                {hasAccess ? (
                    /* Active subscriber — show prolong option */
                    <div className="bg-gradient-to-r from-[var(--primary)] to-[#0a8069] rounded-[3rem] p-12 text-white shadow-2xl shadow-[var(--primary)]/20 mb-8">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <CheckCircle size={24} className="text-[var(--accent)]" />
                                    <h3 className="text-xl font-black uppercase tracking-wider">
                                        {lang === 'ru' ? 'Подписка активна' : 'Obuna faol'}
                                    </h3>
                                </div>
                                <p className="text-white/60 text-sm font-medium max-w-md">
                                    {lang === 'ru'
                                        ? 'Ваша подписка активна. Перейдите в Панель для просмотра уроков или продлите подписку.'
                                        : 'Sizning obunangiz faol. Darslarni ko\'rish uchun Panelga o\'ting yoki obunani uzaytiring.'}
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <button
                                    onClick={handleProlong}
                                    className="inline-flex items-center gap-3 bg-white text-[var(--primary)] px-10 py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:-translate-y-1 transition-all shadow-xl"
                                >
                                    <RefreshCw size={18} />
                                    {lang === 'ru' ? 'ПРОДЛИТЬ НА МЕСЯЦ' : 'OBUNANI UZAYTIRISH'}
                                </button>
                                <a
                                    href={`/${lang}/account`}
                                    className="inline-flex items-center gap-3 bg-white/10 text-white border border-white/20 px-10 py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all text-center"
                                >
                                    <Play size={18} />
                                    {lang === 'ru' ? 'СМОТРЕТЬ В ПАНЕЛИ' : 'PANELDA KO\'RISH'}
                                </a>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Non-subscriber — show purchase banner */
                    <PurchaseBanner
                        price={Number(course.price)}
                        lessonsCount={course.lessons.length}
                        hasAccess={hasAccess}
                        lang={lang}
                        onPurchase={handlePurchase}
                    />
                )}
            </div>

            {/* Lessons Preview — titles only, no playback */}
            {course.lessons.length > 0 && (
                <div className="max-w-4xl mx-auto px-4 mb-16">
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-[var(--primary)]/5 overflow-hidden border border-[var(--secondary)]">
                        <div className="p-8 bg-[var(--secondary)]/50 border-b border-[var(--secondary)]">
                            <h3 className="text-sm font-black text-[var(--primary)] uppercase tracking-[0.3em]">
                                {lang === 'ru' ? 'Содержание курса' : 'Kurs tarkibi'} ({course.lessons.length} {lang === 'ru' ? 'уроков' : 'dars'})
                            </h3>
                        </div>

                        <div className="divide-y divide-[var(--secondary)]">
                            {course.lessons.map((lesson, index) => (
                                <div
                                    key={lesson.id}
                                    className="flex items-center gap-5 px-8 py-5 hover:bg-[var(--secondary)]/30 transition-colors"
                                >
                                    {/* Lesson Number */}
                                    <div className="w-10 h-10 rounded-full bg-[var(--secondary)] flex items-center justify-center shrink-0">
                                        <span className="text-[10px] font-black text-[var(--primary)]/50">{index + 1}</span>
                                    </div>

                                    {/* Lesson Info */}
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-sm font-bold text-[var(--primary)] truncate">
                                            {lesson.title}
                                        </h4>
                                        {lesson.duration && (
                                            <p className="text-[10px] font-bold text-[var(--primary)]/30 uppercase tracking-widest mt-1">
                                                {Math.floor(lesson.duration / 60)} {lang === 'ru' ? 'мин' : 'min'}
                                            </p>
                                        )}
                                    </div>

                                    {/* Lock / Free indicator */}
                                    <div className="shrink-0">
                                        {lesson.isFree ? (
                                            <span className="text-[8px] font-black text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1 rounded-full uppercase tracking-widest">
                                                {lang === 'ru' ? 'БЕСПЛАТНО' : 'BEPUL'}
                                            </span>
                                        ) : !hasAccess ? (
                                            <Lock size={16} className="text-[var(--primary)]/20" />
                                        ) : (
                                            <CheckCircle size={16} className="text-[var(--accent)]" />
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* CTA at bottom of lesson list */}
                        {!hasAccess && (
                            <div className="p-8 bg-[var(--secondary)]/30 border-t border-[var(--secondary)] text-center">
                                <button
                                    onClick={handlePurchase}
                                    className="inline-flex items-center gap-3 bg-[var(--primary)] text-white px-12 py-5 rounded-full font-black uppercase tracking-widest text-[10px] hover:-translate-y-1 transition-all shadow-xl shadow-[var(--primary)]/20"
                                >
                                    {lang === 'ru' ? 'КУПИТЬ КУРС' : 'KURSNI XARID QILISH'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Contact Admin - Professional CTA */}
            <div className="max-w-4xl mx-auto px-4 pb-16 text-center">
                <div className="bg-white rounded-[4rem] p-16 shadow-2xl shadow-[var(--primary)]/5 relative overflow-hidden border border-[var(--secondary)]">
                    <h3 className="text-3xl font-serif font-black text-[var(--primary)] mb-6">
                        {lang === 'uz' ? "Savollaringiz bormi?" : "Есть вопросы?"}
                    </h3>
                    <p className="text-[var(--primary)]/60 text-lg mb-12 italic font-medium">
                        {lang === 'uz'
                            ? "Kurs haqida batafsil ma'lumot olish yoki individual savollar uchun biz bilan bog'laning."
                            : "Свяжитесь с нами для получения подробной информации о курсе или по индивидуальным вопросам."}
                    </p>
                    <a
                        href={`https://t.me/Sabina_Polatova`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-4 bg-[var(--primary)] text-white px-12 py-6 rounded-full font-black uppercase tracking-widest text-[10px] hover:bg-[var(--primary)] transition-all shadow-xl shadow-[var(--primary)]/20 hover:-translate-y-1"
                    >
                        <MessageSquare size={20} />
                        {lang === 'uz' ? "ADMIN BILAN BOG'LANISH" : "СВЯЗАТЬСЯ С АДМИНОМ"}
                    </a>
                </div>
            </div>
        </div>
    );
}
