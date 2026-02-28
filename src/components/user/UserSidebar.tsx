"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname, useRouter } from "next/navigation"
import {
    LayoutDashboard, BookOpen, PlayCircle, Activity,
    User, MessageSquare, ArrowLeft, LogOut, Menu, X, Sparkles,
    Scale
} from "lucide-react"
import { useState, useEffect } from "react"

interface UserSidebarProps {
    lang: 'uz' | 'ru'
    user?: {
        firstName?: string
        lastName?: string
        avatar?: string
        subscriptionActive?: boolean
        joinDate?: string
    }
}

export function UserSidebar({ lang, user: userProp }: UserSidebarProps) {
    const pathname = usePathname() || ''
    const router = useRouter()
    const [mobileOpen, setMobileOpen] = useState(false)
    const [user, setUser] = useState(userProp || null)

    // Auto-fetch user data if not provided via props
    useEffect(() => {
        if (!userProp) {
            fetch('/api/user/profile')
                .then(r => r.json())
                .then(data => {
                    if (data.success && data.user) {
                        setUser({
                            firstName: data.user.firstName,
                            lastName: data.user.lastName,
                            avatar: data.user.avatar || undefined,
                            subscriptionActive: false, // Will be updated if needed
                            joinDate: data.user.createdAt,
                        })
                    }
                })
                .catch(() => { })
        }
    }, [userProp])

    const navItems = [
        {
            href: `/${lang}/account`,
            icon: <LayoutDashboard className="w-[18px] h-[18px]" />,
            label: lang === 'uz' ? 'Dashboard' : 'Дашборд',
            key: 'account'
        },
        {
            href: `/${lang}/online-courses`,
            icon: <PlayCircle className="w-[18px] h-[18px]" />,
            label: lang === 'uz' ? 'Online Kurslar' : 'Онлайн Курсы',
            key: 'online-courses'
        },
        {
            href: `/${lang}/offline-courses`,
            icon: <BookOpen className="w-[18px] h-[18px]" />,
            label: lang === 'uz' ? 'Offline Kurslar' : 'Офлайн Курсы',
            key: 'offline-courses'
        },
        {
            href: `/${lang}/my-courses`,
            icon: <PlayCircle className="w-[18px] h-[18px]" />,
            label: lang === 'uz' ? 'Kurslarim' : 'Мои Курсы',
            key: 'my-courses'
        },
        {
            href: `/${lang}/body-tracking`,
            icon: <Scale className="w-[18px] h-[18px]" />,
            label: lang === 'uz' ? 'Tana kuzatuvi' : 'Трекер тела',
            key: 'body-tracking'
        },
        {
            href: `/${lang}/activity`,
            icon: <Activity className="w-[18px] h-[18px]" />,
            label: lang === 'uz' ? 'Faollik' : 'Активность',
            key: 'activity'
        },

        {
            href: `/${lang}/profile`,
            icon: <User className="w-[18px] h-[18px]" />,
            label: lang === 'uz' ? 'Profil' : 'Профиль',
            key: 'profile'
        },
        {
            href: `/${lang}/chat`,
            icon: <MessageSquare className="w-[18px] h-[18px]" />,
            label: lang === 'uz' ? 'Chat' : 'Чат',
            key: 'chat',
            badge: 'AI'
        },
    ]

    const isActive = (key: string) => {
        if (key === 'account') return pathname.endsWith('/account')
        if (key === 'all-courses') return pathname.includes('/all-courses')
        return pathname.includes(`/${key}`)
    }

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' })
        router.push(`/${lang}`)
    }

    const initials = [user?.firstName?.[0], user?.lastName?.[0]].filter(Boolean).join('').toUpperCase() || '?'

    const sidebarContent = (
        <div className="flex flex-col h-full">
            {/* Profile Card — Warm Cream */}
            <div className="p-5 mb-1">
                <div className="flex items-center gap-3.5">
                    {user?.avatar ? (
                        <img
                            src={user.avatar}
                            alt="Avatar"
                            className="w-11 h-11 rounded-full object-cover ring-2 ring-[var(--accent-gold)]/20"
                        />
                    ) : (
                        <div className="w-11 h-11 rounded-full bg-gradient-to-br from-[var(--primary)] to-[#1a5c4d] flex items-center justify-center text-white font-bold text-sm shadow-sm">
                            {initials}
                        </div>
                    )}
                    <div className="flex-1 min-w-0">
                        <div className="font-semibold text-sm text-[var(--foreground)] truncate">
                            {user?.firstName || (lang === 'uz' ? 'Mehmon' : 'Гость')}
                        </div>
                        <div className={`text-[9px] font-semibold uppercase tracking-wider ${user?.subscriptionActive ? 'text-[var(--primary)]' : 'text-[var(--foreground)]/25'
                            }`}>
                            {user?.subscriptionActive
                                ? (lang === 'uz' ? '✦ Premium' : '✦ Премиум')
                                : (lang === 'uz' ? 'Bepul' : 'Бесплатно')}
                        </div>
                    </div>
                </div>
            </div>

            {/* Divider */}
            <div className="mx-5 mb-2 border-b border-[var(--foreground)]/[0.04]" />

            {/* Navigation */}
            <nav className="flex-1 px-3 space-y-0.5">
                <div className="px-4 py-2">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-[var(--foreground)]/20">
                        {lang === 'uz' ? 'Menu' : 'Меню'}
                    </span>
                </div>
                {navItems.map(item => (
                    <Link
                        key={item.key}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-200 group ${isActive(item.key)
                            ? 'bg-gradient-to-r from-[var(--primary)]/10 to-[var(--primary)]/5 text-[var(--foreground)] shadow-sm border border-[var(--primary)]/10'
                            : 'text-[var(--foreground)]/40 hover:text-[var(--foreground)]/70 hover:bg-[var(--foreground)]/[0.02]'
                            }`}
                    >
                        <span className={isActive(item.key) ? 'text-[var(--primary)]' : 'text-[var(--foreground)]/25 group-hover:text-[var(--foreground)]/40'}>
                            {item.icon}
                        </span>
                        <span className="flex-1">{item.label}</span>
                        {item.badge && (
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-md ${isActive(item.key)
                                ? 'bg-[var(--primary)]/15 text-[var(--primary)]'
                                : 'bg-[var(--foreground)]/5 text-[var(--foreground)]/30'
                                }`}>
                                {item.badge}
                            </span>
                        )}
                        {isActive(item.key) && (
                            <div className="w-1.5 h-1.5 rounded-full bg-[var(--primary)]" />
                        )}
                    </Link>
                ))}
            </nav>

            {/* Bottom Actions */}
            <div className="p-3 mt-auto border-t border-[var(--foreground)]/[0.04]">
                <Link
                    href={`/${lang}`}
                    onClick={() => setMobileOpen(false)}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-[var(--foreground)]/25 hover:text-[var(--foreground)]/50 hover:bg-[var(--foreground)]/[0.02] transition-all"
                >
                    <ArrowLeft className="w-[18px] h-[18px]" />
                    {lang === 'uz' ? "Asosiy sahifa" : "На главную"}
                </Link>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-[13px] font-medium text-rose-300 hover:text-rose-400 hover:bg-rose-50/50 transition-all"
                >
                    <LogOut className="w-[18px] h-[18px]" />
                    {lang === 'uz' ? "Chiqish" : "Выйти"}
                </button>
            </div>
        </div>
    )

    return (
        <>
            {/* Desktop Sidebar — Light Luxury */}
            <aside className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 w-[260px] bg-white/80 backdrop-blur-xl border-r border-[var(--foreground)]/[0.04] z-40">
                {sidebarContent}
            </aside>

            {/* Mobile Header */}
            <div className="lg:hidden fixed top-0 left-0 right-0 h-14 bg-white/90 backdrop-blur-xl border-b border-[var(--foreground)]/[0.04] z-40 flex items-center px-4">
                <button
                    onClick={() => setMobileOpen(true)}
                    className="p-2 rounded-xl hover:bg-[var(--foreground)]/[0.03] transition"
                >
                    <Menu className="w-5 h-5 text-[var(--foreground)]/40" />
                </button>
                <div className="flex-1 text-center">
                    <span className="text-sm font-semibold text-[var(--foreground)]/60 tracking-wide">Baxtli Men</span>
                </div>
                <Link href={`/${lang}/profile`} className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[#1a5c4d] flex items-center justify-center text-white font-semibold text-[10px] shadow-sm">
                    {initials}
                </Link>
            </div>

            {/* Mobile Bottom Tabs — Minimal Light */}
            <div className="lg:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[var(--foreground)]/[0.04] z-40 safe-area-bottom">
                <div className="flex items-center justify-around h-16 px-1">
                    {navItems.slice(0, 5).map(item => (
                        <Link
                            key={item.key}
                            href={item.href}
                            className={`flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-xl transition-all min-w-0 ${isActive(item.key)
                                ? 'text-[var(--primary)]'
                                : 'text-[var(--foreground)]/20'
                                }`}
                        >
                            {item.icon}
                            <span className="text-[8px] font-semibold truncate max-w-[52px]">{item.label}</span>
                            {isActive(item.key) && <div className="w-1 h-1 rounded-full bg-[var(--primary)] mt-0.5" />}
                        </Link>
                    ))}
                </div>
            </div>

            {/* Mobile Drawer */}
            {mobileOpen && (
                <div className="lg:hidden fixed inset-0 z-50">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <div className="absolute left-0 top-0 bottom-0 w-[280px] bg-white shadow-2xl animate-slide-in">
                        <div className="flex items-center justify-between p-4 border-b border-[var(--foreground)]/[0.04]">
                            <div className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                                <span className="text-sm font-semibold text-[var(--foreground)]">Baxtli Men</span>
                            </div>
                            <button onClick={() => setMobileOpen(false)} className="p-2 rounded-xl hover:bg-[var(--foreground)]/[0.03]">
                                <X className="w-5 h-5 text-[var(--foreground)]/30" />
                            </button>
                        </div>
                        {sidebarContent}
                    </div>
                </div>
            )}
        </>
    )
}
