import { Locale } from "@/dictionaries/get-dictionary"
import { prisma } from "@/lib/prisma"
import { getLocalUser } from "@/lib/auth/server"
import CourseFilterGrid from "@/components/user/CourseFilterGrid"

export default async function OnlineCoursesPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const user = await getLocalUser()

    const courses = await prisma.course.findMany({
        where: { isActive: true, type: 'ONLINE' },
        orderBy: { createdAt: 'desc' },
        include: {
            lessons: { select: { id: true, isFree: true } },
            _count: { select: { purchases: true } },
        }
    })

    let purchasedIds: string[] = []
    let subscribedIds: string[] = []
    if (user) {
        const purchases = await prisma.purchase.findMany({
            where: { userId: user.id, status: 'PAID' },
            select: { courseId: true }
        })
        const subscriptions = await prisma.subscription.findMany({
            where: { userId: user.id, status: 'ACTIVE' },
            select: { courseId: true }
        })
        purchasedIds = purchases.map(p => p.courseId).filter(Boolean) as string[]
        subscribedIds = subscriptions.map(s => s.courseId).filter(Boolean) as string[]
    }

    const processedCourses = courses.map(course => ({
        id: course.id,
        title: course.title,
        titleRu: course.titleRu,
        description: course.description,
        descriptionRu: course.descriptionRu,
        coverImage: course.coverImage,
        price: course.price ? Number(course.price) : null,
        type: course.type,
        lessonCount: course.lessons.length,
        freeLessons: course.lessons.filter(l => l.isFree).length,
        purchaseCount: course._count.purchases,
        isUnlocked: purchasedIds.includes(course.id) || subscribedIds.includes(course.id),
    }))

    return (
        <div className="space-y-8 animate-fade-in">
            <div>
                <h1 className="text-2xl font-serif font-black text-[var(--foreground)] mb-1">
                    {lang === 'uz' ? "Online Kurslar" : "Онлайн Курсы"}
                </h1>
                <p className="text-xs text-[var(--foreground)]/30 font-medium">
                    {lang === 'uz'
                        ? "Video darslar va yoga terapiya dasturlari"
                        : "Видео уроки и программы йога-терапии"}
                </p>
            </div>

            <CourseFilterGrid lang={lang as 'uz' | 'ru'} courses={processedCourses} />
        </div>
    )
}
