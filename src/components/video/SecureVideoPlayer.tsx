"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Shield, Tv2, X, MonitorSmartphone, Airplay, Cast, PictureInPicture2, ExternalLink } from "lucide-react"
import OTPVerificationModal from "./OTPVerificationModal"

interface SecureVideoPlayerProps {
    videoUrl: string
    userId: string
    userPhone?: string
    courseTitle: string
    lessonId?: string
    requireOTP?: boolean
    lang?: string
}

export function SecureVideoPlayer({ videoUrl, userId, userPhone, courseTitle, lessonId, requireOTP = false, lang = 'uz' }: SecureVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isMuted, setIsMuted] = useState(false)
    const [progress, setProgress] = useState(0)
    const [currentTime, setCurrentTime] = useState("")
    const [showTvModal, setShowTvModal] = useState(false)
    const [castStatus, setCastStatus] = useState<'idle' | 'connecting' | 'connected'>('idle')

    // Signed URL state
    const [signedSrc, setSignedSrc] = useState<string>("")
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // OTP state
    const [otpVerified, setOtpVerified] = useState(!requireOTP)
    const [showOTPModal, setShowOTPModal] = useState(false)

    // Check for existing OTP session on mount
    useEffect(() => {
        if (!requireOTP) return
        const sessionKey = `otp_session_${lessonId || 'global'}`
        const stored = sessionStorage.getItem(sessionKey)
        if (stored) {
            try {
                const session = JSON.parse(atob(stored))
                if (session.expiresAt > Date.now()) {
                    setOtpVerified(true)
                    return
                }
            } catch { }
            sessionStorage.removeItem(sessionKey)
        }
        setShowOTPModal(true)
    }, [requireOTP, lessonId])

    const handleOTPVerified = (sessionToken: string) => {
        setOtpVerified(true)
        setShowOTPModal(false)
        if (sessionToken) {
            const sessionKey = `otp_session_${lessonId || 'global'}`
            sessionStorage.setItem(sessionKey, sessionToken)
        }
    }

    // Watermark State (Moving Position)
    const [watermarkPos, setWatermarkPos] = useState({ x: 10, y: 10 })

    useEffect(() => {
        // Move watermark every 10 seconds to random positions (Protection Skill standard)
        const interval = setInterval(() => {
            setWatermarkPos({
                x: Math.random() * 70 + 5, // 5% to 75% range
                y: Math.random() * 70 + 5
            })
        }, 10000)

        // Update time every second for the watermark
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date().toLocaleString('uz-UZ'))
        }, 1000)

        return () => {
            clearInterval(interval)
            clearInterval(timeInterval)
        }
    }, [])

    // Fetch Signed URL
    useEffect(() => {
        const fetchSignedUrl = async () => {
            // If already signed or not GCS, use as is (or handle as needed)
            // For now, assume if lessonId is provided and url includes googleapis, we need to sign it.
            // Or simpler: always try to sign if lessonId is available and it looks like a cloud storage URL.

            if (!lessonId) {
                setSignedSrc(videoUrl)
                setIsLoading(false)
                return
            }

            try {
                setIsLoading(true)
                const response = await fetch('/api/video/get-signed-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lessonId })
                })

                if (!response.ok) {
                    throw new Error('Failed to get secure video link')
                }

                const data = await response.json()
                setSignedSrc(data.signedUrl)
            } catch (err) {
                console.error("Failed to sign video URL:", err)
                setError("Failed to load video")
                // Fallback to original URL? Might fail if private.
                setSignedSrc(videoUrl)
            } finally {
                setIsLoading(false)
            }
        }

        fetchSignedUrl()
    }, [videoUrl, lessonId])

    const togglePlay = () => {
        if (videoRef.current) {
            if (isPlaying) videoRef.current.pause()
            else videoRef.current.play()
            setIsPlaying(!isPlaying)
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            const p = (videoRef.current.currentTime / videoRef.current.duration) * 100
            setProgress(p)
        }
    }

    if (!otpVerified) {
        return (
            <>
                <div className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden flex items-center justify-center">
                    <div className="text-center">
                        <Shield className="w-12 h-12 text-white/20 mx-auto mb-4" />
                        <p className="text-white/40 text-sm font-bold">{lang === 'ru' ? 'Требуется верификация' : 'Tasdiqlash kerak'}</p>
                        <button
                            onClick={() => setShowOTPModal(true)}
                            className="mt-4 px-6 py-3 bg-[var(--primary)] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[var(--primary)]/90 transition"
                        >
                            {lang === 'ru' ? 'Подтвердить' : 'Tasdiqlash'}
                        </button>
                    </div>
                </div>
                <OTPVerificationModal
                    isOpen={showOTPModal}
                    onVerified={handleOTPVerified}
                    onClose={() => setShowOTPModal(false)}
                    lessonId={lessonId}
                    lang={lang}
                />
            </>
        )
    }

    if (isLoading) {
        return (
            <div className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[var(--accent)] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden flex items-center justify-center">
                <p className="text-white/50 text-sm">Failed to load video</p>
            </div>
        )
    }


    // Custom Controls (Enhanced with Seeker and Cast)
    const handleSeek = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(new Date().toLocaleString('uz-UZ')); // Just for watermark
        }
    };

    const handleCast = async () => {
        const video = videoRef.current as any;
        // Try Remote Playback API (Chromecast)
        if (video?.remote) {
            try {
                setCastStatus('connecting');
                await video.remote.prompt();
                setCastStatus('connected');
                setShowTvModal(false);
                return;
            } catch (e) {
                setCastStatus('idle');
            }
        }
        // Fallback: show TV modal
        setShowTvModal(true);
    };

    const handlePiP = async () => {
        const video = videoRef.current;
        if (!video) return;
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else {
                await video.requestPictureInPicture();
            }
        } catch (e) {
            console.error('PiP failed:', e);
        }
    };

    const handleAirPlay = () => {
        const video = videoRef.current as any;
        if (video?.webkitShowPlaybackTargetPicker) {
            video.webkitShowPlaybackTargetPicker();
        } else {
            setShowTvModal(true);
        }
    };

    const tvBrowserUrl = typeof window !== 'undefined' ? window.location.href : '';

    const formatDuration = (seconds: number) => {
        if (!seconds || isNaN(seconds)) return "0:00";
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const currentVidTime = videoRef.current?.currentTime || 0;
    const vidDuration = videoRef.current?.duration || 0;

    return (
        <div className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden group select-none shadow-2xl" ref={(ref) => { if (ref) ref.oncontextmenu = (e) => e.preventDefault() }}>
            {/* Video Element */}
            <video
                ref={videoRef}
                src={signedSrc}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
                playsInline
            />

            {/* Moving Watermark */}
            <motion.div
                animate={{
                    left: `${watermarkPos.x}%`,
                    top: `${watermarkPos.y}%`
                }}
                transition={{ duration: 8, ease: "linear" }}
                className="absolute z-20 pointer-events-none whitespace-nowrap opacity-25"
            >
                <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20">
                    <p className="text-[10px] md:text-sm font-black text-white uppercase tracking-widest drop-shadow-2xl">
                        {userId} | {userPhone || "NO_PHONE"}
                    </p>
                    <p className="text-[8px] md:text-[10px] font-bold text-white/60 text-center mt-1">
                        {currentTime}
                    </p>
                    <p className="text-[7px] font-bold text-white/30 text-center uppercase tracking-tighter">
                        PROPRIETARY - DO NOT SHARE
                    </p>
                </div>
            </motion.div>

            {/* Center Play Button Overlay */}
            <AnimatePresence>
                {!isPlaying && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="absolute inset-0 flex items-center justify-center bg-black/40 z-10 cursor-pointer"
                        onClick={togglePlay}
                    >
                        <div className="w-24 h-24 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-2xl shadow-[var(--accent)]/40 hover:scale-110 transition-transform">
                            <Play className="w-10 h-10 text-white fill-white ml-2" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls */}
            <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30">

                {/* Timeline Seeker */}
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-white text-xs font-medium tabular-nums shadow-sm">{formatDuration(currentVidTime)}</span>
                    <input
                        type="range" min="0" max={vidDuration || 100} step="0.1"
                        value={currentVidTime}
                        onChange={(e) => handleSeek(Number(e.target.value))}
                        className="flex-1 h-1.5 accent-[var(--accent)] bg-white/20 rounded-full appearance-none cursor-pointer outline-none slider-thumb-primary hover:h-2 transition-all"
                    />
                    <span className="text-white/70 text-xs font-medium tabular-nums">{formatDuration(vidDuration)}</span>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={togglePlay} className="text-white hover:text-[var(--accent)] transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6 fill-current" /> : <Play className="w-6 h-6 fill-current" />}
                        </button>
                        <div className="group/volume flex items-center gap-3">
                            <button onClick={() => {
                                setIsMuted(!isMuted);
                                if (videoRef.current) videoRef.current.muted = !isMuted;
                            }} className="text-white hover:text-[var(--accent)] transition-colors">
                                {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                            </button>
                        </div>
                    </div>

                    <div className="flex items-center gap-6">
                        <p className="text-[10px] font-black text-[var(--secondary)] uppercase tracking-widest hidden md:block">
                            {courseTitle}
                        </p>

                        {/* PiP Button */}
                        <button onClick={handlePiP} className="text-white/80 hover:text-white transition-colors" title="Kichik oynada ko'rish">
                            <PictureInPicture2 className="w-5 h-5" />
                        </button>

                        {/* Watch on TV Button */}
                        <button
                            onClick={() => setShowTvModal(true)}
                            className={`transition-colors ${castStatus === 'connected' ? 'text-[var(--accent)]' : 'text-white/80 hover:text-white'}`}
                            title="TV orqali ko'rish"
                        >
                            <Tv2 className="w-5 h-5" />
                        </button>

                        {/* Fullscreen */}
                        <button onClick={() => {
                            if (!document.fullscreenElement) {
                                videoRef.current?.parentElement?.requestFullscreen();
                            } else {
                                document.exitFullscreen();
                            }
                        }} className="text-white/80 hover:text-white transition-colors">
                            <Maximize className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>

            {/* TV Modal */}
            <AnimatePresence>
                {showTvModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[999] flex items-center justify-center p-4"
                        onClick={() => setShowTvModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-[#1a1a2e] rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-white/10"
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-500 rounded-2xl flex items-center justify-center">
                                        <Tv2 className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-bold text-sm">
                                            {lang === 'uz' ? 'TV orqali ko\'rish' : 'Смотреть на ТВ'}
                                        </h3>
                                        <p className="text-white/40 text-[10px]">
                                            {lang === 'uz' ? 'Qurilmangizni tanlang' : 'Выберите устройство'}
                                        </p>
                                    </div>
                                </div>
                                <button onClick={() => setShowTvModal(false)} className="text-white/40 hover:text-white transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Options */}
                            <div className="space-y-3">
                                {/* Chromecast */}
                                <button
                                    onClick={handleCast}
                                    className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-left"
                                >
                                    <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                        <Cast className="w-5 h-5 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-semibold text-sm">Chromecast</p>
                                        <p className="text-white/40 text-[10px]">
                                            {lang === 'uz' ? 'Google Chromecast orqali translatsiya' : 'Транслировать через Chromecast'}
                                        </p>
                                    </div>
                                    {castStatus === 'connecting' && (
                                        <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
                                    )}
                                    {castStatus === 'connected' && (
                                        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-full font-bold">ULANDI</span>
                                    )}
                                </button>

                                {/* AirPlay */}
                                <button
                                    onClick={handleAirPlay}
                                    className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-left"
                                >
                                    <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                        <Airplay className="w-5 h-5 text-purple-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-semibold text-sm">AirPlay</p>
                                        <p className="text-white/40 text-[10px]">
                                            {lang === 'uz' ? 'Apple TV yoki AirPlay qurilma' : 'Apple TV или AirPlay устройство'}
                                        </p>
                                    </div>
                                </button>

                                {/* Picture-in-Picture */}
                                <button
                                    onClick={() => { handlePiP(); setShowTvModal(false); }}
                                    className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-left"
                                >
                                    <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                        <PictureInPicture2 className="w-5 h-5 text-amber-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-white font-semibold text-sm">{lang === 'uz' ? 'Kichik oyna' : 'Картинка в картинке'}</p>
                                        <p className="text-white/40 text-[10px]">
                                            {lang === 'uz' ? 'Video kichik oynada ko\'rinadi' : 'Видео в маленьком окне'}
                                        </p>
                                    </div>
                                </button>

                                {/* Open on Smart TV browser */}
                                <div className="pt-2 border-t border-white/10">
                                    <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-2">
                                        {lang === 'uz' ? 'Smart TV brauzerda ochish' : 'Открыть в браузере Smart TV'}
                                    </p>
                                    <div className="bg-white/5 rounded-2xl p-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <MonitorSmartphone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                            <p className="text-white/60 text-[10px]">
                                                {lang === 'uz'
                                                    ? 'Smart TV brauzerda quyidagi havolani oching:'
                                                    : 'Откройте ссылку в браузере Smart TV:'}
                                            </p>
                                        </div>
                                        <div className="bg-black/30 rounded-xl px-3 py-2 flex items-center gap-2">
                                            <code className="text-emerald-400 text-[10px] flex-1 truncate">{tvBrowserUrl}</code>
                                            <button
                                                onClick={() => {
                                                    navigator.clipboard.writeText(tvBrowserUrl);
                                                    const btn = document.getElementById('copy-tv-btn');
                                                    if (btn) { btn.textContent = '✓'; setTimeout(() => btn.textContent = lang === 'uz' ? 'Nusxa' : 'Копия', 1500); }
                                                }}
                                                id="copy-tv-btn"
                                                className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg font-bold hover:bg-emerald-500/30 transition-colors flex-shrink-0"
                                            >
                                                {lang === 'uz' ? 'Nusxa' : 'Копия'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style jsx global>{`
                .slider-thumb-primary::-webkit-slider-thumb {
                    -webkit-appearance: none;
                    appearance: none;
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                }
                .slider-thumb-primary::-moz-range-thumb {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    background: white;
                    cursor: pointer;
                    box-shadow: 0 0 10px rgba(0,0,0,0.3);
                    border: none;
                }
            `}</style>
        </div>
    )
}


