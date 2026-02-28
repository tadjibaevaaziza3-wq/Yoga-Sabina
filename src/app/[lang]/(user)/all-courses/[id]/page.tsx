import { Locale } from "@/dictionaries/get-dictionary"
import { prisma } from "@/lib/prisma"
import { getLocalUser } from "@/lib/auth/server"
import CourseDetail from "@/components/user/CourseDetail"
import { notFound } from "next/navigation"

type Props = {
    params: Promise<{ lang: Locale; id: string }>
}

export default async function UserPanelCoursePage({ params }: Props) {
    const { lang, id } = await params

    // Look up by ID, then fallback to slug-like title search
    let course: any = null
    try {
        course = await prisma.course.findUnique({ where: { id } })
    } catch (e) { /* invalid ID format */ }

    if (!course) {
        try {
            const searchTerm = id.replace(/-/g, ' ')
            course = await prisma.course.findFirst({
                where: {
                    OR: [
                        { title: { contains: searchTerm, mode: 'insensitive' } },
                        { titleRu: { contains: searchTerm, mode: 'insensitive' } },
                    ]
                }
            })
        } catch (e) { /* DB query failed */ }
    }

    if (!course) notFound()

    const user = await getLocalUser()

    return (
        <div className="space-y-6 animate-fade-in">
            <CourseDetail
                courseId={course.id}
                lang={lang}
                userId={user?.id || undefined}
                userEmail={user?.email || undefined}
                userNumber={user?.userNumber || undefined}
            />
        </div>
    )
}
