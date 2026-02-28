import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { CheckoutForm } from "@/components/checkout/CheckoutForm"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { getLocalUser } from "@/lib/auth/server"
import { headers } from "next/headers"
import Link from "next/link"

export default async function CheckoutPage({
    params,
    searchParams,
}: {
    params: Promise<{ lang: Locale }>
    searchParams: Promise<{ id: string; type: string; from?: string }>
}) {
    const { lang } = await params
    const { id, type, from } = await searchParams
    const dictionary = await getDictionary(lang)

    // Auth check — redirect unregistered users to register/login
    const user = await getLocalUser()
    if (!user) {
        redirect(`/${lang}/login?returnTo=/${lang}/checkout?id=${id}&type=${type}`)
    }

    // Detect context: user panel, TMA, or landing page
    const headersList = await headers()
    const referer = headersList.get('referer') || ''
    const isFromTMA = from === 'tma' || referer.includes('/tma/')
    const isFromPanel = from === 'panel' || referer.includes('/all-courses') || referer.includes('/my-courses') || referer.includes('/dashboard') || referer.includes('/account')

    // Determine back URL based on context
    const backUrl = isFromTMA
        ? `/${lang}/tma/courses`
        : isFromPanel
            ? `/${lang}/all-courses`
            : `/${lang}/online-courses`

    const backLabel = lang === 'uz' ? "← Kurslarga qaytish" : "← Вернуться к курсам"

    // Validate Item from Database
    let item: any = null
    try {
        if (type === 'course') {
            const course = await prisma.course.findUnique({
                where: { id: id, productType: 'COURSE' }
            })
            if (course) {
                item = {
                    ...course,
                    title: lang === 'ru' && course.titleRu ? course.titleRu : course.title,
                    description: lang === 'ru' && course.descriptionRu ? course.descriptionRu : course.description,
                    price: Number(course.price)
                }
            }
        } else if (type === 'consultation') {
            const consultation = await prisma.course.findFirst({
                where: { id: id, productType: 'CONSULTATION' }
            })
            if (consultation) {
                item = {
                    ...consultation,
                    title: lang === 'ru' && consultation.titleRu ? consultation.titleRu : consultation.title,
                    description: lang === 'ru' && consultation.descriptionRu ? consultation.descriptionRu : consultation.description,
                    price: Number(consultation.price)
                }
            }
        }
    } catch (error) {
        console.error('Error fetching checkout item:', error)
    }

    if (!item) {
        redirect(backUrl)
    }

    return (
        <main className="min-h-screen bg-[#F8FAFA]">
            <div className="max-w-4xl mx-auto px-4 md:px-8 py-8">
                {/* Back button — always go back to context */}
                <Link
                    href={backUrl}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)]/60 hover:text-[var(--primary)] transition-colors mb-8"
                >
                    {backLabel}
                </Link>

                {/* Page Title */}
                <div className="text-center mb-10">
                    <h1 className="text-2xl md:text-3xl font-serif font-black text-[var(--primary)] mb-2">
                        {lang === 'uz' ? "To'lovni tasdiqlash" : "Подтверждение оплаты"}
                    </h1>
                    <p className="text-sm text-[var(--primary)]/50">
                        {lang === 'uz'
                            ? "Xaridni yakunlash uchun to'lov usulini tanlang"
                            : "Выберите способ оплаты для завершения покупки"}
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Order Summary */}
                    <div className="bg-white rounded-2xl p-6 md:p-8 border border-[var(--secondary)] shadow-xl shadow-[var(--primary)]/5 h-fit">
                        <h3 className="text-lg font-bold text-[var(--primary)] mb-5">
                            {lang === 'uz' ? "Buyurtma tarkibi" : "Состав заказа"}
                        </h3>

                        <div className="aspect-video relative rounded-xl overflow-hidden mb-5">
                            <img
                                src={item.image || item.coverImage || "/images/hero.png"}
                                alt={item.title}
                                className="w-full h-full object-cover"
                            />
                        </div>

                        <div className="space-y-4 mb-6">
                            <div>
                                <div className="text-xs font-bold text-[var(--primary)]/40 uppercase tracking-widest mb-1">
                                    {item.type === 'ONLINE' ? 'Online' : 'Offline'}
                                </div>
                                <h4 className="text-base font-bold text-[var(--primary)] leading-tight">
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
        </main>
    )
}
