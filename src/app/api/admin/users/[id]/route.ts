import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'
import bcrypt from 'bcryptjs'

async function getAdminId(): Promise<string | null> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return null;
    const decoded = verifyToken(adminSession);
    return decoded ? (decoded as any).id || (decoded as any).sub || adminSession : null;
}

// GET /api/admin/users/[id] — Get single user details
export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const adminId = await getAdminId()
    if (!adminId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                userNumber: true,
                firstName: true,
                lastName: true,
                email: true,
                phone: true,
                telegramId: true,
                telegramUsername: true,
                role: true,
                isBlocked: true,
                forcePasswordChange: true,
                createdAt: true,
                updatedAt: true,
                registrationSource: true,
                region: true,
                language: true,
                profile: {
                    select: {
                        gender: true,
                        birthDate: true,
                        healthIssues: true,
                    }
                },
                subscriptions: {
                    select: { id: true, status: true, startsAt: true, endsAt: true, courseId: true },
                    orderBy: { createdAt: 'desc' as const },
                },
                purchases: {
                    select: { id: true, amount: true, status: true, createdAt: true },
                    orderBy: { createdAt: 'desc' as const },
                },
            },
        })

        if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

        return NextResponse.json({ success: true, user })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// PATCH /api/admin/users/[id] — Edit user
export async function PATCH(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const adminId = await getAdminId()
    if (!adminId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params
    const body = await request.json()

    try {
        const updateData: any = {}
        const actions: string[] = []

        if (body.firstName !== undefined) updateData.firstName = body.firstName
        if (body.lastName !== undefined) updateData.lastName = body.lastName
        if (body.email !== undefined) updateData.email = body.email || null
        if (body.phone !== undefined) updateData.phone = body.phone || null
        if (body.role !== undefined) {
            updateData.role = body.role
            actions.push('ROLE_CHANGED')
        }

        // Block / Unblock
        if (body.isBlocked !== undefined) {
            updateData.isBlocked = body.isBlocked
            actions.push(body.isBlocked ? 'USER_BLOCKED' : 'USER_UNBLOCKED')
        }

        // Password reset by admin
        if (body.newPassword) {
            updateData.password = await bcrypt.hash(body.newPassword, 12)
            updateData.forcePasswordChange = true
            actions.push('PASSWORD_RESET')
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        })

        // Log all admin actions
        for (const action of actions) {
            await prisma.adminActionLog.create({
                data: {
                    adminId,
                    action,
                    entity: 'User',
                    entityId: id,
                    details: action === 'ROLE_CHANGED'
                        ? { message: `Role changed to ${body.role}` }
                        : action === 'PASSWORD_RESET'
                            ? { message: 'Password reset by admin' }
                            : undefined,
                },
            })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

// DELETE /api/admin/users/[id] — Delete user
export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const adminId = await getAdminId()
    if (!adminId) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })

    const { id } = await params

    try {
        const user = await prisma.user.findUnique({ where: { id }, select: { firstName: true, lastName: true } })
        if (!user) return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 })

        await prisma.user.delete({ where: { id } })

        await prisma.adminActionLog.create({
            data: {
                adminId,
                action: 'USER_DELETED',
                entity: 'User',
                entityId: id,
                details: { message: `Deleted user: ${user.firstName || ''} ${user.lastName || ''}`.trim() },
            },
        })

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
