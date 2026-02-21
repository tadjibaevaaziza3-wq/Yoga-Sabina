import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ContentStatus, PostType, Region } from "@prisma/client"
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

export async function POST(req: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
        }
        const body = await req.json()
        const { type, content, mediaUrl, ctaLink, ctaText, targetSegment, region, status } = body

        const post = await prisma.post.create({
            data: {
                type: type || PostType.TEXT,
                content,
                mediaUrl,
                ctaLink,
                ctaText,
                targetSegment: targetSegment || "ALL",
                region: region || Region.GLOBAL,
                status: status || ContentStatus.DRAFT
            }
        })

        return NextResponse.json(post)
    } catch (error) {
        console.error("Create Post Error:", error)
        return NextResponse.json({ error: "Failed to create post" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    const posts = await prisma.post.findMany({
        orderBy: { createdAt: 'desc' }
    })
    return NextResponse.json(posts)
}
