import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getLocalUser } from '@/lib/auth/server';

export async function POST(request: Request) {
    try {
        const user = await getLocalUser();
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }

        const { courseId, amount, type, screenshotUrl } = await request.json();

        if (!screenshotUrl) {
            return NextResponse.json({ success: false, error: 'Screenshot is required for manual payment' }, { status: 400 });
        }

        // Create a pending purchase with manual status
        const purchase = await prisma.purchase.create({
            data: {
                userId: user.id,
                courseId: courseId,
                amount: amount,
                status: 'PENDING',
                provider: 'BANK_TRANSFER',
                screenshotUrl: screenshotUrl,
                verifiedByAdmin: false
            }
        });

        return NextResponse.json({ success: true, purchaseId: purchase.id });

    } catch (e: any) {
        console.error('Manual payment error:', e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
