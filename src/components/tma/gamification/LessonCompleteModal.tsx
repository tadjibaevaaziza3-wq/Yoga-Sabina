
import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';
import { Trophy, ArrowRight, Home, Share2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface LessonCompleteModalProps {
    isOpen: boolean;
    onClose: () => void;
    nextLessonId?: string;
    courseId?: string;
}

export default function LessonCompleteModal({ isOpen, onClose, nextLessonId, courseId }: LessonCompleteModalProps) {
    const router = useRouter();

    useEffect(() => {
        if (isOpen) {
            // Trigger confetti
            const duration = 3000;
            const end = Date.now() + duration;

            const frame = () => {
                confetti({
                    particleCount: 2,
                    angle: 60,
                    spread: 55,
                    origin: { x: 0 },
                    colors: ['#FFD700', '#FFA500', '#FF4500']
                });
                confetti({
                    particleCount: 2,
                    angle: 120,
                    spread: 55,
                    origin: { x: 1 },
                    colors: ['#008000', '#00FF00', '#ADFF2F']
                });

                if (Date.now() < end) {
                    requestAnimationFrame(frame);
                }
            };
            frame();
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5, y: 100 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5, y: 100 }}
                        className="relative bg-white rounded-[2.5rem] p-8 w-full max-w-sm text-center overflow-hidden shadow-2xl"
                    >
                        {/* Glow Effect */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-yellow-400/20 blur-[80px] rounded-full -mt-32 pointer-events-none" />

                        <div className="relative z-10 space-y-6">
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
                                transition={{ delay: 0.2, type: "spring" }}
                                className="w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-500 rounded-full mx-auto flex items-center justify-center shadow-lg mb-2"
                            >
                                <Trophy className="w-12 h-12 text-white drop-shadow-md" />
                            </motion.div>

                            <div className="space-y-2">
                                <h2 className="text-3xl font-editorial font-bold text-[#114539]">
                                    Malades! 🎉
                                </h2>
                                <p className="text-sm text-[#114539]/60 leading-relaxed">
                                    Siz bugun o'zingiz uchun katta ish qildingiz. Tanangiz sizga rahmat aytmoqda!
                                </p>
                            </div>

                            <div className="space-y-3 pt-2">
                                {nextLessonId ? (
                                    <button
                                        onClick={() => router.push(`/tma/player/${nextLessonId}`)}
                                        className="w-full btn-luxury py-4 px-6 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest shadow-xl shadow-yellow-500/20"
                                    >
                                        Keyingi Dars <ArrowRight className="w-4 h-4" />
                                    </button>
                                ) : (
                                    <button
                                        onClick={() => router.push('/tma/courses')}
                                        className="w-full btn-luxury py-4 px-6 flex items-center justify-center gap-2 text-[11px] uppercase tracking-widest"
                                    >
                                        Kurslar Sahifasi <ArrowRight className="w-4 h-4" />
                                    </button>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={() => router.push('/tma/dashboard')}
                                        className="py-3 px-4 rounded-xl bg-gray-100 text-[#114539] font-bold text-xs hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Home className="w-4 h-4 opacity-50" /> Bosh Sahifa
                                    </button>
                                    <button
                                        onClick={onClose} // Or share logic
                                        className="py-3 px-4 rounded-xl bg-blue-50/50 text-blue-600 font-bold text-xs hover:bg-blue-100 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Share2 className="w-4 h-4 opacity-50" /> Ulashish
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
