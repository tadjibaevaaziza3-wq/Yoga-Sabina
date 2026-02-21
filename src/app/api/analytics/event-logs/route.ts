import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocalUser } from '@/lib/auth/server';

export async function POST(request: NextRequest) {
    try {
        const user = await getLocalUser();
        const { event, metadata } = await request.json();

        await prisma.eventLog.create({
            data: {
                event,
                metadata: metadata || {},
                userId: user?.id || null,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('Analytics track error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
