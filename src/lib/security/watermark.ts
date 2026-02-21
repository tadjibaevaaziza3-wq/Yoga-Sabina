/**
 * Watermark Configuration and Utilities
 * 
 * This module provides functions for generating and rendering dynamic watermarks
 * on video content to protect copyright and track unauthorized distribution.
 */

export interface WatermarkConfig {
    userId: string;
    email: string;
    timestamp: Date;
    opacity?: number;
    fontSize?: number;
    color?: string;
}

export interface WatermarkPosition {
    x: number;
    y: number;
}

/**
 * Generate watermark text from user data
 * Format: "USER_ID | ema*** | DD.MM.YYYY HH:MM"
 */
export function generateWatermarkText(config: WatermarkConfig): string {
    const { userId, email, timestamp } = config;

    // Mask email (show first 3 characters)
    const maskedEmail = email.length > 3
        ? `${email.substring(0, 3)}***`
        : 'usr***';

    // Format timestamp
    const dateStr = timestamp.toLocaleDateString('uz-UZ', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
    const timeStr = timestamp.toLocaleTimeString('uz-UZ', {
        hour: '2-digit',
        minute: '2-digit',
    });

    return `${userId.substring(0, 8)} | ${maskedEmail} | ${dateStr} ${timeStr}`;
}

/**
 * Calculate watermark position based on time (creates diagonal movement)
 * Completes one full cycle in 60-90 seconds
 * 
 * @param time - Current time in seconds
 * @param canvasWidth - Width of the canvas
 * @param canvasHeight - Height of the canvas
 * @param cycleDuration - Duration of one full cycle in seconds (default: 75)
 */
export function getWatermarkPosition(
    time: number,
    canvasWidth: number,
    canvasHeight: number,
    cycleDuration: number = 75
): WatermarkPosition {
    // Calculate progress through the cycle (0 to 1)
    const progress = (time % cycleDuration) / cycleDuration;

    // Create diagonal movement pattern
    // Move from top-left to bottom-right and back
    const angle = progress * Math.PI * 2;

    // Calculate position with some padding from edges
    const padding = 50;
    const maxX = canvasWidth - padding - 200; // 200 is approx watermark width
    const maxY = canvasHeight - padding - 30; // 30 is approx watermark height

    const x = padding + (maxX - padding) * ((Math.sin(angle) + 1) / 2);
    const y = padding + (maxY - padding) * ((Math.cos(angle) + 1) / 2);

    return { x, y };
}

/**
 * Render watermark on canvas
 * 
 * @param canvas - HTML Canvas element
 * @param text - Watermark text to render
 * @param position - Position to render at
 * @param config - Optional configuration for appearance
 */
export function renderWatermark(
    canvas: HTMLCanvasElement,
    text: string,
    position: WatermarkPosition,
    config: Partial<WatermarkConfig> = {}
): void {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const {
        opacity = 0.3,
        fontSize = 12,
        color = 'white',
    } = config;

    // Clear previous watermark
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set text style
    ctx.font = `${fontSize}px monospace`;
    ctx.fillStyle = color;
    ctx.globalAlpha = opacity;

    // Add text shadow for better visibility
    ctx.shadowColor = 'black';
    ctx.shadowBlur = 4;
    ctx.shadowOffsetX = 1;
    ctx.shadowOffsetY = 1;

    // Render text
    ctx.fillText(text, position.x, position.y);

    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    // Reset alpha
    ctx.globalAlpha = 1;
}

/**
 * Setup watermark animation loop
 * Returns a cleanup function to stop the animation
 */
export function setupWatermarkAnimation(
    canvas: HTMLCanvasElement,
    watermarkText: string,
    config: Partial<WatermarkConfig> = {}
): () => void {
    let animationFrameId: number;
    let startTime = Date.now();

    const animate = () => {
        const currentTime = (Date.now() - startTime) / 1000; // Convert to seconds

        const position = getWatermarkPosition(
            currentTime,
            canvas.width,
            canvas.height
        );

        renderWatermark(canvas, watermarkText, position, config);

        animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    // Return cleanup function
    return () => {
        if (animationFrameId) {
            cancelAnimationFrame(animationFrameId);
        }
    };
}
