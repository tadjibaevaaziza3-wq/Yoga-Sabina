'use client';

/**
 * Course Catalog Component
 * 
 * Displays grid of available courses with filtering
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Video, MapPin, Calendar, Clock, Users } from 'lucide-react';
import { CourseCard } from '@/components/CourseCard';
import { useDictionary } from '@/components/providers/DictionaryProvider';

interface Course {
    id: string;
    title: string;
    titleRu?: string;
    description: string;
    descriptionRu?: string;
    price: number;
    durationDays: number;
    durationLabel?: string;
    type: 'ONLINE' | 'OFFLINE';
    coverImage?: string;
    location?: string;
    locationRu?: string;
    schedule?: string;
    scheduleRu?: string;
    features?: any;
    featuresRu?: any;
    targetAudience?: 'ALL' | 'MEN' | 'WOMEN';
    targetAudienceRu?: string;
    _count: {
        lessons: number;
    };
}

interface CourseCatalogProps {
    lang?: 'uz' | 'ru';
    initialType?: 'ONLINE' | 'OFFLINE' | 'ALL';
}

export default function CourseCatalog({ lang = 'uz', initialType = 'ALL' }: CourseCatalogProps) {
    const router = useRouter();
    const { dictionary } = useDictionary();
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>(initialType);

    useEffect(() => {
        fetchCourses();
    }, [filter]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const params = new URLSearchParams();
            if (filter !== 'ALL') params.append('type', filter);

            const response = await fetch(`/api/courses?${params}`);
            const data = await response.json();

            if (data.success && data.courses && data.courses.length > 0) {
                setCourses(data.courses);
            } else {
                // FALLBACK to static data if DB is empty
                const { coursesData } = require('@/lib/data/courses');
                const staticCourses = coursesData[lang] || coursesData['uz'];
                const filteredStatic = filter === 'ALL'
                    ? staticCourses
                    : staticCourses.filter((c: any) => c.type === filter);

                setCourses(filteredStatic.map((c: any) => ({
                    ...c,
                    _count: { lessons: c.lessons?.length || 0 }
                })));
            }
        } catch (error) {
            console.error('Error fetching courses:', error);
            // FALLBACK to static data on error
            try {
                const { coursesData } = require('@/lib/data/courses');
                const staticCourses = coursesData[lang] || coursesData['uz'];
                const filteredStatic = filter === 'ALL'
                    ? staticCourses
                    : staticCourses.filter((c: any) => c.type === filter);
                setCourses(filteredStatic);
            } catch (e) { }
        } finally {
            setLoading(false);
        }
    };

    const getText = <T,>(uz: T, ru?: T): T => {
        return lang === 'ru' && ru ? ru : uz;
    };

    const handleCourseClick = (courseId: string) => {
        router.push(`/${lang}/all-courses/${courseId}`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--accent)]"></div>
            </div>
        );
    }

    return (
        <div className="w-full">
            {/* Filters */}
            <div className="flex gap-3 mb-10 overflow-x-auto pb-2 scrollbar-hide">
                <button
                    onClick={() => setFilter('ALL')}
                    className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${filter === 'ALL'
                        ? 'bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20'
                        : 'bg-[var(--secondary)] text-[var(--primary)]/60 hover:bg-[var(--secondary)]'
                        }`}
                >
                    {lang === 'ru' ? 'Все курсы' : 'Barcha kurslar'}
                </button>
                <button
                    onClick={() => setFilter('ONLINE')}
                    className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${filter === 'ONLINE'
                        ? 'bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20'
                        : 'bg-[var(--secondary)] text-[var(--primary)]/60 hover:bg-[var(--secondary)]'
                        }`}
                >
                    {lang === 'ru' ? 'Онлайн' : 'Onlayn'}
                </button>
                <button
                    onClick={() => setFilter('OFFLINE')}
                    className={`px-8 py-3 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${filter === 'OFFLINE'
                        ? 'bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20'
                        : 'bg-[var(--secondary)] text-[var(--primary)]/60 hover:bg-[var(--secondary)]'
                        }`}
                >
                    {lang === 'ru' ? 'Оффлайн' : 'Oflayn'}
                </button>
            </div>

            {/* Courses Grid */}
            {courses.length === 0 ? (
                <div className="text-center py-20 bg-[var(--secondary)]/50 rounded-[3rem]">
                    <p className="text-[var(--primary)]/40 font-bold uppercase tracking-widest text-xs">
                        {lang === 'ru' ? 'Курсы не найдены' : 'Kurslar topilmadi'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
                    {courses.map((course) => (
                        <CourseCard
                            key={course.id}
                            id={course.id}
                            title={getText(course.title, course.titleRu)}
                            description={getText(course.description, course.descriptionRu)}
                            price={course.price.toString()}
                            duration={course.durationLabel || `${course.durationDays} ${lang === 'ru' ? 'дней' : 'kun'}`}
                            type={course.type}
                            imageUrl={course.coverImage}
                            features={getText(course.features || [], course.featuresRu)}
                            lang={lang}
                            dictionary={dictionary}
                            targetAudience={course.targetAudience}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}


