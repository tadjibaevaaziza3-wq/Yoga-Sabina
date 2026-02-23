import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { redirect } from "next/navigation"
import { getLocalUser } from "@/lib/auth/server"
import MyCourses from "@/components/user/MyCourses"

export default async function MyCoursesPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params

    const user = await getLocalUser()

    if (!user) {
        redirect(`/${lang}/login?redirect=/${lang}/my-courses`)
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-black text-[var(--foreground)] mb-2">
                    {lang === 'uz' ? "Mening Kurslarim" : "Мои Курсы"}
                </h1>
                <p className="text-sm text-[var(--foreground)]/40 font-medium">
                    {lang === 'uz'
                        ? "Sotib olingan kurslaringiz va o'quv jarayoni"
                        : "Ваши приобретённые курсы и прогресс обучения"}
                </p>
            </div>

            <MyCourses lang={lang} />
        </div>
    )
}
