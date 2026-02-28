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
import { Eye, EyeOff, AlertCircle } from "lucide-react"
import { useSearchParams } from "next/navigation"

const loginSchema = z.object({
    login: z.string().min(3, "Login is too short"),
    password: z.string().min(6, "Password is too short"),
})

const registerSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    phone: z.string()
        .min(12, "Telefon raqam juda qisqa")
        .max(13, "Telefon raqam juda uzun")
        .regex(/^\+998\d{9}$/, "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak"),
    telegramUsername: z.string().optional(),
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
    const [showLoginPassword, setShowLoginPassword] = useState(false)
    const [showRegisterPassword, setShowRegisterPassword] = useState(false)
    const [showResetForm, setShowResetForm] = useState(false)
    const [resetPhone, setResetPhone] = useState('')
    const [resetLoading, setResetLoading] = useState(false)
    const [resetResult, setResetResult] = useState<{ success: boolean; message: string; tempPassword?: string } | null>(null)
    const searchParams = useSearchParams()
    const returnTo = searchParams?.get('returnTo')
    const isFromCheckout = returnTo?.includes('checkout')

    const loginForm = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: { login: "", password: "" },
    })

    const registerForm = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            phone: "",
            telegramUsername: "",
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
            if (result.forcePasswordChange) {
                window.location.href = `/${lang}/change-password`
                return
            }
            window.location.href = returnTo || `/${lang}/account`
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
            window.location.href = returnTo || `/${lang}/account`
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordReset = async () => {
        if (!resetPhone || resetPhone.length < 7) return
        setResetLoading(true)
        setResetResult(null)
        try {
            const res = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: resetPhone })
            })
            const data = await res.json()
            setResetResult(data)
        } catch {
            setResetResult({ success: false, message: 'Xatolik yuz berdi' })
        } finally {
            setResetLoading(false)
        }
    }

    return (
        <div className="w-full">
            {/* Mode Switcher */}
            <div className="flex bg-[var(--secondary)]/50 p-1.5 rounded-2xl mb-8 border border-[var(--primary)]/5">
                <button
                    onClick={() => { setMode('login'); setError(null); setShowResetForm(false); }}
                    className={cn(
                        "flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all",
                        mode === 'login' ? "bg-white text-[var(--primary)] shadow-sm" : "text-[var(--primary)]/40 hover:text-[var(--primary)]/60"
                    )}
                >
                    {dictionary.common.login}
                </button>
                <button
                    onClick={() => { setMode('register'); setError(null); setShowResetForm(false); }}
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

            {/* Purchase redirect info banner */}
            {isFromCheckout && mode === 'register' && (
                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100 mb-6 flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 shrink-0" />
                    <div className="text-[11px] text-blue-700 font-medium leading-relaxed">
                        {lang === 'uz'
                            ? "Kurs sotib olish uchun ro'yxatdan o'ting. To'g'ri telefon raqam va Telegram username kiriting — bu sizga kursni tezda olish imkonini beradi."
                            : "Зарегистрируйтесь для покупки курса. Укажите правильный номер телефона и Telegram username — это позволит быстро получить доступ к курсу."}
                    </div>
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
                                <button
                                    type="button"
                                    onClick={() => { setShowResetForm(!showResetForm); setResetResult(null); }}
                                    className="text-[9px] font-bold text-[var(--primary)] hover:underline opacity-80"
                                >
                                    {lang === 'uz' ? "Parolni unutdingizmi?" : "Забыли пароль?"}
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    {...loginForm.register("password")}
                                    type={showLoginPassword ? "text" : "password"}
                                    placeholder="******"
                                    error={!!loginForm.formState.errors.password}
                                    errorMessage={loginForm.formState.errors.password?.message}
                                    id="login-password"
                                    className="rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary)]/40 hover:text-[var(--primary)] transition-colors p-1"
                                    aria-label={showLoginPassword ? "Hide password" : "Show password"}
                                >
                                    {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Password Reset Form */}
                        <AnimatePresence>
                            {showResetForm && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="p-4 rounded-2xl bg-[var(--secondary)]/50 border border-[var(--primary)]/10 space-y-3">
                                        <p className="text-[10px] font-bold text-[var(--primary)]/60">
                                            {lang === 'uz'
                                                ? "Telefon raqamingizni kiriting. Yangi parol Telegram orqali yuboriladi."
                                                : "Введите номер телефона. Новый пароль будет отправлен через Telegram."
                                            }
                                        </p>
                                        <div className="flex gap-2">
                                            <Input
                                                value={resetPhone}
                                                onChange={(e) => setResetPhone(e.target.value)}
                                                placeholder="+998..."
                                                className="flex-1 rounded-xl border-[var(--primary)]/5 bg-white py-3 text-sm"
                                            />
                                            <button
                                                type="button"
                                                onClick={handlePasswordReset}
                                                disabled={resetLoading || resetPhone.length < 7}
                                                className="px-4 py-3 rounded-xl bg-[var(--primary)] text-white text-[10px] font-black uppercase tracking-wider disabled:opacity-50 transition-all active:scale-95"
                                            >
                                                {resetLoading ? '...' : lang === 'uz' ? 'Yuborish' : 'Отправить'}
                                            </button>
                                        </div>
                                        {resetResult && (
                                            <div className={`p-3 rounded-xl text-xs font-bold ${resetResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                                                {resetResult.message}
                                                {resetResult.tempPassword && (
                                                    <div className="mt-2 p-2 bg-white rounded-lg text-center">
                                                        <span className="text-[10px] text-[var(--primary)]/50 block mb-1">
                                                            {lang === 'uz' ? 'Vaqtinchalik parol:' : 'Временный пароль:'}
                                                        </span>
                                                        <code className="text-lg font-mono font-black text-[var(--primary)]">{resetResult.tempPassword}</code>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

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
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                                {lang === 'uz' ? 'Telegram username' : 'Telegram username'}
                            </label>
                            <Input
                                {...registerForm.register("telegramUsername")}
                                placeholder="@username"
                                id="register-telegram"
                                className="rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6"
                            />
                            <p className="text-[9px] text-[var(--primary)]/25 font-medium ml-4">
                                {lang === 'uz'
                                    ? "Telegram orqali parolni tiklash va bildirishnomalar uchun"
                                    : "Для восстановления пароля и уведомлений через Telegram"}
                            </p>
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
                            <div className="relative">
                                <Input
                                    {...registerForm.register("password")}
                                    type={showRegisterPassword ? "text" : "password"}
                                    placeholder="******"
                                    error={!!registerForm.formState.errors.password}
                                    errorMessage={registerForm.formState.errors.password?.message}
                                    id="register-password"
                                    className="rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6 pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--primary)]/40 hover:text-[var(--primary)] transition-colors p-1"
                                    aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                                >
                                    {showRegisterPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
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
