"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Container } from "./ui/Container"
import { cn } from "@/lib/utils"
import { Locale } from "@/dictionaries/get-dictionary"
import { Globe } from "lucide-react"

interface HeaderProps {
    lang: Locale
    dictionary: any
}

export function Header({ lang, dictionary }: HeaderProps) {
    const pathname = usePathname()

    const redirectedPathname = (locale: string) => {
        if (!pathname) return "/"
        const segments = pathname.split("/")
        segments[1] = locale
        return segments.join("/")
    }

    return (
        <header className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-xl border-b border-primary/5">
            <Container className="py-6 flex items-center justify-between">
                <Link href={`/${lang}`} className="flex items-center gap-3">
                    <Image src="/images/logo.png" alt="Baxtli Men Logo" width={40} height={40} className="w-10 h-10 object-contain" />
                    <div className="flex flex-col">
                        <span className="text-xl font-serif font-black tracking-tight text-emerald-900 leading-none">Baxtli Men</span>
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/40 leading-none mt-1">Akademiya Yoga</span>
                    </div>
                </Link>

                <nav className="hidden lg:flex items-center gap-10 text-[13px] font-bold uppercase tracking-widest text-emerald-900/60">
                    <Link href={`/${lang}`} className="hover:text-emerald-900 transition-colors">
                        {dictionary.common.home}
                    </Link>
                    <Link href={`/${lang}/online-courses`} className="hover:text-emerald-900 transition-colors">
                        Online Kurslar
                    </Link>
                    <Link href={`/${lang}/offline-courses`} className="hover:text-emerald-900 transition-colors">
                        Offline Kurslar
                    </Link>
                    <Link href="/consultations" className="hover:text-emerald-900 transition-colors text-emerald-700 font-extrabold">
                        Консультации
                    </Link>
                    <Link href={`/${lang}/about`} className="hover:text-emerald-900 transition-colors">
                        {dictionary.common.about}
                    </Link>
                </nav>

                <div className="flex items-center gap-8">
                    {/* Language Switcher */}
                    <div className="hidden md:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                        <Link
                            href={redirectedPathname("uz")}
                            className={cn(
                                "transition-all hover:scale-110",
                                lang === "uz" ? "text-primary" : "text-primary/20"
                            )}
                        >
                            UZ
                        </Link>
                        <span className="w-1 h-1 rounded-full bg-primary/10" />
                        <Link
                            href={redirectedPathname("ru")}
                            className={cn(
                                "transition-all hover:scale-110",
                                lang === "ru" ? "text-primary" : "text-primary/20"
                            )}
                        >
                            RU
                        </Link>
                    </div>

                    <Link
                        href={`/${lang}/login`}
                        className="py-2.5 px-6 text-xs uppercase tracking-widest bg-emerald-800 hover:bg-emerald-900 text-white rounded-full transition-all font-bold"
                    >
                        {dictionary.common.login}
                    </Link>
                </div>
            </Container>
        </header>
    )
}
