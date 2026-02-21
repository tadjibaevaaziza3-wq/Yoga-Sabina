import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Container } from "@/components/ui/Container"
import MyCourses from "@/components/user/MyCourses"
import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function MyCoursesPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dictionary = await getDictionary(lang)

    // Check authentication
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        redirect(`/${lang}/login?redirect=/${lang}/my-courses`)
    }

    return (
        <main className="min-h-screen bg-[var(--background)]">

            <section className="pt-32 pb-20">
                <Container>
                    <div className="mb-12">
                        <h1 className="text-4xl md:text-5xl font-serif font-black text-[var(--foreground)] mb-4">
                            {lang === 'uz' ? "Mening kurslarim" : "Мои курсы"}
                        </h1>
                        <p className="text-lg text-[var(--foreground)]/60">
                            {lang === 'uz'
                                ? "Sotib olingan kurslaringiz va o'quv jarayoni"
                                : "Ваши приобретенные курсы и прогресс обучения"}
                        </p>
                    </div>

                    <MyCourses lang={lang} />
                </Container>
            </section>
        </main>
    )
}
