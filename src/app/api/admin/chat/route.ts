import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromSession } from '@/lib/auth/admin-auth'

export async function GET(req: NextRequest) {
    try {
        const admin = await getAdminFromSession()
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        // Fetch courses that have chats
        const coursesWithChats = await prisma.course.findMany({
            where: {
                courseChats: {
                    some: {}
                }
            },
            include: {
                courseChats: {
                    orderBy: { createdAt: 'asc' },
                    include: {
                        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } }
                    }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        // Map to a format suitable for the admin UI
        const structuredChats = coursesWithChats.map(course => ({
            id: course.id,
            title: course.title,
            messages: course.courseChats
        }));

        return NextResponse.json({ success: true, courses: structuredChats })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function POST(req: NextRequest) {
    try {
        const admin = await getAdminFromSession()
        if (!admin) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

        const body = await req.json();
        const { courseId, message } = body;

        if (!courseId || !message || message.trim().length === 0) {
            return NextResponse.json({ error: 'CourseId and message are required' }, { status: 400 });
        }

        // CourseChat.userId references User table, not AdminUser table.
        // Find or create a User record for this admin to send messages.
        let senderUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: admin.email || undefined },
                    { firstName: admin.displayName, role: { in: ['ADMIN', 'SUPER_ADMIN'] } },
                ],
            },
            select: { id: true },
        })

        if (!senderUser) {
            senderUser = await prisma.user.create({
                data: {
                    firstName: admin.displayName || admin.username,
                    email: admin.email || `${admin.username}@admin.local`,
                    role: 'ADMIN',
                    phone: '',
                    registrationSource: 'WEB',
                },
                select: { id: true },
            })
        }

        const chatMessage = await prisma.courseChat.create({
            data: {
                courseId,
                userId: senderUser.id,
                message: message.trim(),
                senderRole: 'ADMIN',
            },
            include: {
                user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } }
            }
        });

        return NextResponse.json({ success: true, message: chatMessage })

    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

