import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const res = await prisma.course.updateMany({ data: { status: 'PUBLISHED' } });
    console.log(`Updated ${res.count} courses to PUBLISHED.`);
}
main().finally(() => prisma.$disconnect());
