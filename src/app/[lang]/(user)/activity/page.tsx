import { Locale } from "@/dictionaries/get-dictionary"
import { prisma } from "@/lib/prisma"
import { getLocalUser } from "@/lib/auth/server"
import { Play, Clock, Star, Heart, BookOpen, Calendar, TrendingUp } from "lucide-react"

export default async function ActivityPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const user = await getLocalUser()

    let stats = {
        coursesEnrolled: 0,
        coursesCompleted: 0,
        totalVideosWatched: 0,
        totalWatchMinutes: 0,
        favoriteCount: 0,
        savedCount: 0,
        lastLogin: null as string | null,
    }

    if (user) {
        const fullUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                purchases: { where: { status: 'PAID' } },
                subscriptions: { where: { status: 'ACTIVE' } },
                progress: { where: { completed: true } },
                enhancedProgress: true,
                profile: true,
                likes: true,
                favoriteLessons: true,
            }
        })

        if (fullUser) {
            const totalSeconds = fullUser.enhancedProgress.reduce((sum, p) => sum + (p.progress || 0), 0)
            stats = {
                coursesEnrolled: fullUser.purchases.length + fullUser.subscriptions.length,
                coursesCompleted: 0, // Would need more complex logic
                totalVideosWatched: fullUser.progress.length,
                totalWatchMinutes: Math.round(totalSeconds / 60) || Math.round((Number(fullUser.profile?.totalYogaTime) || 0) / 60),
                favoriteCount: fullUser.likes?.length || 0,
                savedCount: (fullUser as any).favoriteLessons?.length || 0,
                lastLogin: fullUser.updatedAt?.toISOString() || null,
            }
        }
    }

    const statCards = [
        { label: lang === 'uz' ? "Kurslar" : "Курсы", value: stats.coursesEnrolled, icon: <BookOpen className="w-5 h-5" />, color: "text-blue-500 bg-blue-50" },
        { label: lang === 'uz' ? "Ko'rilgan videolar" : "Просмотрено видео", value: stats.totalVideosWatched, icon: <Play className="w-5 h-5" />, color: "text-emerald-500 bg-emerald-50" },
        { label: lang === 'uz' ? "Jami vaqt" : "Всего времени", value: `${Math.floor(stats.totalWatchMinutes / 60)}h ${stats.totalWatchMinutes % 60}m`, icon: <Clock className="w-5 h-5" />, color: "text-purple-500 bg-purple-50" },
        { label: lang === 'uz' ? "Yoqtirilganlar" : "Избранное", value: stats.favoriteCount, icon: <Heart className="w-5 h-5" />, color: "text-rose-500 bg-rose-50" },
        { label: lang === 'uz' ? "Saqlangan" : "Сохранённые", value: stats.savedCount, icon: <Star className="w-5 h-5" />, color: "text-amber-500 bg-amber-50" },
        { label: lang === 'uz' ? "So'nggi kirish" : "Последний вход", value: stats.lastLogin ? new Date(stats.lastLogin).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'ru-RU') : '—', icon: <Calendar className="w-5 h-5" />, color: "text-gray-500 bg-gray-50" },
    ]

    return (
        <div className="space-y-8">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-serif font-black text-[var(--foreground)] mb-2">
                    {lang === 'uz' ? "Mening Faolligim" : "Моя Активность"}
                </h1>
                <p className="text-sm text-[var(--foreground)]/40 font-medium">
                    {lang === 'uz' ? "O'quv jarayoni va yutuqlaringiz" : "Ваш прогресс обучения и достижения"}
                </p>
            </div>

            {/* Stats Grid */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-6 flex items-center gap-4 shadow-sm">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/30 mb-1">
                                {stat.label}
                            </div>
                            <div className="text-2xl font-black text-[var(--foreground)]">
                                {stat.value}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Motivational Message */}
            <div className="bg-gradient-to-br from-[var(--primary)] to-[var(--accent)] rounded-2xl p-8 text-white">
                <div className="flex items-center gap-3 mb-3">
                    <TrendingUp className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-white/60">
                        {lang === 'uz' ? "Motivatsiya" : "Мотивация"}
                    </span>
                </div>
                <p className="text-lg font-serif italic leading-relaxed">
                    {lang === 'uz'
                        ? "Har bir mashqingiz — bu sog'lom hayot sari bir qadam. Davom eting! 🧘‍♀️"
                        : "Каждая практика — это шаг к здоровой жизни. Продолжайте! 🧘‍♀️"}
                </p>
            </div>

            {/* Contact */}
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
