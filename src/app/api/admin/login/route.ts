import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getResetTime } from '@/lib/security/rate-limit'
import { createAdminSession, logAdminAction } from '@/lib/auth/admin-auth'
import * as bcrypt from 'bcrypt'

export async function POST(req: Request) {
    try {
        // Rate limiting
        const ip = req.headers.get('x-forwarded-for') || 'unknown'
        if (!checkRateLimit(`admin-login:${ip}`)) {
            return NextResponse.json({
                success: false,
                error: 'Too many attempts. Please try again later.',
                retryAfter: getResetTime(`admin-login:${ip}`)
            }, { status: 429 })
        }

        const body = await req.json()
        const { username, password } = body

        if (!username || !password) {
            return NextResponse.json({ success: false, error: 'Username and password required' }, { status: 400 })
        }

        // Look up admin in DB
        let admin = await prisma.adminUser.findUnique({
            where: { username }
        })

        // Auto-seed: if NO admin users exist, create the first SUPER_ADMIN
        // using env credentials (bridges old env-based login to new DB-backed system)
        if (!admin) {
            const adminCount = await prisma.adminUser.count()
            if (adminCount === 0) {
                const envUser = process.env.ADMIN_USERNAME
                const envPass = process.env.ADMIN_PASSWORD
                if (envUser && envPass && username === envUser && password === envPass) {
                    const hashedPassword = await bcrypt.hash(password, 12)
                    admin = await prisma.adminUser.create({
                        data: {
                            username: envUser,
                            displayName: 'Super Admin',
                            passwordHash: hashedPassword,
                            role: 'SUPER_ADMIN',
                            permissions: [],
                        }
                    })
                    console.log('✅ Initial SUPER_ADMIN created from env credentials')
                }
            }
        }

        if (!admin || !admin.isActive) {
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
        }

        // Verify password with bcrypt
        const passwordValid = await bcrypt.compare(password, admin.passwordHash)
        if (!passwordValid) {
            // Log failed attempt
            await logAdminAction(admin.id, 'LOGIN_FAILED', {
                ipAddress: ip,
                details: { reason: 'invalid_password' }
            })
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
        }

        // Create session
        await createAdminSession(admin.id)

        // Log successful login
        await logAdminAction(admin.id, 'LOGIN_SUCCESS', { ipAddress: ip })

        return NextResponse.json({
            success: true,
            admin: {
                id: admin.id,
                username: admin.username,
                displayName: admin.displayName,
                role: admin.role,
                avatar: admin.avatar,
            }
        })
    } catch (error: any) {
        console.error('Admin login error:', error)
        return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 })
    }
}
