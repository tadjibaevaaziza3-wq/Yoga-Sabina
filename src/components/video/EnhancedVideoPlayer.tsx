import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, PictureInPicture, RotateCcw, RotateCw } from 'lucide-react';
import { DynamicWatermark } from './DynamicWatermark';

interface EnhancedVideoPlayerProps {
    assetId: string;
    lessonId: string;
    userId: string;
    email: string;
    phoneNumber?: string;
    className?: string;
    onComplete?: () => void;
}

export interface EnhancedVideoPlayerRef {
    seekTo: (time: number) => void;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const EnhancedVideoPlayer = forwardRef<EnhancedVideoPlayerRef, EnhancedVideoPlayerProps>((
    { assetId, lessonId, userId, email, phoneNumber, className = '', onComplete },
    ref
) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
    const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);
    const tapTimerRef = useRef<NodeJS.Timeout | null>(null);

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
                    // Auto-retry once on 503 (transient DB error)
                    if (urlResponse.status === 503 && retryCount < 2) {
                        console.warn(`[EnhancedVideoPlayer] Got 503, retrying in 2s (attempt ${retryCount + 1})...`);
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
                        const { progress: watchedSeconds, preferredSpeed } = progressData.progress;
                        if (videoRef.current && watchedSeconds > 0) {
                            videoRef.current.currentTime = watchedSeconds;
                        }
                        if (preferredSpeed) setPlaybackRate(preferredSpeed);
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
            if (onComplete) onComplete();
        };

        // CRITICAL FIX: If metadata already loaded before listeners attached,
        // read duration immediately (readyState >= 1 means HAVE_METADATA)
        if (video.readyState >= 1) {
            setDurationOnce(video.duration);
            video.playbackRate = playbackRate;
        }

        video.addEventListener('loadedmetadata', handleMetadata);
        video.addEventListener('durationchange', onDurationChange);
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('volumechange', onVolume);
        video.addEventListener('ended', onEnded);

        return () => {
            video.removeEventListener('loadedmetadata', handleMetadata);
            video.removeEventListener('durationchange', onDurationChange);
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('volumechange', onVolume);
            video.removeEventListener('ended', onEnded);
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

    return (
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
                className="w-full h-full"
                controlsList="nodownload nofullscreen noremoteplayback"
                preload="metadata"
                playsInline
                onClick={(e) => { e.stopPropagation(); togglePlay(); }}
            />

            <DynamicWatermark userId={userId} phone={phoneNumber || email} containerRef={containerRef} />

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

            {/* Big center play button when paused and controls visible */}
            {!isPlaying && showControls && !showCenterIcon && (
                <button
                    className="absolute inset-0 flex items-center justify-center z-20 w-full h-full"
                    onClick={(e) => { e.stopPropagation(); togglePlay(); }}
                >
                    <div className="w-20 h-20 bg-white/15 hover:bg-white/25 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20 transition-all duration-200 hover:scale-110 active:scale-95">
                        <Play className="w-8 h-8 text-white fill-white ml-1" />
                    </div>
                </button>
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
                        className="relative h-1.5 bg-white/20 rounded-full cursor-pointer group"
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
                        {/* Scrubber thumb */}
                        <div
                            className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 bg-white rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
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

                            <span className="text-white/70 text-xs font-mono tabular-nums">
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
                            <button onClick={toggleFullscreen} className="text-white/70 hover:text-white transition-colors p-1" title="Fullscreen">
                                <Maximize size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

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
        </div>
    );
});

EnhancedVideoPlayer.displayName = 'EnhancedVideoPlayer';
export default EnhancedVideoPlayer;
