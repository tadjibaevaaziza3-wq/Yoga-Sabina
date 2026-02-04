import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProductType } from '@prisma/client'

// GET /api/consultations - Get all active consultations
export async function GET() {
    try {
        const consultations = await prisma.course.findMany({
            where: {
                productType: ProductType.CONSULTATION,
                isActive: true,
            },
            orderBy: {
                price: 'asc', // Online first (cheaper)
            },
        })

        return NextResponse.json({ success: true, consultations })
    } catch (error: any) {
        console.error('Get consultations error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
