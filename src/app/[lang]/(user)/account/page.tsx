
import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { prisma } from "@/lib/prisma"
import { Clock, Play, Flame, Star, BookOpen, TrendingUp, ChevronRight, MapPin, CheckCircle } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getLocalUser } from "@/lib/auth/server"
import MyCoursesGrid from "@/components/dashboard/MyCoursesGrid"
import { getRecommendations } from "@/lib/recommendations"
import YogaCalendar from "@/components/user/YogaCalendar"
import OfflineProgress from "@/components/user/OfflineProgress"
import WatchedTimeChart from "@/components/user/WatchedTimeChart"

export default async function DashboardPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dictionary = await getDictionary(lang)

    let user = await getLocalUser()
    let myCourses: any[] = []
    let activityData: { date: string, count: number, level: number }[] = []
    let recommendationData: any = null
    let offlineStats = { totalSessions: 0, attended: 0, totalCourses: 0, attendanceRate: 0 }

    if (user) {
        try {
            const fullUser = await prisma.user.findUnique({
                where: { id: user.id },
                include: {
                    purchases: { where: { status: 'PAID' }, select: { courseId: true } },
                    subscriptions: { where: { status: 'ACTIVE' }, select: { courseId: true, endsAt: true } },
                    profile: true,
                    enhancedProgress: {
                        orderBy: { lastWatched: 'desc' },
                        select: {
                            lessonId: true, progress: true, duration: true,
                            completed: true, lastWatched: true,
                            lesson: {
                                select: {
                                    id: true, title: true,
                                    course: { select: { title: true, coverImage: true, lessons: { select: { id: true } } } }
                                }
                            }
                        }
                    },
                    progress: { where: { completed: true }, select: { lessonId: true } },
                }
            })

            if (fullUser) {
                user = fullUser as any

                const activityMap = new Map<string, { count: number, minutes: number, lessonIds: Set<string> }>()
                // Build activity from enhancedProgress: count unique lessons per day, sum real minutes
                fullUser.enhancedProgress.forEach(prog => {
                    const date = prog.lastWatched.toISOString().split('T')[0]
                    const existing = activityMap.get(date) || { count: 0, minutes: 0, lessonIds: new Set<string>() }
                    // Only count each lesson once per day
                    if (!existing.lessonIds.has(prog.lessonId)) {
                        existing.lessonIds.add(prog.lessonId)
                        existing.count += 1
                    }
                    // Use actual watched seconds converted to minutes
                    existing.minutes += Math.round((prog.progress || 0) / 60)
                    activityMap.set(date, existing)
                })
                activityData = Array.from(activityMap.entries()).map(([date, data]) => ({
                    date, count: data.count, level: Math.min(4, Math.ceil(data.count / 2))
                }))

                try {
                    const allDbCourses = await prisma.course.findMany({
                        where: { isActive: true, type: 'ONLINE' },
                        orderBy: { createdAt: 'desc' },
                        include: { lessons: { select: { id: true } } }
                    })

                    const processedCourses = allDbCourses.map(course => {
                        const hasPurchase = (user as any).purchases?.some((p: any) => p.courseId === course.id)
                        const hasSubscription = (user as any).subscriptions?.some((s: any) => s.courseId === course.id)
                        const courseLessonIds = course.lessons.map(l => l.id)
                        const completedInCourse = (user as any).progress.filter((p: any) => courseLessonIds.includes(p.lessonId)).length
                        const totalLessons = course.lessons.length
                        const progressPercent = totalLessons > 0 ? Math.round((completedInCourse / totalLessons) * 100) : 0

                        return {
                            ...course,
                            price: course.price ? Number(course.price) : null,
                            lessons: undefined,
                            isUnlocked: hasPurchase || hasSubscription,
                            lessonCount: totalLessons,
                            completedCount: completedInCourse,
                            progress: progressPercent
                        }
                    })

                    myCourses = processedCourses.filter(c => c.isUnlocked)
                } catch (courseError) {
                    console.error('Failed to fetch courses for dashboard:', courseError)
                }

                try {
                    recommendationData = await getRecommendations(fullUser.id)
                } catch (recError) {
                    console.error('Failed to fetch recommendations:', recError)
                }
            }
        } catch (dbError) {
            console.error('Failed to fetch user data for account page (pgBouncer?):', dbError)
            // Page will render with basic user info from auth token
        }

        // Fetch offline course KPI data
        try {
            const offlineAttendances = await prisma.offlineAttendance.findMany({
                where: { userId: user.id },
                select: { status: true, session: { select: { courseId: true } } }
            })
            const offlineCourseSet = new Set(offlineAttendances.map(a => a.session.courseId))
            const totalSessions = offlineAttendances.length
            const attended = offlineAttendances.filter(a => a.status === 'PRESENT' || a.status === 'LATE').length
            offlineStats = {
                totalSessions,
                attended,
                totalCourses: offlineCourseSet.size,
                attendanceRate: totalSessions > 0 ? Math.round((attended / totalSessions) * 100) : 0
            }
        } catch (e) {
            console.error('Failed to fetch offline stats:', e)
        }
    }

    // Compute stats from enhancedProgress (actual video player data)
    const enhancedProgressData = (user as any)?.enhancedProgress || []
    const completedVideos = enhancedProgressData.filter((p: any) => p.completed).length
    const totalWatchedSeconds = enhancedProgressData.reduce((sum: number, p: any) => sum + (p.progress || 0), 0)
    const totalMinutesWatched = Math.round(totalWatchedSeconds / 60)
    const currentStreak = (user as any)?.profile?.currentStreak || 0
    const activeSubscription = (user as any)?.subscriptions?.[0]
    let daysRemaining = 0
    if (activeSubscription) {
        const diff = new Date(activeSubscription.endsAt).getTime() - Date.now()
        daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }
    const totalVideos = enhancedProgressData.length
    const totalHours = Math.floor(totalMinutesWatched / 60)
    const totalMins = totalMinutesWatched % 60

    // XP calculation (videos watched * 10 + completed * 25 + streak * 5)
    const xpTotal = (totalVideos * 10) + (completedVideos * 25) + (currentStreak * 5)
    const level = Math.floor(xpTotal / 100) + 1
    const xpInLevel = xpTotal % 100
    const xpPercent = xpInLevel

    return (
        <div className="space-y-8 animate-fade-in">

            {/* ── Subscription Expiry Warning ── */}
            {activeSubscription && daysRemaining <= 3 && daysRemaining > 0 && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 md:p-5 flex items-center gap-4 shadow-sm animate-fade-in">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-amber-900">
                            {lang === 'uz'
                                ? `Obunangiz ${daysRemaining} kunda tugaydi!`
                                : `Ваша подписка истекает через ${daysRemaining} дн.!`}
                        </p>
                        <p className="text-xs text-amber-700/70 mt-0.5">
                            {lang === 'uz'
                                ? "Premium imkoniyatlardan foydalanishni davom ettirish uchun yangilang"
                                : "Продлите, чтобы продолжить пользоваться Premium"}
                        </p>
                    </div>
                    <Link href={`/${lang}/my-courses`} className="px-4 py-2 bg-amber-500 text-white text-xs font-bold rounded-xl hover:bg-amber-600 transition-colors shrink-0 shadow-sm">
                        {lang === 'uz' ? 'Yangilash' : 'Продлить'}
                    </Link>
                </div>
            )}

            {activeSubscription && daysRemaining === 0 && (
                <div className="bg-gradient-to-r from-red-50 to-rose-50 border border-red-200 rounded-2xl p-4 md:p-5 flex items-center gap-4 shadow-sm animate-fade-in">
                    <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                        <Clock className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-red-900">
                            {lang === 'uz' ? 'Obunangiz tugadi!' : 'Подписка истекла!'}
                        </p>
                        <p className="text-xs text-red-700/70 mt-0.5">
                            {lang === 'uz' ? "Kurs videolariga kirishni davom ettirish uchun yangilang" : "Продлите для доступа к видео курсов"}
                        </p>
                    </div>
                    <Link href={`/${lang}/my-courses`} className="px-4 py-2 bg-red-500 text-white text-xs font-bold rounded-xl hover:bg-red-600 transition-colors shrink-0 shadow-sm">
                        {lang === 'uz' ? 'Yangilash' : 'Продлить'}
                    </Link>
                </div>
            )}

            {/* ── Profile Hero ── */}
            <div className="bg-white rounded-3xl border border-[var(--foreground)]/[0.04] p-6 md:p-8 shadow-sm">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                    {/* Avatar + Streak */}
                    <div className="relative">
                        {(user as any)?.avatar ? (
                            <img
                                src={(user as any).avatar}
                                alt="Avatar"
                                className="w-[88px] h-[88px] rounded-full object-cover ring-[3px] ring-[var(--primary)]/20"
                            />
                        ) : (
                            <div className="w-[88px] h-[88px] rounded-full bg-gradient-to-br from-[var(--primary)] to-[#1a5c4d] flex items-center justify-center text-white text-2xl font-bold shadow-md">
                                {(user?.firstName?.[0] || '?').toUpperCase()}
                            </div>
                        )}
                        {/* Level Badge */}
                        <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border-2 border-[var(--primary)]/30 flex items-center justify-center text-[9px] font-black text-[var(--primary)] shadow-sm">
                            {level}
                        </div>
                    </div>

                    {/* Name + Status */}
                    <div className="flex-1 text-center sm:text-left">
                        <h1 className="text-2xl font-serif font-black text-[var(--foreground)] mb-1">
                            {lang === 'uz'
                                ? `Salom, ${user?.firstName || 'Mehmon'}!`
                                : `Привет, ${user?.firstName || 'Гость'}!`}
                        </h1>
                        <p className="text-xs text-[var(--foreground)]/30 font-medium mb-3">
                            {lang === 'uz' ? "Bugun o'zingiz uchun nima qilasiz?" : "Что вы сделаете для себя сегодня?"}
                        </p>
                        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                            {activeSubscription && (
                                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary)]/8 text-[var(--primary)] text-[10px] font-bold border border-[var(--primary)]/10">
                                    ✦ Premium · {daysRemaining} {lang === 'uz' ? 'kun' : 'дн.'}
                                </span>
                            )}
                            {currentStreak > 0 && (
                                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-bold border border-[var(--primary)]/20 animate-streak-glow">
                                    <Flame className="w-3 h-3" /> {currentStreak} {lang === 'uz' ? 'kun streak' : 'дн. серия'}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* XP Ring */}
                    <div className="flex flex-col items-center">
                        <div className="relative w-20 h-20">
                            <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                                <circle cx="50" cy="50" r="45" fill="none" stroke="#f0ebe4" strokeWidth="6" />
                                <circle
                                    cx="50" cy="50" r="45" fill="none"
                                    stroke="var(--primary)" strokeWidth="6"
                                    strokeLinecap="round"
                                    strokeDasharray="283"
                                    strokeDashoffset={283 - (283 * xpPercent / 100)}
                                    className="animate-xp-ring"
                                />
                            </svg>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-lg font-black text-[var(--foreground)]">{xpPercent}</span>
                                <span className="text-[7px] font-bold text-[var(--foreground)]/25 uppercase tracking-wider">XP</span>
                            </div>
                        </div>
                        <span className="text-[8px] font-bold text-[var(--foreground)]/20 mt-1 uppercase tracking-wider">
                            Level {level}
                        </span>
                    </div>
                </div>
            </div>

            {/* ── Quick Stats Row ── */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                    { label: lang === 'uz' ? 'Videolar' : 'Видео', value: totalVideos, icon: <Play className="w-4 h-4" />, color: 'text-[var(--primary)] bg-[var(--primary)]/[0.08]' },
                    { label: lang === 'uz' ? 'Vaqt' : 'Время', value: `${totalHours}h ${totalMins}m`, icon: <Clock className="w-4 h-4" />, color: 'text-[var(--primary)] bg-[var(--primary)]/[0.08]' },
                    { label: 'Streak', value: `${currentStreak}`, icon: <Flame className="w-4 h-4" />, color: 'text-[var(--primary)] bg-[var(--primary)]/[0.08]' },
                    { label: 'XP', value: xpTotal, icon: <Star className="w-4 h-4" />, color: 'text-[var(--primary)] bg-[var(--primary)]/[0.08]' },
                ].map((s, i) => (
                    <div key={i} className="bg-white rounded-2xl border border-[var(--foreground)]/[0.04] p-4 shadow-sm">
                        <div className="flex items-center gap-2 mb-2">
                            <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</span>
                        </div>
                        <div className="text-xl font-black text-[var(--foreground)]">{s.value}</div>
                        <div className="text-[9px] font-semibold uppercase tracking-widest text-[var(--foreground)]/20 mt-0.5">{s.label}</div>
                    </div>
                ))}
            </div>

            {/* ── Offline Course KPI ── */}
            {offlineStats.totalSessions > 0 && (
                <div className="animate-fade-in">
                    <h2 className="text-lg font-serif font-bold text-[var(--foreground)] mb-3">
                        {lang === 'uz' ? "Offline Mashg'ulotlar" : "Офлайн занятия"}
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        {[
                            { label: lang === 'uz' ? 'Kurslar' : 'Курсы', value: offlineStats.totalCourses, icon: <BookOpen className="w-4 h-4" />, color: 'text-amber-600 bg-amber-50' },
                            { label: lang === 'uz' ? 'Davomat' : 'Посещ.', value: `${offlineStats.attended}/${offlineStats.totalSessions}`, icon: <CheckCircle className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-50' },
                            { label: lang === 'uz' ? 'Foiz' : 'Процент', value: `${offlineStats.attendanceRate}%`, icon: <TrendingUp className="w-4 h-4" />, color: 'text-blue-600 bg-blue-50' },
                        ].map((s, i) => (
                            <div key={i} className="bg-white rounded-2xl border border-[var(--foreground)]/[0.04] p-4 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`w-7 h-7 rounded-lg flex items-center justify-center ${s.color}`}>{s.icon}</span>
                                </div>
                                <div className="text-xl font-black text-[var(--foreground)]">{s.value}</div>
                                <div className="text-[9px] font-semibold uppercase tracking-widest text-[var(--foreground)]/20 mt-0.5">{s.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ── Continue Watching / My Courses ── */}
            {myCourses.length > 0 && (
                <section className="animate-fade-in" style={{ animationDelay: '0.1s' }}>
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-serif font-bold text-[var(--foreground)]">
                            {lang === 'uz' ? "Kurslaringiz" : "Ваши курсы"}
                        </h2>
                        <Link href={`/${lang}/my-courses`} className="flex items-center gap-1 text-[10px] font-bold text-[var(--primary)] hover:underline">
                            {lang === 'uz' ? "Barchasi" : "Все"} <ChevronRight className="w-3 h-3" />
                        </Link>
                    </div>
                    <MyCoursesGrid courses={myCourses} lang={lang} />
                </section>
            )}

            {/* ── Recommended For You ── */}
            {recommendationData?.recommendations?.length > 0 && (
                <section className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                    <h2 className="text-lg font-serif font-bold text-[var(--foreground)] mb-4">
                        {lang === 'uz' ? "Siz uchun tavsiya" : "Рекомендуем вам"}
                    </h2>
                    <div className="bg-gradient-to-br from-[var(--surface-warm)] to-[var(--surface-gold)] rounded-2xl border border-[var(--primary)]/10 p-6 shadow-sm">
                        <div className="flex items-start gap-5">
                            {recommendationData.recommendations[0].coverImage && (
                                <Image
                                    src={recommendationData.recommendations[0].coverImage}
                                    alt="Course"
                                    width={100}
                                    height={100}
                                    className="w-20 h-20 rounded-xl object-cover shadow-sm flex-shrink-0"
                                />
                            )}
                            <div className="flex-1 min-w-0">
                                <span className="text-[8px] font-bold uppercase tracking-widest text-[var(--primary)] mb-1 block">
                                    ✦ {lang === 'uz' ? "Tavsiya" : "Рекомендация"}
                                </span>
                                <h3 className="font-bold text-[var(--foreground)] mb-2 leading-tight">
                                    {lang === 'ru' && recommendationData.recommendations[0].titleRu ? recommendationData.recommendations[0].titleRu : recommendationData.recommendations[0].title}
                                </h3>
                                <Link
                                    href={`/${lang}/courses/${recommendationData.recommendations[0].id}`}
                                    className="inline-flex items-center gap-1 text-[10px] font-bold text-[var(--primary)] hover:underline"
                                >
                                    {lang === 'uz' ? "Ko'rish" : "Смотреть"} <ChevronRight className="w-3 h-3" />
                                </Link>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {/* ── Offline Course Attendance ── */}
            <section className="animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <OfflineProgress lang={lang} />
            </section>

            {/* ── Watched Time Chart ── */}
            <section className="animate-fade-in" style={{ animationDelay: '0.35s' }}>
                <h2 className="text-lg font-serif font-bold text-[var(--foreground)] mb-4">
                    {lang === 'uz' ? "Mashg'ulot faolligi" : "Активность тренировок"}
                </h2>
                <div className="bg-white rounded-2xl border border-[var(--foreground)]/[0.04] p-5 shadow-sm">
                    <WatchedTimeChart
                        lang={lang}
                        data={activityData.map(d => ({ date: d.date, count: d.count }))}
                    />
                </div>
            </section>

            {/* ── Mini Calendar ── */}
            <section className="animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <details className="group">
                    <summary className="cursor-pointer flex items-center gap-2 text-sm font-bold text-[var(--foreground)]/40 mb-3 hover:text-[var(--foreground)]/60 transition-colors">
                        <span>📅 {lang === 'uz' ? 'Kalendar' : 'Календарь'}</span>
                        <span className="text-[10px] group-open:rotate-180 transition-transform">▼</span>
                    </summary>
                    <div className="bg-white rounded-2xl border border-[var(--foreground)]/[0.04] p-4 shadow-sm">
                        <YogaCalendar
                            lang={lang}
                            initialCycleData={(user as any)?.profile?.cycleData}
                            practiceData={activityData.map(d => ({ date: d.date, minutes: d.count > 0 ? Math.max(d.count * 5, 1) : 0, sessions: d.count }))}
                        />
                    </div>
                </details>
            </section>

            {/* ── Motivational ── */}
            <div className="bg-gradient-to-r from-[var(--surface-warm)] to-[var(--surface-gold)] rounded-2xl border border-[var(--primary)]/8 p-6 text-center animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <p className="text-sm font-serif italic text-[var(--foreground)]/40 leading-relaxed">
                    {lang === 'uz'
                        ? "✦ Har bir mashqingiz — sog'lom va go'zal kelajak sari bir qadam ✦"
                        : "✦ Каждая практика — шаг к здоровому и прекрасному будущему ✦"}
                </p>
            </div>
        </div>
    )
}
