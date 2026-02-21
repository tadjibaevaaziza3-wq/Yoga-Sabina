import { PrismaClient } from '@prisma/client'
import crypto from 'crypto'

const prisma = new PrismaClient()

async function main() {
    const login = 'admin123123'
    const password = '123123'
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')

    console.log(`Setting up admin user: ${login}`)

    const user = await prisma.user.upsert({
        where: { email: login },
        update: {
            password: hashedPassword,
            role: 'ADMIN'
        },
        create: {
            email: login,
            password: hashedPassword,
            role: 'ADMIN',
            firstName: 'Admin',
            lastName: 'User'
        }
    })

    console.log('Admin user updated successfully:', user.email)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
