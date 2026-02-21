import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { coursesUpdateData } from '@/lib/data/course-updates'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/server'

async function isAdmin(): Promise<boolean> {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get('admin_session')?.value;
    if (!adminSession) return false;
    return !!verifyToken(adminSession);
}

export async function POST(request: NextRequest) {
    try {
        if (!await isAdmin()) {
            return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
        }
        console.log('API Seeding started: Clearing old courses and seeding 8 new courses...')

        // Clear existing data to remove duplicates/copies and avoid FK constraints
        const p = prisma as any;
        await p.videoComment?.deleteMany();
        await p.comment?.deleteMany();
        await p.like?.deleteMany();
        await p.videoProgress?.deleteMany();
        await p.enhancedVideoProgress?.deleteMany();
        await p.asset?.deleteMany();
        await p.lesson?.deleteMany();
        await p.subscription?.deleteMany();
        await p.purchase?.deleteMany();
        await p.courseChat?.deleteMany();
        await p.chatMessage?.deleteMany();
        await p.course.deleteMany();

        const results = []

        for (const course of coursesUpdateData) {
            const data: any = course
            const updatedCourse = await prisma.course.upsert({
                where: { id: data.id },
                update: {
                    title: data.title,
                    titleRu: data.titleRu,
                    description: data.description,
                    descriptionRu: data.descriptionRu,
                    price: data.price,
                    type: data.type as any,
                    productType: (data.productType as any) || 'COURSE',
                    consultationFormat: data.consultationFormat as any,
                    durationDays: data.durationDays,
                    durationLabel: data.durationLabel,
                    coverImage: data.coverImage,
                    isActive: true,
                    location: data.location,
                    locationRu: data.locationRu,
                    schedule: data.schedule,
                    scheduleRu: data.scheduleRu,
                    times: data.times,
                    timesRu: data.timesRu,
                    features: data.features || [],
                    featuresRu: data.featuresRu || [],
                },
                create: {
                    id: data.id,
                    title: data.title,
                    titleRu: data.titleRu,
                    description: data.description,
                    descriptionRu: data.descriptionRu,
                    price: data.price,
                    type: data.type as any,
                    productType: (data.productType as any) || 'COURSE',
                    consultationFormat: data.consultationFormat as any,
                    durationDays: data.durationDays,
                    durationLabel: data.durationLabel,
                    coverImage: data.coverImage,
                    isActive: true,
                    location: data.location,
                    locationRu: data.locationRu,
                    schedule: data.schedule,
                    scheduleRu: data.scheduleRu,
                    times: data.times,
                    timesRu: data.timesRu,
                    features: data.features || [],
                    featuresRu: data.featuresRu || [],
                }
            })

            // Seed Modules & Lessons if they exist in the data
            if (data.modules && data.modules.length > 0) {
                for (const mod of data.modules) {
                    const createdModule = await prisma.module.create({
                        data: {
                            id: mod.id,
                            courseId: updatedCourse.id,
                            title: mod.title,
                            titleRu: mod.titleRu,
                            order: mod.order,
                        }
                    });

                    if (mod.lessons && mod.lessons.length > 0) {
                        for (const lesson of mod.lessons) {
                            await prisma.lesson.create({
                                data: {
                                    id: lesson.id,
                                    courseId: updatedCourse.id,
                                    moduleId: createdModule.id,
                                    title: lesson.title,
                                    titleRu: lesson.titleRu,
                                    order: lesson.order,
                                    videoUrl: lesson.videoUrl,
                                    audioUrl: lesson.audioUrl,
                                    pdfUrl: lesson.pdfUrl,
                                    description: lesson.description,
                                    descriptionRu: lesson.descriptionRu,
                                }
                            });
                        }
                    }
                }
            }

            results.push(updatedCourse.id)
        }

        // Revalidate public pages
        revalidatePath('/[lang]/courses', 'page');
        revalidatePath('/[lang]/', 'page');

        return NextResponse.json({
            success: true,
            message: `Successfully seeded ${results.length} courses.`,
            ids: results
        });
    } catch (error: any) {
        console.error('Seed error:', error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
