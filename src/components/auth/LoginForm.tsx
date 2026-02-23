"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Locale } from "@/dictionaries/types"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { Eye, EyeOff } from "lucide-react"

const loginSchema = z.object({
    login: z.string().min(3, "Login is too short"),
    password: z.string().min(6, "Password is too short"),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
    lang: Locale
    dictionary: any
    isAdmin?: boolean
}

export function LoginForm({ lang, dictionary, isAdmin }: LoginFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            login: "",
            password: "",
        },
    })

    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true)
        setError(null)

        try {
            const url = isAdmin ? "/api/admin/login" : "/api/auth/login"
            const body = isAdmin
                ? { username: data.login, password: data.password }
                : { email: data.login, password: data.password }

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            const result = await res.json()

            if (!result.success) {
                throw new Error(result.error || result.message || "Login failed")
            }

            // Check if force password change is required
            if (result.forcePasswordChange) {
                window.location.href = `/${lang}/change-password`
                return
            }

            // Redirect based on role or context
            if (isAdmin) {
                window.location.href = `/${lang}/admin`
            } else {
                window.location.href = `/${lang}/account`
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
                <div className="p-4 rounded-xl bg-red-100 text-red-600 text-sm font-bold">
                    {error}
                </div>
            )}
            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                    {isAdmin ? "Admin Login" : (dictionary.auth.email || "Email / Login")}
                </label>
                <Input
                    {...form.register("login")}
                    type="text"
                    placeholder={isAdmin ? "admin123" : "Login or Email"}
                    className={cn(
                        "rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6 font-medium",
                        form.formState.errors.login ? "border-red-400" : ""
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                    {dictionary.auth.password || "Parol"}
                </label>
                <div className="relative">
                    <Input
                        {...form.register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="******"
                        className={cn(
                            "rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6 font-medium pr-12",
                            form.formState.errors.password ? "border-red-400" : ""
                        )}
                    />
                    <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary)]/40 hover:text-[var(--primary)] transition-colors p-1"
                        aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                </div>
            </div>

            {!isAdmin && (
                <div className="text-right">
                    <a
                        href="https://t.me/baxtli_men_bot?start=recovery"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] font-bold text-[var(--primary)]/60 hover:text-[var(--primary)] transition-colors uppercase tracking-wider"
                    >
                        {lang === 'uz' ? "Parolni unutdingizmi?" : "Забыли пароль?"}
                    </a>
                </div>
            )}

            <Button type="submit" className="w-full py-6 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary)]/20 active:scale-[0.98] transition-all" disabled={loading}>
                {loading ? (
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Yuklanmoqda...</span>
                    </div>
                ) : dictionary.common.login}
            </Button>

            {!isAdmin && (
                <div className="text-center text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 pt-4">
                    Hisobingiz yo'qmi?{" "}
                    <Link href={`/${lang}/register`} className="text-[var(--primary)] font-black hover:text-[var(--primary)]/70 transition-colors">
                        {dictionary.common.register}
                    </Link>
                </div>
            )}
        </form>
    )
}
