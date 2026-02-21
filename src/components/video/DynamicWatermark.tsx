'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface DynamicWatermarkProps {
    userId: string;
    phone: string;
    containerRef: React.RefObject<HTMLDivElement>;
}

export const DynamicWatermark: React.FC<DynamicWatermarkProps> = ({ userId, phone, containerRef }) => {
    const [position, setPosition] = useState({ x: 10, y: 10 });
    const [isVisible, setIsVisible] = useState(true);
    const [currentTime, setCurrentTime] = useState(new Date());

    const updatePosition = useCallback(() => {
        if (!containerRef.current) return;

        setIsVisible(false);

        setTimeout(() => {
            const container = containerRef.current!;
            const maxX = container.clientWidth - 200; // Text width approx
            const maxY = container.clientHeight - 80;  // Text height approx

            const newX = Math.max(20, Math.floor(Math.random() * maxX));
            const newY = Math.max(20, Math.floor(Math.random() * maxY));

            setPosition({ x: newX, y: newY });
            setIsVisible(true);
        }, 1000); // Fade out then move
    }, [containerRef]);

    useEffect(() => {
        const moveInterval = setInterval(updatePosition, 10000);
        const timeInterval = setInterval(() => setCurrentTime(new Date()), 1000);

        return () => {
            clearInterval(moveInterval);
            clearInterval(timeInterval);
        };
    }, [updatePosition]);

    return (
        <div className="absolute inset-0 pointer-events-none z-[100] overflow-hidden select-none">
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.3 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        style={{
                            position: 'absolute',
                            left: position.x,
                            top: position.y,
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: 'bold',
                            textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                            lineHeight: '1.4',
                        }}
                    >
                        <div>ID: {userId}</div>
                        <div>PH: {phone}</div>
                        <div>{currentTime.toLocaleDateString()}</div>
                        <div>{currentTime.toLocaleTimeString()}</div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};
