
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    const courses = await prisma.course.findMany({
        where: { isActive: true },
        select: { id: true, title: true, type: true, productType: true }
    });
    console.log(JSON.stringify(courses, null, 2));
    await prisma.$disconnect();
}

test();
