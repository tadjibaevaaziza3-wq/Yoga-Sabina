
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const ids = [
        'men-yoga-standard',
        'offline-do-yoga',
        'offline-fit-dance',
        'offline-sophie-fit'
    ]

    const courses = await prisma.course.findMany({
        where: { id: { in: ids } },
        select: { id: true, title: true, coverImage: true }
    })

    console.log('Current Database State:')
    console.table(courses)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
