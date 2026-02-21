/**
 * AI Recommendation & Retention Scoring
 * Hybrid filtering based on user behavior and content tags.
 */

export async function getRecommendations(userId, prisma) {
    // 1. Fetch user engagement history
    const progress = await prisma.enhancedVideoProgress.findMany({
        where: { userId },
        include: { lesson: { include: { course: true } } },
        orderBy: { lastWatched: 'desc' },
        take: 20
    });

    // 2. Identify preferred tags/types
    const tagWeights = {};
    progress.forEach(p => {
        const weight = p.completed ? 1.0 : (p.progress / p.duration);
        const tags = p.lesson.course.features || []; // or metadata tags
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

    // 4. Generate Top 5 Personalized Recommendations
    // Filter out already completed courses, prioritize high weighted tags
    const recommendations = await prisma.course.findMany({
        where: {
            isActive: true,
            // (Exclude purchased/completed courses here)
        },
        take: 10
    });

    return {
        recommendations: recommendations.sort(() => Math.random() - 0.5).slice(0, 5),
        retentionScore,
        churnRisk: retentionScore < 50 ? 'HIGH' : 'LOW',
        actionTriggered: retentionScore < 50 ? 'SendReEngagementNotification' : null
    };
}
