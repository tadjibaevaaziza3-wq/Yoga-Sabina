import { prisma } from "@/lib/prisma"

/**
 * Checks if a user has any active subscription.
 * Returns true if at least one active subscription exists that hasn't expired.
 */
export async function checkUserAccess(userId: string): Promise<boolean> {
    if (!userId) return false

    try {
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: 'ACTIVE',
                endsAt: {
                    gt: new Date()
                }
            }
        })

        return !!subscription
    } catch (error) {
        console.error("Error checking user access:", error)
        return false
    }
}
