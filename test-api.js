const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function testApi() {
    try {
        const courses = await prisma.course.findMany({
            where: { isActive: true },
            orderBy: { createdAt: 'desc' }
        });
        console.log('TMA Courses API Success:', JSON.stringify({ success: true, count: courses.length }));
    } catch (err) {
        console.error('TMA Courses API Error:', err.message);
    } finally {
        await prisma.$disconnect();
    }
}

testApi();
