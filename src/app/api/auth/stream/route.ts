import { NextResponse } from 'next/server'
import { getLocalUser } from '@/lib/auth/server'
import { reserveStream, releaseStream } from '@/lib/security/device-management'

/**
 * POST /api/auth/stream/reserve
 * Body: { deviceId }
 */
export async function POST(req: Request) {
    try {
        const user = await getLocalUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { deviceId } = body

        if (!deviceId) {
            return NextResponse.json({ success: false, error: 'Device ID required' }, { status: 400 })
        }

        const success = await reserveStream(user.id, deviceId)

        if (!success) {
            return NextResponse.json({
                success: false,
                error: 'STREAM_BUSY',
                message: 'Your account is already streaming on another device.'
            }, { status: 409 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/auth/stream/release
 */
export async function DELETE(req: Request) {
    try {
        const user = await getLocalUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        await releaseStream(user.id)
        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

/**
 * PATCH /api/auth/stream/heartbeat
 * Used to keep the stream alive
 */
export async function PATCH(req: Request) {
    try {
        const user = await getLocalUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { deviceId } = body

        const success = await reserveStream(user.id, deviceId) // reuse reserve logic to update timestamp
        return NextResponse.json({ success })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
