"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Lock, Loader2, ShieldCheck, KeyRound } from "lucide-react"

export default function AdminLoginPage() {
    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")
    const router = useRouter()
    const params = useParams<{ lang: string }>()
    const lang = params?.lang || "uz"

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const res = await fetch('/api/admin/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            })

            const data = await res.json()

            if (data.success) {
                // Force a hard reload to ensure middleware/layout picks up the new cookie
                window.location.href = `/${lang}/admin`
            } else {
                setError("Login yoki parol noto'g'ri")
            }
        } catch (err) {
            setError("Tizim xatosi")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-[var(--primary)]/20 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-[var(--accent)]/10 rounded-full blur-[100px]" />
            </div>

            <div className="bg-[var(--card-bg)] backdrop-blur-xl rounded-[2.5rem] p-12 w-full max-w-md shadow-2xl shadow-[var(--glow)] border border-[var(--border)] relative z-10">
                <div className="flex justify-center mb-8">
                    <div className="w-20 h-20 bg-[var(--primary)]/10 rounded-3xl flex items-center justify-center text-[var(--primary)] shadow-inner transform rotate-3 hover:rotate-0 transition-all duration-500">
                        <Lock className="w-10 h-10" />
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-serif font-black text-[var(--foreground)] mb-2 tracking-wide">
                        Admin Panel
                    </h1>
                    <p className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/40">
                        Xavfsiz Kirish
                    </p>
                </div>

                {error && (
                    <div className="bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-black uppercase tracking-widest p-4 rounded-xl mb-8 text-center flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4" />
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/30 ml-4">Login</label>
                        <div className="relative group">
                            <input
                                type="text"
                                placeholder="foydalanuvchi"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full bg-[var(--secondary)]/50 border border-[var(--border)] rounded-2xl p-4 pl-12 text-[var(--foreground)] font-bold placeholder:text-[var(--foreground)]/20 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/30 group-focus-within:text-[var(--primary)] transition-colors">
                                <UserIcon className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-[var(--foreground)]/30 ml-4">Parol</label>
                        <div className="relative group">
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-[var(--secondary)]/50 border border-[var(--border)] rounded-2xl p-4 pl-12 text-[var(--foreground)] font-bold placeholder:text-[var(--foreground)]/20 focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition-all"
                            />
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/30 group-focus-within:text-[var(--primary)] transition-colors">
                                <KeyRound className="w-5 h-5" />
                            </div>
                        </div>
                    </div>
                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-5 bg-[var(--primary)] text-white font-black uppercase tracking-widest rounded-2xl hover:opacity-90 transition-all flex items-center justify-center shadow-xl shadow-[var(--primary)]/20 active:scale-[0.98] mt-4"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Kirish"}
                    </button>
                </form>
            </div>
        </div>
    )
}

function UserIcon({ className }: { className?: string }) {
    return (
        <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
    )
}
