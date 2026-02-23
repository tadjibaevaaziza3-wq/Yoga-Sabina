import { Locale } from "@/dictionaries/get-dictionary"
import { Header } from "@/components/Header"
import { Container } from "@/components/ui/Container"
import { Shield, Lock, Eye, Database, Mail, UserCheck, Trash2 } from "lucide-react"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
    const { lang } = await params
    return {
        title: lang === 'uz' ? 'Maxfiylik siyosati | Baxtli Men' : 'Политика конфиденциальности | Baxtli Men',
        description: lang === 'uz'
            ? "Baxtli Men platformasining maxfiylik siyosati — ma'lumotlaringiz qanday yig'iladi, saqlanadi va ishlatiladi."
            : 'Политика конфиденциальности платформы Baxtli Men — как собираются, хранятся и используются ваши данные.',
        robots: { index: true, follow: true },
    }
}

export default async function PrivacyPolicyPage({ params }: { params: Promise<{ lang: Locale }> }) {
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
                                <Shield className="w-7 h-7 text-[var(--primary)]" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-serif font-black text-[var(--foreground)]">
                                    {isUz ? "Maxfiylik siyosati" : "Политика конфиденциальности"}
                                </h1>
                                <p className="text-xs text-[var(--primary)]/40 mt-1 font-bold uppercase tracking-widest">
                                    {isUz ? "Oxirgi yangilash: 2026-yil fevral" : "Последнее обновление: февраль 2026"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-10 text-sm text-[var(--foreground)]/70 leading-relaxed">
                            {/* Data Collection */}
                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <Database className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "Qanday ma'lumotlarni yig'amiz" : "Какие данные мы собираем"}
                                </h2>
                                <ul className="space-y-2 list-disc list-inside">
                                    <li>{isUz ? "Ism, familiya va email manzil" : "Имя, фамилия и email адрес"}</li>
                                    <li>{isUz ? "Telefon raqami va Telegram username" : "Номер телефона и Telegram username"}</li>
                                    <li>{isUz ? "To'lov ma'lumotlari (Payme, Click orqali)" : "Платёжные данные (через Payme, Click)"}</li>
                                    <li>{isUz ? "Profil ma'lumotlari: jins, tug'ilgan sana, sog'liq holati" : "Данные профиля: пол, дата рождения, состояние здоровья"}</li>
                                    <li>{isUz ? "Tana o'lchamlari: vazn, bo'y, bel, son, ko'krak" : "Измерения тела: вес, рост, талия, бёдра, грудь"}</li>
                                    <li>{isUz ? "Analitika: sayt foydalanish, mashq vaqti, video ko'rish" : "Аналитика: использование сайта, время занятий, просмотр видео"}</li>
                                    <li>{isUz ? "AI chat tarixi va kayfiyat tekshiruvlari" : "История AI чата и проверки настроения"}</li>
                                </ul>
                            </section>

                            {/* How We Use */}
                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <Eye className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "Ma'lumotlardan qanday foydalanamiz" : "Как мы используем данные"}
                                </h2>
                                <ul className="space-y-2 list-disc list-inside">
                                    <li>{isUz ? "Kurs va video kontentga kirish imkonini berish" : "Предоставление доступа к курсам и видео контенту"}</li>
                                    <li>{isUz ? "Shaxsiylashtirilgan yoga maslahatlar berish" : "Предоставление персонализированных советов по йоге"}</li>
                                    <li>{isUz ? "To'lovlarni qayta ishlash va obunalarni boshqarish" : "Обработка платежей и управление подписками"}</li>
                                    <li>{isUz ? "Xizmat sifatini yaxshilash va analitika" : "Улучшение качества сервиса и аналитика"}</li>
                                </ul>
                            </section>

                            {/* AI Data */}
                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <span className="text-xl">🤖</span>
                                    {isUz ? "AI ma'lumotlaridan foydalanish" : "Использование данных AI"}
                                </h2>
                                <p>{isUz
                                    ? "Bizning AI konsyerj (Sabina yordamchisi) sizning profilingiz, sog'liq holatini va chat tarixini shaxsiylashtirilgan yoga maslahatlari berish uchun ishlatadi. AI suhbatlaringiz xavfsiz saqlanadi va uchinchi tomonlar bilan bo'lishilmaydi. Siz istalgan vaqtda AI chat tarixingizni o'chirishingiz mumkin."
                                    : "Наш AI-консьерж (помощник Сабина) использует ваш профиль, состояние здоровья и историю чата для предоставления персонализированных советов по йоге. Ваши AI-разговоры хранятся безопасно и не передаются третьим лицам. Вы можете удалить историю AI-чата в любое время."
                                }</p>
                            </section>

                            {/* Retention */}
                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <Trash2 className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "Ma'lumotlarni saqlash muddati" : "Срок хранения данных"}
                                </h2>
                                <ul className="space-y-2 list-disc list-inside">
                                    <li>{isUz ? "Hisob ma'lumotlari: hisob faol bo'lganda saqlanadi" : "Данные аккаунта: хранятся пока аккаунт активен"}</li>
                                    <li>{isUz ? "To'lov tarixi: qonunchilik talablariga ko'ra 3 yil" : "История платежей: 3 года по требованиям законодательства"}</li>
                                    <li>{isUz ? "AI chat tarixi: oxirgi faollikdan 90 kun" : "История AI-чата: 90 дней с последней активности"}</li>
                                    <li>{isUz ? "Analitika: anonim holda 12 oy" : "Аналитика: 12 месяцев в анонимном виде"}</li>
                                </ul>
                            </section>

                            {/* User Rights */}
                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <UserCheck className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "Sizning huquqlaringiz (GDPR)" : "Ваши права (GDPR)"}
                                </h2>
                                <ul className="space-y-2 list-disc list-inside">
                                    <li>{isUz ? "Ma'lumotlaringizga kirish va nusxa olish huquqi" : "Право на доступ и копирование ваших данных"}</li>
                                    <li>{isUz ? "Ma'lumotlarni tuzatish huquqi" : "Право на исправление данных"}</li>
                                    <li>{isUz ? "Ma'lumotlarni o'chirish huquqi ('unutilish huquqi')" : "Право на удаление данных ('право быть забытым')"}</li>
                                    <li>{isUz ? "Ma'lumotlarni qayta ishlashni cheklash huquqi" : "Право на ограничение обработки данных"}</li>
                                    <li>{isUz ? "Ma'lumotlarni ko'chirish huquqi" : "Право на перенос данных"}</li>
                                    <li>{isUz ? "Rozilikni bekor qilish huquqi" : "Право на отзыв согласия"}</li>
                                </ul>
                            </section>

                            {/* Contact */}
                            <section className="bg-[var(--primary)]/5 rounded-2xl p-6">
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-3 flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "Bog'lanish" : "Контакты"}
                                </h2>
                                <p>{isUz
                                    ? "Maxfiylik bo'yicha savollar uchun: Telegram: @Sabina_Radjapovna"
                                    : "По вопросам конфиденциальности: Telegram: @Sabina_Radjapovna"
                                }</p>
                            </section>
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    )
}
