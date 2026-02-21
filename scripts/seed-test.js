
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    console.log('--- CREATING TEST COURSE ---')
    const course = await prisma.course.create({
        data: {
            title: 'Men\'s Yoga Standard',
            titleRu: 'Мужская Йога Стандарт',
            description: 'Professional yoga course for men.',
            price: 500000,
            type: 'ONLINE',
            isActive: true,
            status: 'PUBLISHED',
            features: ['Video lessons', 'Health guides', 'Supportive chat'],
        }
    })

    const module = await prisma.module.create({
        data: {
            title: 'Getting Started',
            courseId: course.id,
            order: 1
        }
    })

    const lesson = await prisma.lesson.create({
        data: {
            title: 'First Practice',
            courseId: course.id,
            moduleId: module.id,
            order: 1,
            isFree: true,
            videoUrl: 'https://vimeo.com/76979871'
        }
    })
    console.log(`Course created: ${course.id}`)
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
