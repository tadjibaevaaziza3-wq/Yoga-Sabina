'use client';

import { Play, Lock, Clock } from 'lucide-react';

interface Lesson {
    id: string;
    title: string;
    description?: string;
    duration?: number;
    order: number;
    isFree: boolean;
    videoUrl?: string;
    assets: Array<{
        id: string;
        name: string;
        type: string;
        url?: string;
        storagePath?: string;
    }>;
}

interface LessonListItemProps {
    lesson: Lesson;
    index: number;
    isSelected: boolean;
    hasAccess: boolean;
    lang: 'uz' | 'ru';
    onClick: (lesson: Lesson) => void;
}

export function LessonListItem({
    lesson,
    index,
    isSelected,
    hasAccess,
    lang,
    onClick
}: LessonListItemProps) {
    const isAvailable = lesson.isFree || hasAccess;

    return (
        <button
            onClick={() => onClick(lesson)}
            className={`w-full text-left p-6 border-b border-[var(--secondary)] hover:bg-[var(--secondary)] transition-all ${isSelected ? 'bg-[var(--secondary)]/50' : ''
                }`}
        >
            <div className="flex items-start gap-3">
                <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isAvailable
                    ? 'bg-[var(--secondary)] text-[var(--accent)]'
                    : 'bg-[var(--secondary)] text-[var(--primary)]/20'
                    }`}>
                    {isAvailable ? (
                        <Play size={16} />
                    ) : (
                        <Lock size={16} />
                    )}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-gray-500">
                            {index + 1}
                        </span>
                        {lesson.isFree && (
                            <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-[var(--secondary)] text-[var(--primary)] rounded">
                                {lang === 'ru' ? 'Бесплатно' : 'Bepul'}
                            </span>
                        )}
                    </div>

                    <h4 className="text-sm font-medium text-gray-900 mb-1 line-clamp-2">
                        {lesson.title}
                    </h4>

                    {lesson.duration && (
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                            <Clock size={12} />
                            <span>{Math.floor(lesson.duration / 60)} {lang === 'ru' ? 'мин' : 'daq'}</span>
                        </div>
                    )}
                </div>
            </div>
        </button>
    );
}


