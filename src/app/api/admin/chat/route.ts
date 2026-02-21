import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

export async function GET(req: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

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
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const cookieStore = await cookies();
        const adminSession = cookieStore.get('admin_session')?.value;
        const adminUserId = verifyToken(adminSession!);

        const body = await req.json();
        const { courseId, message } = body;

        if (!courseId || !message || message.trim().length === 0) {
            return NextResponse.json({ error: 'CourseId and message are required' }, { status: 400 });
        }

        const chatMessage = await prisma.courseChat.create({
            data: {
                courseId,
                userId: adminUserId!,
                message: message.trim()
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
