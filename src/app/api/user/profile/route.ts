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
        const { firstName, lastName, avatar, gender, birthDate } = body

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                firstName: firstName !== undefined ? firstName : undefined,
                lastName: lastName !== undefined ? lastName : undefined,
                avatar: avatar !== undefined ? avatar : undefined,
            }
        })

        // Build profile update data
        const profileData: any = {}
        if (firstName) profileData.name = `${firstName} ${lastName || ''}`.trim()
        if (gender !== undefined) profileData.gender = gender
        if (birthDate !== undefined) profileData.birthDate = birthDate ? new Date(birthDate) : null

        // Update profile if there's anything to update
        if (Object.keys(profileData).length > 0) {
            await prisma.profile.upsert({
                where: { userId: user.id },
                update: profileData,
                create: { userId: user.id, ...profileData }
            })
        }

        return NextResponse.json({ success: true, user: updatedUser })
    } catch (error) {
        console.error('Profile Update Error:', error)
        return NextResponse.json({ success: false, error: 'Failed to update profile' }, { status: 500 })
    }
}
