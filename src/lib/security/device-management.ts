import { prisma } from '@/lib/prisma'

export interface DeviceInfo {
    deviceId: string
    userAgent?: string
    ipAddress?: string
}

/**
 * Checks if a device is registered for a user.
 * If the device limit is reached (2), it returns false.
 */
export async function checkDeviceBinding(userId: string, deviceInfo: DeviceInfo) {
    const { deviceId, userAgent, ipAddress } = deviceInfo

    // Check if this device is already registered
    const existingDevice = await prisma.userDevice.findUnique({
        where: {
            userId_deviceId: {
                userId,
                deviceId
            }
        }
    })

    if (existingDevice) {
        // Update last seen
        await prisma.userDevice.update({
            where: { id: existingDevice.id },
            data: { lastSeen: new Date(), ipAddress, userAgent }
        })
        return true
    }

    // Check total devices for user
    const deviceCount = await prisma.userDevice.count({
        where: { userId }
    })

    if (deviceCount >= 2) {
        return false // Limit reached
    }

    // Register new device
    await prisma.userDevice.create({
        data: {
            userId,
            deviceId,
            userAgent,
            ipAddress
        }
    })

    return true
}

/**
 * Reserves a stream for a user on a specific device.
 */
export async function reserveStream(userId: string, deviceId: string) {
    const existingStream = await prisma.activeStream.findUnique({
        where: { userId }
    })

    if (existingStream) {
        // If it's the same device, allow "refresh"
        if (existingStream.deviceId === deviceId) {
            await prisma.activeStream.update({
                where: { userId },
                data: { startedAt: new Date() }
            })
            return true
        }

        // LAST-IN-WINS: Automatically release old stream if a new device starts watching
        // This prevents account sharing while allowing legitimate users to switch devices easily
        await prisma.activeStream.update({
            where: { userId },
            data: { deviceId, startedAt: new Date() }
        })
        return true
    }

    // Create new stream
    await prisma.activeStream.create({
        data: {
            userId,
            deviceId
        }
    })

    return true
}

/**
 * Releases a stream for a user.
 */
export async function releaseStream(userId: string) {
    await prisma.activeStream.deleteMany({
        where: { userId }
    })
}
