'use client';

import { useRef, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Heart, Play, Pause } from 'lucide-react';

export default function TMAPage({ params }: { params: any }) {
    const router = useRouter();
    const videoRef = useRef<HTMLVideoElement>(null);
    const [loading, setLoading] = useState(true);
    const [currentLang, setCurrentLang] = useState('uz');
    const [isPlaying, setIsPlaying] = useState(false);

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
        const checkRegistration = async () => {
            const resolvedParams = await params;
            const lang = resolvedParams.lang || 'uz';
            setCurrentLang(lang);

            if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
                const tg = (window as any).Telegram.WebApp;
                const tgUser = tg.initDataUnsafe?.user;
                const isDev = window.location.hostname === 'localhost';

                if (tgUser?.id) {
                    try {
                        const res = await fetch(`/api/tma/register?telegramId=${tgUser.id}`)
                        const data = await res.json()
                        if (data.success && data.isRegistered) {
                            // Using replace to prevent back-button loops
                            window.location.replace(`/${lang}/tma/dashboard`);
                            return;
                        } else {
                            setLoading(false);
                        }
                    } catch (err) {
                        console.error("Auth check failed:", err);
                        setLoading(false);
                    }
                } else if (isDev) {
                    console.log("Dev Mode: Skipping auto-redirect");
                    setLoading(false);
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };
        checkRegistration();
    }, [params]);

    const handleLangSwitch = (lang: string) => {
        setCurrentLang(lang);
        router.push(`/${lang}/tma`);
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f6f9fe] flex items-center justify-center">
            <div className="w-10 h-10 border-t-2 border-[#114539] rounded-full animate-spin" />
        </div>
    );

    const content = {
        uz: {
            title: "Baxtli Men",
            subtitle: "Sog'lomlik va ichki muvozanat",
            bio: "Sabina Polatova — 7 yillik tajribaga ega sertifikatlangan yoga-trener va yoga-terapevt. Salomatlik va barcha uchun ichki muvozanat bo'yicha mutaxassis.",
            cta: "DAVOM ETISH",
            members: "A'zolar"
        },
        ru: {
            title: "Baxtli Men",
            subtitle: "Здоровье и внутренний баланс",
            bio: "Сабина Полатова — сертифицированный йога-тренер и йога-терапевт с 7-летнего стажем. Специалист по оздоровлению и внутреннему балансу для всех.",
            cta: "ПРОДОЛЖИТЬ",
            members: "Участников"
        }
    };

    const t = content[currentLang as keyof typeof content];

    return (
        <main className="bg-[#f6f9fe] min-h-screen flex flex-col overflow-x-hidden relative">
            <div className="absolute top-0 right-0 w-[80%] h-[40%] bg-[#114539]/10 blur-[120px] rounded-full translate-x-1/2 -translate-y-1/2 pointer-events-none"></div>

            {/* Language Switcher */}
            <div className="absolute top-6 right-6 z-50 flex gap-2">
                {['uz', 'ru'].map((l) => (
                    <button
                        key={l}
                        onClick={() => handleLangSwitch(l)}
                        className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentLang === l ? 'bg-[#114539] text-white' : 'bg-white/50 text-[#114539]/40 border border-[#114539]/5'}`}
                    >
                        {l}
                    </button>
                ))}
            </div>

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
                                src="/images/logo.png"
                                alt="Logo"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <div className="space-y-3">
                            <span className="text-[11px] font-bold uppercase tracking-[0.5em] text-[#114539] block">
                                SABINA POLATOVA
                            </span>
                            <h1 className="text-6xl font-editorial font-bold leading-[1] tracking-tight text-[#114539]">
                                {t.title}
                            </h1>
                            <p className="text-xs opacity-60 font-medium text-[#114539] uppercase tracking-widest">{t.subtitle}</p>
                        </div>
                    </div>

                    <div className="flex items-center justify-center gap-4 py-2 border-y border-[#114539]/10">
                        <div className="text-[10px] font-bold text-[#114539]/40 uppercase tracking-widest">
                            <span className="text-[#114539]">500+</span> {t.members}
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
                            src="/videos/intro.mp4"
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
                            <h4 className="text-lg font-editorial font-semibold leading-tight text-white">Metodim bilan tanishing</h4>
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

                    <button
                        onClick={() => {
                            router.push(`/${currentLang}/tma/register`);
                        }}
                        className="btn-luxury w-full py-6 text-xs uppercase tracking-[0.3em] shadow-xl active:scale-95 transition-all text-white font-black"
                    >
                        {t.cta}
                    </button>
                </motion.div>
            </div>
        </main>
    );
}
