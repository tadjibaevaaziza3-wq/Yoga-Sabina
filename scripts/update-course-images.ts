
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const updates = [
        { id: 'men-yoga-standard', image: '/images/tana-yoga-men.png' },
        { id: 'offline-do-yoga', image: '/images/do-yoga-new.jpg' },
        { id: 'offline-fit-dance', image: '/images/fit-dance-new.png' },
        { id: 'offline-sophie-fit', image: '/images/sophie-fit-new.jpg' },
    ]

    console.log('Starting image updates...')

    for (const update of updates) {
        try {
            const course = await prisma.course.update({
                where: { id: update.id },
                data: { coverImage: update.image },
            })
            console.log(`Updated ${update.id} with ${update.image}`)
        } catch (e) {
            console.error(`Failed to update ${update.id}: ${e.message}`)
            // Try finding by title if ID fails (fallback)
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
