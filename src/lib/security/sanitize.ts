/**
 * Security Sanitization Utilities
 * 
 * Generic error sanitizer and input sanitizer for production safety.
 */

/**
 * Sanitize error messages for production responses.
 * In development, returns the full error. In production, returns a generic message.
 */
export function sanitizeError(error: unknown, fallback = 'An error occurred'): string {
    if (process.env.NODE_ENV !== 'production') {
        if (error instanceof Error) return error.message
        if (typeof error === 'string') return error
    }
    return fallback
}

/**
 * Create a safe JSON error response for API routes.
 */
export function safeErrorResponse(error: unknown, fallback = 'Internal server error', status = 500) {
    const { NextResponse } = require('next/server')
    console.error('[API Error]', error)
    return NextResponse.json(
        { success: false, error: sanitizeError(error, fallback) },
        { status }
    )
}

/**
 * Sanitize user input strings — strip HTML tags and trim.
 */
export function sanitizeInput(input: string): string {
    if (typeof input !== 'string') return ''
    return input
        .replace(/<[^>]*>/g, '') // Strip HTML tags
        .replace(/[<>'"]/g, '')  // Remove dangerous chars
        .trim()
}

/**
 * Validate and sanitize email format.
 */
export function sanitizeEmail(email: string): string | null {
    const cleaned = email.trim().toLowerCase()
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(cleaned) ? cleaned : null
}

/**
 * Validate phone number format (Uzbekistan).
 */
export function sanitizePhone(phone: string): string | null {
    const cleaned = phone.replace(/[^\d+]/g, '')
    // Uzbek phone: +998XXXXXXXXX or 998XXXXXXXXX or 9XXXXXXXX
    if (/^\+?998\d{9}$/.test(cleaned) || /^9\d{8}$/.test(cleaned)) {
        return cleaned
    }
    return null
}
