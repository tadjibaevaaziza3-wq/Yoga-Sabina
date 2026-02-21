import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
    const courses = await prisma.course.findMany({ select: { id: true, title: true, status: true, isActive: true, type: true } });
    console.log("All courses:", courses);
}
main().finally(() => prisma.$disconnect());
