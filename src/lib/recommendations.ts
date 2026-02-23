
import { prisma } from "./prisma";

export async function getRecommendations(userId: string) {
    // 1. Fetch user engagement history
    const progress = await prisma.enhancedVideoProgress.findMany({
        where: { userId },
        include: { lesson: { include: { course: true } } },
        orderBy: { lastWatched: 'desc' },
        take: 20
    });

    // 2. Identify preferred tags (features)
    const tagWeights: Record<string, number> = {};
    progress.forEach(p => {
        const weight = p.completed ? 1.0 : (p.progress / (p.duration || 1));
        const tags = (p.lesson.course.features as string[]) || [];
        tags.forEach(tag => {
            tagWeights[tag] = (tagWeights[tag] || 0) + weight;
        });
    });

    // 3. Score churn risk (Retention Scoring)
    const latestActivity = progress[0]?.lastWatched || new Date(0);
    const daysSinceLastActivity = (Date.now() - latestActivity.getTime()) / (1000 * 60 * 60 * 24);

    let retentionScore = 100;
    if (daysSinceLastActivity > 3) retentionScore -= 20;
    if (daysSinceLastActivity > 7) retentionScore -= 50;

    // 4. Fetch available courses that user hasn't bought or subscribed to yet
    const [userPurchases, userSubscriptions] = await Promise.all([
        prisma.purchase.findMany({
            where: { userId, status: 'PAID' },
            select: { courseId: true }
        }),
        prisma.subscription.findMany({
            where: {
                userId,
                status: 'ACTIVE',
                endsAt: { gte: new Date() }
            },
            select: { courseId: true }
        })
    ]);

    const ownedCourseIds = [
        ...userPurchases.map(p => p.courseId),
        ...userSubscriptions.map(s => s.courseId)
    ];

    const availableCourses = await prisma.course.findMany({
        where: {
            id: { notIn: ownedCourseIds },
            isActive: true,
            status: 'PUBLISHED'
        }
    });

    // 5. Rank available courses by tag weights
    const scoredRecommendations = availableCourses.map(course => {
        const tags = (course.features as string[]) || [];
        let score = 0;
        tags.forEach(tag => {
            score += tagWeights[tag] || 0;
        });
        return { ...course, recommendationScore: score };
    });

    // Sort by score (desc) and return top 3
    const topRecommendations = scoredRecommendations
        .sort((a, b) => b.recommendationScore - a.recommendationScore)
        .slice(0, 3);

    return {
        recommendations: topRecommendations,
        retentionScore,
        churnRisk: retentionScore < 50 ? 'HIGH' : 'LOW',
    };
}
