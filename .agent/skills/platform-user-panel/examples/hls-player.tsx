/**
 * Premium HLS Player with Synchronized Dual-Track Audio
 * React + Video.js implementation.
 */

import React, { useEffect, useRef } from 'react';
import videojs from 'video.js';
import 'video.js/dist/video-js.css';

export const HLSPlayer = ({ videoUrl, musicUrl, onProgress }) => {
    const videoRef = useRef(null);
    const musicRef = useRef(null);
    const playerRef = useRef(null);

    useEffect(() => {
        if (!playerRef.current) {
            const videoElement = videoRef.current;
            if (!videoElement) return;

            const player = playerRef.current = videojs(videoElement, {
                autoplay: false,
                controls: true,
                responsive: true,
                fluid: true,
                playbackRates: [0.5, 1, 1.5, 2],
                sources: [{ src: videoUrl, type: 'application/x-mpegURL' }]
            });

            // Master/Slave synchronization for background music
            player.on('play', () => musicRef.current?.play());
            player.on('pause', () => musicRef.current?.pause());
            player.on('seeking', () => {
                if (musicRef.current) {
                    musicRef.current.currentTime = player.currentTime();
                }
            });

            player.on('timeupdate', () => {
                onProgress(player.currentTime(), player.duration());
            });
        }
    }, [videoUrl, musicUrl]);

    return (
        <div className="relative rounded-[2rem] overflow-hidden shadow-2xl border border-white/10">
            <div data-vjs-player>
                <video ref={videoRef} className="video-js vjs-big-play-centered vjs-theme-antigravity" />
            </div>

            {/* Background Music Track (Hidden) */}
            <audio ref={musicRef} src={musicUrl} preload="auto" />

            {/* Custom UI for track toggles could go here */}
        </div>
    );
};
