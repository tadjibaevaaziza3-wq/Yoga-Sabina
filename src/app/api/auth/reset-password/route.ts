import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { sendTelegramMessage } from '@/lib/telegram-bot'
import { checkRateLimit, getResetTime } from '@/lib/security/rate-limit'

/**
 * User-facing password reset.
 * User enters their phone number → find user → generate new password → send via Telegram bot.
 * No authentication required (it's for forgotten passwords).
 */
export async function POST(request: NextRequest) {
    try {
        // Rate limiting — 3 attempts per minute per IP
        const ip = request.headers.get('x-forwarded-for') || 'unknown'
        if (!checkRateLimit(`reset:${ip}`)) {
            return NextResponse.json({
                error: 'too_many_attempts',
                retryAfter: getResetTime(`reset:${ip}`)
            }, { status: 429 })
        }

        const { phone } = await request.json()

        if (!phone || phone.trim().length < 5) {
            return NextResponse.json({ error: 'phone_required' }, { status: 400 })
        }

        // Normalize phone: remove spaces, dashes
        const normalizedPhone = phone.replace(/[\s\-\(\)]/g, '')

        // Find user by phone
        const user = await prisma.user.findFirst({
            where: {
                phone: { contains: normalizedPhone.slice(-9) }, // Match last 9 digits
            },
            select: { id: true, firstName: true, telegramId: true, phone: true },
        })

        if (!user) {
            return NextResponse.json({ error: 'user_not_found' }, { status: 404 })
        }

        if (!user.telegramId) {
            return NextResponse.json({ error: 'no_telegram' }, { status: 400 })
        }

        // Generate random 8-character password
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
        let newPassword = ''
        for (let i = 0; i < 8; i++) {
            newPassword += chars.charAt(Math.floor(Math.random() * chars.length))
        }

        // Hash and save
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword },
        })

        // Send via Telegram
        const message = [
            `🔐 <b>Parolingiz yangilandi</b>`,
            ``,
            `Yangi parol: <code>${newPassword}</code>`,
            ``,
            `⚠️ Iltimos, tizimga kirganingizdan so'ng parolni o'zgartiring.`,
            ``,
            `— Baxtli Men jamoasi`,
        ].join('\n')

        const sent = await sendTelegramMessage(user.telegramId, message)

        if (!sent) {
            return NextResponse.json({ error: 'telegram_failed' }, { status: 500 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        console.error('Password reset error:', error)
        return NextResponse.json({ error: 'server_error' }, { status: 500 })
    }
}
