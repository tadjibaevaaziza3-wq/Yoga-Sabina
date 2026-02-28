'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Heart, Play, Pause, UserPlus, LogIn } from 'lucide-react';

// Default content (used when settings are not set in admin)
const DEFAULTS = {
    TMA_INTRO_LOGO: '/images/logo.png',
    TMA_INTRO_VIDEO: '/videos/intro.mp4',
    TMA_INTRO_TRAINER_NAME: 'SABINA POLATOVA',
    TMA_INTRO_TITLE_UZ: 'Baxtli Men',
    TMA_INTRO_TITLE_RU: 'Baxtli Men',
    TMA_INTRO_SUBTITLE_UZ: "Sog'lomlik va ichki muvozanat",
    TMA_INTRO_SUBTITLE_RU: 'Здоровье и внутренний баланс',
    TMA_INTRO_BIO_UZ: "Sabina Polatova — 7 yillik tajribaga ega sertifikatlangan yoga-trener va yoga-terapevt. Salomatlik va barcha uchun ichki muvozanat bo'yicha mutaxassis.",
    TMA_INTRO_BIO_RU: 'Сабина Полатова — сертифицированный йога-тренер и йога-терапевт с 7-летнего стажем. Специалист по оздоровлению и внутреннему балансу для всех.',
    TMA_INTRO_MEMBERS_COUNT: '500+',
    TMA_INTRO_VIDEO_LABEL_UZ: 'Metodim bilan tanishing',
    TMA_INTRO_VIDEO_LABEL_RU: 'Познакомьтесь с методом',
};

const SETTING_KEYS = Object.keys(DEFAULTS).join(',');

