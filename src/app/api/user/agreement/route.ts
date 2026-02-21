/**
 * NDA / Agreement Check API
 * 
 * GET  /api/user/agreement - Check if user has signed the NDA
 * POST /api/user/agreement - Record user's agreement acceptance
 */

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'
import { prisma } from '@/lib/prisma'

const CURRENT_NDA_VERSION = '1.0'

async function getCurrentUserId(): Promise<string | null> {
    const cookieStore = await cookies()
    const session = cookieStore.get('session')?.value || cookieStore.get('admin_session')?.value
    if (!session) return null
    const decoded = verifyToken(session)
    if (!decoded || typeof decoded === 'string') return null
    return (decoded as any).userId || null
}

/**
 * GET /api/user/agreement
 * Check if user has accepted the current NDA version
 */
export async function GET() {
    const userId = await getCurrentUserId()
    if (!userId) {
        return NextResponse.json({ signed: false, reason: 'not_authenticated' })
    }

    const agreement = await prisma.userAgreement.findFirst({
        where: {
            userId,
            version: CURRENT_NDA_VERSION,
        },
        orderBy: { acceptedAt: 'desc' },
    })

    return NextResponse.json({
        signed: !!agreement,
        version: CURRENT_NDA_VERSION,
        signedAt: agreement?.acceptedAt || null,
    })
}

/**
 * POST /api/user/agreement
 * Record that the user accepted the NDA
 */
export async function POST(request: NextRequest) {
    const userId = await getCurrentUserId()
    if (!userId) {
        return NextResponse.json(
            { success: false, error: 'Not authenticated' },
            { status: 401 }
        )
    }

    // Check if already signed
    const existing = await prisma.userAgreement.findFirst({
        where: { userId, version: CURRENT_NDA_VERSION },
    })

    if (existing) {
        return NextResponse.json({ success: true, alreadySigned: true })
    }

    // Get client info
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await prisma.userAgreement.create({
        data: {
            userId,
            version: CURRENT_NDA_VERSION,
            ip,
            userAgent,
        },
    })

    return NextResponse.json({ success: true }, { status: 201 })
}
