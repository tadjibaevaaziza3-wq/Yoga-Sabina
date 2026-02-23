"use client"

import React, { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Play, Pause, Volume2, VolumeX, Maximize, RotateCcw, Shield } from "lucide-react"
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

    return (
        <div className="relative w-full aspect-video bg-black rounded-[2rem] overflow-hidden group select-none shadow-2xl">
            {/* Video Element */}
            <video
                ref={videoRef}
                src={signedSrc}
                className="w-full h-full object-contain"
                onTimeUpdate={handleTimeUpdate}
                onClick={togglePlay}
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
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
                        <div className="w-24 h-24 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-2xl shadow-[var(--accent)]/40">
                            <Play className="w-10 h-10 text-white fill-white ml-2" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Custom Controls (Simplified) */}
            <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity z-30">
                <div className="w-full h-1 bg-white/20 rounded-full mb-6 overflow-hidden">
                    <motion.div
                        className="h-full bg-[var(--accent)]"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <button onClick={togglePlay} className="text-white hover:text-[var(--accent)]/60 transition-colors">
                            {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                        </button>
                        <button onClick={() => setIsMuted(!isMuted)} className="text-white hover:text-[var(--accent)]/60 transition-colors">
                            {isMuted ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                        </button>
                    </div>
                    <div className="flex items-center gap-6">
                        <p className="text-[10px] font-black text-[var(--secondary)] uppercase tracking-widest">
                            {courseTitle}
                        </p>
                        <button onClick={() => videoRef.current?.requestFullscreen()} className="text-white hover:text-[var(--accent)]/60 transition-colors">
                            <Maximize className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}


