"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "../ui/Button"
import { Input } from "../ui/Input"
import { Locale } from "@/dictionaries/get-dictionary"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { useState } from "react"

const loginSchema = z.object({
    email: z.string().email("Invalid email"),
    password: z.string().min(6, "Password is too short"),
})

type LoginFormValues = z.infer<typeof loginSchema>

interface LoginFormProps {
    lang: Locale
    dictionary: any
}

export function LoginForm({ lang, dictionary }: LoginFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const form = useForm<LoginFormValues>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: "",
            password: "",
        },
    })

    const onSubmit = async (data: LoginFormValues) => {
        setLoading(true)
        setError(null)

        try {
            const { error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            })

            if (authError) throw authError

            router.push(`/${lang}/account`)
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
                {loading ? "Yuklanmoqda..." : dictionary.common.login}
            </Button>

            <div className="text-center text-sm font-medium text-primary/50">
                Hisobingiz yo'qmi?{" "}
                <Link href={`/${lang}/register`} className="text-wellness-gold font-bold hover:underline">
                    {dictionary.common.register}
                </Link>
            </div>
        </form>
    )
}
