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

export async function GET() {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        const faqs = await prisma.fAQ.findMany({
            orderBy: { order: 'asc' }
        })
        return NextResponse.json({ success: true, faqs })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

export async function POST(req: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        const body = await req.json()
        const faq = await prisma.fAQ.create({
            data: {
                question: body.question,
                questionRu: body.questionRu,
                answer: body.answer,
                answerRu: body.answerRu,
                order: body.order || 0
            }
        })
        return NextResponse.json({ success: true, faq })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
