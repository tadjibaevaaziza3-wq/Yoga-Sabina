'use client';

/**
 * Course Detail Component
 * 
 * Displays course information, lessons list, and video player
 */

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, Play, CheckCircle, Clock, FileText, Download, MessageSquare, Users, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import EnhancedVideoPlayer from '@/components/video/EnhancedVideoPlayer';
import CourseChat from '@/components/user/CourseChat';
import VideoComments from '@/components/user/VideoComments';
import UserAgreementModal from '@/components/legal/UserAgreementModal';

// Sub-components
import { CourseHeader } from './CourseHeader';
import { PurchaseBanner } from './PurchaseBanner';
import { LessonListItem } from './LessonListItem';

interface Lesson {
    id: string;
    title: string;
    description?: string;
    duration?: number;
    order: number;
    isFree: boolean;
    videoUrl?: string;
    content?: string;
    assets: Array<{
        id: string;
        name: string;
        type: string;
        url?: string;
        storagePath?: string;
    }>;
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
}

export default function CourseDetail({ courseId, lang = 'uz', userId, userEmail }: CourseDetailProps) {
    const router = useRouter();
    const [course, setCourse] = useState<Course | null>(null);
    const [hasAccess, setHasAccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [showAgreement, setShowAgreement] = useState(false);
    const [agreementAccepted, setAgreementAccepted] = useState(false);
    const [activeTab, setActiveTab] = useState<'content' | 'chat' | 'comments'>('content');
    const videoPlayerRef = useRef<any>(null);

    useEffect(() => {
        fetchCourse();
        checkAgreement();
    }, [courseId]);

    const fetchCourse = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/courses/${courseId}`);
            const data = await response.json();

            if (data.success) {
                setCourse(data.course);
                setHasAccess(data.hasAccess);

                // Auto-select first available lesson
                if (data.course.lessons.length > 0) {
                    setSelectedLesson(data.course.lessons[0]);
                }
            }
        } catch (error) {
            console.error('Error fetching course:', error);
        } finally {
            setLoading(false);
        }
    };

    const checkAgreement = async () => {
        if (!userId) return;

        try {
            const response = await fetch('/api/user/accept-agreement');
            const data = await response.json();
            setAgreementAccepted(data.hasAccepted);
        } catch (error) {
            console.error('Error checking agreement:', error);
        }
    };

    const handleLessonClick = (lesson: Lesson) => {
        // Check if user has access
        if (!lesson.isFree && !hasAccess) {
            alert(lang === 'ru'
                ? 'Купите курс для доступа к этому уроку'
                : 'Ushbu darsga kirish uchun kursni xarid qiling'
            );
            return;
        }

        // Check agreement for video lessons
        if (lesson.videoUrl && !agreementAccepted) {
            setShowAgreement(true);
            return;
        }

        setSelectedLesson(lesson);
    };

    const handleAgreementAccept = () => {
        setAgreementAccepted(true);
        setShowAgreement(false);
    };

    const handlePurchase = () => {
        router.push(`/${lang}/checkout?id=${courseId}&type=course`);
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
            <div className="max-w-7xl mx-auto px-4 py-16">
                {/* Agreement Modal */}
                {showAgreement && (
                    <UserAgreementModal
                        isOpen={showAgreement}
                        onAccept={handleAgreementAccept}
                        lang={lang}
                    />
                )}

                {/* Course Header - Extracted Component */}
                <CourseHeader
                    title={getText(course.title, course.titleRu)}
                    description={getText(course.description, course.descriptionRu)}
                    type={course.type}
                    lang={lang}
                />

                {/* Detailed Info for Offline / Program features */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {/* Features List */}
                    <div className="bg-[var(--primary)] rounded-[3rem] p-12 text-white shadow-2xl shadow-[var(--primary)]/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <h3 className="text-sm font-black text-[var(--accent)]/40 uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                                <CheckCircle size={18} className="text-[var(--accent)]/60" />
                                {lang === 'ru' ? 'ОСОБЕННОСТИ КУРСА' : 'KURS AFZALLIKLARI'}
                            </h3>
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
                        {/* Decoration */}
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

                {/* Purchase Banner - Extracted Component */}
                <PurchaseBanner
                    price={Number(course.price)}
                    lessonsCount={course.lessons.length}
                    hasAccess={hasAccess}
                    lang={lang}
                    onPurchase={handlePurchase}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Video Player / Content Area */}
                <div className="lg:col-span-2">
                    {selectedLesson ? (
                        <div className="bg-white rounded-[3rem] shadow-2xl shadow-[var(--primary)]/5 overflow-hidden border border-[var(--secondary)]">
                            {/* Enhanced Video Player */}
                            {selectedLesson.videoUrl && userId && userEmail && agreementAccepted ? (
                                <EnhancedVideoPlayer
                                    ref={videoPlayerRef}
                                    assetId={selectedLesson.id}
                                    lessonId={selectedLesson.id}
                                    userId={userId}
                                    email={userEmail}
                                    className="w-full aspect-video"
                                />
                            ) : selectedLesson.videoUrl ? (
                                <div className="w-full aspect-video bg-gray-900 flex items-center justify-center">
                                    <div className="text-center text-white">
                                        <Lock size={48} className="mx-auto mb-4 opacity-50" />
                                        <p className="text-lg">
                                            {lang === 'ru'
                                                ? 'Войдите для просмотра'
                                                : 'Ko\'rish uchun kiring'}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <div className="w-full aspect-video bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                    <FileText size={64} className="text-white opacity-50" />
                                </div>
                            )}

                            {/* Lesson Info */}
                            <div className="p-12">
                                <h2 className="text-4xl font-serif font-black text-[var(--primary)] mb-6">
                                    {selectedLesson.title}
                                </h2>

                                {selectedLesson.description && (
                                    <p className="text-xl text-[var(--primary)]/60 font-medium mb-12 italic">
                                        {selectedLesson.description}
                                    </p>
                                )}

                                {selectedLesson.content && (
                                    <div className="prose prose-emerald max-w-none prose-p:text-[var(--primary)]/70 prose-strong:text-[var(--primary)]">
                                        <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                                    </div>
                                )}

                                {/* Assets */}
                                {selectedLesson.assets.length > 0 && (
                                    <div className="mt-12 pt-12 border-t border-[var(--secondary)]">
                                        <h3 className="text-sm font-black text-[var(--primary)] uppercase tracking-[0.3em] mb-8">
                                            {lang === 'ru' ? 'Материалы' : 'Materiallar'}
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {selectedLesson.assets.map((asset) => (
                                                <a
                                                    key={asset.id}
                                                    href={asset.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-4 p-5 bg-[var(--secondary)]/50 rounded-[1.5rem] hover:bg-[var(--secondary)] transition-colors border border-[var(--primary)]/5 group"
                                                >
                                                    <Download size={24} className="text-[var(--accent)] group-hover:-translate-y-1 transition-transform" />
                                                    <span className="text-sm font-bold text-[var(--primary)]">{asset.name}</span>
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Tabs for Chat and Comments */}
                            {hasAccess && userId && (
                                <div className="border-t border-[var(--secondary)]">
                                    {/* Tab Headers */}
                                    <div className="flex border-b border-[var(--secondary)] bg-[#F8FAFA]">
                                        <button
                                            onClick={() => setActiveTab('content')}
                                            className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'content'
                                                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-white'
                                                : 'text-[var(--primary)]/40 hover:text-[var(--primary)]'
                                                }`}
                                        >
                                            <FileText size={18} className="inline mr-2" />
                                            {lang === 'ru' ? 'Материалы' : 'Materiallar'}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('chat')}
                                            className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'chat'
                                                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-white'
                                                : 'text-[var(--primary)]/40 hover:text-[var(--primary)]'
                                                }`}
                                        >
                                            <Users size={18} className="inline mr-2" />
                                            {lang === 'ru' ? 'Чат курса' : 'Kurs chati'}
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('comments')}
                                            className={`px-8 py-5 text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'comments'
                                                ? 'text-[var(--primary)] border-b-2 border-[var(--primary)] bg-white'
                                                : 'text-[var(--primary)]/40 hover:text-[var(--primary)]'
                                                }`}
                                        >
                                            <MessageSquare size={18} className="inline mr-2" />
                                            {lang === 'ru' ? 'Комментарии' : 'Izohlar'}
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="p-12">
                                        {activeTab === 'content' && (
                                            <div>
                                                {selectedLesson.content ? (
                                                    <div className="prose prose-emerald max-w-none">
                                                        <div dangerouslySetInnerHTML={{ __html: selectedLesson.content }} />
                                                    </div>
                                                ) : (
                                                    <p className="text-[var(--primary)]/30 font-bold uppercase tracking-widest text-[10px] text-center py-12">
                                                        {lang === 'ru' ? 'Нет дополнительных материалов' : 'Qo\'shimcha materiallar yo\'q'}
                                                    </p>
                                                )}
                                            </div>
                                        )}

                                        {activeTab === 'chat' && (
                                            <CourseChat
                                                courseId={courseId}
                                                currentUserId={userId}
                                            />
                                        )}

                                        {activeTab === 'comments' && selectedLesson && (
                                            <VideoComments
                                                lessonId={selectedLesson.id}
                                                currentUserId={userId}
                                                onSeekToTimestamp={(seconds) => {
                                                    // Seek video to timestamp using ref
                                                    if (videoPlayerRef.current) {
                                                        videoPlayerRef.current.seekTo(seconds);
                                                    }
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="bg-white rounded-[3rem] p-24 shadow-2xl shadow-[var(--primary)]/5 text-center border border-[var(--secondary)]">
                            <p className="text-[var(--primary)]/30 text-lg font-bold uppercase tracking-widest">
                                {lang === 'ru' ? 'Выберите урок' : 'Darsni tanlang'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Lessons Sidebar */}
                <div className="lg:col-span-1">
                    <div className="bg-white rounded-[3rem] shadow-2xl shadow-[var(--primary)]/5 overflow-hidden border border-[var(--secondary)] sticky top-4">
                        <div className="p-8 bg-[var(--secondary)]/50 border-b border-[var(--secondary)]">
                            <h3 className="text-sm font-black text-[var(--primary)] uppercase tracking-[0.3em]">
                                {lang === 'ru' ? 'Уроки' : 'Darslar'} ({course.lessons.length})
                            </h3>
                        </div>

                        <div className="max-h-[800px] overflow-y-auto scrollbar-hide">
                            {course.lessons.map((lesson, index) => (
                                <LessonListItem
                                    key={lesson.id}
                                    lesson={lesson}
                                    index={index}
                                    isSelected={selectedLesson?.id === lesson.id}
                                    hasAccess={hasAccess}
                                    lang={lang}
                                    onClick={handleLessonClick}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Admin - Professional CTA */}
            <div className="mt-32 max-w-4xl mx-auto text-center">
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


