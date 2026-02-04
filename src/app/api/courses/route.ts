import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/courses - Get all active courses
export async function GET() {
    try {
        const courses = await prisma.course.findMany({
            where: {
                isActive: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        return NextResponse.json({ success: true, courses })
    } catch (error: any) {
        console.error('Get courses error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
