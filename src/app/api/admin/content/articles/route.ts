import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ContentStatus } from "@prisma/client"
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
        const { title, content, coverImage, status, publishAt } = body

        const article = await prisma.article.create({
            data: {
                title, // Expecting JSON {uz: "", ru: ""}
                content,
                coverImage,
                status: status || ContentStatus.DRAFT,
                publishAt: publishAt ? new Date(publishAt) : null,
                // Generate simple slug from English or default title if needed
                slug: `article-${Date.now()}`
            }
        })

        return NextResponse.json(article)
    } catch (error) {
        return NextResponse.json({ error: "Failed to create article" }, { status: 500 })
    }
}

export async function GET(req: Request) {
    if (!await isAdmin()) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const statusParam = searchParams.get('status')

    const articles = await prisma.article.findMany({
        where: statusParam ? { status: statusParam as ContentStatus } : {},
        orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(articles)
}
