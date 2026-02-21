import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import CoursesClient from "./CoursesClient"

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    const dictionary = await getDictionary(lang as Locale)

    return {
        title: dictionary.courses.title,
        description: dictionary.courses.description,
    }
}

export default async function CoursesPage({ params }: { params: Promise<{ lang: string }> }) {
    const { lang } = await params
    const dictionary = await getDictionary(lang as Locale)

    return (
        <CoursesClient
            lang={lang as Locale}
            dictionary={dictionary}
        />
    )
}
