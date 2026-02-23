import { MetadataRoute } from 'next';

// Force dynamic to prevent build-time static generation (requires DB)
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://baxtli-men.uz';

    // Static pages (always available)
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: baseUrl,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/uz`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/ru`,
            lastModified: new Date(),
            changeFrequency: 'daily',
            priority: 1,
        },
        {
            url: `${baseUrl}/uz/online-courses`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/ru/online-courses`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/uz/offline-courses`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/ru/offline-courses`,
            lastModified: new Date(),
            changeFrequency: 'weekly',
            priority: 0.9,
        },
        {
            url: `${baseUrl}/uz/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/ru/about`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.7,
        },
        {
            url: `${baseUrl}/uz/feedback`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
        {
            url: `${baseUrl}/ru/feedback`,
            lastModified: new Date(),
            changeFrequency: 'monthly',
            priority: 0.6,
        },
    ];

    // Dynamic course pages — gracefully degrade if DB is unavailable
    let coursePages: MetadataRoute.Sitemap = [];
    try {
        const { prisma } = await import('@/lib/prisma');
        const courses = await prisma.course.findMany({
            where: { isActive: true },
            select: {
                id: true,
                updatedAt: true,
                type: true,
            },
        });

        coursePages = courses.flatMap((course) => [
            {
                url: `${baseUrl}/uz/courses/${course.id}`,
                lastModified: course.updatedAt,
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            },
            {
                url: `${baseUrl}/ru/courses/${course.id}`,
                lastModified: course.updatedAt,
                changeFrequency: 'weekly' as const,
                priority: 0.8,
            },
        ]);
    } catch (e) {
        console.warn('[Sitemap] Could not fetch courses from DB, returning static pages only:', (e as Error).message);
    }

    return [...staticPages, ...coursePages];
}
