"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Locale } from "@/dictionaries/get-dictionary"
import { useRouter } from "next/navigation"
import { useState } from "react"

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
            const res = await fetch("/api/auth/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            })

            const result = await res.json()

            if (!result.success) {
                throw new Error(result.message || "Login failed")
            }

            // Redirect based on role or context
            if (isAdmin) {
                router.push(`/${lang}/admin`)
            } else {
                router.push(`/${lang}/account`)
            }
            router.refresh()
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
                <label className="text-sm font-bold text-primary/60 ml-2">
                    {isAdmin ? "Admin Login" : (dictionary.auth.email || "Email / Login")}
                </label>
                <Input
                    {...form.register("login")}
                    type="text"
                    placeholder={isAdmin ? "admin123123" : "Login or Email"}
                    className={form.formState.errors.login ? "border-red-400" : ""}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-bold text-primary/60 ml-2">
                    {dictionary.auth.password || "Parol"}
                </label>
                <Input
                    {...form.register("password")}
                    type="password"
                    placeholder="******"
                    className={form.formState.errors.password ? "border-red-400" : ""}
                />
            </div>

            <Button type="submit" className="w-full bg-emerald-800 hover:bg-emerald-900" disabled={loading}>
                {loading ? "Yuklanmoqda..." : dictionary.common.login}
            </Button>

            {!isAdmin && (
                <div className="text-center text-sm font-medium text-primary/50">
                    Hisobingiz yo'qmi?{" "}
                    <Link href={`/${lang}/register`} className="text-emerald-700 font-bold hover:underline">
                        {dictionary.common.register}
                    </Link>
                </div>
            )}
        </form>
    )
}
import Link from "next/link"
