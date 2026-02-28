/**
 * API Routes for Public Course Access
 * 
 * GET /api/courses - List all active courses
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/courses
 * List all active courses (public)
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const type = searchParams.get('type');

        const courses = await prisma.course.findMany({
            where: {
                isActive: true,
                ...(type && { type: type as 'ONLINE' | 'OFFLINE' }),
            },
            select: {
                id: true,
                title: true,
                titleRu: true,
                description: true,
                descriptionRu: true,
                price: true,
                durationDays: true,
                durationLabel: true,
                type: true,
                productType: true,
                targetAudience: true,
                coverImage: true,
                location: true,
                locationRu: true,
                schedule: true,
                scheduleRu: true,
                times: true,
                timesRu: true,
                features: true,
                featuresRu: true,
                isBestseller: true,
                sortOrder: true,
                createdAt: true,
                _count: {
                    select: {
                        lessons: true,
                        subscriptions: true,
                        purchases: true,
                    },
                },
            },
            orderBy: [
                { isBestseller: 'desc' },
                { sortOrder: 'desc' },
                { createdAt: 'desc' },
            ],
        });

        // Re-sort by popularity: bestseller first, then by subscriber+purchase count
        const sorted = courses.sort((a, b) => {
            // Bestsellers always on top
            if (a.isBestseller && !b.isBestseller) return -1;
            if (!a.isBestseller && b.isBestseller) return 1;
            // Then by subscriber + purchase count
            const aPopularity = (a._count.subscriptions || 0) + (a._count.purchases || 0);
            const bPopularity = (b._count.subscriptions || 0) + (b._count.purchases || 0);
            if (bPopularity !== aPopularity) return bPopularity - aPopularity;
            // Then by sortOrder
            return (b.sortOrder || 0) - (a.sortOrder || 0);
        });

        return NextResponse.json({ success: true, courses: sorted });

    } catch (error: any) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
