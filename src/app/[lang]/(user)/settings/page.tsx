import { getLocalUser } from "@/lib/auth/server"
import { redirect } from "next/navigation"
import { Locale } from "@/dictionaries/get-dictionary"
import { prisma } from "@/lib/prisma"
import { UserSettings } from "@/components/user/UserSettings"

export default async function SettingsPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const user = await getLocalUser()

    if (!user) {
        redirect(`/${lang}/login`)
    }

    // Fetch full user + profile data
    const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            avatar: true,
            profile: {
                select: {
                    gender: true,
                    birthDate: true,
                    healthIssues: true,
                }
            }
        }
    }) as any

    const displayName = [fullUser?.firstName, fullUser?.lastName].filter(Boolean).join(' ') || null

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <section className="pt-8 pb-20 px-6">
                <div className="max-w-[800px] mx-auto">
                    <UserSettings
                        lang={lang}
                        userId={user.id}
                        avatar={fullUser?.avatar || null}
                        name={displayName}
                        email={user.email}
                        gender={fullUser?.profile?.gender || null}
                        birthDate={fullUser?.profile?.birthDate ? new Date(fullUser.profile.birthDate).toISOString().split('T')[0] : null}
                        healthIssues={fullUser?.profile?.healthIssues ? (typeof fullUser.profile.healthIssues === 'string' ? fullUser.profile.healthIssues.split(',').map((s: string) => s.trim()) : fullUser.profile.healthIssues) : null}
                    />
                </div>
            </section>
        </main>
    )
}
