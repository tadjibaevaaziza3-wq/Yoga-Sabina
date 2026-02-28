import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'
import bcrypt from 'bcryptjs'
import { sendTelegramMessage } from '@/lib/telegram-bot'

async function getAdmin() {
    const cookieStore = await cookies()
    const session = cookieStore.get('admin_session')?.value
    if (!session) return null
    return verifyToken(session)
}

// POST - Reset user password and send via Telegram
export async function POST(request: NextRequest) {
    const admin = await getAdmin()
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { userId } = await request.json()
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 })

    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, firstName: true, telegramId: true, phone: true },
    })

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 })

    // Generate random 8-character password
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let newPassword = ''
    for (let i = 0; i < 8; i++) {
        newPassword += chars.charAt(Math.floor(Math.random() * chars.length))
    }

    // Hash and save
    const hashedPassword = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
    })

    // Send via Telegram if user has telegramId
    let telegramSent = false
    if (user.telegramId) {
        const message = [
            `🔐 <b>Parolingiz yangilandi</b>`,
            ``,
            `Yangi parol: <code>${newPassword}</code>`,
            ``,
            `⚠️ Iltimos, tizimga kirganingizdan so'ng parolni o'zgartiring.`,
            ``,
            `— Baxtli Men jamoasi`,
        ].join('\n')

        telegramSent = await sendTelegramMessage(user.telegramId, message)
    }

    return NextResponse.json({
        success: true,
        telegramSent,
        hasTelegram: !!user.telegramId,
        newPassword: telegramSent ? undefined : newPassword, // Only return password if Telegram failed
    })
}
