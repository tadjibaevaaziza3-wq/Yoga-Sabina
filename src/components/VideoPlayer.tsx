"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface VideoPlayerProps {
    src: string
    userId?: string
    userName?: string
}

export function VideoPlayer({ src, userId, userName }: VideoPlayerProps) {
    const [watermarkPos, setWatermarkPos] = useState({ top: "10%", left: "10%" })
    const videoRef = useRef<HTMLVideoElement>(null)

    // Move watermark randomly to prevent recording
    useEffect(() => {
        const interval = setInterval(() => {
            setWatermarkPos({
                top: `${Math.floor(Math.random() * 80) + 10}%`,
                left: `${Math.floor(Math.random() * 80) + 10}%`,
            })
        }, 5000)

        return () => clearInterval(interval)
    }, [])

    return (
        <div className="relative aspect-video bg-black rounded-[2.5rem] overflow-hidden group">
            <video
                ref={videoRef}
                src={src}
                controls
                className="w-full h-full"
                controlsList="nodownload"
                onContextMenu={(e) => e.preventDefault()}
            >
                Your browser does not support the video tag.
            </video>

            {/* Floating Watermark */}
            <motion.div
                animate={{
                    top: watermarkPos.top,
                    left: watermarkPos.left,
                    opacity: [0.1, 0.3, 0.1]
                }}
                transition={{ duration: 2, ease: "easeInOut" }}
                className="absolute pointer-events-none select-none text-[10px] md:text-xs font-black text-white/40 uppercase tracking-widest whitespace-nowrap z-50 bg-black/10 px-2 py-1 rounded backdrop-blur-[1px]"
            >
                {userName || "USER"} | {userId || "ID_0000"} | {new Date().toLocaleDateString()}
            </motion.div>

            {/* Protection Layer overlaying common capture spots */}
            <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 mix-blend-overlay" />
        </div>
    )
}


