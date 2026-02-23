/**
 * Engagement Service
 * 
 * Calculates user engagement score and segment based on behavior data.
 * Updates user records with computed values.
 */

import { prisma } from '@/lib/prisma'

// ── SCORING WEIGHTS ──
const WEIGHTS = {
    sessions: 2.0,
    watchTime: 0.01,    // per second
    loginRecency: -0.5, // penalty per day inactive
    purchase: 30,       // bonus for any purchase
}

const SEGMENT_THRESHOLDS = {
    cold: 20,
    warm: 50,
    hot: Infinity,
}

type Segment = 'cold' | 'warm' | 'hot' | 'vip'

/**
 * Calculate engagement score for a user.
 */
export function calculateEngagementScore(user: {
    totalSessions: number
    totalWatchTime: number
    lastLoginAt: Date | null
    updatedAt: Date
    purchases?: { id: string }[]
}): { score: number; segment: Segment } {
    const now = new Date()
    const lastActive = user.lastLoginAt || user.updatedAt
    const inactiveDays = Math.floor((now.getTime() - lastActive.getTime()) / (24 * 60 * 60 * 1000))

    let score =
        WEIGHTS.sessions * user.totalSessions +
        WEIGHTS.watchTime * user.totalWatchTime +
        WEIGHTS.loginRecency * inactiveDays

    score = Math.max(0, Math.round(score * 10) / 10)

    const hasPurchases = user.purchases && user.purchases.length > 0

    // Determine segment
    let segment: Segment
    if (hasPurchases && score > 30) {
        segment = 'vip'
    } else if (score >= SEGMENT_THRESHOLDS.warm) {
        segment = 'hot'
    } else if (score >= SEGMENT_THRESHOLDS.cold) {
        segment = 'warm'
    } else {
        segment = 'cold'
    }

    return { score, segment }
}

/**
 * Recalculate engagement for all users (batch job).
 */
export async function recalculateAllEngagement(): Promise<{ updated: number }> {
    const users = await prisma.user.findMany({
        where: { isBlocked: false },
        select: {
            id: true,
            totalSessions: true,
            totalWatchTime: true,
            lastLoginAt: true,
            updatedAt: true,
            purchases: { select: { id: true } },
        },
    })

    let updated = 0

    for (const user of users) {
        const { score, segment } = calculateEngagementScore(user)

        await prisma.user.update({
            where: { id: user.id },
            data: {
                engagementScore: score,
                segment,
            },
        })
        updated++
    }

    return { updated }
}

/**
 * Recalculate engagement for a single user.
 */
export async function recalculateUserEngagement(userId: string): Promise<{ score: number; segment: string }> {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
            id: true,
            totalSessions: true,
            totalWatchTime: true,
            lastLoginAt: true,
            updatedAt: true,
            purchases: { select: { id: true } },
        },
    })

    if (!user) throw new Error('User not found')

    const { score, segment } = calculateEngagementScore(user)

    await prisma.user.update({
        where: { id: userId },
        data: { engagementScore: score, segment },
    })

    return { score, segment }
}

/**
 * Get engagement analytics (aggregated stats).
 */
export async function getEngagementAnalytics() {
    const users = await prisma.user.findMany({
        where: { isBlocked: false },
        select: {
            engagementScore: true,
            segment: true,
        },
    })

    const totalUsers = users.length
    if (totalUsers === 0) return { totalUsers: 0, avgScore: 0, segments: {} }

    const avgScore = Math.round(
        (users.reduce((sum, u) => sum + u.engagementScore, 0) / totalUsers) * 10
    ) / 10

    const segments = users.reduce(
        (acc, u) => {
            acc[u.segment] = (acc[u.segment] || 0) + 1
            return acc
        },
        {} as Record<string, number>
    )

    return { totalUsers, avgScore, segments }
}
