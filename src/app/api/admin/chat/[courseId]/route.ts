import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

async function getAdmin() {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return null;
    return verifyToken(adminSession);
}

/**
 * GET /api/admin/chat/[courseId] - Fetch history for a specific room
 * POST /api/admin/chat/[courseId] - Admin sends a message
 * DELETE /api/admin/chat/[courseId]?messageId=... - Admin deletes a message
 */

export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const admin = await getAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { courseId } = await params;

        const messages = await prisma.courseChat.findMany({
            where: { courseId },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        role: true
                    }
                }
            },
            orderBy: { createdAt: 'asc' },
            take: 200 // More history for admin
        });

        return NextResponse.json({ success: true, messages });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(
    req: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const admin = await getAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { courseId } = await params;
        const { message } = await req.json();

        if (!message) return NextResponse.json({ error: 'Message required' }, { status: 400 });

        // Admin might not have a record in the 'User' table if they are only in 'AdminUser'
        // But CourseChat requires userId. 
        // We'll look for a user with role ADMIN or use the admin's email to find/create a mirror user.

        let adminUser = await prisma.user.findFirst({
            where: { role: 'ADMIN' } // Fallback to first admin found or specific one
        });

        if (!adminUser) {
            return NextResponse.json({ error: 'No admin user found in database to represent sender' }, { status: 500 });
        }

        const newMessage = await prisma.courseChat.create({
            data: {
                courseId,
                userId: adminUser.id,
                message: ` тЯ║ Admin: ${message}`
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        role: true
                    }
                }
            }
        });

        return NextResponse.json({ success: true, message: newMessage });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ courseId: string }> }
) {
    try {
        const admin = await getAdmin();
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { courseId } = await params;
        const { searchParams } = new URL(req.url);
        const messageId = searchParams.get('messageId');

        if (!messageId) return NextResponse.json({ error: 'Message ID required' }, { status: 400 });

        await prisma.courseChat.delete({
            where: { id: messageId }
        });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
