import { getLocalUser } from "@/lib/auth/server"
import { redirect } from "next/navigation"
import { UserChatManager } from "@/components/user/UserChatManager"
import { Header } from "@/components/Header"
import { getDictionary, Locale } from "@/dictionaries/get-dictionary"

export default async function UserChatPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const user = await getLocalUser()

    if (!user) {
        redirect(`/${lang}/login`)
    }

    const dictionary = await getDictionary(lang)

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Header />
            <div className="pt-32 pb-20">
                <div className="max-w-[1400px] mx-auto px-6">
                    <header className="mb-8">
                        <h1 className="text-4xl font-serif font-black text-[var(--foreground)] mb-2">
                            {lang === 'uz' ? 'Mening Chatlarim' : 'Мои Чаты'}
                        </h1>
                        <p className="text-sm font-bold text-[var(--primary)]/40 uppercase tracking-widest">
                            {lang === 'uz' ? 'Kursdoshlar va administratorlar bilan muloqot' : 'Общение с сокурсниками и администраторами'}
                        </p>
                    </header>

                    <UserChatManager currentUserId={user.id} lang={lang} />
                </div>
            </div>
        </main>
    )
}
