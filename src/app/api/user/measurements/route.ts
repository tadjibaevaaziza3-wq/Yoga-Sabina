/**
 * Body Measurements API
 * 
 * GET  /api/user/measurements - Get all measurements for current user
 * POST /api/user/measurements - Add or update a daily measurement
 */

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getLocalUser } from '@/lib/auth/server'

export async function GET() {
    const user = await getLocalUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const measurements = await prisma.bodyMeasurement.findMany({
            where: { userId: user.id },
            orderBy: { date: 'asc' },
            select: {
                id: true,
                date: true,
                weight: true,
                height: true,
                belly: true,
                hip: true,
                chest: true,
                waist: true,
                notes: true,
                mood: true,
                energy: true,
            }
        })

        return NextResponse.json({
            success: true,
            measurements: measurements.map(m => ({
                ...m,
                date: m.date.toISOString().split('T')[0],
            }))
        })
    } catch (error) {
        console.error('Measurements GET Error:', error)
        return NextResponse.json({ error: 'Failed to fetch' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const user = await getLocalUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const body = await request.json()
        const { weight, height, belly, hip, chest, waist, notes, date, mood, energy } = body

        // Use provided date or today
        const measureDate = date ? new Date(date) : new Date()
        measureDate.setHours(0, 0, 0, 0)

        const measurement = await prisma.bodyMeasurement.upsert({
            where: {
                userId_date: {
                    userId: user.id,
                    date: measureDate,
                }
            },
            update: {
                weight: weight !== undefined ? weight : undefined,
                height: height !== undefined ? height : undefined,
                belly: belly !== undefined ? belly : undefined,
                hip: hip !== undefined ? hip : undefined,
                chest: chest !== undefined ? chest : undefined,
                waist: waist !== undefined ? waist : undefined,
                notes: notes !== undefined ? notes : undefined,
                mood: mood !== undefined ? mood : undefined,
                energy: energy !== undefined ? energy : undefined,
            },
            create: {
                userId: user.id,
                date: measureDate,
                weight, height, belly, hip, chest, waist, notes, mood, energy,
            }
        })

        return NextResponse.json({ success: true, measurement })
    } catch (error) {
        console.error('Measurements POST Error:', error)
        return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }
}
