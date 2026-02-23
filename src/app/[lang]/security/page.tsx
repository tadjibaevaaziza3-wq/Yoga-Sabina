import { Locale } from "@/dictionaries/get-dictionary"
import { Header } from "@/components/Header"
import { Container } from "@/components/ui/Container"
import { Lock, ShieldCheck, Server, CreditCard, AlertTriangle, Mail } from "lucide-react"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
    const { lang } = await params
    return {
        title: lang === 'uz' ? 'Xavfsizlik siyosati | Baxtli Men' : 'Политика безопасности | Baxtli Men',
        description: lang === 'uz'
            ? "Baxtli Men platformasining xavfsizlik siyosati — SSL shifrlash, autentifikatsiya va ma'lumotlar himoyasi."
            : 'Политика безопасности платформы Baxtli Men — SSL шифрование, аутентификация и защита данных.',
        robots: { index: true, follow: true },
    }
}

export default async function SecurityPage({ params }: { params: Promise<{ lang: Locale }> }) {
    const { lang } = await params
    const isUz = lang === 'uz'

    return (
        <main className="min-h-screen bg-[var(--background)]">
            <Header />
            <section className="pt-32 pb-20">
                <Container>
                    <div className="max-w-3xl mx-auto">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-14 h-14 bg-[var(--primary)]/5 rounded-2xl flex items-center justify-center">
                                <Lock className="w-7 h-7 text-[var(--primary)]" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-serif font-black text-[var(--foreground)]">
                                    {isUz ? "Xavfsizlik siyosati" : "Политика безопасности"}
                                </h1>
                                <p className="text-xs text-[var(--primary)]/40 mt-1 font-bold uppercase tracking-widest">
                                    {isUz ? "Oxirgi yangilash: 2026-yil fevral" : "Последнее обновление: февраль 2026"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-10 text-sm text-[var(--foreground)]/70 leading-relaxed">
                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <ShieldCheck className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "SSL/TLS shifrlash" : "SSL/TLS шифрование"}
                                </h2>
                                <p>{isUz
                                    ? "Barcha ma'lumotlar 256-bitli SSL/TLS shifrlash orqali uzatiladi. Saytimiz HTTPS protokolidan foydalanadi va barcha aloqalar shifrlanadi."
                                    : "Все данные передаются с использованием 256-битного SSL/TLS шифрования. Наш сайт использует протокол HTTPS, и все соединения шифруются."
                                }</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <Lock className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "Xavfsiz autentifikatsiya" : "Безопасная аутентификация"}
                                </h2>
                                <ul className="space-y-2 list-disc list-inside">
                                    <li>{isUz ? "JWT tokenlar orqali sessiya boshqaruvi" : "Управление сессиями через JWT-токены"}</li>
                                    <li>{isUz ? "Parollar bcrypt algoritmi bilan xeshlanadi" : "Пароли хешируются алгоритмом bcrypt"}</li>
                                    <li>{isUz ? "Telegram orqali OTP tekshiruvi (video uchun)" : "OTP верификация через Telegram (для видео)"}</li>
                                    <li>{isUz ? "Avtomatik sessiya muddati tugashi" : "Автоматическое истечение сессии"}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <Server className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "Ma'lumotlar saqlash xavfsizligi" : "Безопасность хранения данных"}
                                </h2>
                                <ul className="space-y-2 list-disc list-inside">
                                    <li>{isUz ? "Ma'lumotlar bazasi shifrlangan holda saqlanadi" : "База данных хранится в зашифрованном виде"}</li>
                                    <li>{isUz ? "Video kontentlar xavfsiz Google Cloud Storage'da" : "Видео хранится в безопасном Google Cloud Storage"}</li>
                                    <li>{isUz ? "Shaxsiy ma'lumotlar izolyatsiya qilingan muhitda" : "Персональные данные в изолированной среде"}</li>
                                    <li>{isUz ? "Muntazam zaxira nusxalari" : "Регулярное резервное копирование"}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "To'lov xavfsizligi" : "Безопасность платежей"}
                                </h2>
                                <p>{isUz
                                    ? "To'lovlar Payme va Click xavfsiz to'lov tizimlari orqali amalga oshiriladi. Biz to'lov karta ma'lumotlarini saqlamaymiz — barcha tranzaksiyalar to'lov provayderlar tomonidan qayta ishlanadi (PCI DSS standarti)."
                                    : "Платежи осуществляются через безопасные платёжные системы Payme и Click. Мы не храним данные платёжных карт — все транзакции обрабатываются платёжными провайдерами (стандарт PCI DSS)."
                                }</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "Hodisalarga javob berish" : "Реагирование на инциденты"}
                                </h2>
                                <ul className="space-y-2 list-disc list-inside">
                                    <li>{isUz ? "Xavfsizlik hodisalariga 24 soat ichida javob beramiz" : "Реагируем на инциденты безопасности в течение 24 часов"}</li>
                                    <li>{isUz ? "Zararlangan foydalanuvchilarga darhol xabar beramiz" : "Немедленно уведомляем затронутых пользователей"}</li>
                                    <li>{isUz ? "Har bir hodisa haqida batafsil tahlil o'tkazamiz" : "Проводим детальный анализ каждого инцидента"}</li>
                                </ul>
                            </section>

                            <section className="bg-[var(--primary)]/5 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "Xavfsizlik muammolari haqida xabar berish" : "Сообщить о проблемах безопасности"}
                                </h2>
                                <p>{isUz
                                    ? "Xavfsizlik zaifligini topganmisiz? Iltimos security@baxtlimen.uz yoki Telegram: @Sabina_Radjapovna ga xabar bering."
                                    : "Нашли уязвимость? Сообщите на security@baxtlimen.uz или Telegram: @Sabina_Radjapovna."
                                }</p>
                            </section>
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    )
}
