/**
 * Session Limiter
 * 
 * Enforces max 2 concurrent sessions per user.
 * Tracks devices via UserDevice model and blocks new sessions
 * when limit is exceeded.
 */

import { prisma } from '@/lib/prisma'
import { headers } from 'next/headers'

const MAX_SESSIONS = 2
const SESSION_TIMEOUT_HOURS = 24

/**
 * Generate a device fingerprint from request headers
 */
function getDeviceFingerprint(userAgent: string, ip: string): string {
    // Simple fingerprint: hash of user-agent + IP
    const raw = `${userAgent}|${ip}`
    let hash = 0
    for (let i = 0; i < raw.length; i++) {
        const char = raw.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // Convert to 32-bit integer
    }
    return `dev_${Math.abs(hash).toString(36)}`
}

/**
 * Check and register a user session.
 * Returns { allowed: true } if within limit, or { allowed: false, ...details } if blocked.
 */
export async function checkSessionLimit(userId: string): Promise<{
    allowed: boolean
    activeDevices?: number
    maxDevices?: number
    message?: string
}> {
    try {
        const headersList = await headers()
        const userAgent = headersList.get('user-agent') || 'unknown'
        const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
        const deviceId = getDeviceFingerprint(userAgent, ip)

        // Clean up stale sessions (older than SESSION_TIMEOUT_HOURS)
        const cutoff = new Date(Date.now() - SESSION_TIMEOUT_HOURS * 60 * 60 * 1000)
        await prisma.userDevice.deleteMany({
            where: {
                userId,
                lastSeen: { lt: cutoff }
            }
        })

        // Upsert current device (updates lastSeen if already exists)
        await prisma.userDevice.upsert({
            where: {
                userId_deviceId: { userId, deviceId }
            },
            update: {
                lastSeen: new Date(),
                userAgent,
                ipAddress: ip,
            },
            create: {
                userId,
                deviceId,
                userAgent,
                ipAddress: ip,
            }
        })

        // Count active devices
        const activeDevices = await prisma.userDevice.count({
            where: { userId }
        })

        if (activeDevices > MAX_SESSIONS) {
            // Over limit — remove the OLDEST device that isn't the current one
            const oldestDevice = await prisma.userDevice.findFirst({
                where: {
                    userId,
                    deviceId: { not: deviceId }
                },
                orderBy: { lastSeen: 'asc' }
            })

            if (oldestDevice) {
                await prisma.userDevice.delete({
                    where: { id: oldestDevice.id }
                })
            }
        }

        // Re-count after cleanup
        const finalCount = await prisma.userDevice.count({
            where: { userId }
        })

        return {
            allowed: finalCount <= MAX_SESSIONS,
            activeDevices: finalCount,
            maxDevices: MAX_SESSIONS,
        }
    } catch (error) {
        console.error('Session limit check error:', error)
        // Fail open — don't block user if session tracking fails
        return { allowed: true }
    }
}

/**
 * Remove a device session (e.g., on logout)
 */
export async function removeSession(userId: string): Promise<void> {
    try {
        const headersList = await headers()
        const userAgent = headersList.get('user-agent') || 'unknown'
        const ip = headersList.get('x-forwarded-for') || headersList.get('x-real-ip') || 'unknown'
        const deviceId = getDeviceFingerprint(userAgent, ip)

        await prisma.userDevice.deleteMany({
            where: { userId, deviceId }
        })
    } catch (error) {
        console.error('Remove session error:', error)
    }
}
