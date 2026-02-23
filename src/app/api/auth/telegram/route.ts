import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { validateTelegramData } from '@/lib/telegram/auth'
import { generateToken } from '@/lib/auth/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcrypt'
import { sendTelegramMessage } from '@/lib/telegram/bot'

function generateRandomPassword(length: number = 10): string {
    const charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*"
    let retVal = ""
    for (let i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n))
    }
    return retVal
}

export async function POST(request: Request) {
    try {
        const body = await request.json()
        const { initData } = body

        if (!initData) {
            return NextResponse.json(
                { success: false, error: 'Missing initData' },
                { status: 400 }
            )
        }

        // 1. Validate Telegram Signature
        const validated = validateTelegramData(initData)
        if (!validated) {
            return NextResponse.json(
                { success: false, error: 'Invalid start data' },
                { status: 401 }
            )
        }

        const telegramUser = validated.user
        const telegramIdStr = telegramUser.id.toString()

        // 2. Find or Create User
        // We use upsert if possible, or manual check
        let user = await prisma.user.findFirst({
            where: { telegramId: telegramIdStr }
        })

        if (!user) {
            // Check if user exists by username (optional linking)
            // Or just create new
            user = await prisma.user.create({
                data: {
                    telegramId: telegramIdStr,
                    telegramUsername: telegramUser.username,
                    telegramPhotoUrl: telegramUser.photo_url,
                    firstName: telegramUser.first_name,
                    lastName: telegramUser.last_name,
                    registrationSource: 'TELEGRAM',
                    language: telegramUser.language_code === 'ru' ? 'ru' : 'uz', // default 'uz'
                    // Generate a random email or leave null (we made email optional)
                    // email: null
                }
            })

            // Log registration event
            await prisma.eventLog.create({
                data: {
                    userId: user.id,
                    event: 'REGISTRATION',
                    platform: 'TELEGRAM',
                    metadata: { telegramId: telegramIdStr, username: telegramUser.username }
                }
            })
        } else {
            // Update latest info
            user = await prisma.user.update({
                where: { id: user.id },
                data: {
                    telegramUsername: telegramUser.username,
                    telegramPhotoUrl: telegramUser.photo_url,
                    firstName: telegramUser.first_name,
                    lastName: telegramUser.last_name,
                    // Don't overwrite existing language preference if set
                }
            })

            // Log login event
            await prisma.eventLog.create({
                data: {
                    userId: user.id,
                    event: 'LOGIN',
                    platform: 'TELEGRAM',
                    metadata: { telegramId: telegramIdStr }
                }
            })
        }

        // 2.5 Handle Password Recovery
        if (validated.start_param === 'recovery') {
            const newPassword = generateRandomPassword()
            const hashedPassword = await bcrypt.hash(newPassword, 10)

            await prisma.user.update({
                where: { id: user.id },
                data: { password: hashedPassword }
            })

            const lang = user.language || 'uz'
            const recoveryMessage = lang === 'ru'
                ? `🔑 Ваши данные для входа восстановлены!\n\n**Новый пароль:** \`${newPassword}\`\n\nПожалуйста, измените этот пароль после входа в личный кабинет для обеспечения безопасности.`
                : `🔑 Sizning kirish ma'lumotlaringiz tiklandi!\n\n**Yangi parolingiz:** \`${newPassword}\`\n\nIltimos, xavfsizlikni ta'minlash uchun shaxshiy kabinetingizga kirganingizdan so'ng parolni o'zgartirishni unutmang.`

            await sendTelegramMessage(telegramIdStr, recoveryMessage)
        }

        // 3. Generate Session Token
        const token = generateToken(user.id)

        // 4. Set Cookie
        const cookieStore = await cookies()
        cookieStore.set('auth_token', token, {
            path: '/',
            maxAge: 60 * 60 * 24 * 30, // 30 days
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax' // 'none' might be needed if embedded very specifically, but 'lax' usually ok
        })

        // 5. Return success
        return NextResponse.json({
            success: true,
            user: {
                id: user.id,
                firstName: user.firstName,
                lastName: user.lastName,
                telegramId: user.telegramId,
                role: user.role
            },
            token // Return token for client-side storage if needed (e.g. for non-cookie requests)
        })

    } catch (error: any) {
        console.error('Telegram Auth Error:', error)
        return NextResponse.json(
            { success: false, error: 'Internal Server Error' },
            { status: 500 }
        )
    }
}
