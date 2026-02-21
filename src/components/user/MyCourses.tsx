'use client';

/**
 * My Courses Component
 * 
 * Displays user's purchased courses with progress tracking
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Clock, Calendar, CheckCircle } from 'lucide-react';
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
}

interface MyCoursesProps {
    lang?: 'uz' | 'ru';
}

export default function MyCourses({ lang = 'uz' }: MyCoursesProps) {
    const router = useRouter();
    const [courses, setCourses] = useState<CourseProgress[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchMyCourses();
    }, []);

    const fetchMyCourses = async () => {
        try {
            setLoading(true);
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
        } finally {
            setLoading(false);
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

    return (
        <div className="space-y-6">
            {courses.map(({ subscription, course, progress }) => {
                const daysRemaining = getDaysRemaining(subscription.endsAt);

                return (
                    <div
                        key={subscription.id}
                        className="bg-[var(--card-bg)] rounded-xl shadow-lg border border-[var(--border)] overflow-hidden hover:shadow-xl hover:shadow-[var(--primary)]/10 transition-all cursor-pointer group"
                        onClick={() => router.push(`/${lang}/learn/${course.id}`)}
                    >
                        <div className="grid md:grid-cols-[300px_1fr] gap-6">
                            {/* Course Image */}
                            <div className="relative h-48 md:h-full">
                                {course.coverImage ? (
                                    <Image
                                        src={course.coverImage}
                                        alt={getText(course.title, course.titleRu)}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center">
                                        <Play size={64} className="text-white opacity-50" />
                                    </div>
                                )}
                            </div>

                            {/* Course Info */}
                            <div className="p-6 space-y-4">
                                {/* Header */}
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <h3 className="text-2xl font-bold text-[var(--foreground)] mb-2">
                                            {getText(course.title, course.titleRu)}
                                        </h3>
                                        <p className="text-[var(--foreground)]/60 line-clamp-2">
                                            {getText(course.description, course.descriptionRu)}
                                        </p>
                                    </div>
                                    <span
                                        className={`px-3 py-1 text-xs font-semibold rounded-full ${course.type === 'ONLINE'
                                            ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                                            : 'bg-emerald-500/10 text-emerald-500'
                                            }`}
                                    >
                                        {course.type === 'ONLINE'
                                            ? lang === 'ru' ? 'Онлайн' : 'Onlayn'
                                            : lang === 'ru' ? 'Оффлайн' : 'Oflayn'}
                                    </span>
                                </div>

                                {/* Progress Bar */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-[var(--foreground)]/60">
                                            {lang === 'ru' ? 'Прогресс' : 'Jarayon'}
                                        </span>
                                        <span className="font-semibold text-[var(--foreground)]">
                                            {progress.completed} / {progress.total} {lang === 'ru' ? 'уроков' : 'dars'}
                                        </span>
                                    </div>
                                    <div className="w-full bg-[var(--secondary)] rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-[var(--primary)] h-full transition-all duration-500"
                                            style={{ width: `${progress.percentage}%` }}
                                        />
                                    </div>
                                    <div className="text-xs text-[var(--foreground)]/40">
                                        {progress.percentage}% {lang === 'ru' ? 'завершено' : 'tugallandi'}
                                    </div>
                                </div>

                                {/* Subscription Info */}
                                <div className="flex flex-wrap gap-4 pt-2">
                                    <div className="flex items-center gap-2 text-sm text-[var(--foreground)]/60">
                                        <Calendar size={16} />
                                        <span>
                                            {lang === 'ru' ? 'До' : 'Tugash'}: {formatDate(subscription.endsAt)}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Clock size={16} className={daysRemaining < 7 ? 'text-red-500' : 'text-emerald-500'} />
                                        <span className={daysRemaining < 7 ? 'text-red-500 font-semibold' : 'text-emerald-500'}>
                                            {daysRemaining} {lang === 'ru' ? 'дней осталось' : 'kun qoldi'}
                                        </span>
                                    </div>
                                </div>

                                {/* Action Button */}
                                <div className="pt-2">
                                    <button className="w-full md:w-auto px-6 py-3 bg-[var(--primary)] text-white rounded-lg hover:bg-[var(--primary)]/90 transition-colors font-semibold flex items-center justify-center gap-2 shadow-lg shadow-[var(--primary)]/20">
                                        <Play size={20} />
                                        {progress.completed > 0
                                            ? lang === 'ru' ? 'Продолжить обучение' : 'Davom ettirish'
                                            : lang === 'ru' ? 'Начать обучение' : 'Boshlash'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
