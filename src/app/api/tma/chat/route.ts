import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const courseId = searchParams.get('courseId');

    try {
        const messages = await prisma.chatMessage.findMany({
            where: { courseId: (courseId || null) as any },
            include: { user: { select: { firstName: true, telegramId: true, role: true, avatar: true } } },
            orderBy: { createdAt: 'asc' },
            take: 100
        });

        return NextResponse.json({ success: true, messages });
    } catch (err) {
        return NextResponse.json({ success: false, error: "Failed to fetch messages" }, { status: 500 });
    }
}

export async function POST(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        const body = await request.json();
        const { courseId, text } = body;

        if (!text) {
            return NextResponse.json({ success: false, error: "Xabar matni yo'q" }, { status: 400 });
        }

        const chatMessage = await prisma.chatMessage.create({
            data: {
                userId: token,
                courseId: courseId || null,
                message: text
            },
            include: { user: { select: { firstName: true, telegramId: true, role: true, avatar: true } } }
        });

        return NextResponse.json({ success: true, message: chatMessage });
    } catch (err) {
        return NextResponse.json({ success: false, error: "Failed to send message" }, { status: 500 });
    }
}
