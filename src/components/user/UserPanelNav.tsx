"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, BarChart3, BookOpen, MessageSquare, Settings, ArrowLeft, Play } from "lucide-react"

interface UserPanelNavProps {
    lang: 'uz' | 'ru'
}

export function UserPanelNav({ lang }: UserPanelNavProps) {
    const pathname = usePathname()

    const navItems = [
        { href: `/${lang}/account`, icon: <LayoutDashboard className="w-5 h-5" />, label: lang === 'uz' ? 'Bosh sahifa' : 'Главная', key: 'account' },
        { href: `/${lang}/kpi`, icon: <BarChart3 className="w-5 h-5" />, label: lang === 'uz' ? "Ko'rsatkichlar" : 'Показатели', key: 'kpi' },
        { href: `/${lang}/my-courses`, icon: <BookOpen className="w-5 h-5" />, label: lang === 'uz' ? 'Kurslarim' : 'Мои курсы', key: 'my-courses' },
        { href: `/${lang}/chat`, icon: <MessageSquare className="w-5 h-5" />, label: lang === 'uz' ? 'Chat' : 'Чат', key: 'chat', premium: true },
        { href: `/${lang}/settings`, icon: <Settings className="w-5 h-5" />, label: lang === 'uz' ? 'Sozlamalar' : 'Настройки', key: 'settings' },
    ]

    const isActive = (key: string) => {
        const p = pathname || ''
        if (key === 'account') return p.includes('/account')
        if (key === 'kpi') return p.includes('/kpi')
        if (key === 'my-courses') return p.includes('/my-courses')
        if (key === 'chat') return p.includes('/chat')
        if (key === 'settings') return p.includes('/settings')
        return false
    }

    return (
        <>
            {/* Desktop: Top nav bar */}
            <div className="hidden md:block bg-white/80 backdrop-blur-xl border-b border-[var(--primary)]/5 sticky top-0 z-40">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-1">
                            {navItems.map(item => (
                                <Link key={item.key} href={item.href}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${isActive(item.key)
                                        ? 'bg-[var(--primary)] text-white shadow-sm'
                                        : 'text-[var(--primary)]/50 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5'
                                        }`}>
                                    {item.icon}
                                    <span>{item.label}</span>
                                    {item.premium && <span className="text-[8px] bg-[var(--accent)]/20 text-[var(--accent)] px-1.5 py-0.5 rounded-full font-black">VIP</span>}
                                </Link>
                            ))}
                        </div>
                        <Link href={`/${lang}`}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-[var(--primary)]/40 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all">
                            <ArrowLeft className="w-4 h-4" />
                            {lang === 'uz' ? "Asosiy sahifaga" : "На главную"}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile: Bottom tab bar */}
            <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-xl border-t border-[var(--primary)]/5 z-40 safe-area-bottom">
                <div className="flex items-center justify-around h-16 px-2">
                    {navItems.slice(0, 4).map(item => (
                        <Link key={item.key} href={item.href}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all ${isActive(item.key)
                                ? 'text-[var(--primary)]'
                                : 'text-[var(--primary)]/30'
                                }`}>
                            {item.icon}
                            <span className="text-[9px] font-bold">{item.label}</span>
                        </Link>
                    ))}
                    <Link href={`/${lang}`}
                        className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl text-[var(--primary)]/30">
                        <ArrowLeft className="w-5 h-5" />
                        <span className="text-[9px] font-bold">{lang === 'uz' ? "Ortga" : "Назад"}</span>
                    </Link>
                </div>
            </div>
        </>
    )
}
