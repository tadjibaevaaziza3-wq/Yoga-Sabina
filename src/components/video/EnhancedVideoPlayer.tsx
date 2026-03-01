import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, PictureInPicture, RotateCcw, RotateCw, Monitor, Music, Music2, Tv2, X, MonitorSmartphone, Airplay, Cast } from 'lucide-react';
import { DynamicWatermark } from './DynamicWatermark';

interface EnhancedVideoPlayerProps {
    assetId: string;
    lessonId: string;
    userId: string;
    email: string;
    phoneNumber?: string;
    userNumber?: number;
    audioUrl?: string;
    className?: string;
    onComplete?: (durationSeconds: number) => void;
}

export interface EnhancedVideoPlayerRef {
    seekTo: (time: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const EnhancedVideoPlayer = forwardRef<EnhancedVideoPlayerRef, EnhancedVideoPlayerProps>((
    { assetId, lessonId, userId, email, phoneNumber, userNumber, audioUrl, className = '', onComplete },
    ref
) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);
    const tapTimerRef = useRef<NodeJS.Timeout | null>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [buffered, setBuffered] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [showControls, setShowControls] = useState(true);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [showCenterIcon, setShowCenterIcon] = useState<'play' | 'pause' | 'seekBack' | 'seekForward' | null>(null);
    const [tapSide, setTapSide] = useState<'left' | 'right' | null>(null);
    const [castSupported, setCastSupported] = useState(false);
    const [showTvModal, setShowTvModal] = useState(false);
    const [bgAudioUrl, setBgAudioUrl] = useState<string | null>(null);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [audioVolume, setAudioVolume] = useState(0.3);
    const [isMouseOnControls, setIsMouseOnControls] = useState(false);

    // Expose seekTo
    useImperativeHandle(ref, () => ({
        seekTo: (time: number) => {
            if (videoRef.current) {
                videoRef.current.currentTime = time;
                videoRef.current.play().catch(() => { });
            }
        }
    }));

    // Auto-hide controls
    const resetHideTimer = useCallback(() => {
        setShowControls(true);
        if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
        hideControlsTimerRef.current = setTimeout(() => {
            if (!isMouseOnControls) setShowControls(false);
        }, 3000);
    }, [isMouseOnControls]);

    const handleMouseMove = useCallback(() => {
        resetHideTimer();
    }, [resetHideTimer]);

    useEffect(() => {
        if (!isPlaying) {
            setShowControls(true);
            if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
        } else {
            resetHideTimer();
        }
    }, [isPlaying, resetHideTimer]);

    // Flash center icon briefly
    const flashIcon = useCallback((icon: typeof showCenterIcon) => {
        setShowCenterIcon(icon);
        setTimeout(() => setShowCenterIcon(null), 600);
    }, []);

    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        if (video.paused) {
            video.play().catch(err => console.error('Play error:', err));
            flashIcon('play');
        } else {
            video.pause();
            flashIcon('pause');
        }
    }, [flashIcon]);

    const toggleMute = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;
        video.muted = !video.muted;
        setIsMuted(video.muted);
    }, []);

    const handleVolumeChange = useCallback((newVolume: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.volume = newVolume;
        setVolume(newVolume);
        if (newVolume > 0 && video.muted) {
            video.muted = false;
            setIsMuted(false);
        }
    }, []);

    // Click-to-seek on progress bar
    const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const bar = progressBarRef.current;
        const video = videoRef.current;
        if (!bar || !video) return;
        const rect = bar.getBoundingClientRect();
        const ratio = (e.clientX - rect.left) / rect.width;
        video.currentTime = ratio * video.duration;
    }, []);

    const toggleFullscreen = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;
        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => console.error('Fullscreen error:', err));
        } else {
            document.exitFullscreen().catch(err => console.error('Exit fullscreen error:', err));
        }
    }, []);

    const togglePictureInPicture = useCallback(async () => {
        const video = videoRef.current;
        if (!video) return;
        try {
            if (document.pictureInPictureElement) {
                await document.exitPictureInPicture();
            } else if (document.pictureInPictureEnabled) {
                await video.requestPictureInPicture();
            }
        } catch (error) {
            console.error('PiP error:', error);
        }
    }, []);

    const changePlaybackRate = useCallback((rate: number) => {
        const video = videoRef.current;
        if (!video) return;
        video.playbackRate = rate;
        setPlaybackRate(rate);
        setShowSpeedMenu(false);
    }, []);

    // Double-tap seek (mobile)
    const handleTap = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        // Only handle double taps — use tapTimerRef
        const container = containerRef.current;
        if (!container) return;
        const rect = container.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const isLeft = x < rect.width * 0.35;
        const isRight = x > rect.width * 0.65;

        if (!isLeft && !isRight) {
            // Middle zone = play/pause
            return;
        }

        if (tapTimerRef.current) {
            // Second tap = double tap
            clearTimeout(tapTimerRef.current);
            tapTimerRef.current = null;
            const video = videoRef.current;
            if (!video) return;

            if (isLeft) {
                video.currentTime = Math.max(0, video.currentTime - 10);
                setTapSide('left');
                flashIcon('seekBack');
            } else {
                video.currentTime = Math.min(video.duration, video.currentTime + 10);
                setTapSide('right');
                flashIcon('seekForward');
            }
            setTimeout(() => setTapSide(null), 700);
        } else {
            tapTimerRef.current = setTimeout(() => {
                tapTimerRef.current = null;
            }, 300);
        }
    }, [flashIcon]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            const video = videoRef.current;
            if (!video) return;
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
            switch (e.key.toLowerCase()) {
                case ' ': case 'k': e.preventDefault(); togglePlay(); break;
                case 'arrowleft': e.preventDefault(); video.currentTime = Math.max(0, video.currentTime - 5); break;
                case 'arrowright': e.preventDefault(); video.currentTime = Math.min(video.duration, video.currentTime + 5); break;
                case 'arrowup': e.preventDefault(); video.volume = Math.min(1, video.volume + 0.1); break;
                case 'arrowdown': e.preventDefault(); video.volume = Math.max(0, video.volume - 0.1); break;
                case 'm': e.preventDefault(); toggleMute(); break;
                case 'f': e.preventDefault(); toggleFullscreen(); break;
                case 'p': e.preventDefault(); togglePictureInPicture(); break;
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [togglePlay, toggleMute, toggleFullscreen, togglePictureInPicture]);

    const saveProgress = useCallback(async () => {
        const video = videoRef.current;
        if (!video || !lessonId || isNaN(video.duration)) return;
        try {
            await fetch('/api/lessons/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    watchedSeconds: Math.floor(video.currentTime),
                    totalSeconds: Math.floor(video.duration),
                    completed: video.currentTime / video.duration > 0.9,
                    preferredSpeed: playbackRate,
                }),
            });
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }, [lessonId, playbackRate]);

    // Fetch video URL + resume progress
    useEffect(() => {
        let cancelled = false;
        const fetchVideoData = async (retryCount = 0) => {
            try {
                setIsLoading(true);
                setError(null);
                const urlResponse = await fetch('/api/video/get-signed-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ assetId, lessonId }),
                });

                if (!urlResponse.ok) {
                    // Auto-retry on transient errors (401 can happen if DB auth check fails due to pgBouncer)
                    const retryableStatuses = [401, 500, 503];
                    if (retryableStatuses.includes(urlResponse.status) && retryCount < 3) {
                        console.warn(`[EnhancedVideoPlayer] Got ${urlResponse.status}, retrying in 2s (attempt ${retryCount + 1})...`);
                        await new Promise(r => setTimeout(r, 2000));
                        if (!cancelled) return fetchVideoData(retryCount + 1);
                        return;
                    }
                    const errData = await urlResponse.json().catch(() => ({}));
                    throw new Error(errData.message || errData.error || `Failed to load video (${urlResponse.status})`);
                }

                const urlData = await urlResponse.json();
                if (!cancelled) setVideoUrl(urlData.signedUrl);

                const progressResponse = await fetch(`/api/lessons/progress?lessonId=${lessonId}`);
                if (progressResponse.ok) {
                    const progressData = await progressResponse.json();
                    if (progressData.success && progressData.progress) {
                        const { progress: watchedSeconds, preferredSpeed, duration: savedDuration } = progressData.progress;
                        if (videoRef.current && watchedSeconds > 0) {
                            videoRef.current.currentTime = watchedSeconds;
                        }
                        if (preferredSpeed) setPlaybackRate(preferredSpeed);
                        // Set initial duration from DB so time display shows duration before play
                        if (savedDuration && savedDuration > 0 && !durationSetRef.current) {
                            setDuration(savedDuration);
                        }
                    }
                }
            } catch (err) {
                if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load video');
            } finally {
                if (!cancelled) setIsLoading(false);
            }
        };
        fetchVideoData();
        return () => { cancelled = true; };
    }, [assetId, lessonId]);

    // Fetch signed audio URL if lesson has audioUrl
    useEffect(() => {
        if (!audioUrl) { setBgAudioUrl(null); return; }
        let cancelled = false;
        const fetchAudio = async () => {
            try {
                const res = await fetch('/api/video/get-signed-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ lessonId, type: 'audio' }),
                });
                if (res.ok) {
                    const data = await res.json();
                    if (!cancelled) setBgAudioUrl(data.signedUrl);
                }
            } catch (e) {
                console.warn('[EnhancedVideoPlayer] Failed to fetch audio URL:', e);
            }
        };
        fetchAudio();
        return () => { cancelled = true; };
    }, [audioUrl, lessonId]);

    // Sync audio with video play/pause
    useEffect(() => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (!video || !audio || !bgAudioUrl) return;

        audio.volume = audioEnabled ? audioVolume : 0;

        const onPlay = () => {
            if (audioEnabled) audio.play().catch(() => { });
        };
        const onPause = () => { audio.pause(); };
        const onSeeked = () => {
            // Don't sync audio time — it loops independently
        };

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('seeked', onSeeked);

        // If video already playing, start audio
        if (!video.paused && audioEnabled) {
            audio.play().catch(() => { });
        }

        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('seeked', onSeeked);
            audio.pause();
        };
    }, [bgAudioUrl, audioEnabled, audioVolume]);

    // Detect Cast/Remote Playback API support
    useEffect(() => {
        const video = videoRef.current;
        if (video && (video as any).remote) {
            setCastSupported(true);
        }
    }, [videoUrl]);

    // Auto-save progress every 10s while playing
    useEffect(() => {
        if (isPlaying) {
            progressIntervalRef.current = setInterval(saveProgress, 10000);
        }
        return () => { if (progressIntervalRef.current) clearInterval(progressIntervalRef.current); };
    }, [isPlaying, saveProgress]);

    // Save on unmount
    useEffect(() => { return () => { saveProgress(); }; }, [saveProgress]);

    // Auto-save detected duration to the lesson (once per lesson)
    const durationSavedRef = useRef(false);
    const saveLessonDuration = useCallback(async (detectedDuration: number) => {
        if (durationSavedRef.current || !lessonId || detectedDuration <= 0) return;
        durationSavedRef.current = true;
        try {
            await fetch('/api/lessons/update-duration', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ lessonId, duration: Math.floor(detectedDuration) }),
            });
        } catch (err) {
            console.warn('[EnhancedVideoPlayer] Failed to save duration:', err);
        }
    }, [lessonId]);

    // Reset durationSavedRef when lesson changes
    useEffect(() => {
        durationSavedRef.current = false;
    }, [lessonId]);

    // Video event listeners
    const durationSetRef = useRef(false);
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Reset when video source changes
        durationSetRef.current = false;

        const setDurationOnce = (dur: number) => {
            if (!isNaN(dur) && dur > 0 && !durationSetRef.current) {
                durationSetRef.current = true;
                setDuration(dur);
                saveLessonDuration(dur);
            }
        };

        const handleMetadata = () => {
            setDurationOnce(video.duration);
            video.playbackRate = playbackRate;
        };
        const onTimeUpdate = () => {
            setCurrentTime(video.currentTime);
            // Update buffered
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1));
            }
            // Fallback duration detection (some formats report duration late)
            setDurationOnce(video.duration);
        };
        const onDurationChange = () => {
            setDurationOnce(video.duration);
        };
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onVolume = () => { setVolume(video.volume); setIsMuted(video.muted); };
        const onEnded = () => {
            setIsPlaying(false);
            setShowControls(true);
            if (onComplete) {
                const watchedDuration = video.duration || 0;
                onComplete(Math.floor(watchedDuration));
            }
        };
        const onError = () => {
            const mediaError = video.error;
            if (mediaError) {
                const codes: Record<number, string> = {
                    1: 'Video loading aborted',
                    2: 'Network error while loading video',
                    3: 'Video decoding failed',
                    4: 'Video format not supported',
                };
                console.error('[EnhancedVideoPlayer] Media error:', codes[mediaError.code] || 'Unknown', mediaError.message);
                setError(codes[mediaError.code] || 'Failed to load video');
            }
        };
        const onCanPlay = () => {
            setIsLoading(false);
            setDurationOnce(video.duration);
        };

        // CRITICAL FIX: Sync ALL video state immediately, handling the race
        // condition where the video loads before React effects run.
        const syncState = () => {
            if (!video) return;
            setDurationOnce(video.duration);
            setCurrentTime(video.currentTime);
            setIsPlaying(!video.paused);
            setIsMuted(video.muted);
            setVolume(video.volume);
            if (video.readyState >= 1) {
                video.playbackRate = playbackRate;
            }
            if (video.readyState >= 3) {
                setIsLoading(false);
            }
            if (video.buffered.length > 0) {
                setBuffered(video.buffered.end(video.buffered.length - 1));
            }
        };

        // Immediate sync on mount/videoUrl change
        syncState();

        // Poll every 500ms as failsafe for missed events
        const syncInterval = setInterval(syncState, 500);

        video.addEventListener('loadedmetadata', handleMetadata);
        video.addEventListener('durationchange', onDurationChange);
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('volumechange', onVolume);
        video.addEventListener('ended', onEnded);
        video.addEventListener('error', onError);
        video.addEventListener('canplay', onCanPlay);

        return () => {
            clearInterval(syncInterval);
            video.removeEventListener('loadedmetadata', handleMetadata);
            video.removeEventListener('durationchange', onDurationChange);
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('volumechange', onVolume);
            video.removeEventListener('ended', onEnded);
            video.removeEventListener('error', onError);
            video.removeEventListener('canplay', onCanPlay);
        };
    }, [videoUrl, playbackRate, onComplete, saveLessonDuration]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) return (
        <div className={`flex items-center justify-center bg-black ${className} aspect-video`}>
            <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                <p className="text-white/40 text-xs font-medium tracking-widest uppercase">Loading</p>
            </div>
        </div>
    );

    if (error) return (
        <div className={`flex items-center justify-center bg-black p-8 ${className} aspect-video`}>
            <div className="text-center space-y-4">
                <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto">
                    <span className="text-red-400 text-2xl">⚠</span>
                </div>
                <p className="text-red-400 font-semibold">Video load error</p>
                <p className="text-white/40 text-sm">{error}</p>
                <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2 bg-white/10 hover:bg-white/20 text-white rounded-lg text-xs font-bold uppercase tracking-widest transition-all"
                >
                    Retry
                </button>
            </div>
        </div>
    );

    const progress = duration > 0 ? (currentTime / duration) * 100 : 0;
    const bufferedPct = duration > 0 ? (buffered / duration) * 100 : 0;

    return (<>
        <div
            ref={containerRef}
            className={`relative bg-black overflow-hidden select-none ${className}`}
            style={{ cursor: showControls ? 'default' : 'none' }}
            onMouseMove={handleMouseMove}
            onClick={handleTap}
            onDoubleClick={(e) => {
                // double click in middle = toggle play
                const rect = containerRef.current?.getBoundingClientRect();
                if (!rect) return;
                const x = e.clientX - rect.left;
                if (x >= rect.width * 0.35 && x <= rect.width * 0.65) {
                    togglePlay();
                }
            }}
        >
            <video
                ref={videoRef}
                src={videoUrl || undefined}
                crossOrigin="anonymous"
                className="w-full h-full"
                controlsList="nodownload nofullscreen"
                preload="auto"
                playsInline
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            />

            <DynamicWatermark userId={userId} phone={phoneNumber || email} userNumber={userNumber} containerRef={containerRef} />

            {/* Double-tap ripple feedback */}
            {tapSide && (
                <div
                    className={`absolute inset-y-0 flex items-center justify-center pointer-events-none z-30 ${tapSide === 'left' ? 'left-0 w-1/3' : 'right-0 w-1/3'}`}
                >
                    <div className="flex flex-col items-center gap-1 animate-[fadeInOut_0.6s_ease-out]">
                        <div className="bg-white/20 rounded-full p-4 backdrop-blur-sm">
                            {tapSide === 'left' ? <RotateCcw className="w-8 h-8 text-white" /> : <RotateCw className="w-8 h-8 text-white" />}
                        </div>
                        <span className="text-white text-xs font-bold drop-shadow">{tapSide === 'left' ? '-10s' : '+10s'}</span>
                    </div>
                </div>
            )}

            {/* Center Play/Pause flash */}
            {showCenterIcon && (showCenterIcon === 'play' || showCenterIcon === 'pause') && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
                    <div className="bg-black/40 rounded-full p-5 backdrop-blur-sm animate-[scaleOut_0.5s_ease-out]">
                        {showCenterIcon === 'play'
                            ? <Play className="w-10 h-10 text-white fill-white" />
                            : <Pause className="w-10 h-10 text-white fill-white" />
                        }
                    </div>
                </div>
            )}

            {/* Controls bar */}
            <div
                className={`absolute bottom-0 left-0 right-0 z-40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onMouseEnter={() => { setIsMouseOnControls(true); setShowControls(true); if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current); }}
                onMouseLeave={() => { setIsMouseOnControls(false); if (isPlaying) resetHideTimer(); }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent pointer-events-none" />

                <div className="relative px-4 pb-4 pt-8 space-y-2">
                    {/* Progress bar */}
                    <div
                        ref={progressBarRef}
                        className="relative h-2 bg-white/20 rounded-full cursor-pointer group hover:h-3 transition-all"
                        onClick={handleProgressClick}
                    >
                        {/* Buffered */}
                        <div
                            className="absolute inset-y-0 left-0 bg-white/30 rounded-full transition-all"
                            style={{ width: `${bufferedPct}%` }}
                        />
                        {/* Played */}
                        <div
                            className="absolute inset-y-0 left-0 bg-[var(--accent,#ff7d52)] rounded-full transition-all"
                            style={{ width: `${progress}%` }}
                        />
                        {/* Scrubber thumb — always visible */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full shadow-lg ring-2 ring-[var(--accent,#ff7d52)] transition-transform group-hover:scale-125"
                            style={{ left: `${progress}%` }}
                        />
                    </div>

                    {/* Time + Controls row */}
                    <div className="flex items-center justify-between">
                        {/* Left: play, mute, volume, time */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                                className="text-white hover:text-[var(--accent,#ff7d52)] transition-colors"
                            >
                                {isPlaying ? <Pause size={22} /> : <Play size={22} />}
                            </button>

                            <div className="flex items-center gap-2">
                                <button onClick={toggleMute} className="text-white hover:text-white/70 transition-colors">
                                    {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
                                </button>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.05"
                                    value={isMuted ? 0 : volume}
                                    onChange={(e) => handleVolumeChange(parseFloat(e.target.value))}
                                    className="w-16 h-1 accent-[var(--accent,#ff7d52)] cursor-pointer"
                                />
                            </div>

                            <span className="text-white/80 text-sm font-mono tabular-nums">
                                {formatTime(currentTime)} / {formatTime(duration)}
                            </span>
                        </div>

                        {/* Right: speed, pip, fullscreen */}
                        <div className="flex items-center gap-2">
                            {/* Quality */}
                            <div className="relative">
                                <button
                                    onClick={() => { setShowQualityMenu(!showQualityMenu); setShowSpeedMenu(false); }}
                                    className="text-white hover:text-white/70 transition-colors flex items-center h-full px-1"
                                    title="Quality"
                                >
                                    <div className="text-[10px] font-bold bg-white/10 px-1.5 py-0.5 rounded border border-white/20 uppercase tracking-widest">Auto</div>
                                </button>
                                {showQualityMenu && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-2xl min-w-[140px]">
                                        <div className="px-4 py-2 border-b border-white/10 text-[10px] text-white/50 uppercase tracking-widest font-black">Quality</div>
                                        <button className="block w-full px-5 py-2.5 text-xs text-left font-bold transition-colors bg-[var(--accent,#ff7d52)] text-white flex items-center justify-between">
                                            <span>Original</span>
                                            <span className="text-[9px] bg-white/20 px-1.5 py-0.5 rounded ml-2 font-black tracking-widest">HD</span>
                                        </button>
                                        <button disabled className="block w-full px-5 py-2.5 text-xs text-left font-bold transition-colors text-white/30 cursor-not-allowed">
                                            720p
                                        </button>
                                        <button disabled className="block w-full px-5 py-2.5 text-xs text-left font-bold transition-colors text-white/30 cursor-not-allowed">
                                            480p
                                        </button>
                                        <button disabled className="block w-full px-5 py-2.5 text-xs text-left font-bold transition-colors text-white/30 cursor-not-allowed">
                                            360p
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Settings (Speed) */}
                            <div className="relative">
                                <button
                                    onClick={() => { setShowSpeedMenu(!showSpeedMenu); setShowQualityMenu(false); }}
                                    className="text-white hover:text-white/70 transition-colors p-1"
                                    title="Settings"
                                >
                                    <Settings size={18} className="hover:rotate-45 transition-transform duration-300" />
                                </button>
                                {showSpeedMenu && (
                                    <div className="absolute bottom-full right-0 mb-2 bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                                        <div className="px-4 py-2 border-b border-white/10 text-[10px] text-white/50 uppercase tracking-widest font-black">Playback Speed</div>
                                        {SPEED_OPTIONS.map(r => (
                                            <button
                                                key={r}
                                                onClick={() => { changePlaybackRate(r); setShowSpeedMenu(false); }}
                                                className={`block w-full px-5 py-2.5 text-xs text-left font-bold transition-colors ${playbackRate === r ? 'bg-[var(--accent,#ff7d52)] text-white' : 'text-white/70 hover:bg-white/10'}`}
                                            >
                                                {r === 1 ? 'Normal' : `${r}x`}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <button onClick={togglePictureInPicture} className="text-white/70 hover:text-white transition-colors p-1" title="Picture in Picture">
                                <PictureInPicture size={18} />
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setShowTvModal(true); }}
                                className="text-white/70 hover:text-white transition-colors p-1"
                                title="TV orqali ko'rish"
                            >
                                <Tv2 size={18} />
                            </button>
                            <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors p-1" title="Fullscreen">
                                <Maximize size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* TV Modal */}
            {showTvModal && (
                <div
                    className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[9999] flex items-center justify-center p-4"
                    onClick={(e) => { e.stopPropagation(); setShowTvModal(false); }}
                >
                    <div
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
                                    <h3 className="text-white font-bold text-sm">TV orqali ko&apos;rish</h3>
                                    <p className="text-white/40 text-[10px]">Qurilmangizni tanlang</p>
                                </div>
                            </div>
                            <button onClick={() => setShowTvModal(false)} className="text-white/40 hover:text-white transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="space-y-3">
                            {/* Chromecast */}
                            <button
                                onClick={() => {
                                    const video = videoRef.current;
                                    if (video && (video as any).remote) {
                                        (video as any).remote.prompt().catch(console.error);
                                    } else {
                                        alert("Chromecast qurilmangizda qo'llab quvvatlanmaydi");
                                    }
                                }}
                                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-left"
                            >
                                <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
                                    <Cast className="w-5 h-5 text-blue-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-semibold text-sm">Chromecast</p>
                                    <p className="text-white/40 text-[10px]">Google Chromecast orqali translatsiya</p>
                                </div>
                            </button>

                            {/* AirPlay */}
                            <button
                                onClick={() => {
                                    const video = videoRef.current as any;
                                    if (video?.webkitShowPlaybackTargetPicker) {
                                        video.webkitShowPlaybackTargetPicker();
                                    } else {
                                        alert("AirPlay faqat Safari brauzerda ishlaydi");
                                    }
                                }}
                                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-left"
                            >
                                <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center">
                                    <Airplay className="w-5 h-5 text-purple-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-semibold text-sm">AirPlay</p>
                                    <p className="text-white/40 text-[10px]">Apple TV yoki AirPlay qurilma</p>
                                </div>
                            </button>

                            {/* PiP */}
                            <button
                                onClick={() => { togglePictureInPicture(); setShowTvModal(false); }}
                                className="w-full flex items-center gap-4 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-colors text-left"
                            >
                                <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center">
                                    <PictureInPicture className="w-5 h-5 text-amber-400" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-white font-semibold text-sm">Kichik oyna</p>
                                    <p className="text-white/40 text-[10px]">Video kichik oynada ko&apos;rinadi</p>
                                </div>
                            </button>

                            {/* Smart TV browser */}
                            <div className="pt-2 border-t border-white/10">
                                <p className="text-white/50 text-[10px] font-bold uppercase tracking-wider mb-2">Smart TV brauzerda ochish</p>
                                <div className="bg-white/5 rounded-2xl p-4">
                                    <div className="flex items-center gap-3 mb-3">
                                        <MonitorSmartphone className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                        <p className="text-white/60 text-[10px]">Smart TV brauzerda quyidagi havolani oching:</p>
                                    </div>
                                    <div className="bg-black/30 rounded-xl px-3 py-2 flex items-center gap-2">
                                        <code className="text-emerald-400 text-[10px] flex-1 truncate">{typeof window !== 'undefined' ? window.location.href : ''}</code>
                                        <button
                                            onClick={() => {
                                                navigator.clipboard.writeText(window.location.href);
                                                const btn = document.getElementById('evp-copy-tv');
                                                if (btn) { btn.textContent = '✓'; setTimeout(() => btn.textContent = 'Nusxa', 1500); }
                                            }}
                                            id="evp-copy-tv"
                                            className="text-[9px] bg-emerald-500/20 text-emerald-400 px-2 py-1 rounded-lg font-bold hover:bg-emerald-500/30 transition-colors flex-shrink-0"
                                        >
                                            Nusxa
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Keyframe styles */}
            <style jsx>{`
                @keyframes fadeInOut {
                    0% { opacity: 0; transform: scale(0.8); }
                    30% { opacity: 1; transform: scale(1); }
                    70% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(1.1); }
                }
                @keyframes scaleOut {
                    0% { opacity: 0; transform: scale(0.5); }
                    30% { opacity: 1; transform: scale(1.1); }
                    60% { opacity: 1; transform: scale(1); }
                    100% { opacity: 0; transform: scale(1.3); }
                }
            `}</style>

            {/* Hidden audio element for background music */}
            {bgAudioUrl && (
                <audio ref={audioRef} src={bgAudioUrl} loop preload="auto" />
            )}
        </div>

        {/* Background Audio Control Bar — below the video */}
        {bgAudioUrl && (
            <div className="flex items-center gap-3 px-4 py-3 bg-[var(--card-bg,#1a1a2e)] border-t border-white/5 rounded-b-2xl">
                <button
                    onClick={() => {
                        const newState = !audioEnabled;
                        setAudioEnabled(newState);
                        const audio = audioRef.current;
                        if (!audio) return;
                        if (!newState) {
                            audio.pause();
                        } else if (videoRef.current && !videoRef.current.paused) {
                            audio.play().catch(() => { });
                        }
                    }}
                    className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${audioEnabled
                        ? 'bg-[var(--primary,#0a8069)] text-white shadow-lg shadow-[var(--primary,#0a8069)]/30'
                        : 'bg-white/10 text-white/40 hover:bg-white/20'
                        }`}
                    title={audioEnabled ? 'Mute background music' : 'Enable background music'}
                >
                    {audioEnabled ? <Music2 size={16} /> : <Music size={16} />}
                </button>

                <div className="flex-1 flex items-center gap-2">
                    <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest whitespace-nowrap">
                        🎵 Background Music
                    </span>
                    <input
                        type="range"
                        min="0" max="1" step="0.05"
                        value={audioEnabled ? audioVolume : 0}
                        onChange={(e) => {
                            const v = parseFloat(e.target.value);
                            setAudioVolume(v);
                            if (audioRef.current) audioRef.current.volume = v;
                            if (v > 0 && !audioEnabled) setAudioEnabled(true);
                        }}
                        className="flex-1 h-1 accent-[var(--primary,#0a8069)] cursor-pointer max-w-[160px]"
                    />
                    <span className="text-[10px] font-bold text-white/30 w-8 text-right">
                        {Math.round((audioEnabled ? audioVolume : 0) * 100)}%
                    </span>
                </div>
            </div>
        )}
    </>
    );
});

EnhancedVideoPlayer.displayName = 'EnhancedVideoPlayer';
export default EnhancedVideoPlayer;
