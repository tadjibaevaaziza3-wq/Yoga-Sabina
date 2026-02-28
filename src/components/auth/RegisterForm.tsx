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
import { PublicOfferModal } from "./PublicOfferModal"

const registerSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    phone: z.string()
        .min(12, "Telefon raqam juda qisqa")
        .max(13, "Telefon raqam juda uzun")
        .regex(/^\+998\d{9}$/, "Telefon raqam +998XXXXXXXXX formatida bo'lishi kerak"),
    telegramUsername: z.string().optional(),
    location: z.string().min(2, "Location is required"),
    healthIssues: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
    agreeToOffer: z.boolean().refine(val => val === true, "Siz ommaviy ofertaga rozilik berishingiz kerak"),
})

type RegisterFormValues = z.infer<typeof registerSchema>

interface RegisterFormProps {
    lang: Locale
    dictionary: any
}

export function RegisterForm({ lang, dictionary }: RegisterFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [isOfferModalOpen, setIsOfferModalOpen] = useState(false)

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            telegramUsername: "",
            location: "",
            healthIssues: "",
            password: "",
            agreeToOffer: false,
        },
    })

    const onSubmit = async (data: RegisterFormValues) => {
        setLoading(true)
        setError(null)

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            })

            const result = await res.json()
            if (!result.success) throw new Error(result.error)

            // Success -> Redirect
            window.location.href = `/${lang}/account`
        } catch (err: any) {
            setError(err.reason || err.message || "Xatolik yuz berdi")
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
                    {dictionary.auth.name}
                </label>
                <div className="relative group">
                    <Input
                        {...form.register("name")}
                        placeholder="Ismingizni kiriting"
                        className={cn(
                            "rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6",
                            form.formState.errors.name ? "border-red-400" : ""
                        )}
                    />
                </div>
                {form.formState.errors.name && (
                    <p className="text-[10px] text-red-500 ml-4 font-bold uppercase tracking-tight">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="grid sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                        {dictionary.auth.email}
                    </label>
                    <Input
                        {...form.register("email")}
                        type="email"
                        placeholder="example@mail.com"
                        className={cn(
                            "rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6",
                            form.formState.errors.email ? "border-red-400" : ""
                        )}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                        {dictionary.auth.phone}
                    </label>
                    <Input
                        {...form.register("phone")}
                        placeholder="+998 90 123 45 67"
                        className={cn(
                            "rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6",
                            form.formState.errors.phone ? "border-red-400" : ""
                        )}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                    {lang === 'uz' ? 'Telegram username yoki ID' : 'Telegram имя или ID'}
                </label>
                <Input
                    {...form.register("telegramUsername")}
                    placeholder="@username yoki 123456789"
                    className="rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6"
                />
                <p className="text-[9px] font-bold text-[var(--primary)]/30 ml-4 uppercase tracking-wider">
                    {lang === 'uz' ? 'Ixtiyoriy — parolni tiklash uchun kerak' : 'Необязательно — для восстановления пароля'}
                </p>
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                    {dictionary.auth.location}
                </label>
                <Input
                    {...form.register("location")}
                    placeholder="Shahringiz..."
                    className={cn(
                        "rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6",
                        form.formState.errors.location ? "border-red-400" : ""
                    )}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                    {dictionary.auth.healthIssues}
                </label>
                <textarea
                    {...form.register("healthIssues")}
                    className="flex min-h-[120px] w-full rounded-3xl border border-[var(--primary)]/5 bg-[var(--secondary)]/30 px-6 py-4 text-sm focus:bg-white focus:ring-2 focus:ring-[var(--primary)]/20 focus:border-[var(--primary)]/50 transition-all outline-none"
                    placeholder={dictionary.auth.healthIssuesPlaceholder}
                />
            </div>

            <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)]/40 ml-4">
                    Parol
                </label>
                <Input
                    {...form.register("password")}
                    type="password"
                    placeholder="******"
                    className={cn(
                        "rounded-2xl border-[var(--primary)]/5 bg-[var(--secondary)]/30 focus:bg-white focus:border-[var(--primary)]/50 transition-all py-6",
                        form.formState.errors.password ? "border-red-400" : ""
                    )}
                />
            </div>

            <div className="flex flex-col gap-2">
                <div className="flex items-start gap-4 p-4 rounded-2xl bg-[var(--secondary)]/50 border border-[var(--primary)]/5">
                    <input
                        {...form.register("agreeToOffer")}
                        type="checkbox"
                        id="agreeToOffer"
                        className="mt-1 w-5 h-5 rounded border-[var(--primary)]/10 text-[var(--primary)] focus:ring-[var(--primary)] transition-all cursor-pointer"
                    />
                    <label htmlFor="agreeToOffer" className="text-xs text-[var(--primary)]/60 font-medium leading-relaxed cursor-pointer select-none">
                        {lang === 'uz' ? (
                            <>
                                Men <button type="button" onClick={() => setIsOfferModalOpen(true)} className="text-[var(--primary)] font-bold underline hover:text-[var(--primary)]/80">Ommaviy oferta</button> shartlariga roziman
                            </>
                        ) : (
                            <>
                                Я согласен с условиями <button type="button" onClick={() => setIsOfferModalOpen(true)} className="text-[var(--primary)] font-bold underline hover:text-[var(--primary)]/80">Публичной оферты</button>
                            </>
                        )}
                    </label>
                </div>
                {form.formState.errors.agreeToOffer && (
                    <p className="text-[10px] text-red-500 ml-4 font-bold uppercase tracking-tight">{form.formState.errors.agreeToOffer.message}</p>
                )}
            </div>

            <PublicOfferModal
                isOpen={isOfferModalOpen}
                onClose={() => setIsOfferModalOpen(false)}
                lang={lang}
            />

            <Button type="submit" className="w-full py-6 rounded-2xl bg-[var(--primary)] hover:bg-[var(--primary)]/90 text-[11px] font-black uppercase tracking-[0.2em] shadow-xl shadow-[var(--primary)]/20 active:scale-[0.98] transition-all" disabled={loading}>
                {loading ? (
                    <div className="flex items-center gap-3">
                        <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                        <span>Yuklanmoqda...</span>
                    </div>
                ) : dictionary.common.register}
            </Button>
        </form>
    )
}


