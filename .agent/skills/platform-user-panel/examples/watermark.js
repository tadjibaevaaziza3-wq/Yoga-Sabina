/**
 * Antigravity Dynamic Watermark Implementation
 * Overlay user details over video element with periodic movement.
 */

export function initDynamicWatermark(containerId, userData) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Create overlay
    const overlay = document.createElement('div');
    overlay.id = 'dynamic-watermark';
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.pointerEvents = 'none'; // Allow clicking video through it
    overlay.style.zIndex = '100';
    overlay.style.overflow = 'hidden';

    // Create watermark text
    const text = document.createElement('div');
    text.style.position = 'absolute';
    text.style.color = 'white';
    text.style.opacity = '0.25';
    text.style.fontSize = '12px';
    text.style.fontFamily = 'Inter, sans-serif';
    text.style.fontWeight = 'bold';
    text.style.textShadow = '1px 1px 2px rgba(0,0,0,0.5)';
    text.style.whiteSpace = 'nowrap';
    text.style.transition = 'all 1s ease-in-out';
    text.style.userSelect = 'none';

    overlay.appendChild(text);
    container.appendChild(overlay);

    function updateWatermark() {
        const now = new Date();
        const dateStr = now.toLocaleDateString();
        const timeStr = now.toLocaleTimeString();

        text.innerHTML = `
            <div>ID: ${userData.user_id}</div>
            <div>PH: ${userData.phone}</div>
            <div>${dateStr} - ${timeStr}</div>
        `;

        // Movement Logic: Random Position
        const maxX = container.clientWidth - text.clientWidth - 20;
        const maxY = container.clientHeight - text.clientHeight - 20;

        const randomX = Math.max(10, Math.floor(Math.random() * maxX));
        const randomY = Math.max(10, Math.floor(Math.random() * maxY));

        text.style.left = `${randomX}px`;
        text.style.top = `${randomY}px`;
    }

    // Move every 10 seconds
    updateWatermark();
    const interval = setInterval(updateWatermark, 10000);

    return () => clearInterval(interval);
}
