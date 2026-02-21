import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://baxtli-men.uz';

    // Fetch all active courses
    const courses = await prisma.course.findMany({
        where: { isActive: true },
        select: {
            id: true,
            updatedAt: true,
            type: true,
        },
    });

    // Static pages
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

    // Dynamic course pages
    const coursePages: MetadataRoute.Sitemap = courses.flatMap((course) => [
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

    return [...staticPages, ...coursePages];
}
