"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Eye, EyeOff, Lock, Shield } from "lucide-react"

export default function ChangePasswordPage() {
    const params = useParams() as any
    const lang = params?.lang || 'uz'
    const router = useRouter()

    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (password.length < 6) {
            setError(lang === 'uz' ? "Parol kamida 6 ta belgidan iborat bo'lishi kerak" : "Пароль должен быть не менее 6 символов")
            return
        }
        if (password !== confirmPassword) {
            setError(lang === 'uz' ? "Parollar mos kelmaydi" : "Пароли не совпадают")
            return
        }

        setLoading(true)
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ newPassword: password }),
            })
            const data = await res.json()
            if (!data.success) throw new Error(data.error)
            router.push(`/${lang}/account`)
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
            <div className="w-full max-w-md">
                <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border)] shadow-2xl p-8 space-y-6">
                    {/* Header */}
                    <div className="text-center space-y-3">
                        <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center">
                            <Lock className="w-8 h-8 text-amber-600" />
                        </div>
                        <h1 className="text-2xl font-black text-[var(--foreground)]">
                            {lang === 'uz' ? "Parolni o'zgartirish" : "Смена пароля"}
                        </h1>
                        <p className="text-sm text-[var(--foreground)]/50">
                            {lang === 'uz'
                                ? "Xavfsizlik uchun yangi parol o'rnating"
                                : "Установите новый пароль для безопасности"}
                        </p>
                    </div>

                    {error && (
                        <div className="p-4 rounded-xl bg-red-100 text-red-600 text-sm font-bold">{error}</div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                                {lang === 'uz' ? "Yangi parol" : "Новый пароль"}
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="******"
                                    minLength={6}
                                    className="w-full px-4 py-4 rounded-2xl border border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all text-sm font-medium pr-12 outline-none"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary)]/40 hover:text-[var(--primary)] transition"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                                {lang === 'uz' ? "Parolni tasdiqlang" : "Подтвердите пароль"}
                            </label>
                            <input
                                type={showPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={e => setConfirmPassword(e.target.value)}
                                placeholder="******"
                                className="w-full px-4 py-4 rounded-2xl border border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all text-sm font-medium outline-none"
                            />
                        </div>

                        <div className="flex items-center gap-2 p-3 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold">
                            <Shield className="w-4 h-4 flex-shrink-0" />
                            {lang === 'uz' ? "Parol shifrlangan holda saqlanadi" : "Пароль хранится в зашифрованном виде"}
                        </div>

                        <button
                            type="submit"
                            disabled={loading || password.length < 6}
                            className="w-full py-4 bg-[var(--primary)] text-white rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary)]/20 active:scale-[0.98] transition-all disabled:opacity-50"
                        >
                            {loading ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    <span>Yuklanmoqda...</span>
                                </div>
                            ) : (lang === 'uz' ? "O'zgartirish" : "Сменить пароль")}
                        </button>
                    </form>
                </div>
            </div>
        </main>
    )
}
