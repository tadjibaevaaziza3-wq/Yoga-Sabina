import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Container } from "@/components/ui/Container"
import { Header } from "@/components/Header"
import { CourseCard } from "@/components/CourseCard"
import { coursesData } from "@/lib/data/courses"

export default async function CoursesPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dictionary = await getDictionary(lang)
    const courses = coursesData[lang]

    return (
        <main className="min-h-screen bg-secondary/30">
            <Header lang={lang} dictionary={dictionary} />

            <section className="py-20">
                <Container>
                    <div className="mb-16">
                        <h1 className="text-5xl font-serif text-primary mb-4">
                            {dictionary.courses.title}
                        </h1>
                        <p className="text-primary/60 font-medium">
                            {dictionary.courses.subtitle}
                        </p>
                    </div>

                    {/* Filtering Placeholder */}
                    <div className="flex flex-wrap gap-4 mb-12">
                        <button className="px-6 py-2 rounded-full bg-primary text-white font-bold tracking-tight shadow-lg">
                            Barchasi
                        </button>
                        <button className="px-6 py-2 rounded-full bg-white text-primary border border-primary/10 font-bold tracking-tight hover:bg-primary/5 transition-all">
                            Onlayn
                        </button>
                        <button className="px-6 py-2 rounded-full bg-white text-primary border border-primary/10 font-bold tracking-tight hover:bg-primary/5 transition-all">
                            Oflayn
                        </button>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                id={course.id}
                                title={course.title}
                                description={course.description}
                                price={course.price}
                                duration={course.duration}
                                type={course.type}
                                lang={lang}
                                dictionary={dictionary}
                            />
                        ))}
                    </div>
                </Container>
            </section>
        </main>
    )
}
