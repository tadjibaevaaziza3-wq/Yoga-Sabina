
import { prisma } from '../src/lib/prisma'
import { checkUserAccess } from '../src/lib/db/access'

async function main() {
    console.log('🧪 Testing DB Access Control...')

    try {
        // 1. Create dummy user
        const user = await prisma.user.create({
            data: {
                email: `test-access-${Date.now()}@example.com`,
                firstName: 'Test',
                lastName: 'User'
            }
        })
        console.log('✅ Created user:', user.id)

        // 2. Check access (should be false)
        let hasAccess = await checkUserAccess(user.id)
        console.log('🔒 Access before subscription:', hasAccess)
        if (hasAccess) throw new Error("User shouldn't have access yet!")

        // 3. Create active subscription
        // Need a course first?
        let course = await prisma.course.findFirst()
        if (!course) {
            console.log("⚠️ No course found. Creating dummy course...")
            course = await prisma.course.create({
                data: {
                    title: "Dummy Course",
                    description: "Test",
                    price: 100
                }
            })
        }

        await prisma.subscription.create({
            data: {
                userId: user.id,
                courseId: course.id,
                status: 'ACTIVE',
                endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24) // +1 day
            }
        })
        console.log('✅ Created active subscription')

        // 4. Check access (should be true)
        hasAccess = await checkUserAccess(user.id)
        console.log('🔓 Access with active subscription:', hasAccess)
        if (!hasAccess) throw new Error("User should have access now!")

        // 5. Cleanup
        console.log('🧹 Cleaning up...')
        await prisma.subscription.deleteMany({ where: { userId: user.id } })
        await prisma.user.delete({ where: { id: user.id } })
        console.log('✨ Cleanup complete.')

    } catch (e) {
        console.error('❌ Test Failed:', e)
        process.exit(1)
    }
}

main()
