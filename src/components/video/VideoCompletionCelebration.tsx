"use client";

import React, { useEffect, useState } from 'react';
import { Trophy, Star, Clock, Zap, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface VideoCompletionCelebrationProps {
    isOpen: boolean;
    onClose: () => void;
    onNextLesson?: () => void;
    lessonTitle: string;
    watchedMinutes: number;
    completedCount: number;
    streak: number;
    xpEarned: number;
    lang: 'uz' | 'ru';
}

const MOTIVATIONAL_MESSAGES_UZ = [
    "Ajoyib! Siz o'z tanangiz va ruhingiz uchun g'amxo'rlik qilyapsiz! 🌟",
    "Har bir mashg'ulot — sog'lom hayot sari bir qadam! 💚",
    "Tabriklaymiz! Siz davom etasiz — bu eng muhim narsa! 🏆",
    "Siz bugun o'zingizni yangiladingiz! Ertaga yanada kuchliroq bo'lasiz! 💪",
    "Yoga — bu safar, manzil emas. Siz to'g'ri yo'ldasiz! 🧘‍♀️",
    "Disciplina — bu erkinlik! Siz g'olib bo'ldingiz! 🎯",
    "Tanangiz minnatdor! Har bir mashg'ulot muhim! ✨",
    "Zo'r natija! Sabr va mehnat bilan hamma narsaga erishish mumkin! 🌱",
];

const MOTIVATIONAL_MESSAGES_RU = [
    "Превосходно! Вы заботитесь о своём теле и духе! 🌟",
    "Каждая тренировка — шаг к здоровой жизни! 💚",
    "Поздравляем! Вы продолжаете — это самое важное! 🏆",
    "Сегодня вы обновили себя! Завтра будете ещё сильнее! 💪",
    "Йога — это путешествие, а не цель. Вы на верном пути! 🧘‍♀️",
    "Дисциплина — это свобода! Вы победили! 🎯",
    "Ваше тело благодарно! Каждая тренировка важна! ✨",
    "Отличный результат! Терпение и труд — ключ к успеху! 🌱",
];

export function VideoCompletionCelebration({
    isOpen,
    onClose,
    onNextLesson,
    lessonTitle,
    watchedMinutes,
    completedCount,
    streak,
    xpEarned,
    lang,
}: VideoCompletionCelebrationProps) {
    const [confettiPieces, setConfettiPieces] = useState<{ id: number; x: number; delay: number; color: string; size: number }[]>([]);

    const messages = lang === 'uz' ? MOTIVATIONAL_MESSAGES_UZ : MOTIVATIONAL_MESSAGES_RU;
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];

    useEffect(() => {
        if (isOpen) {
            const pieces = Array.from({ length: 40 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                delay: Math.random() * 2,
                color: ['#0a8069', '#15b892', '#d4edda', '#ffd700', '#ff6b6b', '#7c3aed'][Math.floor(Math.random() * 6)],
                size: Math.random() * 8 + 4,
            }));
            setConfettiPieces(pieces);
        }
    }, [isOpen]);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
                    onClick={onClose}
                >
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

                    {/* Confetti */}
                    {confettiPieces.map((piece) => (
                        <motion.div
                            key={piece.id}
                            initial={{ y: -20, x: `${piece.x}vw`, opacity: 1, rotate: 0 }}
                            animate={{
                                y: '100vh',
                                rotate: 720,
                                opacity: [1, 1, 0],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                delay: piece.delay,
                                ease: 'easeIn',
                            }}
                            className="fixed top-0 pointer-events-none"
                            style={{
                                width: piece.size,
                                height: piece.size,
                                backgroundColor: piece.color,
                                borderRadius: Math.random() > 0.5 ? '50%' : '2px',
                                left: `${piece.x}%`,
                            }}
                        />
                    ))}

                    {/* Modal */}
                    <motion.div
                        initial={{ scale: 0.5, y: 50 }}
                        animate={{ scale: 1, y: 0 }}
                        exit={{ scale: 0.8, y: 50, opacity: 0 }}
                        transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                        className="relative bg-white rounded-[2rem] shadow-2xl max-w-md w-full overflow-hidden"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Top gradient */}
                        <div className="bg-gradient-to-br from-[#0a8069] to-[#065f50] p-8 text-center text-white relative overflow-hidden">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ delay: 0.3, type: 'spring' }}
                                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm mb-4"
                            >
                                <Trophy className="w-10 h-10 text-yellow-300" />
                            </motion.div>
                            <motion.h2
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                                className="text-2xl font-black font-serif mb-2"
                            >
                                {lang === 'uz' ? 'Tabriklaymiz! 🎉' : 'Поздравляем! 🎉'}
                            </motion.h2>
                            <motion.p
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                                className="text-white/80 text-sm line-clamp-2"
                            >
                                {lessonTitle}
                            </motion.p>

                            {/* Sparkle decorations */}
                            <Sparkles className="absolute top-4 right-6 w-5 h-5 text-yellow-300/40 animate-pulse" />
                            <Sparkles className="absolute bottom-6 left-8 w-4 h-4 text-white/20 animate-pulse" style={{ animationDelay: '0.5s' }} />
                        </div>

                        {/* Stats */}
                        <div className="p-6 space-y-5">
                            {/* Motivational message */}
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-center text-sm text-gray-600 font-medium leading-relaxed"
                            >
                                {randomMessage}
                            </motion.p>

                            {/* Stats grid */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7 }}
                                className="grid grid-cols-2 gap-3"
                            >
                                <div className="bg-emerald-50 rounded-2xl p-4 text-center border border-emerald-100">
                                    <Zap className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                                    <p className="text-xl font-black text-emerald-700">+{xpEarned}</p>
                                    <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">XP</p>
                                </div>
                                <div className="bg-blue-50 rounded-2xl p-4 text-center border border-blue-100">
                                    <Clock className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                                    <p className="text-xl font-black text-blue-700">{watchedMinutes}m</p>
                                    <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest">
                                        {lang === 'uz' ? 'Vaqt' : 'Время'}
                                    </p>
                                </div>
                                <div className="bg-purple-50 rounded-2xl p-4 text-center border border-purple-100">
                                    <Star className="w-5 h-5 text-purple-600 mx-auto mb-1" />
                                    <p className="text-xl font-black text-purple-700">{completedCount}</p>
                                    <p className="text-[10px] font-bold text-purple-500 uppercase tracking-widest">
                                        {lang === 'uz' ? 'Yakunlangan' : 'Завершено'}
                                    </p>
                                </div>
                                <div className="bg-orange-50 rounded-2xl p-4 text-center border border-orange-100">
                                    <div className="text-orange-600 text-lg mx-auto mb-1">🔥</div>
                                    <p className="text-xl font-black text-orange-700">{streak}</p>
                                    <p className="text-[10px] font-bold text-orange-500 uppercase tracking-widest">Streak</p>
                                </div>
                            </motion.div>

                            {/* Actions */}
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.8 }}
                                className="flex gap-3"
                            >
                                {onNextLesson && (
                                    <button
                                        onClick={onNextLesson}
                                        className="flex-1 flex items-center justify-center gap-2 px-6 py-3.5 bg-[#0a8069] text-white rounded-2xl font-bold text-sm hover:bg-[#065f50] transition-all shadow-lg shadow-[#0a8069]/20"
                                    >
                                        {lang === 'uz' ? 'Keyingi dars' : 'Следующий урок'}
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                )}
                                <button
                                    onClick={onClose}
                                    className={`${onNextLesson ? 'px-5' : 'flex-1'} py-3.5 bg-gray-100 text-gray-600 rounded-2xl font-bold text-sm hover:bg-gray-200 transition-all`}
                                >
                                    {lang === 'uz' ? 'Yopish' : 'Закрыть'}
                                </button>
                            </motion.div>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
