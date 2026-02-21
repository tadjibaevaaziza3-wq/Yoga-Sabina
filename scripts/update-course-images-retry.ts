
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const updates = [
        { id: 'men-yoga-standard', image: '/images/tana-yoga-men.png' },
        { id: 'offline-do-yoga', image: '/images/do-yoga-new.jpg' },
        { id: 'offline-fit-dance', image: '/images/fit-dance-new.png' },
        { id: 'offline-sophie-fit', image: '/images/sophie-fit-new.jpg' },
    ]

    console.log('Starting image updates (Retry)...')

    for (const update of updates) {
        try {
            // First check if the course exists
            const course = await prisma.course.findUnique({ where: { id: update.id } })

            if (!course) {
                console.error(`Course not found: ${update.id}`)
                continue
            }

            const result = await prisma.course.update({
                where: { id: update.id },
                data: { coverImage: update.image },
            })
            console.log(`SUCCESS: Updated ${update.id} to ${result.coverImage}`)
        } catch (e) {
            console.error(`FAILED to update ${update.id}:`, e)
        }
    }
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
