
import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Header } from "@/components/Header"
import { prisma } from "@/lib/prisma"
import { LayoutDashboard, BookOpen, Settings, Clock, Heart, MessageSquare, Lock, Play, Activity, TrendingUp, Calendar } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { cookies } from "next/headers"
import UserDashboardClient from "@/components/dashboard/UserDashboardClient"
import { ProfileSettings } from "@/components/user/ProfileSettings"
import { getLocalUser } from "@/lib/auth/server"
import CourseListClient from "@/components/dashboard/CourseListClient"
import ActivityHeatmap from "@/components/dashboard/ActivityHeatmap"
import MyCoursesGrid from "@/components/dashboard/MyCoursesGrid"
import { getRecommendations } from "@/lib/recommendations"

export default async function AccountPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dictionary = await getDictionary(lang)

    let user = await getLocalUser()
    let myCourses: any[] = []
    let availableCourses: any[] = []
    let activityData: { date: string, count: number, level: number }[] = []
    let recommendationData: any = null

    if (user) {
        const fullUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                purchases: { where: { status: 'PAID' } },
                subscriptions: { where: { status: 'ACTIVE' } },
                profile: true,
                enhancedProgress: {
                    orderBy: { lastWatched: 'desc' },
                    include: {
                        lesson: {
                            include: {
                                course: { select: { title: true, coverImage: true, lessons: { select: { id: true } } } }
                            }
                        }
                    }
                },
                progress: { where: { completed: true } },
                eventLogs: {
                    where: {
                        createdAt: {
                            gte: new Date(new Date().setFullYear(new Date().getFullYear() - 1))
                        }
                    },
                    select: { createdAt: true }
                }
            }
        })

        if (fullUser) {
            user = fullUser as any

            // --- 1. Process Activity Data for Heatmap ---
            const activityMap = new Map<string, number>()
            fullUser.eventLogs.forEach(log => {
                const date = log.createdAt.toISOString().split('T')[0]
                activityMap.set(date, (activityMap.get(date) || 0) + 1)
            })
            // Also include video progress as activity
            fullUser.enhancedProgress.forEach(prog => {
                const date = prog.lastWatched.toISOString().split('T')[0]
                activityMap.set(date, (activityMap.get(date) || 0) + 1)
            })

            activityData = Array.from(activityMap.entries()).map(([date, count]) => ({
                date,
                count,
                level: Math.min(4, Math.ceil(count / 2)) // Simple level calc
            }))

            // --- 2. Process Courses (Active vs Available) ---
            const allDbCourses = await prisma.course.findMany({
                where: { isActive: true, type: 'ONLINE' },
                orderBy: { createdAt: 'desc' },
                include: { lessons: { select: { id: true } } }
            })

            const processedCourses = allDbCourses.map(course => {
                const hasPurchase = (user as any).purchases?.some((p: any) => p.courseId === course.id)
                const hasSubscription = (user as any).subscriptions?.some((s: any) => s.courseId === course.id)

                // Calculate progress for this course
                const courseLessonIds = course.lessons.map(l => l.id)
                const completedInCourse = (user as any).progress.filter((p: any) => courseLessonIds.includes(p.lessonId)).length
                const totalLessons = course.lessons.length
                const progressPercent = totalLessons > 0 ? Math.round((completedInCourse / totalLessons) * 100) : 0

                return {
                    ...course,
                    isUnlocked: hasPurchase || hasSubscription,
                    lessonCount: totalLessons,
                    completedCount: completedInCourse,
                    progress: progressPercent
                }
            })

            myCourses = processedCourses.filter(c => c.isUnlocked)
            availableCourses = processedCourses.filter(c => !c.isUnlocked)

            // --- 3. Get AI Recommendations ---
            recommendationData = await getRecommendations(fullUser.id)
        }
    }

    // --- 4. Calculate KPI Stats ---
    const totalMinutesWatched = Math.round(((user as any)?.profile?.totalYogaTime || 0) / 60)
    const currentStreak = (user as any)?.profile?.currentStreak || 0
    const activeSubscription = (user as any)?.subscriptions?.[0]

    // Calculate days remaining if subscription exists
    let daysRemaining = 0
    if (activeSubscription) {
        const now = new Date()
        const end = new Date(activeSubscription.endsAt)
        const diff = end.getTime() - now.getTime()
        daysRemaining = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)))
    }

    const navItems = [
        { label: dictionary.common.home, href: `/${lang}/account`, icon: <LayoutDashboard className="w-5 h-5" />, active: true },
        { label: dictionary.common.courses, href: "#courses", icon: <BookOpen className="w-5 h-5" /> },
        { label: lang === 'uz' ? "Faollik" : "Активность", href: "#activity", icon: <Activity className="w-5 h-5" /> },
        { label: lang === 'uz' ? "Jadval" : "Расписание", href: "#", icon: <Clock className="w-5 h-5" /> },
        { label: lang === 'uz' ? "Chat" : "Чат", href: `/${lang}/chat`, icon: <MessageSquare className="w-5 h-5" /> },
    ]

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <div className="pt-32 pb-20">
                <div className="max-w-[1600px] mx-auto px-6 grid lg:grid-cols-[280px_1fr_320px] gap-12">
                    {/* Left Sidebar */}
                    <aside className="hidden lg:block space-y-8">
                        <div className="bg-[var(--card-bg)] p-8 space-y-2 rounded-[2rem] border border-[var(--border)] shadow-sm sticky top-32">
                            {navItems.map((item, i) => (
                                item.href.startsWith('#') ? (
                                    <a
                                        key={i}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm",
                                            item.active ? "bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20" : "text-[var(--foreground)]/60 hover:bg-[var(--secondary)] hover:text-white"
                                        )}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </a>
                                ) : (
                                    <Link
                                        key={i}
                                        href={item.href}
                                        className={cn(
                                            "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm",
                                            item.active ? "bg-[var(--primary)] text-white shadow-xl shadow-[var(--primary)]/20" : "text-[var(--foreground)]/60 hover:bg-[var(--secondary)] hover:text-white"
                                        )}
                                    >
                                        {item.icon}
                                        {item.label}
                                    </Link>
                                )
                            ))}

                            <div className="pt-8 mt-8 border-t border-[var(--border)]">
                                <ProfileSettings user={user} lang={lang} />
                            </div>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="space-y-12">
                        <header>
                            <h1 className="text-4xl font-serif font-black text-[var(--foreground)] mb-2">
                                {lang === 'uz'
                                    ? `Salom, ${user?.firstName || (user as any)?.profile?.name || 'Mehmon'}!`
                                    : `Привет, ${user?.firstName || (user as any)?.profile?.name || 'Гость'}!`}
                            </h1>
                            <p className="text-sm font-bold text-[var(--primary)]/40 uppercase tracking-widest leading-relaxed">
                                {lang === 'uz' ? "Bugun o'zingiz uchun nima qilasiz?" : "Что вы сделаете для себя сегодня?"}
                            </p>
                        </header>

                        {/* Master KPIs */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                {
                                    label: lang === 'uz' ? "Obuna" : "Подписка",
                                    val: activeSubscription ? (lang === 'uz' ? `${daysRemaining} kun` : `${daysRemaining} дн.`) : (lang === 'uz' ? "Faol emas" : "Не активна"),
                                    icon: "📅",
                                    bg: activeSubscription && daysRemaining < 3 ? "bg-red-50 text-red-600" : "bg-blue-50"
                                },
                                {
                                    label: lang === 'uz' ? "Jami vaqt" : "Всего времени",
                                    val: `${Math.floor(totalMinutesWatched / 60)}h ${totalMinutesWatched % 60}m`,
                                    icon: "⏱️",
                                    bg: "bg-green-50"
                                },
                                {
                                    label: lang === 'uz' ? "Streak" : "Серия",
                                    val: `${currentStreak} ${lang === 'uz' ? 'kun' : 'дн.'}`,
                                    icon: "🔥",
                                    bg: "bg-orange-50"
                                },
                            ].map((stat, i) => (
                                <div key={i} className={cn("p-8 rounded-[2.5rem] border border-[var(--border)] bg-[var(--card-bg)] shadow-sm flex items-center gap-6", stat.bg)}>
                                    <div className="text-4xl">{stat.icon}</div>
                                    <div>
                                        <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">{stat.label}</div>
                                        <div className="text-2xl font-black">{stat.val}</div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Active Courses Section */}
                        <section>
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-serif font-bold text-[var(--foreground)]">
                                    {lang === 'uz' ? "Mening Kurslarim" : "Мои Курсы"}
                                </h2>
                            </div>
                            <MyCoursesGrid courses={myCourses} lang={lang} />
                        </section>

                        {/* Activity Heatmap */}
                        <section id="activity">
                            <ActivityHeatmap data={activityData} lang={lang} />
                        </section>

                        {/* Available Courses (Catalog) */}
                        <section id="courses" className="space-y-8 pt-8 border-t border-[var(--border)]">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-serif font-bold text-[var(--foreground)] opacity-60">
                                    {lang === 'uz' ? "Barcha Kurslar" : "Все Курсы"}
                                </h2>
                            </div>

                            <CourseListClient
                                courses={availableCourses}
                                lang={lang}
                                dictionary={dictionary}
                            />
                        </section>
                    </div>

                    {/* Right Sidebar - Recommendations & Events */}
                    <aside className="space-y-8">
                        {/* Dynamic AI Recommendation */}
                        {recommendationData?.recommendations?.length > 0 && (
                            <div className="bg-[#114539] text-white p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
                                <div className="relative z-10">
                                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-300 mb-4 block">
                                        {lang === 'uz' ? "Siz uchun tavsiya" : "Рекомендуем вам"}
                                    </span>
                                    <h4 className="text-xl font-serif italic mb-6 leading-tight">
                                        {lang === 'ru' && recommendationData.recommendations[0].titleRu ? recommendationData.recommendations[0].titleRu : recommendationData.recommendations[0].title}
                                    </h4>
                                    <p className="text-xs text-white/60 mb-6 leading-relaxed line-clamp-2">
                                        {lang === 'ru' && recommendationData.recommendations[0].descriptionRu ? recommendationData.recommendations[0].descriptionRu : recommendationData.recommendations[0].description}
                                    </p>
                                    <Link
                                        href={`/${lang}/courses/${recommendationData.recommendations[0].id}`}
                                        className="w-full py-4 bg-white text-[#114539] rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg hover:bg-emerald-50 transition-colors inline-flex items-center justify-center"
                                    >
                                        {lang === 'uz' ? "Batafsil" : "Подробнее"}
                                    </Link>
                                </div>
                                {recommendationData.recommendations[0].coverImage && (
                                    <Image
                                        src={recommendationData.recommendations[0].coverImage}
                                        alt="Recommendation"
                                        fill
                                        className="object-cover opacity-10 group-hover:scale-110 transition-transform duration-700"
                                    />
                                )}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 rounded-full -mr-16 -mt-16 blur-2xl" />
                                <div className="absolute bottom-0 left-0 w-24 h-24 bg-emerald-500/10 rounded-full -ml-12 -mb-12 blur-2xl" />
                            </div>
                        )}

                        {/* Community / Gamification Widget */}
                        <div className="bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
                            <UserDashboardClient userData={user as any} lang={lang} />
                        </div>
                    </aside>
                </div>
            </div>
        </main >
    )
}
