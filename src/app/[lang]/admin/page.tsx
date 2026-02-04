import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Container } from "@/components/ui/Container"
import { Header } from "@/components/Header"
import { AdminKPI, UserList, BroadcastTool } from "@/components/admin/Dashboard"
import { EngagementStats } from "@/components/admin/EngagementStats"
import { LayoutDashboard, Users, BookMarked, Settings, BarChart } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

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
        <main className="min-h-screen bg-emerald-50/30">
            {/* Admin Header / Topbar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-emerald-100 py-4">
                <Container className="flex items-center justify-between">
                    <Link href={`/${lang}/admin`} className="flex items-center gap-3">
                        <Image src="/images/logo.png" alt="Logo" width={32} height={32} className="w-8 h-8 object-contain" />
                        <div className="flex flex-col">
                            <span className="text-lg font-serif font-black tracking-tight text-emerald-900 leading-none">Baxtli Men</span>
                            <span className="text-[8px] font-bold uppercase tracking-[0.2em] text-emerald-600/40 leading-none mt-0.5">Admin Panel</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="text-right mr-4 hidden md:block">
                            <div className="text-xs font-bold text-emerald-900">Admin User</div>
                            <div className="text-[10px] text-emerald-600/50 uppercase tracking-widest font-black">Super Admin</div>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-900 hover:bg-emerald-200 transition-colors">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </Container>
            </header>

            <Container className="pt-28 pb-12">
                <div className="grid lg:grid-cols-5 gap-12">
                    {/* Admin Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-28 space-y-2">
                            {navItems.map((item, i) => (
                                <Link
                                    key={i}
                                    href={item.href}
                                    className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all font-bold text-sm ${item.active
                                        ? "bg-emerald-900 text-white shadow-xl shadow-emerald-900/20"
                                        : "text-emerald-900/50 hover:bg-emerald-100/50"
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
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                            <div>
                                <h1 className="text-4xl font-serif font-black text-emerald-900 mb-2">Boshqaruv Paneli</h1>
                                <p className="text-sm font-bold text-emerald-900/40 uppercase tracking-[0.2em]">Platformadagi barcha ma'lumotlar nazorati</p>
                            </div>
                            <div className="flex gap-4">
                                <button className="px-8 py-4 rounded-2xl bg-white border border-emerald-100 text-sm font-extrabold text-emerald-900 hover:bg-emerald-50 transition-all shadow-sm">
                                    Hisobot
                                </button>
                                <button className="px-8 py-4 rounded-2xl bg-emerald-900 text-white text-sm font-extrabold shadow-xl shadow-emerald-900/20 hover:bg-emerald-800 transition-all">
                                    Yangi kurs +
                                </button>
                            </div>
                        </div>

                        <AdminKPI />

                        <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                            <section className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm">
                                <h2 className="text-xl font-serif font-bold text-emerald-900 mb-8 border-b border-emerald-50 pb-4">Broadcast Xabarnoma</h2>
                                <BroadcastTool />
                            </section>

                            <section className="bg-white p-8 rounded-[2.5rem] border border-emerald-100 shadow-sm">
                                <h2 className="text-xl font-serif font-bold text-emerald-900 mb-8 border-b border-emerald-50 pb-4">Foydalanuvchilar Faolligi</h2>
                                <EngagementStats />
                            </section>
                        </div>

                        <section className="bg-white p-8 rounded-[3rem] border border-emerald-100 shadow-sm">
                            <h2 className="text-xl font-serif font-bold text-emerald-900 mb-8 px-4">Oxirgi Ro'yxatdan o'tganlar</h2>
                            <UserList />
                        </section>
                    </div>
                </div>
            </Container>
        </main>
    )
}
