import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Baxtli Men Academy',
        short_name: 'Baxtli Men',
        description: 'Yoga and Wellness Academy by Sabina Polatova — Health and balance for everyone.',
        start_url: '/',
        display: 'standalone',
        background_color: '#f6f9fe',
        theme_color: '#114539',
        icons: [
            {
                src: '/favicon.ico',
                sizes: 'any',
                type: 'image/x-icon',
            },
            {
                src: '/images/hero-sabina.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/images/hero-sabina.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'maskable',
            }
        ],
    }
}
