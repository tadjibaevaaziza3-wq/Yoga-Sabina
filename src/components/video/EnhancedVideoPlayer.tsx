'use client';

import { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Settings, PictureInPicture, Cast } from 'lucide-react';
import { setupWatermarkAnimation } from '@/lib/security/watermark';

interface EnhancedVideoPlayerProps {
    assetId: string;
    lessonId: string;
    userId: string;
    email: string;
    className?: string;
    onComplete?: () => void;
}

export interface EnhancedVideoPlayerRef {
    seekTo: (time: number) => void;
}

const QUALITY_OPTIONS = [
    { label: 'Auto', value: 'AUTO' },
    { label: '1080p', value: 'QUALITY_1080P' },
    { label: '720p', value: 'QUALITY_720P' },
    { label: '480p', value: 'QUALITY_480P' },
    { label: '360p', value: 'QUALITY_360P' },
];

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

const EnhancedVideoPlayer = forwardRef<EnhancedVideoPlayerRef, EnhancedVideoPlayerProps>(({
    assetId,
    lessonId,
    userId,
    email,
    className = '',
    onComplete,
}, ref) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [watermarkText, setWatermarkText] = useState<string>('');

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [volume, setVolume] = useState(1);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [playbackRate, setPlaybackRate] = useState(1);
    const [quality, setQuality] = useState('AUTO');
    const [showControls, setShowControls] = useState(true);
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showQualityMenu, setShowQualityMenu] = useState(false);
    const [showAudioMenu, setShowAudioMenu] = useState(false);
    const [audioTracks, setAudioTracks] = useState<string[]>([]);
    const [selectedAudioTrack, setSelectedAudioTrack] = useState(0);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
        seekTo: (time: number) => {
            if (videoRef.current) {
                videoRef.current.currentTime = time;
                videoRef.current.play().catch(() => { }); // Play if paused
            }
        }
    }));

    // Control handlers
    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play().catch(err => console.error("Play error:", err));
        } else {
            video.pause();
        }
    }, []);

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
    }, [isMuted]);

    const handleSeek = useCallback((newTime: number) => {
        const video = videoRef.current;
        if (!video) return;

        video.currentTime = newTime;
        setCurrentTime(newTime);
    }, []);

    const changePlaybackRate = useCallback((rate: number) => {
        const video = videoRef.current;
        if (!video) return;

        video.playbackRate = rate;
        setPlaybackRate(rate);
        setShowSpeedMenu(false);
    }, []);

    const changeQuality = useCallback((newQuality: string) => {
        setQuality(newQuality);
        setShowQualityMenu(false);
        // Preference saved by progress periodic saver
    }, []);

    const changeAudioTrack = useCallback((trackIndex: number) => {
        const video = videoRef.current;
        if (!video) return;

        const audioTracksObj = (video as any).audioTracks;
        if (!audioTracksObj) return;

        for (let i = 0; i < audioTracksObj.length; i++) {
            audioTracksObj[i].enabled = (i === trackIndex);
        }
        setSelectedAudioTrack(trackIndex);
        setShowAudioMenu(false);
    }, []);

    const toggleFullscreen = useCallback(() => {
        const container = containerRef.current;
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen().catch(err => console.error("Fullscreen error:", err));
        } else {
            document.exitFullscreen().catch(err => console.error("Exit fullscreen error:", err));
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

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            const video = videoRef.current;
            if (!video) return;

            // Don't trigger if user is typing in chat or comments
            if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    video.currentTime = Math.max(0, video.currentTime - 5);
                    break;
                case 'arrowright':
                    e.preventDefault();
                    video.currentTime = Math.min(video.duration, video.currentTime + 5);
                    break;
                case 'arrowup':
                    e.preventDefault();
                    video.volume = Math.min(1, video.volume + 0.1);
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    video.volume = Math.max(0, video.volume - 0.1);
                    break;
                case 'm':
                    e.preventDefault();
                    toggleMute();
                    break;
                case 'f':
                    e.preventDefault();
                    toggleFullscreen();
                    break;
                case 'p':
                    e.preventDefault();
                    togglePictureInPicture();
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [togglePlay, toggleMute, toggleFullscreen, togglePictureInPicture]);

    const saveProgress = useCallback(async () => {
        const video = videoRef.current;
        if (!video || !lessonId) return;

        try {
            await fetch('/api/lessons/progress', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    lessonId,
                    watchedSeconds: Math.floor(video.currentTime),
                    totalSeconds: Math.floor(video.duration),
                    completed: video.currentTime / video.duration > 0.9,
                    preferredQuality: quality,
                    preferredSpeed: playbackRate,
                }),
            });

            if (video.currentTime / video.duration > 0.9 && onComplete) {
                onComplete();
            }
        } catch (error) {
            console.error('Error saving progress:', error);
        }
    }, [lessonId, quality, playbackRate, onComplete]);

    // Fetch initial data
    useEffect(() => {
        const fetchVideoData = async () => {
            try {
                setIsLoading(true);
                const urlResponse = await fetch('/api/video/get-signed-url', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ assetId, lessonId }),
                });

                if (!urlResponse.ok) throw new Error('Failed to load video URL');
                const urlData = await urlResponse.json();
                setVideoUrl(urlData.signedUrl);
                setWatermarkText(urlData.watermarkData.text);

                const progressResponse = await fetch(`/api/lessons/progress?lessonId=${lessonId}`);
                if (progressResponse.ok) {
                    const progressData = await progressResponse.json();
                    if (progressData.success && progressData.progress) {
                        const { progress: watchedSeconds, preferredQuality, preferredSpeed } = progressData.progress;
                        if (videoRef.current && watchedSeconds > 0) {
                            videoRef.current.currentTime = watchedSeconds;
                        }
                        if (preferredQuality) setQuality(preferredQuality);
                        if (preferredSpeed) setPlaybackRate(preferredSpeed);
                    }
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load video');
            } finally {
                setIsLoading(false);
            }
        };

        fetchVideoData();
    }, [assetId, lessonId]);

    // Setup watermark
    useEffect(() => {
        if (!canvasRef.current || !watermarkText) return;
        return setupWatermarkAnimation(canvasRef.current, watermarkText, { opacity: 0.3, fontSize: 12 });
    }, [watermarkText]);

    // Resize canvas
    useEffect(() => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        if (!video || !canvas) return;
        const resize = () => {
            canvas.width = video.clientWidth;
            canvas.height = video.clientHeight;
        };
        resize();
        window.addEventListener('resize', resize);
        return () => window.removeEventListener('resize', resize);
    }, [videoUrl]);

    // Auto-save progress
    useEffect(() => {
        if (isPlaying) {
            progressIntervalRef.current = setInterval(saveProgress, 10000);
        }
        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [isPlaying, saveProgress]);

    // Check for completion
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            if (video.currentTime / video.duration > 0.95 && !video.paused) {
                // Trigger completion near the end
                // De-bounce or ensure it only fires once per session if needed
                // For now, parent handles state
            }
        };
        // Actually, let's trigger it in saveProgress or a dedicated effect when 'completed' status is reached
    }, []);

    // Cleanup and final save

    // Cleanup and final save
    useEffect(() => {
        return () => { saveProgress(); };
    }, [saveProgress]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleMetadata = () => {
            setDuration(video.duration);
            video.playbackRate = playbackRate;
            const audioTracksObj = (video as any).audioTracks;
            if (audioTracksObj && audioTracksObj.length > 0) {
                const tracks = Array.from(audioTracksObj).map((t: any, i) => t.label || `Track ${i + 1}`);
                setAudioTracks(tracks);
            }
        };

        const onTimeUpdate = () => setCurrentTime(video.currentTime);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onVolume = () => { setVolume(video.volume); setIsMuted(video.muted); };

        video.addEventListener('loadedmetadata', handleMetadata);
        video.addEventListener('timeupdate', onTimeUpdate);
        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('volumechange', onVolume);

        return () => {
            video.removeEventListener('loadedmetadata', handleMetadata);
            video.removeEventListener('timeupdate', onTimeUpdate);
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('volumechange', onVolume);
        };
    }, [videoUrl, playbackRate]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    if (isLoading) return (
        <div className={`flex items-center justify-center bg-black rounded-lg ${className}`}>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>
    );

    if (error) return (
        <div className={`flex items-center justify-center bg-red-900/20 rounded-lg p-8 ${className}`}>
            <p className="text-red-400">{error}</p>
        </div>
    );

    return (
        <div
            ref={containerRef}
            className={`relative bg-black rounded-lg overflow-hidden ${className}`}
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <video ref={videoRef} src={videoUrl || undefined} className="w-full h-full" controlsList="nodownload" playsInline />
            <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full pointer-events-none" />
            <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-4 transition-opacity ${showControls ? 'opacity-100' : 'opacity-0'}`}>
                <div className="mb-3">
                    <input type="range" min="0" max={duration || 0} value={currentTime} onChange={(e) => handleSeek(parseFloat(e.target.value))} className="w-full h-1 accent-[var(--accent)]" />
                    <div className="flex justify-between text-xs text-white mt-1">
                        <span>{formatTime(currentTime)}</span>
                        <span>{formatTime(duration)}</span>
                    </div>
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={togglePlay} className="text-white hover:text-[var(--accent)]/60">{isPlaying ? <Pause size={24} /> : <Play size={24} />}</button>
                        <div className="flex items-center gap-2">
                            <button onClick={toggleMute} className="text-white">{isMuted || volume === 0 ? <VolumeX size={20} /> : <Volume2 size={20} />}</button>
                            <input type="range" min="0" max="1" step="0.1" value={volume} onChange={(e) => handleVolumeChange(parseFloat(e.target.value))} className="w-20 h-1 accent-[var(--accent)]" />
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <button onClick={() => setShowQualityMenu(!showQualityMenu)} className="text-white text-sm px-2 py-1 bg-white/10 rounded">{QUALITY_OPTIONS.find(q => q.value === quality)?.label || 'Auto'}</button>
                            {showQualityMenu && (
                                <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg">
                                    {QUALITY_OPTIONS.map(q => <button key={q.value} onClick={() => changeQuality(q.value)} className={`block w-full px-4 py-2 text-sm text-left ${quality === q.value ? 'bg-[var(--accent)]' : 'hover:bg-gray-700'}`}>{q.label}</button>)}
                                </div>
                            )}
                        </div>
                        <div className="relative">
                            <button onClick={() => setShowSpeedMenu(!showSpeedMenu)} className="text-white flex items-center gap-1 text-sm"><Settings size={18} />{playbackRate}x</button>
                            {showSpeedMenu && (
                                <div className="absolute bottom-full right-0 mb-2 bg-gray-800 rounded-lg">
                                    {SPEED_OPTIONS.map(r => <button key={r} onClick={() => changePlaybackRate(r)} className={`block w-full px-4 py-2 text-sm text-left ${playbackRate === r ? 'bg-[var(--accent)]' : 'hover:bg-gray-700'}`}>{r}x</button>)}
                                </div>
                            )}
                        </div>
                        <button onClick={togglePictureInPicture} className="text-white"><PictureInPicture size={20} /></button>
                        <button onClick={toggleFullscreen} className="text-white"><Maximize size={20} /></button>
                    </div>
                </div>
            </div>
        </div>
    );
});

EnhancedVideoPlayer.displayName = 'EnhancedVideoPlayer';
export default EnhancedVideoPlayer;


