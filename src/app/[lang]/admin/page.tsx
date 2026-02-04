import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Container } from "@/components/ui/Container"
import { Header } from "@/components/Header"
import { AdminKPI, UserList, BroadcastTool } from "@/components/admin/Dashboard"
import { EngagementStats } from "@/components/admin/EngagementStats"
import { LayoutDashboard, Users, BookMarked, Settings, BarChart } from "lucide-react"
import Link from "next/link"

export default async function AdminPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dictionary = await getDictionary(lang)

    const navItems = [
        { label: "Dashboard", href: "#", icon: <LayoutDashboard className="w-5 h-5" />, active: true },
        { label: "Foydalanuvchilar", href: "#", icon: <Users className="w-5 h-5" /> },
        { label: "Kurslar CRUD", href: "#", icon: <BookMarked className="w-5 h-5" /> },
        { label: "Analitika", href: "#", icon: <BarChart className="w-5 h-5" /> },
        { label: "Sozlamalar", href: "#", icon: <Settings className="w-5 h-5" /> },
    ]

    return (
        <main className="min-h-screen bg-secondary/20">
            <Header lang={lang} dictionary={dictionary} />

            <Container className="py-12">
                <div className="grid lg:grid-cols-5 gap-12">
                    {/* Admin Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="glass-card bg-white rounded-[2.5rem] p-6 space-y-2">
                            <div className="px-6 py-4 mb-4">
                                <div className="text-[10px] font-black uppercase tracking-widest text-primary/30">Baxtli Men</div>
                                <div className="text-xl font-black text-primary">Admin Panel</div>
                            </div>
                            {navItems.map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${item.active ? "bg-wellness-gold text-white premium-shadow" : "text-primary/50 hover:bg-primary/5"
                                        }`}
                                >
                                    {item.icon}
                                    {item.label}
                                </Link>
                            ))}
                        </div>
                    </aside>

                    {/* Admin Content */}
                    <div className="lg:col-span-4 space-y-12">
                        <header className="flex items-center justify-between">
                            <div>
                                <h1 className="text-3xl font-serif text-primary mb-2">Boshqaruv Paneli</h1>
                                <p className="text-sm font-bold text-primary/40 uppercase tracking-widest">Platformadagi barcha ma'lumotlar nazorati</p>
                            </div>
                            <div className="flex gap-4">
                                <button className="px-6 py-3 rounded-2xl bg-white border border-primary/5 text-sm font-bold text-primary hover:bg-primary/5 transition-all">
                                    Hisobot yuklash
                                </button>
                                <button className="px-6 py-3 rounded-2xl bg-primary text-white text-sm font-bold premium-shadow">
                                    Yangi kurs +
                                </button>
                            </div>
                        </header>

                        <AdminKPI />

                        <section>
                            <BroadcastTool />
                        </section>

                        <section>
                            <EngagementStats />
                        </section>

                        <section>
                            <UserList />
                        </section>
                    </div>
                </div>
            </Container>
        </main>
    )
}
