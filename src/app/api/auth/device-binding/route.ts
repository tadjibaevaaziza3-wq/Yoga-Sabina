import { NextResponse } from 'next/server'
import { getLocalUser } from '@/lib/auth/server'
import { checkDeviceBinding } from '@/lib/security/device-management'

export async function POST(req: Request) {
    try {
        const user = await getLocalUser()
        if (!user) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }

        const body = await req.json()
        const { deviceId, userAgent, ipAddress } = body

        if (!deviceId) {
            return NextResponse.json({ success: false, error: 'Device ID required' }, { status: 400 })
        }

        const allowed = await checkDeviceBinding(user.id, {
            deviceId,
            userAgent,
            ipAddress: ipAddress || req.headers.get('x-forwarded-for') || 'unknown'
        })

        if (!allowed) {
            return NextResponse.json({
                success: false,
                error: 'DEVICE_LIMIT_REACHED',
                message: 'You have reached the maximum number of registered devices (2).'
            }, { status: 403 })
        }

        return NextResponse.json({ success: true })
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }
}
