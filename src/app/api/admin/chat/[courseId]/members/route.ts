/**
 * Admin Chat Members API — manage members and bans per course chat
 * 
 * GET  /api/admin/chat/[courseId]/members → list members with ban status
 * POST /api/admin/chat/[courseId]/members → ban/unban user
 *   body: { userId, action: 'ban'|'unban', reason? }
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAdminFromSession } from '@/lib/auth/admin-auth';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    const admin = await getAdminFromSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { courseId } = await params;

    // Get all users who have sent messages in this course chat
    const chatUsers = await prisma.courseChat.findMany({
        where: { courseId, isDeleted: false },
        select: { userId: true },
        distinct: ['userId'],
    });

    const userIds = chatUsers.map(c => c.userId);

    // Get user details + ban status
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            telegramUsername: true,
            telegramPhotoUrl: true,
            role: true,
        },
    });

    // Get member records (for ban info)
    const members = await prisma.courseChatMember.findMany({
        where: { courseId },
    });

    const memberMap = new Map(members.map(m => [m.userId, m]));

    const result = users.map(user => {
        const member = memberMap.get(user.id);
        return {
            ...user,
            isBanned: member?.isBanned || false,
            banReason: member?.banReason || null,
            bannedAt: member?.bannedAt || null,
        };
    });

    return NextResponse.json({ success: true, members: result });
}

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    const admin = await getAdminFromSession();
    if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { courseId } = await params;
    const { userId, action, reason } = await request.json();

    if (!userId || !['ban', 'unban'].includes(action)) {
        return NextResponse.json({ error: 'userId and action (ban|unban) required' }, { status: 400 });
    }

    if (action === 'ban') {
        await prisma.courseChatMember.upsert({
            where: { courseId_userId: { courseId, userId } },
            create: {
                courseId,
                userId,
                isBanned: true,
                banReason: reason || null,
                bannedAt: new Date(),
                bannedBy: admin.id,
            },
            update: {
                isBanned: true,
                banReason: reason || null,
                bannedAt: new Date(),
                bannedBy: admin.id,
            },
        });

        return NextResponse.json({ success: true, message: 'User banned from chat' });
    }

    if (action === 'unban') {
        await prisma.courseChatMember.upsert({
            where: { courseId_userId: { courseId, userId } },
            create: {
                courseId,
                userId,
                isBanned: false,
            },
            update: {
                isBanned: false,
                banReason: null,
                bannedAt: null,
                bannedBy: null,
            },
        });

        return NextResponse.json({ success: true, message: 'User unbanned from chat' });
    }

    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
