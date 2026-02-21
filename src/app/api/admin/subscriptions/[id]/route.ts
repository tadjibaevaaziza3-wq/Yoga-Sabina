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
    const { id } = await params
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params
        const body = await request.json()
        const { durationDays, status } = body

        // Find existing subscription
        const existing = await prisma.subscription.findUnique({
            where: { id }
        })

        if (!existing) {
            return NextResponse.json({
                success: false,
                error: 'Subscription not found'
            }, { status: 404 })
        }

        const updateData: any = {}

        // If extending duration
        if (durationDays) {
            const newEndsAt = new Date(existing.endsAt)
            newEndsAt.setDate(newEndsAt.getDate() + parseInt(durationDays))
            updateData.endsAt = newEndsAt
        }

        // If changing status
        if (status) {
            updateData.status = status
        }

        const subscription = await prisma.subscription.update({
            where: { id },
            data: updateData,
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
            subscription,
            message: 'Subscription updated successfully'
        })
    } catch (error: any) {
        console.error('Error updating subscription:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { id } = await params

        // Instead of deleting, we'll cancel the subscription
        const subscription = await prisma.subscription.update({
            where: { id },
            data: {
                status: 'CANCELED'
            }
        })

        return NextResponse.json({
            success: true,
            message: 'Subscription canceled successfully'
        })
    } catch (error: any) {
        console.error('Error canceling subscription:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
