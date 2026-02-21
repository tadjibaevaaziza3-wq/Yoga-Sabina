import { prisma } from '@/lib/prisma'

/**
 * Helper function to create or extend a course subscription for a user.
 * @param userId - ID of the user
 * @param courseId - ID of the course
 * @param durationDays - Duration of the subscription in days
 */
export async function createOrExtendSubscription(userId: string, courseId: string, durationDays: number) {
    const now = new Date()
    const endsAt = new Date(now)
    endsAt.setDate(now.getDate() + durationDays)

    // Check if user already has an active subscription for this course
    const existingSubscription = await prisma.subscription.findFirst({
        where: {
            userId,
            courseId,
            status: 'ACTIVE',
            endsAt: { gt: now }
        }
    })

    if (existingSubscription) {
        // Extend existing subscription
        const currentEndsAt = new Date(existingSubscription.endsAt)
        currentEndsAt.setDate(currentEndsAt.getDate() + durationDays)

        return await prisma.subscription.update({
            where: { id: existingSubscription.id },
            data: { endsAt: currentEndsAt }
        })
    } else {
        // Create new subscription
        return await prisma.subscription.create({
            data: {
                userId,
                courseId,
                startsAt: now,
                endsAt,
                status: 'ACTIVE'
            }
        })
    }
}
