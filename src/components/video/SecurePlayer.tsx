'use client';

import React, { useEffect, useRef, useState } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';
import { DynamicWatermark } from './DynamicWatermark';
import { Volume2, VolumeX, Maximize2, Play, Pause, Settings } from 'lucide-react';

interface SecurePlayerProps {
    videoUrl: string;
    musicUrl?: string;
    userId: string;
    phone: string;
    onProgress?: (progress: number, duration: number) => void;
    onComplete?: () => void;
    lessonId?: string;
    courseId?: string;
}

import { getDeviceId } from '@/lib/device-client';
import { useStreamHeartbeat } from '@/hooks/useStreamHeartbeat';

// ... existing imports

export const SecurePlayer: React.FC<SecurePlayerProps> = ({
    videoUrl,
    musicUrl,
    userId,
    phone,
    onProgress,
    onComplete,
    lessonId,
    courseId
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const musicRef = useRef<HTMLAudioElement>(null);
    const playerRef = useRef<any>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [isMuted, setIsMuted] = useState(false);
    const [musicMuted, setMusicMuted] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [deviceId, setDeviceId] = useState<string | null>(null);

    // Initialize Device ID
    useEffect(() => {
        setDeviceId(getDeviceId());
    }, []);

    // Activate Stream Heartbeat (Anti-Sharing)
    useStreamHeartbeat(isPlaying, deviceId);

    useEffect(() => {
        if (!videoRef.current) return;

        // ... (rest of the player initialization)

        const player = playerRef.current = videojs(videoRef.current, {
            autoplay: false,
            controls: true,
            responsive: true,
            fluid: true,
            playbackRates: [0.5, 0.75, 1, 1.25, 1.5, 2],
            userActions: {
                doubleClick: true,
                hotkeys: true
            },
            controlBar: {
                children: [
                    'playToggle',
                    'volumePanel',
                    'currentTimeDisplay',
                    'timeDivider',
                    'durationDisplay',
                    'progressControl',
                    'playbackRateMenuButton',
                    'subsCapsButton',
                    'audioTrackButton',
                    'fullscreenToggle',
                ],
            },
        });

        player.src({ src: videoUrl, type: 'application/x-mpegURL' });

        // Synchronize Music Track
        player.on('play', () => {
            setIsPlaying(true);
            musicRef.current?.play().catch(console.error);
        });

        player.on('pause', () => {
            setIsPlaying(false);
            musicRef.current?.pause();
        });

        player.on('seeking', () => {
            if (musicRef.current) {
                musicRef.current.currentTime = player.currentTime() || 0;
            }
        });

        player.on('timeupdate', () => {
            if (onProgress) {
                onProgress(player.currentTime() || 0, player.duration() || 0);
            }
            // Continuous sync check
            if (musicRef.current && Math.abs(musicRef.current.currentTime - (player.currentTime() || 0)) > 0.3) {
                musicRef.current.currentTime = player.currentTime() || 0;
            }
        });

        player.on('ended', () => {
            if (onComplete) onComplete();
        });

        // Precision Watch Time Tracking (Heartbeats)
        let heartbeatTimer: any;
        if (isPlaying) {
            heartbeatTimer = setInterval(async () => {
                try {
                    await fetch('/api/analytics/event-logs', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            event: 'VIDEO_HEARTBEAT',
                            metadata: {
                                lessonId,
                                courseId,
                                currentTime: player.currentTime(),
                                duration: player.duration(),
                                watchInterval: 10
                            }
                        })
                    });
                } catch (e) {
                    console.error('Heartbeat failed:', e);
                }
            }, 10000); // Every 10 seconds
        }

        // Anti-Piracy: Disable Right Click
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        containerRef.current?.addEventListener('contextmenu', handleContextMenu);

        // Anti-Piracy: Blur when tab inactive
        const handleVisibilityChange = () => {
            if (document.hidden) {
                player.pause();
                if (containerRef.current) containerRef.current.style.filter = 'blur(20px)';
            } else {
                if (containerRef.current) containerRef.current.style.filter = 'none';
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (player) {
                player.dispose();
            }
            if (heartbeatTimer) clearInterval(heartbeatTimer);
            containerRef.current?.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, [videoUrl, onProgress, isPlaying, lessonId, courseId, onComplete]);

    return (
        <div ref={containerRef} className="relative group rounded-[2.5rem] overflow-hidden bg-black shadow-2xl border border-white/5 transition-all duration-700">
            <div data-vjs-player>
                <video ref={videoRef} className="video-js vjs-big-play-centered vjs-theme-antigravity" />
            </div>

            {/* Hidden Music Track */}
            {musicUrl && (
                <audio ref={musicRef} src={musicUrl} muted={musicMuted} preload="auto" />
            )}

            {/* Dynamic Watermark Layer */}
            {/* @ts-ignore */}
            <DynamicWatermark userId={userId} phone={phone} containerRef={containerRef} />

            {/* Independent Music Toggle (Overlay) */}
            {musicUrl && (
                <div className="absolute top-6 right-6 z-[110] flex items-center gap-3">
                    <button
                        onClick={() => setMusicMuted(!musicMuted)}
                        className={`p-3 rounded-2xl backdrop-blur-md border border-white/10 transition-all ${musicMuted ? 'bg-rose-500/20 text-rose-200' : 'bg-white/10 text-white'
                            }`}
                        title={musicMuted ? "Enable Background Music" : "Mute Background Music"}
                    >
                        {musicMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                    </button>
                    <div className="text-[10px] font-bold text-white/40 uppercase tracking-[0.2em] hidden group-hover:block transition-all">
                        Background Music
                    </div>
                </div>
            )}

            {/* Anti-Piracy Warning Overlay (on DevTools or suspicious action) */}
            <div className="absolute inset-0 z-[120] pointer-events-none flex items-center justify-center opacity-0 group-active:opacity-100 transition-opacity">
                <div className="bg-black/60 backdrop-blur-sm px-6 py-3 rounded-full border border-white/20 text-[10px] font-black uppercase tracking-[0.3em] text-white">
                    Protected by Antigravity
                </div>
            </div>
        </div>
    );
};
