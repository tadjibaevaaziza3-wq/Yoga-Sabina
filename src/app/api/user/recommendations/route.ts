import { NextRequest, NextResponse } from 'next/server';
import { getRecommendations } from '@/lib/recommendations';
import { getLocalUser } from '@/lib/auth/server';

export async function GET(request: NextRequest) {
    try {
        const user = await getLocalUser();
        if (!user) {
            return NextResponse.json(
                { success: false, error: 'Unauthorized' },
                { status: 401 }
            );
        }

        const recommendations = await getRecommendations(user.id);

        return NextResponse.json({
            success: true,
            ...recommendations
        });

    } catch (error: any) {
        console.error('Error fetching recommendations:', error);
        return NextResponse.json(
            { success: false, error: error.message },
            { status: 500 }
        );
    }
}
