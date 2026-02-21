import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ConsultationStatus } from '@prisma/client'
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/server';

interface RouteParams {
    params: Promise<{ id: string }>
}

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

// PATCH /api/admin/consultations/[id]/status - Update consultation status
export async function PATCH(request: Request, { params }: RouteParams) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
        }
        const { id } = await params
        const { status } = await request.json()

        // Validate status
        if (!['NEW', 'CONFIRMED', 'COMPLETED', 'CANCELED'].includes(status)) {
            return NextResponse.json({ success: false, error: 'Invalid status' }, { status: 400 })
        }

        const purchase = await prisma.purchase.update({
            where: { id },
            data: {
                consultationStatus: status as ConsultationStatus,
            },
            include: {
                user: {
                    select: {
                        firstName: true,
                        lastName: true,
                        email: true,
                    },
                },
                course: {
                    select: {
                        title: true,
                    },
                },
            },
        })

        return NextResponse.json({ success: true, purchase })
    } catch (error: any) {
        console.error('Update consultation status error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
