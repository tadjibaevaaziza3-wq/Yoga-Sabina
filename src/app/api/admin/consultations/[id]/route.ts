import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

import { verifyToken } from '@/lib/auth/server'

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { consultationStatus } = body

        if (!consultationStatus) {
            return NextResponse.json({
                success: false,
                error: 'Missing required field: consultationStatus'
            }, { status: 400 })
        }

        const consultation = await prisma.purchase.update({
            where: { id },
            data: { consultationStatus },
            include: {
                user: {
                    include: {
                        profile: true
                    }
                },
                course: true
            }
        })

        return NextResponse.json({
            success: true,
            consultation,
            message: 'Consultation status updated successfully'
        })
    } catch (error: any) {
        console.error('Error updating consultation:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
