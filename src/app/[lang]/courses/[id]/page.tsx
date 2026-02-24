import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Header } from "@/components/Header"
import CourseDetail from "@/components/user/CourseDetail"
import { getLocalUser } from "@/lib/auth/server"
import { Metadata, ResolvingMetadata } from "next"
import { prisma } from "@/lib/prisma"
import { StructuredData } from "@/components/seo/StructuredData"
import { notFound } from "next/navigation"

type Props = {
    params: Promise<{ lang: Locale; id: string }>
}

export async function generateMetadata(
    { params }: Props,
    parent: ResolvingMetadata
): Promise<Metadata> {
    const { lang, id } = await params

    let course: any = null
    try {
        course = await prisma.course.findUnique({
            where: { id },
            select: {
                title: true,
                titleRu: true,
                description: true,
                descriptionRu: true,
                seoTitle: true,
                seoDescription: true,
                coverImage: true,
            }
        })
    } catch (e) {
        // Invalid ID format (e.g. slug from static data)
    }

    if (!course) {
        return {
            title: "Course Not Found | Baxtli Men"
        }
    }

    const title = course.seoTitle || (lang === 'ru' && course.titleRu ? course.titleRu : course.title);
    const description = course.seoDescription || (lang === 'ru' && course.descriptionRu ? course.descriptionRu : course.description);

    return {
        title: title,
        description: description?.slice(0, 160), // Limit description length
        openGraph: {
            title: title,
            description: description?.slice(0, 200),
            images: course.coverImage ? [course.coverImage] : [],
        },
        alternates: {
            canonical: `/${lang}/courses/${id}`,
            languages: {
                'uz': `/uz/courses/${id}`,
                'ru': `/ru/courses/${id}`,
            }
        }
    }
}

export default async function CoursePage({
    params,
}: Props) {
    const { lang, id } = await params

    // Fetch course for schema
    let course: any = null
    try {
        course = await prisma.course.findUnique({
            where: { id }
        })
    } catch (e) {
        // Invalid ID format (e.g. slug from static data)
    }

    if (!course) notFound()

    const dictionary = await getDictionary(lang)
    const user = await getLocalUser()

    const courseSchema = {
        "@context": "https://schema.org",
        "@type": "Course",
        "name": lang === 'ru' ? course.titleRu || course.title : course.title,
        "description": lang === 'ru' ? course.descriptionRu || course.description : course.description,
        "provider": {
            "@type": "Organization",
            "name": "Baxtli Men Academy",
            "sameAs": "https://baxtli-men.uz"
        },
        "url": `https://baxtli-men.uz/${lang}/courses/${id}`,
        "image": course.coverImage
    }

    return (
        <main className="min-h-screen bg-[#F8FAFA]">
            <StructuredData data={courseSchema} id={`course-${id}-schema`} />
            <Header />

            <CourseDetail
                courseId={id}
                lang={lang}
                userId={user?.id || undefined}
                userEmail={user?.email || undefined}
            />
        </main>
    )
}
