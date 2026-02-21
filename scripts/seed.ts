
import { PrismaClient } from '@prisma/client'
import { coursesData } from '../src/lib/data/courses'

const prisma = new PrismaClient()

async function main() {
    console.log('Generic seeding...')
    try {
        const results = []

        // Seed UZ courses (and find matching RU)
        for (const uzCourse of coursesData.uz) {
            const ruCourse = coursesData.ru.find(c => c.id === uzCourse.id)

            const features = uzCourse.features || []
            const featuresRu = ruCourse?.features || []

            const course = await prisma.course.upsert({
                where: { id: uzCourse.id },
                update: {
                    title: uzCourse.title,
                    titleRu: ruCourse?.title,
                    description: uzCourse.description,
                    descriptionRu: ruCourse?.description,
                    price: Number(uzCourse.price),
                    durationDays: Number(uzCourse.duration) || 30,
                    durationLabel: uzCourse.duration,
                    type: uzCourse.type as any,
                    coverImage: uzCourse.image,

                    location: (uzCourse as any).location,
                    locationRu: (ruCourse as any)?.location,
                    schedule: (uzCourse as any).schedule,
                    scheduleRu: (ruCourse as any)?.schedule,
                    times: (uzCourse as any).times,
                    timesRu: (ruCourse as any)?.times,

                    features: features as any,
                    featuresRu: featuresRu as any,
                },
                create: {
                    id: uzCourse.id,
                    title: uzCourse.title,
                    titleRu: ruCourse?.title,
                    description: uzCourse.description,
                    descriptionRu: ruCourse?.description,
                    price: Number(uzCourse.price),
                    durationDays: Number(uzCourse.duration) || 30,
                    durationLabel: uzCourse.duration,
                    type: uzCourse.type as any,
                    coverImage: uzCourse.image,

                    location: (uzCourse as any).location,
                    locationRu: (ruCourse as any)?.location,
                    schedule: (uzCourse as any).schedule,
                    scheduleRu: (ruCourse as any)?.schedule,
                    times: (uzCourse as any).times,
                    timesRu: (ruCourse as any)?.times,

                    features: features as any,
                    featuresRu: featuresRu as any,
                }
            })
            console.log(`Seeded course: ${course.title}`)
            results.push(course)
        }

        console.log(`Seeding finished. count: ${results.length}`)
    } catch (e: any) {
        console.error(e)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

main()
