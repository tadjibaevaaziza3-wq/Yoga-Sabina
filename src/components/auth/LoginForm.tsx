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
import { Eye, EyeOff, Smartphone, Trash2, AlertTriangle } from "lucide-react"

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

interface DeviceInfo {
    id: string;
    deviceName: string;
    lastSeen: string;
    createdAt: string;
}

export function LoginForm({ lang, dictionary, isAdmin }: LoginFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [showPassword, setShowPassword] = useState(false)
    const [deviceLimitReached, setDeviceLimitReached] = useState(false)
    const [currentDevices, setCurrentDevices] = useState<DeviceInfo[]>([])
    const [removingDeviceId, setRemovingDeviceId] = useState<string | null>(null)
    const [pendingLoginData, setPendingLoginData] = useState<LoginFormValues | null>(null)

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            login: "",
            password: "",
        },
    })

    const removeDevice = async (deviceId: string) => {
        setRemovingDeviceId(deviceId)
        try {
            const res = await fetch('/api/auth/devices', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ deviceId })
            })
            const result = await res.json()
            if (result.success) {
                setCurrentDevices(prev => prev.filter(d => d.id !== deviceId))
                // If we now have < 3 devices, retry login
                if (currentDevices.length <= 3 && pendingLoginData) {
                    setDeviceLimitReached(false)
                    setError(null)
                    onSubmit(pendingLoginData)
                }
            }
        } catch {
            setError('Failed to remove device')
        } finally {
            setRemovingDeviceId(null)
        }
    }

    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true)
        setError(null)
        setDeviceLimitReached(false)

        try {
            const url = isAdmin ? "/api/admin/login" : "/api/auth/login"
            const body = isAdmin
                ? { username: data.login, password: data.password }
                : { login: data.login, password: data.password }

            const res = await fetch(url, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            const result = await res.json()

            if (!result.success) {
                // Handle device limit exceeded
                if (result.reason === 'DEVICE_LIMIT_EXCEEDED' && result.currentDevices) {
                    setDeviceLimitReached(true)
                    setCurrentDevices(result.currentDevices)
                    setPendingLoginData(data)
                    setError(result.error)
                    return
                }
                throw new Error(result.error || result.message || "Login failed")
            }

            if (result.forcePasswordChange) {
                window.location.href = `/${lang}/change-password`
                return
            }

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
                <div className={cn(
                    "p-4 rounded-xl text-sm font-bold",
                    deviceLimitReached
                        ? "bg-amber-50 text-amber-700 border border-amber-200"
                        : "bg-red-100 text-red-600"
                )}>
                    {deviceLimitReached && <AlertTriangle className="w-4 h-4 inline mr-2" />}
                    {error}
                </div>
            )}

            {/* Device Limit Management UI */}
            {deviceLimitReached && currentDevices.length > 0 && (
                <div className="bg-white rounded-2xl border border-[var(--primary)]/10 overflow-hidden shadow-sm">
                    <div className="p-4 bg-[var(--primary)]/5 border-b border-[var(--primary)]/5">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/60">
                            {lang === 'uz' ? 'Sizning qurilmalaringiz (max 3)' : 'Ваши устройства (макс. 3)'}
                        </h3>
                    </div>
                    <div className="divide-y divide-[var(--primary)]/5">
                        {currentDevices.map(device => (
                            <div key={device.id} className="p-4 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/5 flex items-center justify-center flex-shrink-0">
                                    <Smartphone className="w-4 h-4 text-[var(--primary)]/50" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-bold text-[var(--primary)] truncate">{device.deviceName}</p>
                                    <p className="text-[9px] font-bold text-[var(--primary)]/40 uppercase tracking-wider">
                                        {lang === 'uz' ? 'Oxirgi' : 'Посл.'}: {new Date(device.lastSeen).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => removeDevice(device.id)}
                                    disabled={removingDeviceId === device.id}
                                    className="w-8 h-8 rounded-lg bg-red-50 hover:bg-red-100 flex items-center justify-center transition-colors flex-shrink-0"
                                >
                                    {removingDeviceId === device.id
                                        ? <div className="w-3 h-3 border-2 border-red-300 border-t-red-600 rounded-full animate-spin" />
                                        : <Trash2 className="w-3.5 h-3.5 text-red-500" />
                                    }
                                </button>
                            </div>
                        ))}
                    </div>
                    <div className="p-3 bg-[var(--primary)]/5 text-center">
                        <p className="text-[9px] font-bold text-[var(--primary)]/40 uppercase tracking-wider">
                            {lang === 'uz'
                                ? "Qurilmani o'chirib, qayta kirish uchun yuqoridagi tugmani bosing"
                                : "Удалите устройство и повторите попытку входа"}
                        </p>
                    </div>
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
                ) : deviceLimitReached
                    ? (lang === 'uz' ? 'Qayta kirish' : 'Повторить')
                    : dictionary.common.login}
            </Button>

            {!isAdmin && (
                <div className="text-center text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 pt-4">
                    Hisobingiz yo'qmi?{" "}
                    <a href="https://t.me/baxtli_men_bot?startapp=register" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] font-black hover:text-[var(--primary)]/70 transition-colors">
                        💬 {dictionary.common.register}
                    </a>
                </div>
            )}
        </form>
    )
}

