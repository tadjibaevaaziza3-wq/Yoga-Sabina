import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    const hashedPassword = await bcrypt.hash('123123', 12);
    const admin = await prisma.adminUser.upsert({
        where: { username: 'admin123123' },
        update: {
            passwordHash: hashedPassword,
            role: 'SUPER_ADMIN',
        },
        create: {
            username: 'admin123123',
            passwordHash: hashedPassword,
            role: 'SUPER_ADMIN',
            displayName: 'Super Admin',
        },
    });
    console.log('Upserted admin user:', admin.username);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
