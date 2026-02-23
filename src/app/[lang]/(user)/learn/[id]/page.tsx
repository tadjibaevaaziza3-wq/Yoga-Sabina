
import { prisma } from "@/lib/prisma"
import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { CourseLearningInterface } from "@/components/course/CourseLearningInterface"
import { verifyToken } from "@/lib/auth/server"

export default async function CourseLearnPage({
    params,
}: {
    params: Promise<{ lang: Locale; id: string }>
}) {
    const { lang, id } = await params
    const dictionary = await getDictionary(lang)
    const cookieStore = await cookies()
    const token = cookieStore.get('auth_token')?.value

    if (!token) {
        redirect(`/${lang}/login`)
    }

    const userId = verifyToken(token)
    if (!userId) {
        redirect(`/${lang}/login`)
    }

    // Find the course — try by ID first, then by title match (for slug-like URLs)
    let course = await prisma.course.findUnique({
        where: { id },
        include: {
            modules: {
                orderBy: { order: 'asc' },
            },
            lessons: {
                orderBy: { order: 'asc' },
                include: {
                    assets: true,
                    comments: {
                        include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
                        orderBy: { createdAt: 'desc' }
                    },
                    likes: { where: { userId } },
                    favoritedBy: { where: { userId } },
                    enhancedProgress: { where: { userId } },
                    progress: { where: { userId } }
                }
            }
        }
    }).catch(() => null) // Catch invalid cuid errors

    // If not found by ID, try matching by title (slug-like lookup)
    if (!course) {
        const searchTitle = id.replace(/-/g, ' ')
        const courses = await prisma.course.findMany({
            where: {
                OR: [
                    { title: { contains: searchTitle, mode: 'insensitive' } },
                    { titleRu: { contains: searchTitle, mode: 'insensitive' } }
                ]
            },
            include: {
                modules: {
                    orderBy: { order: 'asc' },
                },
                lessons: {
                    orderBy: { order: 'asc' },
                    include: {
                        assets: true,
                        comments: {
                            include: { user: { select: { firstName: true, lastName: true, avatar: true } } },
                            orderBy: { createdAt: 'desc' }
                        },
                        likes: { where: { userId } },
                        favoritedBy: { where: { userId } },
                        enhancedProgress: { where: { userId } },
                        progress: { where: { userId } }
                    }
                }
            },
            take: 1
        })
        course = courses[0] || null
    }

    if (!course) redirect(`/${lang}/account`)

    // Check access using resolved course ID
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            purchases: { where: { courseId: course.id, status: 'PAID' } },
            subscriptions: { where: { courseId: course.id, status: 'ACTIVE' } },
            progress: { where: { completed: true } }
        }
    })

    if (!user) redirect(`/${lang}/login`)

    const hasPurchase = user.purchases.length > 0
    const hasSubscription = user.subscriptions.length > 0
    const isAdmin = user.role === 'ADMIN'

    const hasAccess = hasPurchase || hasSubscription || isAdmin

    if (!hasAccess) {
        redirect(`/${lang}/account`)
    }

    // IMPORTANT: Prisma Decimal objects are not serializable to Client Components.
    const plainCourse = JSON.parse(JSON.stringify(course))
    const plainUser = JSON.parse(JSON.stringify(user))

    return (
        <CourseLearningInterface
            course={plainCourse}
            user={plainUser}
            lang={lang}
            dictionary={dictionary}
        />
    )
}