export default function TMAPage({ params }: { params: any }) {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [loading, setLoading] = useState(true);
    const [currentLang, setCurrentLang] = useState('uz');
    const [isPlaying, setIsPlaying] = useState(false);
    const [settings, setSettings] = useState(DEFAULTS);

    const toggleVideo = () => {
        if (videoRef.current) {
            if (isPlaying) {
                videoRef.current.pause();
            } else {
                videoRef.current.play();
            }
            setIsPlaying(!isPlaying);
        }
    };

    useEffect(() => {
        const init = async () => {
            const resolvedParams = await params;
            const lang = resolvedParams.lang || 'uz';
            setCurrentLang(lang);

            // Fetch settings and check auth IN PARALLEL
            const settingsPromise = fetch(`/api/settings/public?keys=${SETTING_KEYS}`)
                .then(r => r.json())
                .catch(() => ({}));

            // Check if user is already registered — POST Telegram data so existing web-registered
            // users get their telegramId auto-linked immediately on first TMA visit
            const tg = typeof window !== "undefined" ? (window as any).Telegram?.WebApp : null;
            const tgUser = tg?.initDataUnsafe?.user;
            const isDev = typeof window !== "undefined" && window.location.hostname === 'localhost';

            let authPromise: Promise<any>;
            if (tgUser?.id) {
                // POST to auto-link telegramId + check registration
                authPromise = fetch('/api/tma/register', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        telegramId: tgUser.id,
                        telegramUsername: tgUser.username || null,
                        firstName: tgUser.first_name || null,
                        lastName: tgUser.last_name || null,
                        lang,
                    }),
                }).then(r => r.json()).catch(() => null);
            } else {
                authPromise = Promise.resolve(null);
            }

            const [settingsData, authData] = await Promise.all([settingsPromise, authPromise]);

            // Apply settings
            setSettings(prev => {
                const merged = { ...prev };
                Object.keys(prev).forEach(k => {
                    if (settingsData[k]) (merged as any)[k] = settingsData[k];
                });
                return merged;
            });

            // Handle auth redirect
            if (authData?.success && authData?.isRegistered) {
                window.location.replace(`/${lang}/tma/dashboard`);
                return;
            }
            setLoading(false);
        };
        init();
    }, [params]);

    if (loading) return (
        <div className="min-h-screen bg-[#f6f9fe] flex items-center justify-center">
            <div className="w-10 h-10 border-t-2 border-[#114539] rounded-full animate-spin" />
        </div>
    );

    // Dynamic localized content
    const s = settings;
    const t = {
        title: currentLang === 'ru' ? s.TMA_INTRO_TITLE_RU : s.TMA_INTRO_TITLE_UZ,
        subtitle: currentLang === 'ru' ? s.TMA_INTRO_SUBTITLE_RU : s.TMA_INTRO_SUBTITLE_UZ,
        bio: currentLang === 'ru' ? s.TMA_INTRO_BIO_RU : s.TMA_INTRO_BIO_UZ,
        cta: currentLang === 'ru' ? 'ПРОДОЛЖИТЬ' : 'DAVOM ETISH',
        members: currentLang === 'ru' ? 'Участников' : "A'zolar",
        videoLabel: currentLang === 'ru' ? s.TMA_INTRO_VIDEO_LABEL_RU : s.TMA_INTRO_VIDEO_LABEL_UZ,
    };

    return (
        <main className="bg-[#f6f9fe] min-h-screen flex flex-col overflow-x-hidden relative">
            <div className="absolute top-0 right-0 w-[80%] h-[40%] bg-[#114539]/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            <div className="flex-1 flex flex-col p-8 pt-20 space-y-10 relative z-10 text-center">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="space-y-6"
                >
                    <div className="space-y-4 flex flex-col items-center">
                        <div className="relative w-24 h-24 mb-2">
                            <Image
                                src={s.TMA_INTRO_LOGO}
                                alt="Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="space-y-3">
                            <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-[#114539] block">
                                {s.TMA_INTRO_TRAINER_NAME}
                            </span>
                            <h1 className="text-6xl font-editorial font-bold leading-[1] tracking-tight text-[#114539]">
                                {t.title}
                            </h1>
                            <p className="text-xs opacity-60 font-medium text-[#114539] uppercase tracking-widest">{t.subtitle}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 py-2 border-y border-[#114539]/10">
                        <div className="text-[10px] font-bold text-[#114539]/40 uppercase tracking-widest">
                            <span className="text-[#114539]">{s.TMA_INTRO_MEMBERS_COUNT}</span> {t.members}
                        </div>
                    </div>
                </motion.div>

                {/* Video Section */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 1, delay: 0.2 }}
                    className="relative group"
                >
                    <div
                        onClick={toggleVideo}
                        className="relative aspect-[4/5] w-full max-w-sm mx-auto rounded-[3rem] overflow-hidden shadow-2xl border border-white cursor-pointer bg-black"
                    >
                        <video
                            ref={videoRef}
                            src={s.TMA_INTRO_VIDEO}
                            className="w-full h-full object-cover"
                            playsInline
                            loop
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                        />

                        {/* Video Controls Overlay */}
                        <AnimatePresence>
                            {!isPlaying && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity"
                                >
                                    <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-xl border border-white/30 flex items-center justify-center">
                                        <Play className="w-8 h-8 text-white fill-current ml-1" />
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Title Overlay */}
                        <div className="absolute top-8 left-8 text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Intro Video</p>
                            <h4 className="text-lg font-editorial font-semibold leading-tight text-white">{t.videoLabel}</h4>
                        </div>

                        {isPlaying && (
                            <div className="absolute bottom-8 right-8">
                                <div className="w-10 h-10 rounded-full bg-black/20 backdrop-blur-md border border-white/10 flex items-center justify-center">
                                    <Pause className="w-4 h-4 text-white" />
                                </div>
                            </div>
                        )}
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.4 }}
                    className="space-y-8"
                >
                    <p className="text-sm text-[#114539]/70 max-w-[300px] mx-auto leading-relaxed font-medium">
                        {t.bio}
                    </p>

                    <div className="space-y-4">
                        {/* Sign Up button */}
                        <button
                            onClick={() => {
                                router.push(`/${currentLang}/tma/register`);
                            }}
                            className="btn-luxury w-full py-6 text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all text-white font-black flex items-center justify-center gap-3"
                        >
                            <UserPlus className="w-4 h-4" />
                            {currentLang === 'ru' ? 'РЕГИСТРАЦИЯ' : "RO'YXATDAN O'TISH"}
                        </button>
                        {/* Sign In button */}
                        <button
                            onClick={() => {
                                router.push(`/${currentLang}/tma/register?mode=login`);
                            }}
                            className="w-full py-6 text-xs uppercase tracking-[0.3em] shadow-lg active:scale-95 transition-all text-[#114539] font-black bg-white border-2 border-[#114539]/20 rounded-[2rem] flex items-center justify-center gap-3"
                        >
                            <LogIn className="w-4 h-4" />
                            {currentLang === 'ru' ? 'ВОЙТИ' : 'KIRISH'}
                        </button>
                    </div>
                </motion.div>
            </div>
        </main>
    );
}
