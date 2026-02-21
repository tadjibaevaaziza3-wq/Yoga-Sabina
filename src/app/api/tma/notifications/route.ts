import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function GET(request: Request) {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth_token')?.value;

    if (!token) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Fetch global alerts (Posts)
        const notifications = await prisma.post.findMany({
            where: {
                status: 'PUBLISHED',
                OR: [
                    { targetSegment: 'ALL' },
                    { targetSegment: 'SUBSCRIBERS' }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 20
        });

        return NextResponse.json({ success: true, notifications });
    } catch (err) {
        return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
    }
}
