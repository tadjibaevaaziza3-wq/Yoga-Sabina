"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Container } from "./ui/Container"
import { Button } from "./ui/Button"
import { cn } from "@/lib/utils"
import { Menu, X, LogOut, KeyRound, LayoutDashboard } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useDictionary } from "./providers/DictionaryProvider"
import { supabase } from "@/lib/supabase"
import { User } from "@supabase/supabase-js"
import { NotificationCenter } from "./NotificationCenter"
import { ChangePasswordModal } from "./user/ChangePasswordModal"

export function Header({ minimal = false, isAdmin = false, isConsultationEnabled = true }: { minimal?: boolean, isAdmin?: boolean, isConsultationEnabled?: boolean }) {
    const { dictionary, lang } = useDictionary()
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)
    const [user, setUser] = useState<User | null>(null)
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false)
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        const handleOutsideClick = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsProfileMenuOpen(false)
            }
        }

        window.addEventListener("scroll", handleScroll)
        document.addEventListener("mousedown", handleOutsideClick)

        // Check local session
        fetch('/api/auth/me')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUser(data.user)
                }
            })
            .catch(() => setUser(null))

        return () => {
            window.removeEventListener("scroll", handleScroll)
            document.removeEventListener("mousedown", handleOutsideClick)
        }
    }, [])

    const redirectedPathname = (locale: string) => {
        if (!pathname) return "/"
        const segments = pathname.split("/")
        segments[1] = locale
        return segments.join("/")
    }

    const navLinks = [
        { href: `/${lang}/online-courses`, label: dictionary.courses.online },
        { href: `/${lang}/offline-courses`, label: dictionary.courses.offline },
        { href: `/${lang}/about`, label: dictionary.common.about },
    ]

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-700",
            isScrolled || isMenuOpen ? "bg-[#f6f9fe]/80 backdrop-blur-xl py-4 shadow-soft" : "bg-transparent py-8"
        )}>
            <Container className="flex items-center justify-between">
                {/* Left: Logo & Brand */}
                <Link href={`/${lang}`} className="flex items-center relative z-[110] group">
                    <div className="transition-transform duration-500 group-hover:scale-105">
                        <Image
                            src="/images/logo.png"
                            alt="Baxtli Men"
                            width={120}
                            height={45}
                            className="w-20 md:w-24 h-auto object-contain"
                        />
                    </div>
                </Link>

                {/* Center: Desktop Nav - Minimalist */}
                {!minimal && (
                    <nav aria-label="Main navigation" className="hidden lg:flex items-center gap-10 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/70">
                        {navLinks.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className="transition-all hover:text-[var(--primary)] hover:tracking-[0.3em] duration-300 relative group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 rounded-sm"
                            >
                                {link.label}
                                <span className="absolute -bottom-2 left-1/2 w-0 h-px bg-[var(--primary)]/30 group-hover:w-full group-hover:left-0 transition-all duration-300"></span>
                            </Link>
                        ))}
                    </nav>
                )}

                {/* Right: Actions */}
                <div className="flex items-center gap-4 relative z-[110]">
                    {user && (
                        <NotificationCenter locale={lang as 'uz' | 'ru'} />
                    )}

                    {/* Single Language Toggle Button - Minimal */}
                    <Link
                        href={redirectedPathname(lang === "uz" ? "ru" : "uz")}
                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full border border-[var(--primary)]/10 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-[var(--primary)]/5 text-[var(--primary)]"
                    >
                        <span className={lang === 'uz' ? 'opacity-100' : 'opacity-40'}>UZ</span>
                        <span className="w-0.5 h-3 bg-[var(--primary)]/20"></span>
                        <span className={lang === 'ru' ? 'opacity-100' : 'opacity-40'}>RU</span>
                    </Link>

                    {user ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                                className="w-10 h-10 rounded-full bg-[var(--primary)] text-white text-lg flex items-center justify-center transition-all active:scale-95 shadow-md"
                            >
                                {(user as any).avatar ? (user as any).avatar : (user as any).firstName?.[0] || "👤"}
                            </button>

                            {/* Dropdown Menu */}
                            {isProfileMenuOpen && (
                                <div className="absolute right-0 mt-3 w-64 bg-white rounded-2xl shadow-xl border border-[var(--primary)]/5 overflow-hidden z-[120] py-2">
                                    <div className="px-5 py-4 border-b border-[var(--primary)]/5 bg-gray-50/50">
                                        <p className="text-sm font-bold text-[var(--primary)] truncate">{(user as any).firstName || "Foydalanuvchi"}</p>
                                        <p className="text-[11px] text-[var(--primary)]/50 font-medium truncate mt-1">
                                            {(user as any).email || (user as any).phone || (user as any).telegramUsername || "Tizimga kirdingiz"}
                                        </p>
                                    </div>

                                    <div className="py-2">
                                        <Link
                                            href={`/${lang}/account`}
                                            onClick={() => setIsProfileMenuOpen(false)}
                                            className="flex items-center px-5 py-3 text-[13px] font-bold text-[var(--primary)]/80 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] transition-colors w-full text-left"
                                        >
                                            <LayoutDashboard className="w-4 h-4 mr-3 opacity-60" />
                                            {lang === 'uz' ? "Shaxsiy kabinet" : "Личный кабинет"}
                                        </Link>

                                        <button
                                            onClick={() => { setIsProfileMenuOpen(false); setIsPasswordModalOpen(true); }}
                                            className="flex items-center px-5 py-3 text-[13px] font-bold text-[var(--primary)]/80 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)] transition-colors w-full text-left"
                                        >
                                            <KeyRound className="w-4 h-4 mr-3 opacity-60" />
                                            {lang === 'uz' ? "Parolni o'zgartirish" : "Изменить пароль"}
                                        </button>

                                        <button
                                            onClick={async () => {
                                                await fetch('/api/auth/logout', { method: 'POST' });
                                                window.location.href = `/${lang}`;
                                            }}
                                            className="flex items-center px-5 py-3 text-[13px] font-bold text-red-500/80 hover:bg-red-50 hover:text-red-600 transition-colors w-full text-left mt-1 border-t border-[var(--primary)]/5 pt-3"
                                        >
                                            <LogOut className="w-4 h-4 mr-3 opacity-60" />
                                            {lang === 'uz' ? "Chiqish" : "Выйти"}
                                        </button>
                                    </div>
                                </div>
                            )}

                            <ChangePasswordModal
                                isOpen={isPasswordModalOpen}
                                onClose={() => setIsPasswordModalOpen(false)}
                                lang={lang}
                            />
                        </div>
                    ) : (
                        <Link
                            href={`/${lang}/login`}
                            className="hidden md:block py-3 px-8 text-[10px] uppercase tracking-[0.2em] rounded-xl font-bold bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-lg shadow-[var(--primary)]/20"
                        >
                            {dictionary.common.login}
                        </Link>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden w-10 h-10 flex items-center justify-center text-[var(--primary)]"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </Container>

            {/* Mobile Menu Overlay - Clean & Minimal */}
            <div className={cn(
                "fixed inset-0 bg-[#f6f9fe] z-[100] pt-32 px-6 transition-all duration-500 lg:hidden",
                isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
            )}>
                <nav className="flex flex-col gap-8 text-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className="text-4xl font-editorial font-bold text-[var(--primary)] tracking-tight hover:opacity-70 transition-opacity"
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="h-px bg-[var(--primary)]/5 my-4 w-1/2 mx-auto" />
                    <Link
                        href={user ? `/${lang}/account` : `/${lang}/login`}
                        onClick={() => setIsMenuOpen(false)}
                        className="py-5 bg-[var(--primary)] text-white rounded-xl font-bold uppercase tracking-[0.2em] text-[11px] shadow-lg shadow-[var(--primary)]/20"
                    >
                        {user ? dictionary.common.profile : dictionary.common.login}
                    </Link>

                    <div className="flex justify-center gap-8 mt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40">
                        <Link href={redirectedPathname("uz")} className={lang === 'uz' ? 'text-[var(--primary)]' : ''}>O'zbekcha</Link>
                        <Link href={redirectedPathname("ru")} className={lang === 'ru' ? 'text-[var(--primary)]' : ''}>Русский</Link>
                    </div>
                </nav>
            </div>
        </header>
    )
}


