'use client';

/**
 * My Courses Component
 * 
 * Displays user's purchased courses with progress tracking
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Clock } from 'lucide-react';
import Image from 'next/image';

interface CourseProgress {
    subscription: {
        id: string;
        startsAt: string;
        endsAt: string;
    };
    course: {
        id: string;
        title: string;
        titleRu?: string;
        description: string;
        descriptionRu?: string;
        coverImage?: string;
        type: 'ONLINE' | 'OFFLINE';
        _count: {
            lessons: number;
        };
    };
    progress: {
        total: number;
        completed: number;
        percentage: number;
    };
    lastWatchedLesson?: {
        id: string;
        title: string;
        titleRu?: string;
        slug: string;
        lastWatched: string;
        progress: number;
        duration: number;
    } | null;
}

interface RecommendedCourse {
    id: string;
    title: string;
    titleRu?: string;
    description: string;
    descriptionRu?: string;
    coverImage?: string;
    price: number;
    type: 'ONLINE' | 'OFFLINE';
    recommendationScore: number;
}

interface MyCoursesProps {
    lang?: 'uz' | 'ru';
}

export default function MyCourses({ lang = 'uz' }: MyCoursesProps) {
    const router = useRouter();
    const [courses, setCourses] = useState<CourseProgress[]>([]);
    const [recommendations, setRecommendations] = useState<RecommendedCourse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            await Promise.all([
                fetchMyCourses(),
                fetchRecommendations()
            ]);
            setLoading(false);
        };
        loadData();
    }, []);

    const fetchMyCourses = async () => {
        try {
            const response = await fetch('/api/user/my-courses');
            const data = await response.json();

            if (data.success) {
                setCourses(data.courses);
            } else {
                setError(data.error);
            }
        } catch (err) {
            console.error('Error fetching courses:', err);
            setError('Failed to load courses');
        }
    };

    const fetchRecommendations = async () => {
        try {
            const res = await fetch('/api/user/recommendations');
            const data = await res.json();
            if (data.success) {
                setRecommendations(data.recommendations);
            }
        } catch (err) {
            console.error('Error fetching recommendations:', err);
        }
    };

    const getText = (uz: string, ru?: string) => {
        return lang === 'ru' && ru ? ru : uz;
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'uz-UZ', {
            day: 'numeric',
            month: 'long',
            year: 'numeric',
        });
    };

    const getDaysRemaining = (endDate: string) => {
        const end = new Date(endDate);
        const now = new Date();
        const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return diff;
    };

    const getMostRecentLesson = () => {
        const lessonsWithTime = courses
            .filter(c => c.lastWatchedLesson)
            .map(c => ({
                course: c.course,
                lesson: c.lastWatchedLesson!,
                timestamp: new Date(c.lastWatchedLesson!.lastWatched).getTime()
            }))
            .sort((a, b) => b.timestamp - a.timestamp);

        return lessonsWithTime[0] || null;
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="text-center py-16">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (courses.length === 0) {
        return (
            <div className="text-center py-16 space-y-4">
                <div className="w-24 h-24 bg-[var(--secondary)] rounded-full flex items-center justify-center mx-auto">
                    <Play size={40} className="text-[var(--primary)]/50" />
                </div>
                <h3 className="text-xl font-bold text-[var(--foreground)]">
                    {lang === 'ru' ? 'У вас пока нет курсов' : 'Sizda hali kurslar yo\'q'}
                </h3>
                <p className="text-[var(--foreground)]/60">
                    {lang === 'ru'
                        ? 'Купите курс, чтобы начать обучение'
                        : 'O\'qishni boshlash uchun kurs sotib oling'}
                </p>
                <button
                    onClick={() => router.push(`/${lang}/account#courses`)}
                    className="mt-4 px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors shadow-lg shadow-[var(--primary)]/20"
                >
                    {lang === 'ru' ? 'Смотреть курсы' : 'Kurslarni ko\'rish'}
                </button>
            </div>
        );
    }

    const mostRecent = getMostRecentLesson();

    return (
        <div className="space-y-12">
            {/* 1. Quick Resume Section (Hero) */}
            {mostRecent && (
                <section className="bg-gradient-to-r from-[var(--primary)] to-[var(--primary)]/80 rounded-2xl p-8 text-white shadow-xl shadow-[var(--primary)]/20">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                        <div className="space-y-2">
                            <span className="inline-block px-3 py-1 bg-white/20 rounded-full text-xs font-bold uppercase tracking-wider mb-2">
                                {lang === 'uz' ? 'O\'qishni davom ettirish' : 'Продолжить обучение'}
                            </span>
                            <h3 className="text-3xl font-serif font-black">
                                {getText(mostRecent.lesson.title, mostRecent.lesson.titleRu)}
                            </h3>
                            <p className="opacity-80">
                                {getText(mostRecent.course.title, mostRecent.course.titleRu)}
                            </p>
                        </div>
                        <button
                            onClick={() => {
                                router.push(`/${lang}/learn/${mostRecent.course.id}?lesson=${mostRecent.lesson.id}`);
                            }}
                            className="px-8 py-4 bg-white text-[var(--primary)] rounded-xl font-bold hover:bg-opacity-90 transition-all shadow-lg flex items-center gap-2"
                        >
                            <Play fill="currentColor" size={20} />
                            {lang === 'uz' ? 'Hozir ko\'rish' : 'Смотреть сейчас'}
                        </button>
                    </div>
                </section>
            )}

            {/* 2. My Courses Grid — YouTube-style */}
            <div className="space-y-6">
                <h2 className="text-2xl font-serif font-black text-[var(--foreground)]">
                    {lang === 'uz' ? 'Kurslarim' : 'Мои курсы'}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {courses.map(({ subscription, course, progress }) => {
                        const daysRemaining = getDaysRemaining(subscription.endsAt);
                        const isUrgent = daysRemaining < 7;

                        return (
                            <div
                                key={subscription.id}
                                className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] overflow-hidden hover:shadow-2xl hover:shadow-[var(--primary)]/10 hover:-translate-y-1 transition-all cursor-pointer group"
                                onClick={() => router.push(`/${lang}/learn/${course.id}`)}
                            >
                                {/* Thumbnail — 16:9 aspect ratio */}
                                <div className="relative aspect-video overflow-hidden bg-[var(--secondary)]">
                                    {course.coverImage ? (
                                        <Image
                                            src={course.coverImage}
                                            alt={getText(course.title, course.titleRu)}
                                            fill
                                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-gradient-to-br from-[var(--primary)]/20 to-[var(--primary)]/5 flex items-center justify-center">
                                            <Play size={48} className="text-[var(--primary)]/30" />
                                        </div>
                                    )}

                                    {/* Play overlay on hover */}
                                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-300 flex items-center justify-center">
                                        <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition-all duration-300 shadow-xl">
                                            <Play size={22} className="text-[var(--primary)] fill-current ml-1" />
                                        </div>
                                    </div>

                                    {/* Lesson count badge */}
                                    <div className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/70 text-white text-[10px] font-bold rounded-md">
                                        {progress.total} {lang === 'uz' ? 'dars' : 'урок'}
                                    </div>

                                    {/* Progress bar at bottom of thumbnail */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                        <div
                                            className="h-full bg-[var(--primary)]"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Card Body */}
                                <div className="p-4 space-y-3">
                                    {/* Title + Type badge */}
                                    <div className="flex items-start gap-2">
                                        <h3 className="flex-1 font-bold text-[var(--foreground)] line-clamp-2 text-sm leading-snug">
                                            {getText(course.title, course.titleRu)}
                                        </h3>
                                        <span className={`flex-shrink-0 px-2 py-0.5 text-[9px] font-black rounded-full uppercase tracking-wider mt-0.5 ${course.type === 'ONLINE'
                                            ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                                            : 'bg-emerald-500/10 text-emerald-500'
                                            }`}>
                                            {course.type === 'ONLINE'
                                                ? lang === 'ru' ? 'Онлайн' : 'Online'
                                                : lang === 'ru' ? 'Оффлайн' : 'Offline'}
                                        </span>
                                    </div>

                                    {/* Progress text */}
                                    <div className="flex items-center justify-between text-[11px] text-[var(--foreground)]/50 font-medium">
                                        <span>{progress.completed}/{progress.total} {lang === 'uz' ? 'dars' : 'урок'}</span>
                                        <span>{progress.percentage}%</span>
                                    </div>

                                    {/* Days remaining */}
                                    <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${isUrgent ? 'text-red-500' : 'text-[var(--foreground)]/40'}`}>
                                        <Clock size={12} />
                                        {daysRemaining} {lang === 'uz' ? 'kun qoldi' : 'дней осталось'}
                                    </div>

                                    {/* Continue button */}
                                    <button className="w-full py-2.5 bg-[var(--primary)] text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:opacity-90 transition-opacity shadow-md shadow-[var(--primary)]/20 flex items-center justify-center gap-2">
                                        <Play size={14} fill="currentColor" />
                                        {progress.completed > 0
                                            ? lang === 'ru' ? 'Продолжить' : 'Davom ettirish'
                                            : lang === 'ru' ? 'Начать' : 'Boshlash'}
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* 3. Recommendations Section */}
            {recommendations.length > 0 && (
                <section className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-serif font-black text-[var(--foreground)]">
                            {lang === 'uz' ? 'Siz uchun tavsiyalar' : 'Рекомендовано для вас'}
                        </h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {recommendations.map((course) => (
                            <div
                                key={course.id}
                                className="bg-[var(--card-bg)] rounded-xl border border-[var(--border)] overflow-hidden hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                                onClick={() => router.push(`/${lang}/all-courses`)}
                            >
                                <div className="relative h-40 overflow-hidden">
                                    {course.coverImage ? (
                                        <Image
                                            src={course.coverImage}
                                            alt={getText(course.title, course.titleRu)}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-[var(--primary)]/10" />
                                    )}
                                    <div className="absolute top-2 right-2 px-2 py-1 bg-[var(--primary)] text-white text-[10px] font-bold rounded-lg shadow-sm">
                                        {lang === 'uz' ? 'TAVSIYA' : 'РЕКОМЕНДУЕМ'}
                                    </div>
                                </div>
                                <div className="p-4 flex-1 flex flex-col">
                                    <h4 className="font-bold text-[var(--foreground)] mb-2 line-clamp-1">
                                        {getText(course.title, course.titleRu)}
                                    </h4>
                                    <p className="text-xs text-[var(--foreground)]/60 line-clamp-2 mb-4 flex-1">
                                        {getText(course.description, course.descriptionRu)}
                                    </p>
                                    <div className="flex items-center justify-between mt-auto">
                                        <span className="font-bold text-[var(--primary)]">
                                            {course.price.toLocaleString()} {lang === 'uz' ? 'so\'m' : 'сум'}
                                        </span>
                                        <button className="text-[var(--primary)] text-xs font-bold hover:underline">
                                            {lang === 'uz' ? 'Batafsil' : 'Подробнее'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </div>
    );
}
