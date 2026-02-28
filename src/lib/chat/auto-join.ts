import { prisma } from '@/lib/prisma';

/**
 * Auto-add a user to the course chat when their purchase is activated.
 * Uses upsert to avoid duplicates (idempotent).
 * Should be called after any purchase becomes PAID/ACTIVE.
 */
export async function addUserToCourseChat(userId: string, courseId: string) {
    try {
        await prisma.courseChatMember.upsert({
            where: {
                courseId_userId: { courseId, userId }
            },
            update: {}, // Already exists, do nothing
            create: {
                courseId,
                userId,
            }
        });
    } catch (error) {
        // Non-critical: log but don't break the payment flow
        console.error('[CourseChat] Failed to auto-add user to chat:', error);
    }
}
