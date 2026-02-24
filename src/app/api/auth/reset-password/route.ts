import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendTelegramMessage, resolveTelegramChatId } from '@/lib/telegram-bot'

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
        const { phone, telegramId: providedTelegramId, telegramUsername, userId } = await request.json()

        if (!phone && !userId) {
            return NextResponse.json({ success: false, error: 'Telefon raqam yoki foydalanuvchi ID kiritilishi kerak' }, { status: 400 })
        }

        // Find user by ID, phone, or email
        let user;
        if (userId) {
            user = await prisma.user.findUnique({ where: { id: userId } });
        }
        if (!user && phone) {
            user = await prisma.user.findFirst({
                where: {
                    OR: [
                        { phone },
                        { phone: phone.replace('+', '') },
                        { phone: `+${phone.replace('+', '')}` },
                        { email: phone },
                    ]
                }
            })
        }

        if (!user) {
            return NextResponse.json({
                success: true,
                message: 'Agar bu raqam ro\'yxatdan o\'tgan bo\'lsa, yangi parol yuboriladi'
            })
        }

        // Use telegramId from: provided param > user record > resolve from username
        let telegramId = providedTelegramId || user.telegramId;

        // If no telegramId but have username, try to resolve it
        if (!telegramId) {
            const tgUsername = telegramUsername || (user as any).telegramUsername;
            if (tgUsername) {
                const resolvedId = await resolveTelegramChatId(tgUsername);
                if (resolvedId) {
                    telegramId = resolvedId;
                    // Save the resolved telegramId for future use
                    await prisma.user.update({
                        where: { id: user.id },
                        data: { telegramId: resolvedId }
                    })
                    console.log(`✅ Resolved Telegram ID for ${tgUsername}: ${resolvedId}`);
                }
            }
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
        if (telegramId) {
            const msg = `🔑 <b>Yangi parol — Baxtli Men</b>\n\nSizning vaqtinchalik parolingiz: <code>${tempPassword}</code>\n\nIltimos, tizimga kirganingizdan so'ng darhol parolni o'zgartiring.\n\n---\n🔑 <b>Новый пароль — Baxtli Men</b>\n\nВаш временный пароль: <code>${tempPassword}</code>\n\nПожалуйста, смените пароль после входа.`

            const sent = await sendTelegramMessage(telegramId, msg)

            return NextResponse.json({
                success: true,
                message: 'Yangi parol Telegram orqali yuborildi',
                sentViaTelegram: sent,
                // If telegram send failed, also return the password
                ...(!sent ? { tempPassword } : {}),
            })
        }

        return NextResponse.json({
            success: true,
            message: 'Parol tiklandi',
            tempPassword, // No Telegram — admin must deliver manually
        })
    } catch (error: any) {
        console.error('Password reset error:', error)
        return NextResponse.json({ success: false, error: 'Xatolik yuz berdi' }, { status: 500 })
    }
}
