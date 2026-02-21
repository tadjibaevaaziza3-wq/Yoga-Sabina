
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
    console.log('--- Course Data Check ---');
    try {
        const courses = await prisma.course.findMany({
            select: { id: true, title: true, coverImage: true }
        });
        console.log('Courses found:', courses.length);
        courses.forEach(c => {
            console.log(`- ${c.title}: ${c.coverImage}`);
        });
    } catch (error) {
        console.error('Database query failed:', error.message);
    } finally {
        await prisma.$disconnect();
    }
}

checkData();
