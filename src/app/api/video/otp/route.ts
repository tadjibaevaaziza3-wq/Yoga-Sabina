import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'
import { generateOTP, sendOTP } from '@/lib/telegram-bot'

// In-memory OTP store (in production, use Redis)
const otpStore = new Map<string, { code: string, expiresAt: number, attempts: number }>()

// Clean expired OTPs periodically
setInterval(() => {
    const now = Date.now()
    for (const [key, value] of otpStore) {
        if (value.expiresAt < now) otpStore.delete(key)
    }
}, 60000) // Clean every minute

async function getUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null
    return verifyToken(token)
}

/**
 * POST /api/video/otp
 * 
 * action: 'request' — Generate and send OTP via Telegram
 * action: 'verify' — Verify OTP code
 */
export async function POST(request: NextRequest) {
    const userId = await getUser()
    if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await request.json()
    const { action, lessonId } = body

    // Get user with Telegram info
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            telegramId: true,
            phone: true,
            role: true
        }
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Admins bypass OTP
    if (user.role === 'ADMIN') {
        return NextResponse.json({ success: true, verified: true, bypass: true })
    }

    if (!user.telegramId) {
        return NextResponse.json({
            error: 'No Telegram account linked. Please register via Telegram.',
            needsTelegram: true
        }, { status: 400 })
    }

    const otpKey = `${userId}:${lessonId || 'session'}`

    if (action === 'request') {
        // Rate limit: max 3 OTP requests per 5 minutes
        const existing = otpStore.get(otpKey)
        if (existing && existing.attempts >= 3 && existing.expiresAt > Date.now()) {
            return NextResponse.json({
                error: 'Too many requests. Please wait.',
                retryAfter: Math.ceil((existing.expiresAt - Date.now()) / 1000)
            }, { status: 429 })
        }

        const code = generateOTP()
        const expiresAt = Date.now() + 5 * 60 * 1000 // 5 minutes

        otpStore.set(otpKey, {
            code,
            expiresAt,
            attempts: (existing?.attempts || 0) + 1
        })

        // Detect language from request
        const lang = body.lang === 'ru' ? 'ru' : 'uz'

        // Send via Telegram
        const sent = await sendOTP(user.telegramId, code, lang as 'uz' | 'ru')

        if (!sent) {
            return NextResponse.json({
                error: 'Failed to send OTP via Telegram. Check your Telegram connection.',
                telegramError: true
            }, { status: 500 })
        }

        // Log the OTP event
        await prisma.eventLog.create({
            data: {
                userId,
                event: 'OTP_REQUESTED',
                metadata: { lessonId, telegramId: user.telegramId }
            }
        }).catch(() => { }) // Non-critical

        return NextResponse.json({
            success: true,
            message: 'OTP sent to your Telegram',
            expiresIn: 300 // 5 minutes in seconds
        })
    }

    if (action === 'verify') {
        const { code } = body

        if (!code) {
            return NextResponse.json({ error: 'Code required' }, { status: 400 })
        }

        const stored = otpStore.get(otpKey)

        if (!stored) {
            return NextResponse.json({ error: 'No OTP requested. Please request a new code.' }, { status: 400 })
        }

        if (stored.expiresAt < Date.now()) {
            otpStore.delete(otpKey)
            return NextResponse.json({ error: 'Code expired. Please request a new one.' }, { status: 400 })
        }

        if (stored.code !== code.trim()) {
            return NextResponse.json({ error: 'Invalid code. Please try again.' }, { status: 400 })
        }

        // OTP verified! Clean up and return success
        otpStore.delete(otpKey)

        // Log successful verification
        await prisma.eventLog.create({
            data: {
                userId,
                event: 'OTP_VERIFIED',
                metadata: { lessonId }
            }
        }).catch(() => { })

        // Set a session cookie for this video session (valid 2 hours)
        const cookieStore = await cookies()
        const sessionToken = Buffer.from(JSON.stringify({
            userId,
            lessonId,
            verifiedAt: Date.now(),
            expiresAt: Date.now() + 2 * 60 * 60 * 1000
        })).toString('base64')

        // We return the token for the client to include in video requests
        return NextResponse.json({
            success: true,
            verified: true,
            videoSessionToken: sessionToken,
            expiresIn: 7200 // 2 hours
        })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
}
