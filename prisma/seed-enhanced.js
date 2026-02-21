const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    console.log('Seeding data...');

    // 1. Ensure User exists
    let user = await prisma.user.findFirst({
        where: { email: 'test@example.com' }
    });

    if (!user) {
        console.log('Creating test user...');
        user = await prisma.user.create({
            data: {
                email: 'test@example.com',
                firstName: 'Test',
                lastName: 'User',
            }
        });
    }

    // 2. Ensure Course and Lesson exist
    const testCourseId = 'verified-test-course';

    let course = await prisma.course.findUnique({
        where: { id: testCourseId },
        include: { lessons: true }
    });

    if (!course) {
        console.log('Creating verified test course...');
        course = await prisma.course.create({
            data: {
                id: testCourseId,
                title: 'Йога асослари (Verified)',
                titleRu: 'Основы йоги (Verified)',
                description: 'Boshlovchilar uchun mukammal kurs.',
                descriptionRu: 'Идеальный курс для начинающих.',
                price: 150000,
                type: 'ONLINE',
                lessons: {
                    create: [
                        {
                            id: 'verified-test-lesson',
                            title: '1-dars: Nafas olish',
                            description: 'Nafas mashqlari haqida.',
                            order: 1,
                            isFree: true,
                            videoUrl: 'https://example.com/video1.mp4',
                        }
                    ]
                }
            },
            include: { lessons: true }
        });
    }

    const lesson = course.lessons[0];

    // 3. Ensure User has active subscription
    const existingSub = await prisma.subscription.findFirst({
        where: { userId: user.id, courseId: course.id }
    });

    if (!existingSub) {
        console.log('Creating test subscription...');
        await prisma.subscription.create({
            data: {
                userId: user.id,
                courseId: course.id,
                status: 'ACTIVE',
                startsAt: new Date(),
                endsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            }
        });
    }

    // 4. Seed Chat Messages
    console.log('Creating chat messages...');
    await prisma.courseChat.create({
        data: {
            courseId: course.id,
            userId: user.id,
            message: 'Assalomu alaykum! Kurs juda ajoyib ekan.',
        }
    });

    // 5. Seed Video Comments
    console.log('Creating video comments...');
    await prisma.videoComment.create({
        data: {
            lessonId: lesson.id,
            userId: user.id,
            comment: 'Ushbu darsdagi 02:30 dagi holat juda muhim. Diqqat bilan koʻring!',
            timestamp: 150, // 2:30
        }
    });

    console.log('Seeding completed successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
