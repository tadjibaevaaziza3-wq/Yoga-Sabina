import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

interface RouteParams {
    params: Promise<{ id: string }>
}

// GET /api/consultations/[id] - Get consultation details
export async function GET(request: Request, { params }: RouteParams) {
    try {
        const { id } = await params

        const consultation = await prisma.course.findUnique({
            where: { id },
        })

        if (!consultation) {
            return NextResponse.json({ success: false, error: 'Consultation not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, consultation })
    } catch (error: any) {
        console.error('Get consultation details error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
