
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const courses = await prisma.course.findMany({
        include: {
            _count: {
                select: { lessons: true }
            }
        }
    })

    console.log('--- COURSES IN DATABASE ---')
    courses.forEach(c => {
        console.log(`ID: ${c.id} | Title: ${c.title} | Active: ${c.isActive} | Lessons: ${c._count.lessons} | Price: ${c.price}`)
    })

    const purchases = await prisma.purchase.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' }
    })
    console.log('\n--- RECENT PURCHASES ---')
    purchases.forEach(p => {
        console.log(`ID: ${p.id} | Status: ${p.status} | Course: ${p.courseId} | User: ${p.userId}`)
    })
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
