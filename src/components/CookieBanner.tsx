"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Cookie, Shield, BarChart3, Megaphone, ChevronDown, ChevronUp, X } from "lucide-react"
import Link from "next/link"

interface CookiePreferences {
    necessary: boolean
    analytics: boolean
    marketing: boolean
}

const DEFAULT_PREFS: CookiePreferences = { necessary: true, analytics: false, marketing: false }

export function CookieBanner() {
    const [visible, setVisible] = useState(false)
    const [showDetails, setShowDetails] = useState(false)
    const [prefs, setPrefs] = useState<CookiePreferences>(DEFAULT_PREFS)

    useEffect(() => {
        const stored = localStorage.getItem('cookie_consent')
        if (!stored) {
            const timer = setTimeout(() => setVisible(true), 1500)
            return () => clearTimeout(timer)
        }
    }, [])

    const saveConsent = (preferences: CookiePreferences) => {
        localStorage.setItem('cookie_consent', JSON.stringify({
            ...preferences,
            timestamp: new Date().toISOString(),
            version: '1.0',
        }))
        setVisible(false)
    }

    const acceptAll = () => saveConsent({ necessary: true, analytics: true, marketing: true })
    const rejectAll = () => saveConsent({ necessary: true, analytics: false, marketing: false })
    const saveCustom = () => saveConsent(prefs)

    const categories = [
        {
            key: 'necessary' as const,
            icon: <Shield className="w-4 h-4" />,
            title: 'Necessary',
            titleUz: 'Zaruriy',
            desc: 'Essential for site functionality. Cannot be disabled.',
            descUz: "Sayt ishlashi uchun zarur. O'chirib bo'lmaydi.",
            locked: true,
        },
        {
            key: 'analytics' as const,
            icon: <BarChart3 className="w-4 h-4" />,
            title: 'Analytics',
            titleUz: 'Analitika',
            desc: 'Help us understand how you use our website.',
            descUz: "Saytimizdan qanday foydalanishingizni tushunishga yordam beradi.",
            locked: false,
        },
        {
            key: 'marketing' as const,
            icon: <Megaphone className="w-4 h-4" />,
            title: 'Marketing',
            titleUz: 'Marketing',
            desc: 'Used for delivering personalized advertisements.',
            descUz: "Shaxsiylashtirilgan reklamalarni ko'rsatish uchun.",
            locked: false,
        },
    ]

    return (
        <AnimatePresence>
            {visible && (
                <motion.div
                    initial={{ y: 100, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 100, opacity: 0 }}
                    transition={{ type: "spring", damping: 25, stiffness: 300 }}
                    className="fixed bottom-0 left-0 right-0 z-[200] p-4 md:p-6"
                >
                    <div className="max-w-3xl mx-auto bg-white dark:bg-[#1a2e28] rounded-3xl shadow-2xl border border-[var(--primary)]/10 overflow-hidden">
                        <div className="p-6 md:p-8">
                            {/* Header */}
                            <div className="flex items-start gap-4 mb-4">
                                <div className="w-10 h-10 bg-[var(--accent)]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <Cookie className="w-5 h-5 text-[var(--accent)]" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-base font-bold text-[var(--foreground)] mb-1">🍪 Cookie Notice</h3>
                                    <p className="text-sm text-[var(--foreground)]/60 leading-relaxed">
                                        We use cookies to improve your experience, analyze traffic and personalize content.{' '}
                                        <Link href="/uz/privacy" className="text-[var(--accent)] hover:underline font-medium">Privacy Policy</Link>
                                    </p>
                                </div>
                                <button onClick={rejectAll} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/5 rounded-lg transition-colors">
                                    <X className="w-4 h-4 text-[var(--foreground)]/30" />
                                </button>
                            </div>

                            {/* Manage Preferences (expandable) */}
                            <AnimatePresence>
                                {showDetails && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                                        className="overflow-hidden mb-4">
                                        <div className="space-y-3 pt-4 border-t border-[var(--primary)]/10">
                                            {categories.map(cat => (
                                                <div key={cat.key} className="flex items-center justify-between p-3 bg-[var(--background)] rounded-xl">
                                                    <div className="flex items-center gap-3">
                                                        <div className="text-[var(--primary)]/40">{cat.icon}</div>
                                                        <div>
                                                            <div className="text-xs font-bold text-[var(--foreground)]">{cat.title}</div>
                                                            <div className="text-[10px] text-[var(--foreground)]/40">{cat.desc}</div>
                                                        </div>
                                                    </div>
                                                    <label className="relative inline-flex items-center cursor-pointer">
                                                        <input type="checkbox" checked={prefs[cat.key]} disabled={cat.locked}
                                                            onChange={() => !cat.locked && setPrefs(p => ({ ...p, [cat.key]: !p[cat.key] }))}
                                                            className="sr-only peer" />
                                                        <div className={`w-9 h-5 rounded-full transition-colors ${cat.locked ? 'bg-green-400 cursor-not-allowed' : 'bg-gray-200 peer-checked:bg-[var(--primary)]'}`}>
                                                            <div className={`w-4 h-4 bg-white rounded-full shadow transform transition-transform mt-0.5 ${prefs[cat.key] ? 'translate-x-4 ml-0.5' : 'translate-x-0.5'}`} />
                                                        </div>
                                                    </label>
                                                </div>
                                            ))}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Buttons */}
                            <div className="flex flex-col sm:flex-row gap-2">
                                <button onClick={acceptAll}
                                    className="flex-1 bg-[var(--primary)] text-white py-2.5 px-4 rounded-xl text-sm font-bold hover:bg-[var(--primary)]/90 transition-all">
                                    Accept All
                                </button>
                                <button onClick={rejectAll}
                                    className="flex-1 bg-[var(--background)] text-[var(--foreground)] py-2.5 px-4 rounded-xl text-sm font-bold border border-[var(--primary)]/10 hover:border-[var(--primary)]/20 transition-all">
                                    Reject All
                                </button>
                                <button onClick={() => showDetails ? saveCustom() : setShowDetails(true)}
                                    className="flex-1 flex items-center justify-center gap-1.5 bg-[var(--background)] text-[var(--foreground)] py-2.5 px-4 rounded-xl text-sm font-bold border border-[var(--primary)]/10 hover:border-[var(--primary)]/20 transition-all">
                                    {showDetails ? 'Save Preferences' : 'Manage Preferences'}
                                    {!showDetails && <ChevronDown className="w-3.5 h-3.5" />}
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
