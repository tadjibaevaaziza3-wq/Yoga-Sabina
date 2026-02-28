'use client'

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

/**
 * Web registration → redirect to TMA (Telegram Mini App)
 * All registration happens through Telegram to auto-capture telegramId.
 * After registration in TMA, user is redirected to web user panel.
 */
export default function RegisterPage() {
    const params = useParams()
    const lang = (params?.lang as string) || 'uz'

    useEffect(() => {
        // Redirect to Telegram Mini App for registration
        window.location.href = `https://t.me/baxtli_men_bot?startapp=register`
    }, [])

    return (
        <main className="min-h-screen bg-[#f6f9fe] flex items-center justify-center p-6">
            <div className="text-center space-y-6 max-w-md">
                <div className="w-16 h-16 mx-auto bg-[#114539] rounded-2xl flex items-center justify-center shadow-lg">
                    <span className="text-3xl">📱</span>
                </div>
                <h1 className="text-2xl font-black text-[#114539]">
                    {lang === 'ru' ? 'Регистрация через Telegram' : 'Telegram orqali ro\'yxatdan o\'tish'}
                </h1>
                <p className="text-sm text-[#114539]/60 leading-relaxed">
                    {lang === 'ru'
                        ? 'Вы будете перенаправлены в наш Telegram бот для быстрой и безопасной регистрации.'
                        : 'Tez va xavfsiz ro\'yxatdan o\'tish uchun Telegram botimizga yo\'naltirilasiz.'}
                </p>
                <a
                    href="https://t.me/baxtli_men_bot?startapp=register"
                    className="inline-flex items-center gap-2 bg-[#114539] text-white font-bold text-sm px-8 py-4 rounded-2xl hover:bg-[#0a8069] transition-colors shadow-lg"
                >
                    <span className="text-lg">💬</span>
                    {lang === 'ru' ? 'Открыть Telegram' : 'Telegramni ochish'}
                </a>
                <p className="text-[10px] text-[#114539]/30 uppercase tracking-widest font-bold">
                    {lang === 'ru'
                        ? 'После регистрации вы сможете войти и с сайта'
                        : 'Ro\'yxatdan o\'tgandan so\'ng saytdan ham kirishingiz mumkin'}
                </p>
            </div>
        </main>
    )
}
