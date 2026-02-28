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
            userNumber: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            telegramId: true,
            telegramUsername: true,
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
                        <h1 className="text-2xl font-black text-[var(--foreground)] mb-1 flex items-center gap-3 justify-center sm:justify-start flex-wrap">
                            {displayName || (lang === 'uz' ? 'Mehmon' : 'Гость')}
                            {fullUser?.userNumber && (
                                <span className="text-[10px] font-mono font-bold bg-[var(--primary)]/10 text-[var(--primary)] px-2.5 py-1 rounded-lg">
                                    #{fullUser.userNumber}
                                </span>
                            )}
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
                        {(fullUser?.telegramId || fullUser?.telegramUsername) && (
                            <div className="flex items-center gap-2 mt-2 px-3 py-2 bg-blue-50 rounded-xl w-fit mx-auto sm:mx-0">
                                <svg viewBox="0 0 24 24" className="w-4 h-4 text-blue-500 shrink-0" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 0 0-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.74-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" /></svg>
                                <span className="text-xs font-bold text-blue-600">
                                    {fullUser.telegramUsername ? `@${fullUser.telegramUsername}` : ''}
                                </span>
                                {fullUser.telegramId && (
                                    <span className="text-[10px] text-blue-400 font-mono">ID: {fullUser.telegramId}</span>
                                )}
                            </div>
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
