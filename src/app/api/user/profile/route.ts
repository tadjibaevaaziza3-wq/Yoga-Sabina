/**
 * User Profile API
 * 
 * GET    /api/user/profile - Get current profile
 * PATCH  /api/user/profile - Update profile details (firstName, avatar)
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLocalUser } from '@/lib/auth/server'

export async function GET(request: NextRequest) {
    const user = await getLocalUser()
    if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        include: { profile: true }
    })

    return NextResponse.json({ success: true, user: fullUser })
}

export async function PATCH(request: NextRequest) {
    const user = await getLocalUser()
    if (!user) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { firstName, lastName, avatar } = body

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                firstName: firstName !== undefined ? firstName : undefined,
                lastName: lastName !== undefined ? lastName : undefined,
                avatar: avatar !== undefined ? avatar : undefined,
            }
        })

        // Also update profile name if it exists to keep in sync
        if (firstName) {
            await prisma.profile.update({
                where: { userId: user.id },
                data: { name: `${firstName} ${lastName || ''}`.trim() }
            })
        }

        return NextResponse.json({ success: true, user: updatedUser })
    } catch (error) {
        console.error('Profile Update Error:', error)
        return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
    }
}
