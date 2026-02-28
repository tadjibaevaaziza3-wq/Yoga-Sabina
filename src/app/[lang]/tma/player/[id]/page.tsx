'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { SecurePlayer } from '@/components/video/SecurePlayer';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, Info, Share2, Heart, Lock, Activity, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import LessonCompleteModal from "@/components/tma/gamification/LessonCompleteModal";

export default function TMAPlayerPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [videoData, setVideoData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showCelebration, setShowCelebration] = useState(false);
    const progressSaveTimer = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await fetch(`/api/videos/signed-url/${id}`);
                if (res.ok) {
                    const data = await res.json().catch(() => null);
                    if (data?.success) {
                        setVideoData(data);
                    } else {
                        setError(data?.error || 'Failed to load video');
                    }
                } else {
                    setError('Unauthorized or Failed to load video');
                }
            } catch (err) {
                setError('Network error');
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [id]);

    const handleProgress = useCallback((progress: number, duration: number) => {
        // Debounce: save at most once every 10 seconds
        if (progressSaveTimer.current) return;
        progressSaveTimer.current = setTimeout(async () => {
            progressSaveTimer.current = null;
            if (!id || isNaN(duration) || duration === 0) return;
            try {
                await fetch('/api/lessons/progress', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        lessonId: id,
                        watchedSeconds: Math.floor(progress),
                        totalSeconds: Math.floor(duration),
                        completed: progress / duration > 0.9,
                    }),
                });
            } catch (err) {
                console.error('Progress save error:', err);
            }
        }, 10000);
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0b0c10] flex items-center justify-center">
                <div className="w-10 h-10 border-t-2 border-[#114539] rounded-full animate-spin" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-[#f6f9fe] flex flex-col items-center justify-center p-8 text-center space-y-6">
                <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center">
                    <Info className="w-8 h-8 text-rose-500" />
                </div>
                <h2 className="text-2xl font-editorial font-bold text-[#114539]">Access Denied</h2>
                <p className="text-sm text-[#114539]/60 max-w-[240px]">{error}</p>
                <button
                    onClick={() => router.back()}
                    className="btn-luxury px-8 py-4 text-[10px] uppercase tracking-widest"
                >
                    Return Back
                </button>
            </div>
        );
    }

    return (
        <main className="bg-[#0b0c10] min-h-screen text-white">
            {/* Header Controls */}
            <header className="fixed top-0 left-0 right-0 z-50 p-6 flex items-center justify-between bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={() => router.back()} className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex gap-3">
                    <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                        <Heart className="w-5 h-5" />
                    </button>
                    <button className="w-10 h-10 bg-white/10 backdrop-blur-md rounded-xl flex items-center justify-center border border-white/10">
                        <Share2 className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Player Section */}
            <section className="pt-24 px-4">
                <SecurePlayer
                    videoUrl={videoData.url}
                    userId={videoData.watermark.userId}
                    phone={videoData.watermark.phone}
                    userNumber={videoData.watermark.userNumber}
                    onProgress={handleProgress}
                    onComplete={() => setShowCelebration(true)}
                />
            </section>

            <LessonCompleteModal
                isOpen={showCelebration}
                onClose={() => setShowCelebration(false)}
            />

            {/* Description Section */}
            <motion.section
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-8 space-y-6"
            >
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-bold text-[#114539] bg-white px-2 py-0.5 rounded uppercase tracking-widest">
                            {videoData.lesson?.course?.type || "Premium"}
                        </span>
                        <span className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                            {videoData.lesson?.title ? `Lesson` : "Yoga Session"}
                        </span>
                    </div>
                    <h1 className="text-3xl font-editorial font-bold">
                        {videoData.lesson?.title || "Yoga Session"}
                    </h1>
                </div>

                <p className="text-sm text-white/60 leading-relaxed font-medium">
                    {videoData.lesson?.description || "In this session, we focus on smooth transitions and breath synchronization. Perfect for those starting their yoga journey."}
                </p>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                        <Clock className="w-4 h-4 text-white/40" />
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Duration</div>
                        <div className="text-sm font-bold">
                            {videoData.lesson?.duration ? `${Math.floor(videoData.lesson.duration / 60)} Minutes` : "24 Minutes"}
                        </div>
                    </div>
                    <div className="p-6 bg-white/5 rounded-3xl border border-white/5 space-y-2">
                        <Activity className="w-4 h-4 text-white/40" />
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Intensity</div>
                        <div className="text-sm font-bold">Medium</div>
                    </div>
                </div>
            </motion.section>
        </main>
    );
}
