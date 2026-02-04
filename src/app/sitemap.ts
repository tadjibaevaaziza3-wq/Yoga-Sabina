import { MetadataRoute } from 'next'
import { coursesData } from '@/lib/data/courses'

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://baxtli-men.uz'
    const languages = ['uz', 'ru']
    const staticPages = ['', '/feedback', '/about']

    const routes = languages.flatMap((lang) =>
        staticPages.map((page) => ({
            url: `${baseUrl}/${lang}${page}`,
            lastModified: new Date(),
            changeFrequency: 'weekly' as const,
            priority: page === '' ? 1 : 0.8,
        }))
    )

    const courseRoutes = languages.flatMap((lang) =>
        coursesData[lang as keyof typeof coursesData].map((course: any) => ({
            url: `${baseUrl}/${lang}/courses/${course.id}`,
            lastModified: new Date(),
            changeFrequency: 'monthly' as const,
            priority: 0.7,
        }))
    )

    return [...routes, ...courseRoutes]
}
