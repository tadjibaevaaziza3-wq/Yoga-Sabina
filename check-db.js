const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCourses() {
    try {
        const activeCourses = await prisma.course.findMany({
            where: { isActive: true },
            select: { id: true, title: true, type: true }
        });
        console.log('--- ACTIVE COURSES ---');
        console.log(JSON.stringify(activeCourses, null, 2));

        const allCourses = await prisma.course.count();
        console.log('\nTotal Courses Count:', allCourses);
        console.log('Active Courses Count:', activeCourses.length);
    } catch (err) {
        console.error('Prisma check failed:', err);
    } finally {
        await prisma.$disconnect();
    }
}

checkCourses();
