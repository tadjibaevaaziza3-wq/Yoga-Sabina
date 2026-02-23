import { getLocalUser } from "@/lib/auth/server"
import { redirect } from "next/navigation"
import { Locale } from "@/dictionaries/get-dictionary"
import { prisma } from "@/lib/prisma"
import { UserSettings } from "@/components/user/UserSettings"

export default async function ProfilePage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const user = await getLocalUser()

    if (!user) {
        redirect(`/${lang}/login`)
    }

    const fullUser = await prisma.user.findUnique({
        where: { id: user.id },
        select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            createdAt: true,
            subscriptions: {
                where: { status: 'ACTIVE' },
                select: { status: true, endsAt: true },
                take: 1,
            },
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
    const hasSubscription = (fullUser?.subscriptions?.length || 0) > 0
    const joinDate = fullUser?.createdAt ? new Date(fullUser.createdAt).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'ru-RU', { year: 'numeric', month: 'long', day: 'numeric' }) : null

    return (
        <div className="space-y-8">
            {/* Profile Header */}
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-8">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                    {/* Avatar */}
                    <div className="relative">
                        {fullUser?.avatar ? (
                            <img
                                src={fullUser.avatar}
                                alt="Avatar"
                                className="w-24 h-24 rounded-2xl object-cover ring-4 ring-[var(--primary)]/10"
                            />
                        ) : (
                            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] flex items-center justify-center text-white text-3xl font-black shadow-lg">
                                {(fullUser?.firstName?.[0] || '?').toUpperCase()}
                            </div>
                        )}
                    </div>
                    {/* Info */}
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-black text-[var(--foreground)] mb-1">
                            {displayName || (lang === 'uz' ? 'Mehmon' : 'Гость')}
                        </h1>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-xs text-[var(--foreground)]/40 font-medium">
                            {hasSubscription ? (
                                <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                                    {lang === 'uz' ? "Obuna faol" : "Подписка активна"}
                                </span>
                            ) : (
                                <span className="text-orange-500 font-bold">
                                    {lang === 'uz' ? "Obuna yo'q" : "Нет подписки"}
                                </span>
                            )}
                            {joinDate && (
                                <span>{lang === 'uz' ? `Qo'shilgan: ${joinDate}` : `Регистрация: ${joinDate}`}</span>
                            )}
                        </div>
                        {fullUser?.phone && (
                            <div className="text-xs text-[var(--foreground)]/30 mt-1">📱 {fullUser.phone}</div>
                        )}
                    </div>
                </div>
            </div>

            {/* Settings Form */}
            <div className="max-w-[800px]">
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

            {/* Contact Footer */}
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-6 text-center">
                <p className="text-xs text-[var(--foreground)]/40 font-medium">
                    {lang === 'uz'
                        ? "Savollar uchun: Telegram: @Sabina_Radjapovna"
                        : "Вопросы: Telegram: @Sabina_Radjapovna"}
                </p>
            </div>
        </div>
    )
}
