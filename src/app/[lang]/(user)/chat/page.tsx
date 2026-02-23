import { getLocalUser } from "@/lib/auth/server"
import { redirect } from "next/navigation"
import { UserChatManager } from "@/components/user/UserChatManager"
import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { SubscriptionGate } from "@/components/user/SubscriptionGate"
import { checkUserAccess } from "@/lib/db/access"

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

    const hasSubscription = await checkUserAccess(user.id)

    return (
        <div className="space-y-6">
            <SubscriptionGate isSubscribed={hasSubscription} lang={lang} featureName={lang === 'uz' ? "AI Chat" : "AI Чат"}>
                <header className="mb-6">
                    <h1 className="text-2xl font-serif font-black text-[var(--foreground)] mb-1">
                        {lang === 'uz' ? 'AI Yordamchi' : 'AI Помощник'}
                    </h1>
                    <p className="text-xs text-[var(--foreground)]/30 font-medium">
                        {lang === 'uz' ? 'Sabina terapevt bilan shaxsiy maslahat' : 'Персональная консультация с тренером Сабиной'}
                    </p>
                </header>
                <UserChatManager currentUserId={user.id} lang={lang} />
            </SubscriptionGate>
        </div>
    )
}
