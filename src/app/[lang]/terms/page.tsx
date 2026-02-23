import { Locale } from "@/dictionaries/get-dictionary"
import { Header } from "@/components/Header"
import { Container } from "@/components/ui/Container"
import { FileText, User, CreditCard, Ban, Scale, Gavel } from "lucide-react"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ lang: Locale }> }): Promise<Metadata> {
    const { lang } = await params
    return {
        title: lang === 'uz' ? 'Foydalanish shartlari | Baxtli Men' : 'Условия использования | Baxtli Men',
        description: lang === 'uz'
            ? "Baxtli Men platformasining foydalanish shartlari — foydalanuvchi huquqlari, obuna, to'lov va qaytarish siyosati."
            : 'Условия использования платформы Baxtli Men — права пользователей, подписка, оплата и возврат.',
        robots: { index: true, follow: true },
    }
}

export default async function TermsPage({ params }: { params: Promise<{ lang: Locale }> }) {
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
                                <FileText className="w-7 h-7 text-[var(--primary)]" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-serif font-black text-[var(--foreground)]">
                                    {isUz ? "Foydalanish shartlari" : "Условия использования"}
                                </h1>
                                <p className="text-xs text-[var(--primary)]/40 mt-1 font-bold uppercase tracking-widest">
                                    {isUz ? "Oxirgi yangilash: 2026-yil fevral" : "Последнее обновление: февраль 2026"}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-10 text-sm text-[var(--foreground)]/70 leading-relaxed">
                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <User className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "Foydalanuvchi majburiyatlari" : "Обязанности пользователя"}
                                </h2>
                                <ul className="space-y-2 list-disc list-inside">
                                    <li>{isUz ? "Ro'yxatdan o'tishda to'g'ri ma'lumotlarni kiritish" : "Предоставлять достоверную информацию при регистрации"}</li>
                                    <li>{isUz ? "Hisobingiz xavfsizligini ta'minlash" : "Обеспечивать безопасность вашего аккаунта"}</li>
                                    <li>{isUz ? "Kontentni uchinchi shaxslarga tarqatmaslik" : "Не распространять контент третьим лицам"}</li>
                                    <li>{isUz ? "Platformadan qonuniy maqsadlarda foydalanish" : "Использовать платформу в законных целях"}</li>
                                    <li>{isUz ? "Video kontentni yozib olmaslik va tarqatmaslik" : "Не записывать и не распространять видео контент"}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <Scale className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "Hisob qoidalari" : "Правила аккаунта"}
                                </h2>
                                <ul className="space-y-2 list-disc list-inside">
                                    <li>{isUz ? "Har bir foydalanuvchi faqat bitta hisob yaratishi mumkin" : "Каждый пользователь может создать только один аккаунт"}</li>
                                    <li>{isUz ? "Hisobni boshqa shaxslarga berish taqiqlanadi" : "Передача аккаунта другим лицам запрещена"}</li>
                                    <li>{isUz ? "Qoidalarni buzgan hisoblar bloklanishi mumkin" : "Аккаунты, нарушающие правила, могут быть заблокированы"}</li>
                                    <li>{isUz ? "16 yoshdan kichik shaxslar ota-ona roziligi bilan" : "Лица младше 16 лет — с согласия родителей"}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <CreditCard className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "Obuna va to'lov shartlari" : "Подписка и условия оплаты"}
                                </h2>
                                <ul className="space-y-2 list-disc list-inside">
                                    <li>{isUz ? "Obuna to'lovi Payme yoki Click orqali amalga oshiriladi" : "Оплата подписки осуществляется через Payme или Click"}</li>
                                    <li>{isUz ? "Obuna muddati tugagach, premium kontentga kirish cheklanadi" : "По истечении подписки доступ к премиум контенту ограничивается"}</li>
                                    <li>{isUz ? "Narxlar oldindan ogohlantirish bilan o'zgarishi mumkin" : "Цены могут измениться с предварительным уведомлением"}</li>
                                    <li>{isUz ? "Bepul sinov muddati mavjud (agar ko'rsatilgan bo'lsa)" : "Бесплатный пробный период (если указан)"}</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <Ban className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "Qaytarish siyosati" : "Политика возврата"}
                                </h2>
                                <p>{isUz
                                    ? "Raqamli kontent sotib olingandan so'ng, 14 kun ichida qaytarish so'rovi yuborilishi mumkin. Agar kurs materiallarining 30% dan ortiq qismi ko'rilgan bo'lsa, qaytarish amalga oshirilmaydi. Qaytarish uchun admin@baxtlimen.uz yoki @Sabina_Radjapovna ga murojaat qiling."
                                    : "После покупки цифрового контента запрос на возврат может быть подан в течение 14 дней. Если просмотрено более 30% материалов курса, возврат не осуществляется. Для возврата обратитесь на admin@baxtlimen.uz или @Sabina_Radjapovna."
                                }</p>
                            </section>

                            <section>
                                <h2 className="text-lg font-bold text-[var(--foreground)] mb-4 flex items-center gap-2">
                                    <Gavel className="w-5 h-5 text-[var(--accent)]" />
                                    {isUz ? "Javobgarlikni cheklash va boshqaruvchi qonun" : "Ограничение ответственности и применимое право"}
                                </h2>
                                <ul className="space-y-2 list-disc list-inside">
                                    <li>{isUz ? "Platform tibbiy maslahat bermaydi — yoga mashqlari shaxsiy javobgarlikda" : "Платформа не предоставляет медицинских советов — занятия йогой под личную ответственность"}</li>
                                    <li>{isUz ? "Texnik nosozliklar uchun javobgarlik cheklangan" : "Ответственность за технические сбои ограничена"}</li>
                                    <li>{isUz ? "O'zbekiston Respublikasi qonunlari qo'llaniladi" : "Применяется законодательство Республики Узбекистан"}</li>
                                    <li>{isUz ? "Nizolar muzokaralar orqali hal qilinadi" : "Споры решаются путём переговоров"}</li>
                                </ul>
                            </section>

                            <section className="bg-[var(--primary)]/5 rounded-2xl p-6">
                                <p className="text-sm font-medium text-[var(--foreground)]">
                                    {isUz
                                        ? "Savollar uchun: info@baxtlimen.uz | Telegram: @Sabina_Radjapovna"
                                        : "Вопросы: info@baxtlimen.uz | Telegram: @Sabina_Radjapovna"}
                                </p>
                            </section>
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    )
}
