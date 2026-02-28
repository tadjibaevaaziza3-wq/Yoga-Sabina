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

        // Look up admin in DB (wrapped in try-catch for pgBouncer resilience)
        let admin: any = null
        try {
            admin = await prisma.adminUser.findUnique({
                where: { username }
            })

            // Auto-seed: if NO admin users exist, create the first SUPER_ADMIN
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
        } catch (dbError) {
            console.error('DB lookup failed (pgBouncer?), falling through to ENV check:', dbError)
        }

        if (!admin || !admin.isActive) {
            // Last resort: check ENV credentials directly
            const envUser = process.env.ADMIN_USERNAME
            const envPass = process.env.ADMIN_PASSWORD
            if (envUser && envPass && username === envUser && password === envPass) {
                // Try to create/update admin in DB, but don't fail if DB is down
                try {
                    const hashedPassword = await bcrypt.hash(password, 12)
                    admin = await prisma.adminUser.upsert({
                        where: { username: envUser },
                        update: { passwordHash: hashedPassword, isActive: true },
                        create: {
                            username: envUser,
                            displayName: 'Super Admin',
                            passwordHash: hashedPassword,
                            role: 'SUPER_ADMIN',
                            permissions: [],
                        }
                    })
                    console.log('✅ Admin synced from env credentials')
                } catch (dbError) {
                    console.error('DB upsert failed, using ENV-only login:', dbError)
                    // Create a mock admin object for session creation
                    admin = {
                        id: 'env-admin',
                        username: envUser,
                        displayName: 'Super Admin',
                        role: 'SUPER_ADMIN',
                        passwordHash: await bcrypt.hash(password, 12),
                        isActive: true,
                        avatar: null,
                    }
                }
            } else {
                return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
            }
        }

        // Verify password with bcrypt
        let passwordValid = await bcrypt.compare(password, admin.passwordHash)

        // If password doesn't match DB hash but matches ENV, sync the password
        if (!passwordValid) {
            const envUser = process.env.ADMIN_USERNAME
            const envPass = process.env.ADMIN_PASSWORD
            if (envUser && envPass && username === envUser && password === envPass) {
                try {
                    const hashedPassword = await bcrypt.hash(password, 12)
                    admin = await prisma.adminUser.update({
                        where: { id: admin.id },
                        data: { passwordHash: hashedPassword }
                    })
                } catch (e) {
                    console.error('Failed to sync password:', e)
                }
                passwordValid = true
                console.log('✅ Admin password synced from env')
            }
        }

        if (!passwordValid) {
            // Log failed attempt (non-critical)
            try {
                await logAdminAction(admin.id, 'LOGIN_FAILED', {
                    ipAddress: ip,
                    details: { reason: 'invalid_password' }
                })
            } catch (e) { /* ignore */ }
            return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 })
        }

        // Create session
        const token = await createAdminSession(admin.id)

        // Log successful login (non-critical)
        try {
            await logAdminAction(admin.id, 'LOGIN_SUCCESS', { ipAddress: ip })
        } catch (e) { /* ignore */ }

        return NextResponse.json({
            success: true,
            token,
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
