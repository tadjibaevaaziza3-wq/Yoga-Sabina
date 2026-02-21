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
                createdAt: true,
                _count: {
                    select: {
                        lessons: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return NextResponse.json({ success: true, courses });

    } catch (error: any) {
        console.error('Error fetching courses:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
