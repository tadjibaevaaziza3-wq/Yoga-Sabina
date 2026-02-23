import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { verifyToken, generateToken } from './server'
import { NextResponse } from 'next/server'
import type { AdminUser, AdminRole } from '@prisma/client'

// ── All configurable permissions ──

export const ALL_PERMISSIONS = [
    'users.view', 'users.edit', 'users.delete', 'users.create',
    'subscriptions.view', 'subscriptions.grant', 'subscriptions.manage',
    'courses.view', 'courses.create', 'courses.edit', 'courses.delete',
    'payments.view', 'payments.verify',
    'leads.view', 'leads.message',
    'analytics.view', 'analytics.export',
    'automation.view', 'automation.manage',
    'messages.send', 'messages.broadcast',
    'settings.view', 'settings.edit',
    'logs.view',
] as const

export type Permission = typeof ALL_PERMISSIONS[number]

// ── Permission groups for UI display ──

export const PERMISSION_GROUPS = {
    'Users': ['users.view', 'users.edit', 'users.delete', 'users.create'],
    'Subscriptions': ['subscriptions.view', 'subscriptions.grant', 'subscriptions.manage'],
    'Courses': ['courses.view', 'courses.create', 'courses.edit', 'courses.delete'],
    'Payments': ['payments.view', 'payments.verify'],
    'Leads': ['leads.view', 'leads.message'],
    'Analytics': ['analytics.view', 'analytics.export'],
    'Automation': ['automation.view', 'automation.manage'],
    'Messages': ['messages.send', 'messages.broadcast'],
    'Settings': ['settings.view', 'settings.edit'],
    'Logs': ['logs.view'],
} as const

// ── Get admin from session cookie ──

export async function getAdminFromSession(): Promise<AdminUser | null> {
    try {
        const cookieStore = await cookies()
        const token = cookieStore.get('admin_session')?.value
        if (!token) return null

        const adminId = verifyToken(token)
        if (!adminId || adminId === 'admin-master-account') return null

        const admin = await prisma.adminUser.findUnique({
            where: { id: adminId, isActive: true }
        })

        return admin
    } catch {
        return null
    }
}

// ── Get admin from request (API routes) ──

export async function getAdminFromRequest(req: Request): Promise<AdminUser | null> {
    // Try cookie first
    const admin = await getAdminFromSession()
    if (admin) return admin

    // Try Authorization header
    const authHeader = req.headers.get('authorization')
    if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.slice(7)
        const adminId = verifyToken(token)
        if (!adminId) return null

        return prisma.adminUser.findUnique({
            where: { id: adminId, isActive: true }
        })
    }

    return null
}

// ── Permission check ──

export function hasPermission(admin: AdminUser, permission: Permission): boolean {
    if (admin.role === 'SUPER_ADMIN') return true
    const perms = admin.permissions as string[]
    return Array.isArray(perms) && perms.includes(permission)
}

// ── Middleware: require authentication ──

export async function requireAdmin(req: Request) {
    const admin = await getAdminFromRequest(req)
    if (!admin) {
        return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }), admin: null }
    }
    return { error: null, admin }
}

// ── Middleware: require specific permission ──

export async function requirePermission(req: Request, permission: Permission) {
    const { error, admin } = await requireAdmin(req)
    if (error || !admin) return { error: error!, admin: null }

    if (!hasPermission(admin, permission)) {
        return {
            error: NextResponse.json({ error: 'Forbidden: insufficient permissions' }, { status: 403 }),
            admin: null
        }
    }

    return { error: null, admin }
}

// ── Audit logging ──

export async function logAdminAction(
    adminId: string,
    action: string,
    opts?: { entity?: string; entityId?: string; details?: any; ipAddress?: string }
) {
    try {
        await prisma.adminActionLog.create({
            data: {
                adminId,
                action,
                entity: opts?.entity,
                entityId: opts?.entityId,
                details: opts?.details,
                ipAddress: opts?.ipAddress,
            }
        })
    } catch (err) {
        console.error('Failed to log admin action:', err)
    }
}

// ── Generate admin session ──

export async function createAdminSession(adminId: string) {
    const token = generateToken(adminId)
    const cookieStore = await cookies()

    cookieStore.set('admin_session', token, {
        path: '/',
        maxAge: 60 * 60 * 24 * 30,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
    })

    // Update last login
    await prisma.adminUser.update({
        where: { id: adminId },
        data: { lastLoginAt: new Date() }
    })

    return token
}
