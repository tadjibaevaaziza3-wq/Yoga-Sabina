import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/server';
import { sendTelegramMessage } from '@/lib/telegram/bot';

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

export async function POST(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
        }

        const { id: userId } = await params;
        const body = await req.json();
        const { message } = body;

        if (!message || typeof message !== 'string' || !message.trim()) {
            return NextResponse.json({ error: 'Message content is required' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { id: true, telegramId: true, firstName: true }
        });

        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // 1. Save message as a general notification in ChatMessage
        await prisma.chatMessage.create({
            data: {
                userId: user.id,
                message: `🔔 Admin xabari:\n\n${message.trim()}`
            }
        });

        // 2. Send via Telegram if connected
        let sentViaTelegram = false;
        if (user.telegramId) {
            const telegramText = `🔔 <b>Sizda adminga yangi xabar bor!</b>\n\n${message.trim()}`;
            try {
                const telegramResult = await sendTelegramMessage(user.telegramId, telegramText, 'TEXT');
                sentViaTelegram = telegramResult.success;
            } catch (err) {
                console.error(`Failed to send telegram message to ${user.telegramId}:`, err);
            }
        }

        return NextResponse.json({
            success: true,
            sentViaTelegram,
            message: sentViaTelegram ? 'Xabar Telegram va platformaga yuborildi' : 'Xabar faqat platformaga yuborildi (Telegram ulanmagan)'
        });

    } catch (error: any) {
        console.error('[AdminMessage API Error]:', error);
        return NextResponse.json({ error: 'Ichki server xatosi' }, { status: 500 });
    }
}
