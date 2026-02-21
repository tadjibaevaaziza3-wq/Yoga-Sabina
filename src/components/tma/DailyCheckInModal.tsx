
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Smile, Frown, Meh, ArrowRight, Activity, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface CheckInProps {
    isOpen: boolean;
    onClose: () => void;
    userName?: string;
    lang?: 'uz' | 'ru';
}

export default function DailyCheckInModal({ isOpen, onClose, userName, lang = 'uz' }: CheckInProps) {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [mood, setMood] = useState(5);
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [customSymptom, setCustomSymptom] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [recommendation, setRecommendation] = useState<any>(null);

    const translations = {
        uz: {
            title: "Daily Check-in",
            greeting: "Salom",
            howAreYou: "Bugun o'zingizni qanday his qilyapsiz?",
            bad: "Yomon",
            excellent: "A'lo",
            continue: "Davom etish",
            bothering: "Sizni nima bezovta qilyapti?",
            goalDescription: "Yoki shunchaki bugungi maqsadingizni tanlang.",
            customPlaceholder: "Yoki o'zingiz yozing...",
            analyze: "Tahlil qilish",
            recommendationForYou: "Siz uchun tavsiya:",
            startCourse: "Kursni Boshlash",
            thanksClose: "Rahmat, yopish",
            commonSymptoms: [
                "Bel og'rig'i", "Tizza og'rig'i", "Stress", "Charchoq", "Uyqusizlik", "Bosh og'rig'i", "Hayz davri (Og'riqli)"
            ]
        },
        ru: {
            title: "Daily Check-in",
            greeting: "Привет",
            howAreYou: "Как вы себя сегодня чувствуете?",
            bad: "Плохо",
            excellent: "Отлично",
            continue: "Продолжить",
            bothering: "Что вас беспокоит?",
            goalDescription: "Или просто выберите цель на сегодня.",
            customPlaceholder: "Или напишите сами...",
            analyze: "Анализировать",
            recommendationForYou: "Рекомендация для вас:",
            startCourse: "Начать курс",
            thanksClose: "Спасибо, закрыть",
            commonSymptoms: [
                "Боль в спине", "Боль в коленях", "Стресс", "Усталость", "Бессонница", "Головная боль", "Цикл (Болезненно)"
            ]
        }
    };

    const t = translations[lang as keyof typeof translations] || translations.uz;

    const commonSymptoms = t.commonSymptoms;

    const toggleSymptom = (sym: string) => {
        if (symptoms.includes(sym)) {
            setSymptoms(symptoms.filter(s => s !== sym));
        } else {
            setSymptoms([...symptoms, sym]);
        }
    };

    const handleSubmit = async () => {
        setIsSubmitting(true);
        try {
            const allSymptoms = [...symptoms];
            if (customSymptom) allSymptoms.push(customSymptom);

            const res = await fetch('/api/ai/check-in', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mood,
                    symptoms: allSymptoms.join(', '),
                    lang
                })
            });

            const data = await res.json();
            if (data.success) {
                setRecommendation(data.recommendation);
                setStep(3); // Result step
            }
        } catch (error) {
            console.error('Check-in failed', error);
            onClose();
        } finally {
            setIsSubmitting(false);
        }
    };

    const getMoodIcon = (val: number) => {
        if (val <= 3) return <Frown className="w-12 h-12 text-rose-500" />;
        if (val <= 7) return <Meh className="w-12 h-12 text-yellow-500" />;
        return <Smile className="w-12 h-12 text-green-500" />;
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                    onClick={onClose}
                />

                <motion.div
                    initial={{ scale: 0.9, y: 20, opacity: 0 }}
                    animate={{ scale: 1, y: 0, opacity: 1 }}
                    exit={{ scale: 0.9, y: 20, opacity: 0 }}
                    className="relative bg-[#0b0c10] border border-white/10 rounded-[2.5rem] w-full max-w-md overflow-hidden shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/5">
                        <div className="flex items-center gap-2">
                            <Activity className="w-5 h-5 text-[#114539]" />
                            <span className="text-xs font-bold uppercase tracking-widest text-white/60">{t.title}</span>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <X className="w-5 h-5 text-white/60" />
                        </button>
                    </div>

                    <div className="p-8">
                        {step === 1 && (
                            <div className="space-y-8 text-center">
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-editorial text-white">{t.greeting}, {userName || 'Azizim'}! 👋</h3>
                                    <p className="text-white/60 text-sm">{t.howAreYou}</p>
                                </div>

                                <div className="flex flex-col items-center gap-6">
                                    <div className="transform scale-150 transition-all duration-300">
                                        {getMoodIcon(mood)}
                                    </div>
                                    <input
                                        type="range"
                                        min="1"
                                        max="10"
                                        value={mood}
                                        onChange={(e) => setMood(parseInt(e.target.value))}
                                        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer accent-[#114539]"
                                    />
                                    <div className="flex justify-between w-full text-[10px] text-white/40 font-bold uppercase tracking-widest">
                                        <span>{t.bad}</span>
                                        <span>{t.excellent}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => setStep(2)}
                                    className="w-full btn-luxury py-4 mt-4 flex items-center justify-center gap-2"
                                >
                                    {t.continue} <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="text-center space-y-2">
                                    <h3 className="text-xl font-editorial text-white">{t.bothering}</h3>
                                    <p className="text-white/60 text-sm">{t.goalDescription}</p>
                                </div>

                                <div className="flex flex-wrap gap-2 justify-center">
                                    {commonSymptoms.map(sym => (
                                        <button
                                            key={sym}
                                            onClick={() => toggleSymptom(sym)}
                                            className={`px-4 py-2 rounded-full text-xs font-medium transition-all border ${symptoms.includes(sym)
                                                ? 'bg-[#114539] border-[#114539] text-white'
                                                : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                                                }`}
                                        >
                                            {sym}
                                        </button>
                                    ))}
                                </div>

                                <input
                                    type="text"
                                    placeholder={t.customPlaceholder}
                                    value={customSymptom}
                                    onChange={(e) => setCustomSymptom(e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-[#114539]"
                                />

                                <button
                                    onClick={handleSubmit}
                                    disabled={isSubmitting}
                                    className="w-full btn-luxury py-4 flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    ) : (
                                        <>{t.analyze} <Activity className="w-4 h-4" /></>
                                    )}
                                </button>
                            </div>
                        )}

                        {step === 3 && recommendation && (
                            <div className="space-y-6 text-center">
                                <div className="w-16 h-16 bg-[#114539]/20 rounded-full flex items-center justify-center mx-auto">
                                    <Heart className="w-8 h-8 text-[#114539]" />
                                </div>

                                <div className="space-y-2">
                                    <h3 className="text-xl font-editorial text-white">{t.recommendationForYou}</h3>
                                    <div className="bg-white/5 p-4 rounded-2xl text-left border border-white/10 max-h-40 overflow-y-auto custom-scrollbar">
                                        <p className="text-white/80 text-sm leading-relaxed whitespace-pre-wrap">
                                            {recommendation.text}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => router.push(`/${lang}/tma/courses`)}
                                        className="py-3 px-4 rounded-xl bg-white text-black font-bold text-xs hover:bg-gray-200 transition-colors"
                                    >
                                        {t.startCourse}
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="py-3 px-4 rounded-xl bg-white/10 text-white font-bold text-xs hover:bg-white/20 transition-colors"
                                    >
                                        {t.thanksClose}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
