import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { ProductType } from '@prisma/client'

// GET /api/admin/consultations - Get all consultation purchases
export async function GET() {
    try {
        const purchases = await prisma.purchase.findMany({
            where: {
                course: {
                    productType: ProductType.CONSULTATION,
                },
            },
            include: {
                user: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true,
                        email: true,
                        phone: true,
                        telegramId: true,
                    },
                },
                course: {
                    select: {
                        id: true,
                        title: true,
                        consultationFormat: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        })

        // Calculate stats
        const stats = {
            total: purchases.length,
            revenue: purchases
                .filter(p => p.status === 'PAID')
                .reduce((sum, p) => sum + Number(p.amount), 0),
            byStatus: {
                new: purchases.filter(p => p.consultationStatus === 'NEW').length,
                confirmed: purchases.filter(p => p.consultationStatus === 'CONFIRMED').length,
                completed: purchases.filter(p => p.consultationStatus === 'COMPLETED').length,
                canceled: purchases.filter(p => p.consultationStatus === 'CANCELED').length,
            },
        }

        return NextResponse.json({ success: true, purchases, stats })
    } catch (error: any) {
        console.error('Get consultation purchases error:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
