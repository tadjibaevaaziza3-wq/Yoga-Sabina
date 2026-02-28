import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyToken } from '@/lib/auth/server';
import { cookies } from 'next/headers';

export async function GET() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const userId = verifyToken(token);
        if (!userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

        const measurements = await prisma.bodyMeasurement.findMany({
            where: { userId },
            orderBy: { date: 'desc' },
            take: 60,
        });

        // Calculate stats
        const latest = measurements[0];
        const oldest = measurements[measurements.length - 1];
        const weightChange = latest?.weight && oldest?.weight
            ? Number((latest.weight - oldest.weight).toFixed(1))
            : null;

        return NextResponse.json({
            success: true,
            measurements,
            stats: {
                totalEntries: measurements.length,
                latestWeight: latest?.weight || null,
                weightChange,
                latestMood: latest?.mood || null,
                latestEnergy: latest?.energy || null,
            }
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get('auth_token')?.value;
        if (!token) return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });

        const userId = verifyToken(token);
        if (!userId) return NextResponse.json({ success: false, error: 'Invalid token' }, { status: 401 });

        const body = await request.json();
        const { weight, height, belly, hip, chest, waist, notes, photoUrl, mood, energy } = body;

        // Use today's date (start of day UTC)
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const measurement = await prisma.bodyMeasurement.upsert({
            where: {
                userId_date: { userId, date: today }
            },
            create: {
                userId,
                date: today,
                weight: weight ? parseFloat(weight) : null,
                height: height ? parseFloat(height) : null,
                belly: belly ? parseFloat(belly) : null,
                hip: hip ? parseFloat(hip) : null,
                chest: chest ? parseFloat(chest) : null,
                waist: waist ? parseFloat(waist) : null,
                notes: notes || null,
                photoUrl: photoUrl || null,
                mood: mood ? parseInt(mood) : null,
                energy: energy ? parseInt(energy) : null,
            },
            update: {
                weight: weight ? parseFloat(weight) : undefined,
                height: height ? parseFloat(height) : undefined,
                belly: belly ? parseFloat(belly) : undefined,
                hip: hip ? parseFloat(hip) : undefined,
                chest: chest ? parseFloat(chest) : undefined,
                waist: waist ? parseFloat(waist) : undefined,
                notes: notes || undefined,
                photoUrl: photoUrl || undefined,
                mood: mood ? parseInt(mood) : undefined,
                energy: energy ? parseInt(energy) : undefined,
            },
        });

        return NextResponse.json({ success: true, measurement });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
