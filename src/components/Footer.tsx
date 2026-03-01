"use client"

import Link from "next/link"
import { useDictionary } from "./providers/DictionaryProvider"
import { Container } from "./ui/Container"
import Image from "next/image"
import { Instagram, Send, Youtube, Phone, Link as LinkIcon } from "lucide-react"

export function Footer({ isConsultationEnabled = true }: { isConsultationEnabled?: boolean }) {
    const { dictionary, lang } = useDictionary()
    const currentYear = new Date().getFullYear()

    return (
        <footer role="contentinfo" aria-label="Site footer" className="bg-[var(--background)] text-[var(--primary)] pt-40 pb-20 relative overflow-hidden">
            {/* Giant Watermark */}
            <div className="absolute top-0 left-0 w-full overflow-hidden opacity-[0.03] pointer-events-none select-none">
                <h1 className="text-[15vw] font-editorial font-bold text-center leading-[0.8] tracking-tight">
                    BAXTLI MEN
                </h1>
            </div>

            <Container className="relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-20 lg:gap-8 mb-32 pt-20 border-t border-[var(--primary)]/10">
                    {/* Brand Section */}
                    <div className="lg:col-span-1 space-y-10">
                        <Link href={`/${lang}`} className="block">
                            <span className="text-3xl font-editorial font-bold tracking-tight">Baxtli Men.</span>
                        </Link>
                        <p className="text-[var(--primary)]/50 text-sm leading-relaxed max-w-xs">
                            {dictionary.common.footerDesc}
                        </p>
                        <div className="flex gap-6">
                            {[
                                { icon: <Instagram className="w-5 h-5" />, href: "https://www.instagram.com/sabina_yogatrener?igsh=MXg2bXI0bXpkcnNzcQ==", label: "Instagram" },
                                { icon: <Send className="w-5 h-5" />, href: dictionary.common.telegramBot, label: "Telegram" },
                                { icon: <Youtube className="w-5 h-5" />, href: "https://www.youtube.com/@sabina_yogauz", label: "YouTube" },
                                { icon: <LinkIcon className="w-5 h-5" />, href: "https://sabinapolatova.taplink.ws", label: "Taplink" },
                            ].map((social, i) => (
                                <a
                                    key={i}
                                    href={social.href}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    aria-label={social.label}
                                    className="w-12 h-12 rounded-full border border-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)]/60 hover:bg-[var(--primary)] hover:text-white transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2"
                                >
                                    {social.icon}
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Navigation - Spaced out */}
                    <div className="lg:col-span-2 grid grid-cols-2 gap-12">
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40 mb-8">{dictionary.common.courses}</h4>
                            <ul className="space-y-4">
                                <li><a href={`/${lang}/online-courses`} className="text-[var(--primary)] text-sm hover:text-[var(--accent)] transition-colors">{dictionary.courses.online}</a></li>
                                <li><a href={`/${lang}/offline-courses`} className="text-[var(--primary)] text-sm hover:text-[var(--accent)] transition-colors">{dictionary.courses.offline}</a></li>
                                <li><a href={`/${lang}/about`} className="text-[var(--primary)] text-sm hover:text-[var(--accent)] transition-colors">{dictionary.common.about}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40 mb-8">{lang === 'uz' ? "Huquqiy" : "Правовая информация"}</h4>
                            <ul className="space-y-4">
                                <li><a href={`/${lang}/privacy`} className="text-[var(--primary)] text-sm hover:text-[var(--accent)] transition-colors">{lang === 'uz' ? "Maxfiylik siyosati" : "Политика конфиденциальности"}</a></li>
                                <li><a href={`/${lang}/terms`} className="text-[var(--primary)] text-sm hover:text-[var(--accent)] transition-colors">{lang === 'uz' ? "Foydalanish shartlari" : "Условия использования"}</a></li>
                                <li><a href={`/${lang}/security`} className="text-[var(--primary)] text-sm hover:text-[var(--accent)] transition-colors">{lang === 'uz' ? "Xavfsizlik" : "Безопасность"}</a></li>
                                <li><a href={`/${lang}/cookie-settings`} className="text-[var(--primary)] text-sm hover:text-[var(--accent)] transition-colors">{lang === 'uz' ? "Cookie sozlamalari" : "Настройки cookie"}</a></li>
                            </ul>
                        </div>
                    </div>

                    {/* Contact - Minimal */}
                    <div className="lg:col-span-1">
                        <h4 className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40 mb-8">{lang === 'uz' ? "Aloqa" : "Контакты"}</h4>
                        <ul className="space-y-6">
                            <li>
                                <a href={`tel:${dictionary.common.phone.replace(/\s+/g, '')}`} className="text-xl font-editorial font-bold hover:text-[var(--accent)] transition-colors">{dictionary.common.phone}</a>
                                <p className="text-[10px] text-[var(--primary)]/40 mt-1 uppercase tracking-widest">{lang === 'uz' ? "Ma'muriyat" : "Администрация"}</p>
                            </li>
                            <li>
                                <a href={`https://t.me/${dictionary.common.adminContact.replace('@', '')}`} className="text-xl font-editorial font-bold hover:text-[var(--accent)] transition-colors">{dictionary.common.adminContact}</a>
                                <p className="text-[10px] text-[var(--primary)]/40 mt-1 uppercase tracking-widest">Telegram</p>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-12 border-t border-[var(--primary)]/5 flex flex-col md:flex-row items-center justify-between gap-6 opacity-60 hover:opacity-100 transition-opacity">
                    <p className="text-[9px] font-bold uppercase tracking-[0.2em]">
                        &copy; {currentYear} Baxtli Men.
                    </p>
                    <div className="flex items-center gap-3">
                        <span className="text-[9px] font-bold uppercase tracking-[0.2em]">Designed by Co-innovator.uz</span>
                    </div>
                </div>
            </Container>
        </footer>
    )
}
