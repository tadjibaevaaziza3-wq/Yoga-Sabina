'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, PictureInPicture, Cast, MonitorPlay, Music, Check } from 'lucide-react';
import { setupWatermarkAnimation } from '@/lib/security/watermark';

interface TMAVideoPlayerProps {
    lessonId: string;
    userId: string;
    userPhone?: string | null;
    email?: string | null;
    className?: string;
    onComplete?: () => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export function TMAVideoPlayer({
    lessonId,
    userId,
    userPhone,
    email,
    className = '',
    onComplete
}: TMAVideoPlayerProps) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const hlsRef = useRef<Hls | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Media URLs
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [audioUrl, setAudioUrl] = useState<string | null>(null);
    const [watermarkText, setWatermarkText] = useState<string>('');

    // Playback State
    const [isPlaying, setIsPlaying] = useState(false);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);

    // UI State
    const [showControls, setShowControls] = useState(true);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showQualityMenu, setShowQualityMenu] = useState(false);

    // Quality & Audio
    const [qualities, setQualities] = useState<{ height: number, level: number }[]>([]);
    const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 is Auto
    const [isAudioEnabled, setIsAudioEnabled] = useState(false); // Enable separate audio track?

    // 1. Fetch URLs
    useEffect(() => {
        let mounted = true;
        const fetchUrls = async () => {
            try {
                setIsLoading(true);
                // Fetch Video URL
                const vidRes = await fetch('/api/video/get-signed-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lessonId, type: 'video' }),
                });

                if (!vidRes.ok) throw new Error('Video yuklashda xatolik');
                const vidData = await vidRes.json();

                if (mounted) {
                    setVideoUrl(vidData.signedUrl);
                    setWatermarkText(vidData.watermarkData.text);
                }

                // Try fetch Audio URL (might fail if no audio)
                try {
                    const audRes = await fetch('/api/video/get-signed-url', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ lessonId, type: 'audio' }),
                    });
                    if (audRes.ok) {
                        const audData = await audRes.json();
                        if (mounted) setAudioUrl(audData.signedUrl);
                    }
                } catch (e) {
                    // Audio track is optional
                }

            } catch (err) {
                if (mounted) setError(err instanceof Error ? err.message : 'Xatolik yuz berdi');
            } finally {
                if (mounted) setIsLoading(false);
            }
        };
        fetchUrls();
        return () => { mounted = false; };
    }, [lessonId]);

    // 2. Setup HLS & Native Video
    useEffect(() => {
        const video = videoRef.current;
        if (!video || !videoUrl) return;

        // Cleanup previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        if (videoUrl.includes('.m3u8') && Hls.isSupported()) {
            const hls = new Hls({
                maxBufferLength: 30,
                maxMaxBufferLength: 60,
                enableWorker: true,
            });
            hlsRef.current = hls;

            hls.loadSource(videoUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
                const availableQualities = data.levels.map((l, index) => ({ height: l.height, level: index }));
                setQualities(availableQualities);
            });

            hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
                setCurrentQuality(hls.autoLevelEnabled ? -1 : data.level);
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            hls.recoverMediaError();
                            break;
                        default:
                            hls.destroy();
                            break;
                    }
                }
            });

        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Safari native HLS or simple mp4
            video.src = videoUrl;
        } else {
            // Fallback for MP4
            video.src = videoUrl;
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
            }
        };
    }, [videoUrl]);

    // 3. Audio Sync
    useEffect(() => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (!video || !audio || !audioUrl || !isAudioEnabled) return;

        const syncAudio = () => {
            if (Math.abs(audio.currentTime - video.currentTime) > 0.5) {
                audio.currentTime = video.currentTime;
            }
        };

        const handlePlay = () => audio.play().catch(() => { });
        const handlePause = () => audio.pause();
        const handleSeek = () => { audio.currentTime = video.currentTime; };

        video.addEventListener('play', handlePlay);
        video.addEventListener('pause', handlePause);
        video.addEventListener('seeked', handleSeek);
        video.addEventListener('timeupdate', syncAudio);

        return () => {
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('seeked', handleSeek);
            video.removeEventListener('timeupdate', syncAudio);
        };
    }, [audioUrl, isAudioEnabled]);

    // 4. Video Events & Watermark
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onTimeUpdate = () => setCurrentTime(video.currentTime);
        const onLoadedMetadata = () => setDuration(video.duration);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);

        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('loadedmetadata', onLoadedMetadata);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);

        return () => {
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('loadedmetadata', onLoadedMetadata);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
        };
    }, []);

    useEffect(() => {
        if (!canvasRef.current || !watermarkText) return;
        return setupWatermarkAnimation(canvasRef.current, watermarkText, { opacity: 0.3, fontSize: 13 });
    }, [watermarkText]);

    // 5. Anti-Piracy
    useEffect(() => {
        const handleContextMenu = (e: MouseEvent) => e.preventDefault();
        const container = containerRef.current;

        if (container) {
            container.addEventListener('contextmenu', handleContextMenu);
        }

        const handleVisibilityChange = () => {
            if (document.hidden && videoRef.current) {
                videoRef.current.pause();
                if (container) container.style.filter = 'blur(20px)';
            } else {
                if (container) container.style.filter = 'none';
            }
        };
        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            if (container) container.removeEventListener('contextmenu', handleContextMenu);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);

    // Controls
    const togglePlay = () => {
        if (videoRef.current?.paused) videoRef.current.play();
        else videoRef.current?.pause();
    };

    const handleVolume = (v: number) => {
        setVolume(v);
        if (videoRef.current) videoRef.current.volume = v;
        if (audioRef.current && isAudioEnabled) audioRef.current.volume = v; // sync volume if needed
        setIsMuted(v === 0);
    };

    const toggleMute = () => {
        const newMuted = !isMuted;
        setIsMuted(newMuted);
        if (videoRef.current) videoRef.current.muted = newMuted;
        if (audioRef.current && isAudioEnabled) audioRef.current.muted = newMuted;
    };

    const handleSeek = (time: number) => {
        if (videoRef.current) {
            videoRef.current.currentTime = time;
            setCurrentTime(time);
        }
    };

    const toggleFullscreen = async () => {
        if (!document.fullscreenElement) {
            await containerRef.current?.requestFullscreen();
        } else {
            await document.exitFullscreen();
        }
    };

    const handleCast = async () => {
        const video = videoRef.current as any;
        if (video && video.remote && video.remote.state !== 'disconnected') {
            video.remote.prompt().catch(console.error);
        } else {
            alert("Casting qurilma tomonidan qo'llab quvvatlanmaydi.");
        }
    };

    const changeQuality = (level: number) => {
        if (hlsRef.current) {
            hlsRef.current.currentLevel = level;
            setCurrentQuality(level);
            setShowQualityMenu(false);
        }
    };

    const changeSpeed = (speed: number) => {
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
            setPlaybackRate(speed);
            setShowSpeedMenu(false);
        }
    };

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = Math.floor(seconds % 60);
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    if (isLoading) return <div className="aspect-video w-full bg-black animate-pulse rounded-2xl flex items-center justify-center"><div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" /></div>;
    if (error) return <div className="aspect-video w-full bg-black/90 rounded-2xl flex items-center justify-center text-red-500 font-medium">{error}</div>;

    return (
        <div
            ref={containerRef}
            className={`relative bg-black rounded-2xl overflow-hidden group transition-all duration-300 ${className}`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <video
                ref={videoRef}
                className="w-full h-full object-contain"
                playsInline
                controlsList="nodownload"
            />
            {audioUrl && isAudioEnabled && (
                <audio ref={audioRef} src={audioUrl} />
            )}
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-50" />

            {/* Controls Overlay */}
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-4 sm:px-6 pt-16 pb-4 sm:pb-6 transition-opacity duration-300 ${showControls || !isPlaying ? 'opacity-100' : 'opacity-0'}`}>

                {/* Timeline */}
                <div className="flex items-center gap-4 mb-4">
                    <span className="text-white text-xs font-medium tabular-nums shadow-sm">{formatTime(currentTime)}</span>
                    <input
                        type="range" min="0" max={duration || 0} step="0.1"
                        value={currentTime} onChange={(e) => handleSeek(Number(e.target.value))}
                        className="flex-1 h-1.5 accent-[var(--primary)] bg-white/20 rounded-full appearance-none cursor-pointer outline-none slider-thumb-primary hover:h-2 transition-all"
                    />
                    <span className="text-white/70 text-xs font-medium tabular-nums">{formatTime(duration)}</span>
                </div>

                {/* Bottom Bar */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 sm:gap-6">
                        <button onClick={togglePlay} className="text-white hover:text-[var(--primary)] transition-transform hover:scale-110">
                            {isPlaying ? <Pause className="w-6 h-6 sm:w-7 sm:h-7 fill-current" /> : <Play className="w-6 h-6 sm:w-7 sm:h-7 fill-current" />}
                        </button>

                        <div className="hidden sm:flex items-center gap-3 group/volume">
                            <button onClick={toggleMute} className="text-white hover:text-[var(--primary)] transition-colors">
                                {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                            </button>
                            <input
                                type="range" min="0" max="1" step="0.05"
                                value={isMuted ? 0 : volume} onChange={(e) => handleVolume(Number(e.target.value))}
                                className="w-0 opacity-0 group-hover/volume:w-20 group-hover/volume:opacity-100 transition-all duration-300 h-1.5 accent-white bg-white/30 rounded-full cursor-pointer"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 sm:gap-5">
                        {audioUrl && (
                            <button
                                onClick={() => setIsAudioEnabled(!isAudioEnabled)}
                                className={`text-sm font-bold tracking-wider px-3 py-1.5 rounded-lg border transition-all ${isAudioEnabled ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-lg' : 'bg-black/40 border-white/20 text-white/70 hover:bg-white/10'}`}
                                title="Fonda musiqa yoqish"
                            >
                                <Music className="w-4 h-4 inline-block sm:mr-1.5" />
                                <span className="hidden sm:inline">Music</span>
                            </button>
                        )}

                        {/* Cast */}
                        <button onClick={handleCast} className="text-white/80 hover:text-white transition-colors" title="Cast to TV">
                            <MonitorPlay className="w-5 h-5" />
                        </button>

                        {/* Speed */}
                        <div className="relative">
                            <button onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowQualityMenu(false); }} className="text-white/90 text-sm font-bold flex items-center gap-1 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10">
                                {playbackRate}x
                            </button>
                            {showSpeedMenu && (
                                <div className="absolute bottom-full right-0 mb-3 w-28 bg-black/90 backdrop-blur-md rounded-xl border border-white/10 py-2 shadow-2xl origin-bottom animate-in fade-in zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out data-[state=closed]:zoom-out-95">
                                    {SPEED_OPTIONS.map(r => (
                                        <button key={r} onClick={() => changeSpeed(r)} className="w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white flex items-center justify-between">
                                            {r}x {playbackRate === r && <Check className="w-4 h-4 text-[var(--primary)]" />}
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Quality */}
                        {qualities.length > 0 && (
                            <div className="relative">
                                <button onClick={() => { setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); }} className="text-white/90 text-sm font-bold flex items-center gap-1 hover:text-white transition-colors px-2 py-1 rounded-md hover:bg-white/10">
                                    <Settings className="w-4 h-4" />
                                </button>
                                {showQualityMenu && (
                                    <div className="absolute bottom-full right-0 mb-3 w-32 bg-black/90 backdrop-blur-md rounded-xl border border-white/10 py-2 shadow-2xl origin-bottom animate-in fade-in zoom-in-95">
                                        <button onClick={() => changeQuality(-1)} className="w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white flex items-center justify-between">
                                            Auto {currentQuality === -1 && <Check className="w-4 h-4 text-[var(--primary)]" />}
                                        </button>
                                        {qualities.map(q => (
                                            <button key={q.level} onClick={() => changeQuality(q.level)} className="w-full text-left px-4 py-2 text-sm text-white/90 hover:bg-white/10 hover:text-white flex items-center justify-between">
                                                {q.height}p {currentQuality === q.level && <Check className="w-4 h-4 text-[var(--primary)]" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        <button onClick={toggleFullscreen} className="text-white/80 hover:text-white transition-transform hover:scale-110">
                            <Maximize className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </div>

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
    );
}
