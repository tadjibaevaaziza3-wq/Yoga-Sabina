import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Container } from "@/components/ui/Container"
import { Header } from "@/components/Header"
import { coursesData } from "@/lib/data/courses"
import { consultationsData } from "@/lib/data/consultations"
import { CheckoutForm } from "@/components/checkout/CheckoutForm"
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase"

export default async function CheckoutPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: Locale }>
    searchParams: Promise<{ id: string; type: string }>
}) {
    const { lang } = await params
    const { id, type } = await searchParams
    const dictionary = await getDictionary(lang)

    // Validate Item
    let item: any = null
    if (type === 'course') {
        item = coursesData[lang].find(c => c.id === id)
    } else if (type === 'consultation') {
        item = consultationsData[lang].find(c => c.id === id)
    }

    if (!item) {
        redirect(`/${lang}`)
    }

    return (
        <main className="min-h-screen bg-[#F8FAFA]">
            <Header />
            <section className="pt-32 pb-20">
                <Container>
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-12">
                            <h1 className="text-3xl md:text-4xl font-serif font-black text-[var(--primary)] mb-4">
                                {lang === 'uz' ? "To'lovni tasdiqlash" : "Подтверждение оплаты"}
                            </h1>
                            <p className="text-[var(--primary)]/60">
                                {lang === 'uz'
                                    ? "Xaridni yakunlash uchun to'lov usulini tanlang"
                                    : "Выберите способ оплаты для завершения покупки"}
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8">
                            {/* Order Summary */}
                            <div className="bg-white rounded-[2rem] p-8 border border-[var(--secondary)] shadow-xl shadow-[var(--primary)]/5 h-fit">
                                <h3 className="text-xl font-bold text-[var(--primary)] mb-6">
                                    {lang === 'uz' ? "Buyurtma tarkibi" : "Состав заказа"}
                                </h3>

                                <div className="aspect-video relative rounded-xl overflow-hidden mb-6">
                                    <img
                                        src={item.image || item.coverImage || "/images/hero.png"}
                                        alt={item.title}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-[var(--primary)]/10" />
                                </div>

                                <div className="space-y-4 mb-8">
                                    <div>
                                        <div className="text-xs font-bold text-[var(--primary)]/40 uppercase tracking-widest mb-1">
                                            {item.type === 'ONLINE' ? 'Online' : 'Offline'}
                                        </div>
                                        <h4 className="text-lg font-bold text-[var(--primary)] leading-tight">
                                            {item.title}
                                        </h4>
                                    </div>

                                    <div className="flex items-center justify-between py-4 border-t border-[var(--secondary)]">
                                        <span className="font-bold text-[var(--primary)]/60">
                                            {lang === 'uz' ? "Jami:" : "Итого:"}
                                        </span>
                                        <span className="text-2xl font-black text-[var(--primary)]">
                                            {new Intl.NumberFormat(lang === 'uz' ? 'uz-UZ' : 'ru-RU').format(Number(item.price))}
                                            <span className="text-xs ml-1">{dictionary.courses.uzs}</span>
                                        </span>
                                    </div>
                                </div>

                                <div className="bg-[var(--secondary)] rounded-xl p-4 text-xs text-[var(--primary)]/60 leading-relaxed">
                                    {lang === 'uz'
                                        ? "Xarid qilish orqali siz ommaviy ofertani qabul qilgan hisoblanasiz va shaxsiy ma'lumotlaringizni qayta ishlashga rozilik berasiz."
                                        : "Совершая покупку, вы принимаете условия публичной оферты и даете согласие на обработку персональных данных."}
                                </div>
                            </div>

                            {/* Payment Form */}
                            <div className="space-y-6">
                                <CheckoutForm
                                    item={item}
                                    lang={lang}
                                    type={type}
                                    dictionary={dictionary}
                                />
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    )
}
