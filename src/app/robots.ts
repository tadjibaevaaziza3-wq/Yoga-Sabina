import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://baxtli-men.uz';

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/api/',
                    '/admin/',
                    '/dashboard/',
                    '/account/',
                    '/checkout/',
                    '/_next/',
                    '/tma/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    };
}
