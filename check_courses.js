
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const count = await prisma.course.count({ where: { isActive: true } });
    console.log(`Active courses count: ${count}`);
    const allCount = await prisma.course.count();
    console.log(`Total courses count: ${allCount}`);
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
