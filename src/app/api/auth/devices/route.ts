import { NextResponse, NextRequest } from 'next/server'
import { removeDevice, getUserDevices } from '@/lib/security/device-tracker'
import { verifyToken } from '@/lib/auth/server'
import { cookies } from 'next/headers'

/**
 * GET /api/auth/devices — List user's devices
 */
export async function GET() {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
        }

        const payload = verifyToken(token) as any
        if (!payload?.userId) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
        }

        const devices = await getUserDevices(payload.userId)
        return NextResponse.json({ success: true, devices, maxDevices: 3 })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}

/**
 * DELETE /api/auth/devices — Remove a device
 * Body: { deviceId: string }
 */
export async function DELETE(request: NextRequest) {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('auth_token')?.value
        if (!token) {
            return NextResponse.json({ success: false, error: 'Not authenticated' }, { status: 401 })
        }

        const payload = verifyToken(token) as any
        if (!payload?.userId) {
            return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 })
        }

        const body = await request.json()
        if (!body.deviceId) {
            return NextResponse.json({ success: false, error: 'deviceId is required' }, { status: 400 })
        }

        const removed = await removeDevice(payload.userId, body.deviceId)
        if (!removed) {
            return NextResponse.json({ success: false, error: 'Device not found' }, { status: 404 })
        }

        return NextResponse.json({ success: true, message: 'Device removed' })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
