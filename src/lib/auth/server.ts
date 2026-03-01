import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

function getAuthSecret(): string {
    const secret = process.env.AUTH_SECRET
    if (!secret) {
        throw new Error('FATAL: AUTH_SECRET environment variable is not set. Server cannot start without it.')
    }
    return secret
}

const AUTH_SECRET: string = getAuthSecret()

export function generateToken(userId: string) {
    const data = `${userId}:${Date.now()}`
    const signature = crypto.createHmac('sha256', AUTH_SECRET).update(data).digest('hex')
    return Buffer.from(`${data}:${signature}`).toString('base64')
}

export function verifyToken(token: string): string | null {
    try {
        const decoded = Buffer.from(token, 'base64').toString()
        const [payload, timestamp, signature] = decoded.split(':')

        if (!payload || !timestamp || !signature) return null

        const expectedSignature = crypto
            .createHmac('sha256', AUTH_SECRET)
            .update(`${payload}:${timestamp}`)
            .digest('hex')

        if (signature !== expectedSignature) {
            console.error('Invalid token signature')
            return null
        }

        // Check if token is too old (7 days for users)
        const tokenAge = Date.now() - parseInt(timestamp)
        if (tokenAge > 7 * 24 * 60 * 60 * 1000) {
            console.error('Token expired')
            return null
        }

        return payload
    } catch (e) {
        console.error('Error verifying token:', e)
        return null
    }
}

export async function getLocalUser() {
    try {
        const cookieStore = await cookies()
        const authToken = cookieStore.get('auth_token')?.value

        if (!authToken) return null

        const userId = verifyToken(authToken)
        if (!userId) return null

        // Validate basic CUID format before passing to Prisma to prevent crash
        if (typeof userId !== 'string' || userId.length < 20 || !userId.startsWith('c')) {
            console.error('Invalid User ID format from token:', userId)
            return null
        }

        let user = null
        try {
            user = await prisma.user.findUnique({
                where: { id: userId },
                select: {
                    id: true,
                    userNumber: true,
                    email: true,
                    phone: true,
                    firstName: true,
                    lastName: true,
                    role: true,
                    telegramUsername: true
                }
            })
        } catch (e) {
            console.error('Invalid User ID or PRISMA Error during getLocalUser:', e)
            return null
        }

        return user
    } catch (error) {
        console.error('Error getting local user:', error)
        return null
    }
}

export async function isAdmin(): Promise<boolean> {
    try {
        // First try DB-backed admin auth
        const { getAdminFromSession } = await import('./admin-auth')
        const admin = await getAdminFromSession()
        if (admin) return true

        // Fallback: legacy token check
        const cookieStore = await cookies();
        const adminSession = cookieStore.get('admin_session')?.value;
        if (!adminSession) return false;
        return !!verifyToken(adminSession);
    } catch {
        return false
    }
}
