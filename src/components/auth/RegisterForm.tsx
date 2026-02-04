"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Locale } from "@/dictionaries/get-dictionary"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useState } from "react"

const registerSchema = z.object({
    name: z.string().min(2, "Name is too short"),
    email: z.string().email("Invalid email"),
    phone: z.string().min(7, "Invalid phone number"),
    location: z.string().min(2, "Location is required"),
    healthIssues: z.string().optional(),
    password: z.string().min(6, "Password must be at least 6 characters"),
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

    const form = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            name: "",
            email: "",
            phone: "",
            location: "",
            healthIssues: "",
            password: "",
        },
    })

    const onSubmit = async (data: RegisterFormValues) => {
        setLoading(true)
        setError(null)

        try {
            // 1. Supabase Sign Up
            const { data: authData, error: authError } = await supabase.auth.signUp({
                email: data.email,
                password: data.password,
                options: {
                    data: {
                        full_name: data.name,
                    }
                }
            })

            if (authError) throw authError
            if (!authData.user) throw new Error("Registration failed")

            // 2. Call our API to create Prisma records
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...data,
                    supabaseUserId: authData.user.id
                })
            })

            const result = await res.json()
            if (!result.success) throw new Error(result.error)

            // 3. Success -> Redirect
            router.push(`/${lang}/account`)
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
                <label className="text-sm font-bold text-primary/60 ml-2">
                    {dictionary.auth.name}
                </label>
                <Input
                    {...form.register("name")}
                    placeholder="Ismingizni kiriting"
                    className={form.formState.errors.name ? "border-red-400" : ""}
                />
                {form.formState.errors.name && (
                    <p className="text-xs text-red-500 ml-2">{form.formState.errors.name.message}</p>
                )}
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-primary/60 ml-2">
                        {dictionary.auth.email}
                    </label>
                    <Input
                        {...form.register("email")}
                        type="email"
                        placeholder="example@mail.com"
                        className={form.formState.errors.email ? "border-red-400" : ""}
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold text-primary/60 ml-2">
                        {dictionary.auth.phone}
                    </label>
                    <Input
                        {...form.register("phone")}
                        placeholder="+998 90 123 45 67"
                        className={form.formState.errors.phone ? "border-red-400" : ""}
                    />
                </div>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-primary/60 ml-2">
                    {dictionary.auth.location}
                </label>
                <Input
                    {...form.register("location")}
                    placeholder="Shahringiz..."
                    className={form.formState.errors.location ? "border-red-400" : ""}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-primary/60 ml-2">
                    {dictionary.auth.healthIssues}
                </label>
                <textarea
                    {...form.register("healthIssues")}
                    className="flex min-h-[100px] w-full rounded-2xl border border-primary/10 bg-white px-4 py-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-wellness-gold transition-all"
                    placeholder={dictionary.auth.healthIssuesPlaceholder}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-primary/60 ml-2">
                    Parol
                </label>
                <Input
                    {...form.register("password")}
                    type="password"
                    placeholder="******"
                    className={form.formState.errors.password ? "border-red-400" : ""}
                />
            </div>

            <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Yuklanmoqda..." : dictionary.common.register}
            </Button>
        </form>
    )
}
