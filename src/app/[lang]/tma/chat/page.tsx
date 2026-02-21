"use client"

import React, { useEffect, useState } from "react"
import { Container } from "@/components/ui/Container"
import { UserChatManager } from "@/components/user/UserChatManager"
import { BookOpen, Star, Activity, MessageCircle } from "lucide-react"
import Link from "next/link"
import { useParams } from 'next/navigation'
import { motion } from "framer-motion"

export default function TMAChatPage() {
    const params = useParams()
    const lang = (params?.lang as string) || 'uz'
    const [user, setUser] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchMe = async () => {
            try {
                const res = await fetch('/api/tma/me')
                const data = await res.json()
                if (data.success) {
                    setUser(data.user)
                }
            } catch (err) {
                console.error('Fetch error:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchMe()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f6f9fe] flex items-center justify-center">
                <div className="w-10 h-10 border-t-2 border-[#114539] rounded-full animate-spin" />
            </div>
        )
    }

    if (!user) {
        return (
            <div className="min-h-screen border-none bg-[#f6f9fe] flex items-center justify-center text-[#114539]/40 font-bold uppercase tracking-widest text-[10px]">
                {lang === 'ru' ? 'Необходима авторизация' : 'Avtorizatsiya talab qilinadi'}
            </div>
        )
    }

    return (
        <main className="pb-32 bg-[#f6f9fe] min-h-screen relative overflow-x-hidden">
            {/* Background Gradient Accents */}
            <div className="absolute top-0 right-0 w-[120%] h-[40%] bg-[#114539]/10 blur-[100px] rounded-full translate-x-1/2 -translate-y-1/2 -z-10"></div>

            <Container className="pt-8 px-4 space-y-6">
                <header className="mb-4">
                    <h1 className="text-3xl font-editorial font-black text-[#114539]">
                        {lang === 'ru' ? 'Мои Чаты' : 'Mening Chatlarim'}
                    </h1>
                </header>

                <div className="pb-8">
                    {/* The UserChatManager has a fixed height, on mobile we might want to let it be responsive if possible. 
                        But we'll use the existing component for now. 
                        We can add custom CSS to manage the height on small screens if necessary. */}
                    <div className="sm:h-[750px] h-[calc(100vh-250px)]">
                        <UserChatManager currentUserId={user.id} lang={lang as 'uz' | 'ru'} />
                    </div>
                </div>
            </Container>

            {/* Bottom Nav Bar (Global TMA matched style) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#114539]/5 p-6 pb-10 flex justify-around z-50">
                <Link href={`/${lang}/tma/dashboard`} className="flex flex-col items-center gap-2">
                    <Activity className="w-6 h-6 text-[#114539]/20" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]/20">Panel</span>
                </Link>
                <Link href={`/${lang}/tma/courses`} className="flex flex-col items-center gap-2">
                    <BookOpen className="w-6 h-6 text-[#114539]/20" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]/20">Kurslar</span>
                </Link>
                <Link href={`/${lang}/tma/chat`} className="flex flex-col items-center gap-2">
                    <MessageCircle className="w-6 h-6 text-[#114539]" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]">Chat</span>
                </Link>
                <Link href={`/${lang}/tma/profile`} className="flex flex-col items-center gap-2">
                    <Star className="w-6 h-6 text-[#114539]/20" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]/20">Profil</span>
                </Link>
            </div>
        </main>
    )
}
