"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Container } from "./ui/Container"
import { cn } from "@/lib/utils"
import { Locale } from "@/dictionaries/get-dictionary"
import { Menu, X, Globe } from "lucide-react"
import { useState, useEffect } from "react"

interface HeaderProps {
    lang: Locale
    dictionary: any
}

export function Header({ lang, dictionary }: HeaderProps) {
    const pathname = usePathname()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isScrolled, setIsScrolled] = useState(false)

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20)
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const redirectedPathname = (locale: string) => {
        if (!pathname) return "/"
        const segments = pathname.split("/")
        segments[1] = locale
        return segments.join("/")
    }

    const navLinks = [
        { href: `/${lang}`, label: dictionary.common.home },
        { href: `/${lang}/online-courses`, label: "Online Kurslar" },
        { href: `/${lang}/offline-courses`, label: "Offline Kurslar" },
        { href: "/consultations", label: "Консультации", special: true },
        { href: `/${lang}/about`, label: dictionary.common.about },
    ]

    return (
        <header className={cn(
            "fixed top-0 left-0 right-0 z-[100] transition-all duration-300",
            isScrolled || isMenuOpen ? "bg-white shadow-xl shadow-emerald-900/5 py-4" : "bg-transparent py-6"
        )}>
            <Container className="flex items-center justify-between">
                <Link href={`/${lang}`} className="flex items-center gap-3 relative z-[110]">
                    <Image src="/images/logo.png" alt="Logo" width={40} height={40} className="w-10 h-10 object-contain" />
                    <div className="flex flex-col">
                        <span className={cn("text-xl font-serif font-black tracking-tight leading-none", isScrolled || isMenuOpen ? "text-emerald-900" : "text-emerald-900")}>Baxtli Men</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/40 leading-none mt-1">Akademiya Yoga</span>
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden lg:flex items-center gap-10 text-[13px] font-extrabold uppercase tracking-widest">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={cn(
                                "transition-colors hover:text-emerald-600",
                                link.special ? "text-emerald-700 font-black" : "text-emerald-900/60"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-6 relative z-[110]">
                    {/* Desktop Language Switcher */}
                    <div className="hidden md:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest mr-4">
                        <Link href={redirectedPathname("uz")} className={lang === "uz" ? "text-emerald-900" : "text-emerald-900/20"}>UZ</Link>
                        <span className="w-1 h-1 rounded-full bg-emerald-900/10" />
                        <Link href={redirectedPathname("ru")} className={lang === "ru" ? "text-emerald-900" : "text-emerald-900/20"}>RU</Link>
                    </div>

                    <Link
                        href={`/${lang}/login`}
                        className="hidden md:block py-3 px-8 text-xs uppercase tracking-widest bg-emerald-900 text-white rounded-full font-black hover:bg-emerald-800 transition-all shadow-lg shadow-emerald-900/20"
                    >
                        {dictionary.common.login}
                    </Link>

                    {/* Mobile Menu Toggle */}
                    <button
                        className="lg:hidden w-12 h-12 flex items-center justify-center text-emerald-900"
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                    >
                        {isMenuOpen ? <X className="w-8 h-8" /> : <Menu className="w-8 h-8" />}
                    </button>
                </div>
            </Container>

            {/* Mobile Menu Overlay */}
            <div className={cn(
                "fixed inset-0 bg-white z-[100] pt-32 px-6 transition-all duration-500 lg:hidden",
                isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
            )}>
                <nav className="flex flex-col gap-8 text-center">
                    {navLinks.map((link) => (
                        <Link
                            key={link.href}
                            href={link.href}
                            onClick={() => setIsMenuOpen(false)}
                            className={cn(
                                "text-2xl font-serif font-black",
                                link.special ? "text-emerald-700" : "text-emerald-900"
                            )}
                        >
                            {link.label}
                        </Link>
                    ))}
                    <div className="h-px bg-emerald-50 my-4" />
                    <Link
                        href={`/${lang}/login`}
                        onClick={() => setIsMenuOpen(false)}
                        className="py-5 bg-emerald-900 text-white rounded-3xl font-black uppercase tracking-widest text-sm"
                    >
                        {dictionary.common.login}
                    </Link>

                    <div className="flex justify-center gap-8 mt-4 text-xs font-black uppercase tracking-widest text-emerald-900/40">
                        <Link href={redirectedPathname("uz")}>O'zbekcha</Link>
                        <Link href={redirectedPathname("ru")}>Русский</Link>
                    </div>
                </nav>
            </div>
        </header>
    )
}
