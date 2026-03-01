import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/server';

async function getUser() {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value
    if (!token) return null
    const userId = verifyToken(token)
    if (!userId) return null
    return userId
}

export async function GET() {
    try {
        const userId = await getUser();

        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Fetch active offline subscriptions for the user
        const subscriptions = await prisma.subscription.findMany({
            where: {
                userId: userId as string,
                status: 'ACTIVE',
                course: {
                    type: 'OFFLINE'
                }
            },
            include: {
                course: {
                    select: { id: true, title: true }
                }
            }
        });

        // Fetch attendance records for these courses
        const offlineCourses = await Promise.all(subscriptions.map(async (sub) => {
            const attendances = await prisma.offlineAttendance.findMany({
                where: {
                    userId: userId as string,
                    session: {
                        courseId: sub.courseId
                    }
                },
                include: {
                    session: {
                        select: { date: true, timeSlot: true }
                    }
                },
                orderBy: {
                    session: { date: 'asc' }
                }
            });

            // Calculate stats
            const totalClasses = attendances.length;
            const attended = attendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length;
            const absent = attendances.filter(a => a.status === 'ABSENT').length;
            const excused = attendances.filter(a => a.status === 'EXCUSED').length;

            return {
                subscriptionId: sub.id,
                courseId: sub.courseId,
                courseTitle: sub.course.title,
                timeSlot: sub.timeSlot,
                startsAt: sub.startsAt,
                endsAt: sub.endsAt,
                attendances: attendances.map(a => ({
                    date: a.session.date,
                    timeSlot: a.session.timeSlot,
                    status: a.status,
                    note: a.note
                })),
                stats: {
                    totalClasses,
                    attended,
                    absent,
                    excused
                }
            };
        }));

        return NextResponse.json({ success: true, offlineCourses });
    } catch (error) {
        console.error('[User Davomat API Error]:', error);
        return NextResponse.json({ error: 'Ichki server xatosi' }, { status: 500 });
    }
}
