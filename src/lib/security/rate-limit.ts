/**
 * Rate Limiting Middleware
 * 
 * Prevents abuse by limiting the number of video requests per IP address
 */

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

// In-memory store for rate limiting
// In production, consider using Redis for distributed rate limiting
const rateLimitStore = new Map<string, RateLimitEntry>();

const MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '5', 10);
const WINDOW_MINUTES = parseInt(process.env.RATE_LIMIT_WINDOW_MINUTES || '1', 10);
const WINDOW_MS = WINDOW_MINUTES * 60 * 1000;

/**
 * Check if a request should be rate limited
 * 
 * @param identifier - Unique identifier (usually IP address)
 * @returns true if request should be allowed, false if rate limited
 */
export function checkRateLimit(identifier: string): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(identifier);

    // No entry or window expired - allow and create new entry
    if (!entry || now > entry.resetAt) {
        rateLimitStore.set(identifier, {
            count: 1,
            resetAt: now + WINDOW_MS,
        });
        return true;
    }

    // Within window - check count
    if (entry.count < MAX_REQUESTS) {
        entry.count++;
        return true;
    }

    // Rate limit exceeded
    return false;
}

/**
 * Get remaining requests for an identifier
 */
export function getRemainingRequests(identifier: string): number {
    const entry = rateLimitStore.get(identifier);
    if (!entry || Date.now() > entry.resetAt) {
        return MAX_REQUESTS;
    }
    return Math.max(0, MAX_REQUESTS - entry.count);
}

/**
 * Get time until rate limit resets (in seconds)
 */
export function getResetTime(identifier: string): number {
    const entry = rateLimitStore.get(identifier);
    if (!entry || Date.now() > entry.resetAt) {
        return 0;
    }
    return Math.ceil((entry.resetAt - Date.now()) / 1000);
}

/**
 * Clean up expired entries (should be called periodically)
 */
export function cleanupExpiredEntries(): void {
    const now = Date.now();
    for (const [key, entry] of rateLimitStore.entries()) {
        if (now > entry.resetAt) {
            rateLimitStore.delete(key);
        }
    }
}

// Clean up every 5 minutes
if (typeof window === 'undefined') {
    setInterval(cleanupExpiredEntries, 5 * 60 * 1000);
}
