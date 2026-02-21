
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.count()
    const profiles = await prisma.profile.count()
    const courses = await prisma.course.count()

    console.log('--- DATABASE STATS ---')
    console.log(`Users: ${users}`)
    console.log(`Profiles: ${profiles}`)
    console.log(`Courses: ${courses}`)

    if (users > 0) {
        const latestUser = await prisma.user.findFirst({ orderBy: { createdAt: 'desc' } })
        console.log(`Latest User: ${latestUser.email} (ID: ${latestUser.id})`)
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
