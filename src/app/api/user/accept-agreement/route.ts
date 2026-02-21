import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { z } from 'zod';
import { verifyToken } from '@/lib/auth/server';

const requestSchema = z.object({
    version: z.string().min(1),
});

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const userId = token ? verifyToken(token) : null;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const validation = requestSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: 'Invalid request', details: validation.error.issues }, { status: 400 });
        }

        const { version } = validation.data;
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || null;
        const userAgent = request.headers.get('user-agent');

        const existing = await prisma.userAgreement.findUnique({
            where: {
                userId_version: {
                    userId,
                    version,
                },
            },
        });

        if (existing) {
            return NextResponse.json({
                success: true,
                acceptedAt: existing.acceptedAt.toISOString(),
                message: 'Agreement already accepted',
            });
        }

        const agreement = await prisma.userAgreement.create({
            data: {
                userId,
                version,
                ip,
                userAgent,
            },
        });

        return NextResponse.json({
            success: true,
            acceptedAt: agreement.acceptedAt.toISOString(),
        });

    } catch (error: any) {
        console.error('Error accepting agreement:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        const userId = token ? verifyToken(token) : null;

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const version = process.env.USER_AGREEMENT_VERSION || '1.0';

        const agreement = await prisma.userAgreement.findUnique({
            where: {
                userId_version: {
                    userId,
                    version,
                },
            },
        });

        return NextResponse.json({
            hasAccepted: !!agreement,
            version,
            acceptedAt: agreement?.acceptedAt.toISOString() || null,
        });

    } catch (error: any) {
        console.error('Error checking agreement:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
