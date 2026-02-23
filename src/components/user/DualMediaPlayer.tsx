"use client";

import React, { useRef, useState, useEffect, useCallback } from 'react';

interface DualMediaPlayerProps {
    videoUrl: string;
    audioUrl?: string;
    poster?: string;
    title?: string;
}

/**
 * DualMediaPlayer — Video + optional background audio with independent volume controls.
 * User can toggle audio on/off. When both are active, they sync play/pause/seek.
 */
export const DualMediaPlayer: React.FC<DualMediaPlayerProps> = ({
    videoUrl,
    audioUrl,
    poster,
    title
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioRef = useRef<HTMLAudioElement>(null);

    const [videoVolume, setVideoVolume] = useState(0.8);
    const [audioVolume, setAudioVolume] = useState(0.5);
    const [audioEnabled, setAudioEnabled] = useState(true);
    const [showPanel, setShowPanel] = useState(false);

    // Sync audio with video play/pause
    const syncAudio = useCallback(() => {
        const video = videoRef.current;
        const audio = audioRef.current;
        if (!video || !audio || !audioEnabled) return;

        if (video.paused) {
            audio.pause();
        } else {
            audio.currentTime = video.currentTime;
            audio.play().catch(() => { });
        }
    }, [audioEnabled]);

    // Video event listeners
    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const onPlay = () => syncAudio();
        const onPause = () => syncAudio();
        const onSeeked = () => {
            if (audioRef.current && videoRef.current) {
                audioRef.current.currentTime = videoRef.current.currentTime;
            }
        };

        video.addEventListener('play', onPlay);
        video.addEventListener('pause', onPause);
        video.addEventListener('seeked', onSeeked);

        return () => {
            video.removeEventListener('play', onPlay);
            video.removeEventListener('pause', onPause);
            video.removeEventListener('seeked', onSeeked);
        };
    }, [syncAudio]);

    // Volume sync
    useEffect(() => {
        if (videoRef.current) videoRef.current.volume = videoVolume;
    }, [videoVolume]);

    useEffect(() => {
        if (audioRef.current) audioRef.current.volume = audioEnabled ? audioVolume : 0;
    }, [audioVolume, audioEnabled]);

    // Toggle audio on/off
    const toggleAudio = () => {
        const newState = !audioEnabled;
        setAudioEnabled(newState);
        if (!newState && audioRef.current) {
            audioRef.current.pause();
        } else if (newState && audioRef.current && videoRef.current && !videoRef.current.paused) {
            audioRef.current.currentTime = videoRef.current.currentTime;
            audioRef.current.play().catch(() => { });
        }
    };

    return (
        <div
            style={{ position: 'relative', width: '100%', background: '#000', borderRadius: 12, overflow: 'hidden' }}
            onMouseEnter={() => setShowPanel(true)}
            onMouseLeave={() => setShowPanel(false)}
        >
            {/* Video Player */}
            <video
                ref={videoRef}
                src={videoUrl}
                poster={poster}
                controls
                playsInline
                style={{ width: '100%', display: 'block', maxHeight: '70vh' }}
            />

            {/* Hidden Audio Element */}
            {audioUrl && (
                <audio ref={audioRef} src={audioUrl} preload="auto" loop />
            )}

            {/* Dual Volume Panel — shown on hover when audio track exists */}
            {audioUrl && showPanel && (
                <div style={{
                    position: 'absolute',
                    bottom: 56,
                    right: 12,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                    padding: '12px 14px',
                    background: 'rgba(0,0,0,0.75)',
                    backdropFilter: 'blur(12px)',
                    borderRadius: 12,
                    zIndex: 10,
                    minWidth: 44,
                    alignItems: 'center',
                }}>
                    {/* Video Volume */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <span style={{ fontSize: 16 }}>🎥</span>
                        <input
                            type="range"
                            min="0" max="1" step="0.05"
                            value={videoVolume}
                            onChange={(e) => setVideoVolume(parseFloat(e.target.value))}
                            style={{
                                writingMode: 'vertical-lr',
                                direction: 'rtl',
                                width: 4, height: 70,
                                cursor: 'pointer',
                                accentColor: '#0a8069',
                            }}
                        />
                        <span style={{ fontSize: 10, color: '#ccc', fontWeight: 600 }}>{Math.round(videoVolume * 100)}%</span>
                    </div>

                    {/* Divider */}
                    <div style={{ width: 24, height: 1, background: 'rgba(255,255,255,0.2)' }} />

                    {/* Audio Toggle + Volume */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <button
                            onClick={toggleAudio}
                            style={{
                                background: audioEnabled ? '#114539' : '#555',
                                border: 'none',
                                borderRadius: 6,
                                padding: '2px 6px',
                                cursor: 'pointer',
                                fontSize: 14,
                                transition: 'background 0.2s',
                            }}
                            title={audioEnabled ? "Audio o'chirish" : "Audio yoqish"}
                        >
                            {audioEnabled ? '🎵' : '🔇'}
                        </button>
                        {audioEnabled && (
                            <>
                                <input
                                    type="range"
                                    min="0" max="1" step="0.05"
                                    value={audioVolume}
                                    onChange={(e) => setAudioVolume(parseFloat(e.target.value))}
                                    style={{
                                        writingMode: 'vertical-lr',
                                        direction: 'rtl',
                                        width: 4, height: 70,
                                        cursor: 'pointer',
                                        accentColor: '#114539',
                                    }}
                                />
                                <span style={{ fontSize: 10, color: '#ccc', fontWeight: 600 }}>{Math.round(audioVolume * 100)}%</span>
                            </>
                        )}
                        {!audioEnabled && (
                            <span style={{ fontSize: 10, color: '#888', fontWeight: 500 }}>O'chiq</span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};
