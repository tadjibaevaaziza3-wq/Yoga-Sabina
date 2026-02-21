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

export async function GET(request: Request) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const status = searchParams.get('status')
        const format = searchParams.get('format')

        const where: any = {
            course: {
                productType: 'CONSULTATION'
            }
        }

        if (status) {
            where.consultationStatus = status
        }
        if (format) {
            where.course = {
                ...where.course,
                consultationFormat: format
            }
        }

        const consultations = await prisma.purchase.findMany({
            where,
            include: {
                user: {
                    include: {
                        profile: true
                    }
                },
                course: true
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        // Group by status
        const byStatus = consultations.reduce((acc, c) => {
            const status = c.consultationStatus || 'NEW'
            acc[status] = (acc[status] || 0) + 1
            return acc
        }, {} as Record<string, number>)

        return NextResponse.json({
            success: true,
            consultations,
            total: consultations.length,
            byStatus
        })
    } catch (error: any) {
        console.error('Error fetching consultations:', error)
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
