/**
 * Admin Seed Script
 * Creates the initial Super Admin from env vars (ADMIN_USER / ADMIN_PASS)
 * Run: npx ts-node prisma/admin-seed.ts
 * Or:  npx tsx prisma/admin-seed.ts
 */

import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcrypt'

const prisma = new PrismaClient()

async function main() {
    const username = process.env.ADMIN_USER || 'admin123'
    const password = process.env.ADMIN_PASS || '123123'

    // Check if admin already exists
    const existing = await prisma.adminUser.findUnique({ where: { username } })
    if (existing) {
        console.log(`✓ Super Admin "${username}" already exists (id: ${existing.id})`)
        return
    }

    const passwordHash = await bcrypt.hash(password, 12)

    const admin = await prisma.adminUser.create({
        data: {
            username,
            passwordHash,
            displayName: 'Super Admin',
            role: 'SUPER_ADMIN',
            permissions: [],
            isActive: true,
        }
    })

    console.log(`✓ Super Admin created:`)
    console.log(`  Username: ${username}`)
    console.log(`  Role: SUPER_ADMIN`)
    console.log(`  ID: ${admin.id}`)
    console.log(`\n  You can now log in at /admin/login`)
}

main()
    .catch((e) => {
        console.error('Seed failed:', e)
        process.exit(1)
    })
    .finally(() => prisma.$disconnect())
