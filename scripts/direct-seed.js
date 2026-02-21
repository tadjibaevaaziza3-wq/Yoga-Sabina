const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { coursesData } = require('../src/lib/data/courses');

async function seed() {
    console.log('Starting seed...');
    try {
        for (const courseUz of coursesData.uz) {
            console.log(`Seeding ${courseUz.id}...`);
            await prisma.course.upsert({
                where: { id: courseUz.id },
                update: {},
                create: {
                    id: courseUz.id,
                    title: courseUz.title,
                    description: courseUz.description,
                    price: courseUz.price,
                    type: courseUz.type,
                    isActive: true,
                }
            });
        }
        console.log('Seed finished successfully');
    } catch (err) {
        console.error('Seed error:', err);
    } finally {
        await prisma.$disconnect();
    }
}

seed();
