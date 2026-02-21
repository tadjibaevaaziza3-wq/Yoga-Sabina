
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

    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            purchases: { where: { courseId: id, status: 'PAID' } },
            subscriptions: { where: { courseId: id, status: 'ACTIVE' } },
            progress: { where: { completed: true } }
        }
    })

    if (!user) redirect(`/${lang}/login`)

    // Check access
    const hasAccess = user.purchases.length > 0 || user.subscriptions.length > 0
    // Allow admin bypass?
    // if (user.role === 'ADMIN') hasAccess = true

    if (!hasAccess) {
        redirect(`/${lang}/account`) // Redirect to account where they can buy it
    }

    const course = await prisma.course.findUnique({
        where: { id },
        include: {
            lessons: {
                orderBy: { order: 'asc' },
                include: {
                    assets: true,
                    comments: {
                        include: { user: { select: { firstName: true, lastName: true } } },
                        orderBy: { createdAt: 'desc' }
                    },
                    likes: { where: { userId: user.id } }
                }
            }
        }
    })

    if (!course) redirect(`/${lang}/account`)

    return (
        <CourseLearningInterface
            course={course as any}
            user={user as any}
            lang={lang}
            dictionary={dictionary}
        />
    )
}
