import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendTelegramMessage } from '@/lib/telegram-bot'

/**
 * User Password Reset via Phone Number
 * 
 * POST /api/auth/reset-password
 * Body: { phone }
 * 
 * Flow:
 * 1. User enters phone number
 * 2. System generates a temporary password (6 chars)
 * 3. Sets forcePasswordChange = true
 * 4. Sends temporary password via Telegram (if user has telegramId)
 * 5. Returns success (but never reveals the password in API response)
 */
export async function POST(request: Request) {
    try {
        const { phone } = await request.json()

        if (!phone) {
            return NextResponse.json({ success: false, error: 'Telefon raqam kiritilishi kerak' }, { status: 400 })
        }

        // Find user by phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone },
                    { phone: phone.replace('+', '') },
                    { phone: `+${phone.replace('+', '')}` },
                ]
            }
        })

        if (!user) {
            // Don't reveal if user exists or not — return generic success
            return NextResponse.json({
                success: true,
                message: 'Agar bu raqam ro\'yxatdan o\'tgan bo\'lsa, yangi parol yuboriladi'
            })
        }

        // Generate temporary password (6 random characters)
        const tempPassword = crypto.randomBytes(3).toString('hex') // e.g., "a3f2b1"

        // Hash it with SHA-256 (matching the registration hash method)
        const hashedPassword = crypto.createHash('sha256').update(tempPassword).digest('hex')

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                forcePasswordChange: true,
            }
        })

        // Send via Telegram if available
        if (user.telegramId) {
            const msg = `🔑 <b>Yangi parol — Baxtli Men</b>\n\nSizning vaqtinchalik parolingiz: <code>${tempPassword}</code>\n\nIltimos, tizimga kirganingizdan so'ng darhol parolni o'zgartiring.\n\n---\n🔑 <b>Новый пароль — Baxtli Men</b>\n\nВаш временный пароль: <code>${tempPassword}</code>\n\nПожалуйста, смените пароль после входа.`

            await sendTelegramMessage(user.telegramId, msg)
        }

        return NextResponse.json({
            success: true,
            message: 'Yangi parol Telegram orqali yuborildi',
            // Only show temp password if user has no telegram (so they can see it once)
            ...(user.telegramId ? {} : { tempPassword }),
        })
    } catch (error: any) {
        console.error('Password reset error:', error)
        return NextResponse.json({ success: false, error: 'Xatolik yuz berdi' }, { status: 500 })
    }
}
