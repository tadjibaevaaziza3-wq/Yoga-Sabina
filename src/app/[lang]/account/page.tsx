import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Container } from "@/components/ui/Container"
import { Header } from "@/components/Header"
import { UserKPI } from "@/components/dashboard/UserKPI"
import { CourseCard } from "@/components/CourseCard"
import { coursesData } from "@/lib/data/courses"
import { LayoutDashboard, BookOpen, Settings, Clock, Heart, MessageSquare } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { cn } from "@/lib/utils"

export default async function AccountPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dictionary = await getDictionary(lang)
    const myCourses = coursesData[lang].slice(0, 2)

    const navItems = [
        { label: "Bosh sahifa", href: `/${lang}/account`, icon: <LayoutDashboard className="w-5 h-5" />, active: true },
        { label: "Kurslarim", href: "#", icon: <BookOpen className="w-5 h-5" /> },
        { label: "Jadval", href: "#", icon: <Clock className="w-5 h-5" /> },
        { label: "Saralanganlar", href: "#", icon: <Heart className="w-5 h-5" /> },
        { label: "Yordam", href: "#", icon: <MessageSquare className="w-5 h-5" /> },
    ]

    return (
        <main className="min-h-screen bg-[#F5F8F8]">
            <Header lang={lang} dictionary={dictionary} />

            <div className="pt-32 pb-20">
                <div className="max-w-[1600px] mx-auto px-6 grid lg:grid-cols-[280px_1fr_320px] gap-12">
                    {/* Left Sidebar */}
                    <aside className="hidden lg:block space-y-8">
                        <div className="glass-card p-8 space-y-2 !rounded-[2rem]">
                            {navItems.map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className={cn(
                                        "flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm",
                                        item.active ? "bg-primary text-white premium-shadow" : "text-primary/40 hover:bg-primary/5"
                                    )}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                        </div>

                        <div className="p-8">
                            <button className="flex items-center gap-4 text-primary/40 font-bold text-sm hover:text-primary transition-colors">
                                <Settings className="w-5 h-5" /> Sozlamalar
                            </button>
                        </div>
                    </aside>

                    {/* Main Content */}
                    <div className="space-y-12">
                        <header>
                            <h1 className="text-4xl font-serif text-primary mb-2">Xush kelibsiz, Sabina!</h1>
                            <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">O'zlikni anglash va salomatlik sari yo'l</p>
                        </header>

                        {/* Quick Stats */}
                        <div className="grid md:grid-cols-3 gap-6">
                            {[
                                { label: "Meditatsiyalar", val: "12", icon: "🧘‍♀️", bg: "bg-blue-50" },
                                { label: "Darslar", val: "24", icon: "📚", bg: "bg-green-50" },
                                { label: "Sertifikatlar", val: "1", icon: "🏆", bg: "bg-purple-50" },
                            ].map((stat, i) => (
                                <div key={i} className={cn("p-8 rounded-[2.5rem] border border-primary/5", stat.bg)}>
                                    <div className="text-2xl mb-4">{stat.icon}</div>
                                    <div className="text-xs font-black uppercase tracking-widest text-primary/40 mb-1">{stat.label}</div>
                                    <div className="text-3xl font-black text-primary">{stat.val}</div>
                                </div>
                            ))}
                        </div>

                        {/* Active Courses List */}
                        <section className="space-y-8">
                            <div className="flex items-center gap-4 border-b border-primary/5 pb-4">
                                <button className="text-sm font-black text-primary border-b-2 border-primary pb-4">Aktiv kurslar</button>
                                <button className="text-sm font-bold text-primary/40 pb-4">Tugallangan</button>
                            </div>

                            <div className="space-y-6">
                                {myCourses.map((course) => (
                                    <div key={course.id} className="bg-white p-8 rounded-[2.5rem] border border-primary/5 flex gap-8 items-center group">
                                        <div className="relative w-48 h-32 rounded-3xl overflow-hidden shrink-0">
                                            <Image src="/images/hero.png" alt={course.title} fill className="object-cover" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="text-xl font-serif text-primary mb-2">{course.title}</h3>
                                            <div className="flex items-center gap-4 mb-6">
                                                <div className="flex-1 h-1 bg-secondary rounded-full overflow-hidden">
                                                    <div className="h-full bg-accent w-1/3" />
                                                </div>
                                                <span className="text-[10px] font-black text-primary/40 uppercase tracking-widest">35% Tamomlandi</span>
                                            </div>
                                            <Link href={`/${lang}/courses/${course.id}`} className="btn-primary py-3 px-8 text-[10px] uppercase tracking-widest">
                                                Davom ettirish
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Sidebar */}
                    <aside className="space-y-12">
                        {/* Event Card */}
                        <div className="bg-[#144243] text-white p-10 rounded-[3rem] premium-shadow relative overflow-hidden">
                            <div className="relative z-10">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60 mb-6 block">Yaqindagi tadbir</span>
                                <h4 className="text-2xl font-serif mb-8 leading-tight">Sabina bilan Zoom-muloqot</h4>
                                <Link href="#" className="btn-coral w-full py-4 text-xs uppercase tracking-widest inline-flex items-center justify-center">
                                    Qo'shilish
                                </Link>
                            </div>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl" />
                        </div>

                        {/* Favorites */}
                        <section className="space-y-6">
                            <h4 className="text-sm font-black text-primary uppercase tracking-widest px-2">Saralanganlar</h4>
                            <div className="space-y-4">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="flex items-center gap-4 p-4 hover:bg-white rounded-2xl transition-all border border-transparent hover:border-primary/5 group cursor-pointer">
                                        <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0">
                                            <Image src="/images/hero.png" alt="Fav" width={64} height={48} className="object-cover" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-primary group-hover:text-accent transition-colors">Ertalabki meditatsiya</div>
                                            <div className="text-[9px] font-black text-primary/30 uppercase tracking-widest">12:00 • Sabina</div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </aside>
                </div>
            </div>
        </main>
    )
}
