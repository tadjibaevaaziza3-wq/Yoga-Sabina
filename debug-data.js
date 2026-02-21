
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log('--- PUBLIC API TEST ---');
    const publicCourses = await prisma.course.findMany({
        where: { isActive: true }
    });
    console.log('Public Active Courses:', publicCourses.length);
    if (publicCourses.length > 0) {
        console.log('First Course Details:', JSON.stringify(publicCourses[0], null, 2));
    }

    console.log('\n--- TMA API TEST ---');
    const tmaCourses = await prisma.course.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' }
    });
    console.log('TMA Active Courses:', tmaCourses.length);

    await prisma.$disconnect();
}

test();
