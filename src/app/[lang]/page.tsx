import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Header } from "@/components/Header"
import { Hero } from "@/components/landing/Hero"
import { ProgramsSection } from "@/components/landing/ProgramsSection"

export default async function Home({
  params,
}: {
  params: Promise<{ lang: Locale }>
}) {
  const { lang } = await params
  const dictionary = await getDictionary(lang)

  return (
    <main className="min-h-screen">
      <Header lang={lang} dictionary={dictionary} />
      <Hero lang={lang} dictionary={dictionary} />
      <ProgramsSection lang={lang} dictionary={dictionary} />
    </main>
  )
}
