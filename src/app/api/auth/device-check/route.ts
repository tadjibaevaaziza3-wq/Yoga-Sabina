import { NextResponse, NextRequest } from 'next/server'
import { checkAndRegisterDevice } from '@/lib/security/device-tracker'
import { verifyToken } from '@/lib/auth/server'
import { cookies } from 'next/headers'

/**
 * POST /api/auth/device-check
 * 
 * Called after successful login to verify device limit.
 * Body: { fingerprint?: string }
 */
export async function POST(request: NextRequest) {
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

        const body = await request.json().catch(() => ({}))
        const userAgent = request.headers.get('user-agent') || 'Unknown'
        const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'

        const result = await checkAndRegisterDevice(
            payload.userId,
            userAgent,
            ip,
            body.fingerprint // additional browser fingerprint data
        )

        if (!result.allowed) {
            return NextResponse.json({
                success: false,
                error: result.reason === 'DEVICE_BLOCKED'
                    ? 'This device has been blocked. Contact admin.'
                    : 'Device limit exceeded. You can use maximum 3 devices.',
                reason: result.reason,
                currentDevices: result.currentDevices,
                fraudAlert: result.fraudAlert,
                maxDevices: 3
            }, { status: 403 })
        }

        return NextResponse.json({
            success: true,
            device: {
                id: result.deviceId,
                name: result.deviceName
            }
        })
    } catch (error: any) {
        return NextResponse.json(
            { success: false, error: error.message || 'Device check failed' },
            { status: 500 }
        )
    }
}
