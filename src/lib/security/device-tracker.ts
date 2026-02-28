/**
 * Device Security Utilities
 * 
 * Handles device fingerprinting, tracking, and fraud detection.
 * Enforces max 3 devices per user across the entire platform.
 */

import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const MAX_DEVICES = 3;
const FRAUD_THRESHOLD_ATTEMPTS = 5;
const FRAUD_WINDOW_HOURS = 24;

/**
 * Generate a device fingerprint from request info
 */
export function generateFingerprint(userAgent: string, extra?: string): string {
    const raw = `${userAgent}|${extra || 'default'}`;
    return crypto.createHash('sha256').update(raw).digest('hex').substring(0, 32);
}

/**
 * Parse user agent into a friendly device name
 */
export function parseDeviceName(userAgent: string): string {
    if (!userAgent) return 'Unknown Device';

    let browser = 'Browser';
    let os = 'Device';

    // Detect browser
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) browser = 'Chrome';
    else if (userAgent.includes('Firefox')) browser = 'Firefox';
    else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) browser = 'Safari';
    else if (userAgent.includes('Edg')) browser = 'Edge';
    else if (userAgent.includes('Opera') || userAgent.includes('OPR')) browser = 'Opera';

    // Detect OS
    if (userAgent.includes('Windows')) os = 'Windows';
    else if (userAgent.includes('Mac OS')) os = 'macOS';
    else if (userAgent.includes('iPhone')) os = 'iPhone';
    else if (userAgent.includes('iPad')) os = 'iPad';
    else if (userAgent.includes('Android')) os = 'Android';
    else if (userAgent.includes('Linux')) os = 'Linux';

    return `${browser} on ${os}`;
}

export interface DeviceCheckResult {
    allowed: boolean;
    deviceId: string;
    deviceName: string;
    reason?: string;
    currentDevices?: Array<{
        id: string;
        deviceName: string;
        lastSeen: Date;
        createdAt: Date;
    }>;
    fraudAlert?: boolean;
}

/**
 * Check and register device for a user.
 * Returns whether the login is allowed.
 */
export async function checkAndRegisterDevice(
    userId: string,
    userAgent: string,
    ipAddress: string,
    extraFingerprint?: string
): Promise<DeviceCheckResult> {
    const fingerprint = generateFingerprint(userAgent, extraFingerprint);
    const deviceName = parseDeviceName(userAgent);

    // Check if this device already exists for this user
    const existingDevice = await prisma.userDevice.findUnique({
        where: { userId_deviceId: { userId, deviceId: fingerprint } }
    });

    if (existingDevice) {
        // Known device — update lastSeen and allow
        if (existingDevice.isBlocked) {
            return { allowed: false, deviceId: fingerprint, deviceName, reason: 'DEVICE_BLOCKED' };
        }
        await prisma.userDevice.update({
            where: { id: existingDevice.id },
            data: { lastSeen: new Date(), ipAddress, deviceName }
        });
        return { allowed: true, deviceId: fingerprint, deviceName };
    }

    // New device — check how many devices the user has
    const deviceCount = await prisma.userDevice.count({ where: { userId } });

    if (deviceCount >= MAX_DEVICES) {
        // Get current devices for display
        const currentDevices = await prisma.userDevice.findMany({
            where: { userId },
            select: { id: true, deviceName: true, lastSeen: true, createdAt: true },
            orderBy: { lastSeen: 'desc' }
        });

        // Check for fraud (too many attempts in 24h)
        let fraudAlert = false;
        // Count recent unique device attempts via event log
        try {
            const recentAttempts = await prisma.eventLog.count({
                where: {
                    userId,
                    eventType: 'DEVICE_LIMIT_EXCEEDED',
                    createdAt: { gte: new Date(Date.now() - FRAUD_WINDOW_HOURS * 60 * 60 * 1000) }
                }
            });
            if (recentAttempts >= FRAUD_THRESHOLD_ATTEMPTS) {
                fraudAlert = true;
                // Auto-block the user
                await prisma.user.update({
                    where: { id: userId },
                    data: { isBlocked: true }
                });
            }
        } catch {
            // EventLog may not have this type yet
        }

        // Log the attempt
        try {
            await prisma.eventLog.create({
                data: {
                    userId,
                    eventType: 'DEVICE_LIMIT_EXCEEDED',
                    metadata: { fingerprint, deviceName, ipAddress, deviceCount }
                }
            });
        } catch {
            // Non-critical
        }

        return {
            allowed: false,
            deviceId: fingerprint,
            deviceName,
            reason: 'DEVICE_LIMIT_EXCEEDED',
            currentDevices,
            fraudAlert
        };
    }

    // Register new device
    await prisma.userDevice.create({
        data: { userId, deviceId: fingerprint, deviceName, userAgent, ipAddress }
    });

    return { allowed: true, deviceId: fingerprint, deviceName };
}

/**
 * Remove a device from a user's list
 */
export async function removeDevice(userId: string, deviceDbId: string): Promise<boolean> {
    try {
        await prisma.userDevice.delete({
            where: { id: deviceDbId, userId }
        });
        return true;
    } catch {
        return false;
    }
}

/**
 * Get all devices for a user
 */
export async function getUserDevices(userId: string) {
    return prisma.userDevice.findMany({
        where: { userId },
        orderBy: { lastSeen: 'desc' },
        select: {
            id: true,
            deviceId: true,
            deviceName: true,
            userAgent: true,
            ipAddress: true,
            isBlocked: true,
            lastSeen: true,
            createdAt: true
        }
    });
}
