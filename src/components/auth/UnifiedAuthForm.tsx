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
import { motion, AnimatePresence } from "framer-motion"

const loginSchema = z.object({
    login: z.string().min(3, "Login is too short"),
    password: z.string().min(6, "Password is too short"),
})

const registerSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    phone: z.string().min(7, "Invalid phone number"),
    location: z.string().min(2, "Location is required"),
    healthIssues: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
})

type LoginFormValues = z.infer<typeof loginSchema>
type RegisterFormValues = z.infer<typeof registerSchema>

interface UnifiedAuthFormProps {
    lang: Locale
    dictionary: any
    initialMode?: 'login' | 'register'
}

export function UnifiedAuthForm({ lang, dictionary, initialMode = 'login' }: UnifiedAuthFormProps) {
    const router = useRouter()
    const [mode, setMode] = useState<'login' | 'register'>(initialMode)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { login: "", password: "" },
    })

    const registerForm = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            phone: "",
            location: "",
            healthIssues: "",
            password: "",
        },
    })

    const onLoginSubmit = async (data: LoginFormValues) => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ login: data.login, password: data.password }),
            })
            const result = await res.json()
            if (!result.success) throw new Error(result.error || "Login failed")
            window.location.href = `/${lang}/account`
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const onRegisterSubmit = async (data: RegisterFormValues) => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })
            const result = await res.json()
            if (!result.success) throw new Error(result.error || "Registration failed")
            window.location.href = `/${lang}/account`
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="w-full">
            {/* Mode Switcher */}
            <div className="flex bg-[var(--secondary)]/50 p-1.5 rounded-2xl mb-8 border border-[var(--primary)]/5">
                <button
                    onClick={() => { setMode('login'); setError(null); }}
                    className={cn(
                        "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                        mode === 'login' ? "bg-white text-[var(--primary)] shadow-sm" : "text-[var(--primary)]/40 hover:text-[var(--primary)]/60"
                    )}
                >
                    {dictionary.common.login}
                </button>
                <button
                    onClick={() => { setMode('register'); setError(null); }}
                    className={cn(
                        "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                        mode === 'register' ? "bg-white text-[var(--primary)] shadow-sm" : "text-[var(--primary)]/40 hover:text-[var(--primary)]/60"
                    )}
                >
                    {dictionary.common.register}
                </button>
            </div>

            {error && (
                <div className="p-4 rounded-xl bg-red-100 text-red-600 text-xs font-bold mb-6">
                    {error}
                </div>
            )}

            <AnimatePresence mode="wait">
                {mode === 'login' ? (
                    <motion.form
                        key="login"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 10 }}
                        onSubmit={loginForm.handleSubmit(onLoginSubmit)}
                        className="space-y-5"
                    >
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                                {dictionary.auth.phone}
                            </label>
                            <Input
                                {...loginForm.register("login")}
                                placeholder="+998..."
                                error={!!loginForm.formState.errors.login}
                                errorMessage={loginForm.formState.errors.login?.message}
                                id="login-email"
                                className="rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6"
                            />
                        </div>
                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-4">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40">Parol</label>
                                <a
                                    href="https://t.me/baxtli_men_bot?start=recovery"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[9px] font-bold text-[var(--primary)] hover:underline opacity-80"
                                >
                                    {lang === 'uz' ? "Parolni unutdingizmi?" : "Забыли пароль?"}
                                </a>
                            </div>
                            <Input
                                {...loginForm.register("password")}
                                type="password"
                                placeholder="******"
                                error={!!loginForm.formState.errors.password}
                                errorMessage={loginForm.formState.errors.password?.message}
                                id="login-password"
                                className="rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full py-6 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[var(--primary)]/20 active:scale-95 transition-all">
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    Yuklanmoqda...
                                </span>
                            ) : dictionary.common.login}
                        </Button>
                    </motion.form>
                ) : (
                    <motion.form
                        key="register"
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -10 }}
                        onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
                        className="space-y-5"
                    >
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">{dictionary.auth.name}</label>
                            <Input
                                {...registerForm.register("name")}
                                placeholder="Ismingiz"
                                error={!!registerForm.formState.errors.name}
                                errorMessage={registerForm.formState.errors.name?.message}
                                id="register-name"
                                className="rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6"
                            />
                        </div>
                        <div className="space-y-2 col-span-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">{dictionary.auth.phone}</label>
                            <Input
                                {...registerForm.register("phone")}
                                placeholder="+998"
                                error={!!registerForm.formState.errors.phone}
                                errorMessage={registerForm.formState.errors.phone?.message}
                                id="register-phone"
                                className="rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">{dictionary.auth.location}</label>
                            <Input
                                {...registerForm.register("location")}
                                placeholder="Toshkent"
                                className="rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">{dictionary.auth.healthIssues}</label>
                            <textarea
                                {...registerForm.register("healthIssues")}
                                placeholder="Sizni nima qiynamoqda?"
                                className="w-full rounded-2xl border border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all p-4 text-sm min-h-[100px] outline-none"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">Parol</label>
                            <Input
                                {...registerForm.register("password")}
                                type="password"
                                placeholder="******"
                                error={!!registerForm.formState.errors.password}
                                errorMessage={registerForm.formState.errors.password?.message}
                                id="register-password"
                                className="rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6"
                            />
                        </div>
                        <Button type="submit" disabled={loading} className="w-full py-6 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-white text-[11px] font-black uppercase tracking-widest shadow-xl shadow-[var(--primary)]/20 active:scale-95 transition-all">
                            {loading ? (
                                <span className="inline-flex items-center gap-2">
                                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" /></svg>
                                    Yuklanmoqda...
                                </span>
                            ) : dictionary.common.register}
                        </Button>
                    </motion.form>
                )}
            </AnimatePresence>
        </div>
    )
}
