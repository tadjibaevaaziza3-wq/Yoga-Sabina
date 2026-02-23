"use client"

import { useState, useEffect } from "react"
import { Header } from "@/components/Header"
import { Container } from "@/components/ui/Container"
import { Shield, BarChart3, Megaphone, Save, CheckCircle } from "lucide-react"
import Link from "next/link"

interface CookiePreferences {
    necessary: boolean
    analytics: boolean
    marketing: boolean
}

export default function CookieSettingsPage() {
    const [prefs, setPrefs] = useState<CookiePreferences>({ necessary: true, analytics: false, marketing: false })
    const [saved, setSaved] = useState(false)

    useEffect(() => {
        const stored = localStorage.getItem('cookie_consent')
        if (stored) {
            try {
                const parsed = JSON.parse(stored)
                setPrefs({ necessary: true, analytics: !!parsed.analytics, marketing: !!parsed.marketing })
            } catch { }
        }
    }, [])

    const handleSave = () => {
        localStorage.setItem('cookie_consent', JSON.stringify({
            ...prefs,
            timestamp: new Date().toISOString(),
            version: '1.0',
        }))
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
    }

    const categories = [
        {
            key: 'necessary' as const,
            icon: <Shield className="w-6 h-6" />,
            title: 'Necessary Cookies',
            desc: 'Essential cookies for site functionality. These cannot be disabled as they are required for the website to work properly. They include session management, authentication, and security features.',
            locked: true,
        },
        {
            key: 'analytics' as const,
            icon: <BarChart3 className="w-6 h-6" />,
            title: 'Analytics Cookies',
            desc: 'Help us understand how you use our website. We use anonymous analytics to improve our service, track popular lessons, and optimize the learning experience.',
            locked: false,
        },
        {
            key: 'marketing' as const,
            icon: <Megaphone className="w-6 h-6" />,
            title: 'Marketing Cookies',
            desc: 'Used for delivering personalized recommendations and advertisements. These cookies help us show relevant course suggestions and promotional offers.',
            locked: false,
        },
    ]

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Header />
            <section className="pt-32 pb-20">
                <Container>
                    <div className="max-w-2xl mx-auto">
                        <h1 className="text-3xl font-serif font-black text-[var(--foreground)] mb-2">Cookie Settings</h1>
                        <p className="text-sm text-[var(--foreground)]/50 mb-8">
                            Manage your cookie preferences. You can update these settings at any time.{' '}
                            <Link href="/uz/privacy" className="text-[var(--accent)] hover:underline">Privacy Policy</Link>
                        </p>

                        <div className="space-y-4">
                            {categories.map(cat => (
                                <div key={cat.key} className="bg-white dark:bg-[#1a2e28] rounded-2xl p-6 border border-[var(--primary)]/5 premium-shadow">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex items-start gap-4">
                                            <div className="w-12 h-12 bg-[var(--primary)]/5 rounded-xl flex items-center justify-center flex-shrink-0 text-[var(--primary)]/40">
                                                {cat.icon}
                                            </div>
                                            <div>
                                                <h3 className="text-sm font-bold text-[var(--foreground)] mb-1">{cat.title}</h3>
                                                <p className="text-xs text-[var(--foreground)]/50 leading-relaxed">{cat.desc}</p>
                                            </div>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                                            <input type="checkbox" checked={prefs[cat.key]} disabled={cat.locked}
                                                onChange={() => !cat.locked && setPrefs(p => ({ ...p, [cat.key]: !p[cat.key] }))}
                                                className="sr-only peer" />
                                            <div className={`w-11 h-6 rounded-full transition-colors ${cat.locked ? 'bg-green-400 cursor-not-allowed' : 'bg-gray-200 dark:bg-gray-700 peer-checked:bg-[var(--primary)]'}`}>
                                                <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform mt-0.5 ${prefs[cat.key] ? 'translate-x-5 ml-0.5' : 'translate-x-0.5'}`} />
                                            </div>
                                            <span className="ml-2 text-[10px] font-bold uppercase tracking-widest text-[var(--primary)]/30">
                                                {cat.locked ? 'Always on' : prefs[cat.key] ? 'On' : 'Off'}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-4 mt-8">
                            <button onClick={handleSave}
                                className="bg-[var(--primary)] text-white px-8 py-3 rounded-2xl font-bold text-sm flex items-center gap-2 hover:bg-[var(--primary)]/90 transition-all shadow-lg shadow-[var(--primary)]/20">
                                {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                                {saved ? 'Saved!' : 'Save Preferences'}
                            </button>
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    )
}
