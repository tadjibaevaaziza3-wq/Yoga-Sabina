"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { CreditCard, Wallet, Landmark, ChevronRight, CheckCircle2 } from "lucide-react"
import TMAFileUpload from "@/components/tma/TMAFileUpload"
import { motion, AnimatePresence } from "framer-motion"

interface CheckoutFormProps {
    item: any
    lang: string
    type: string
    dictionary: any
}

export function CheckoutForm({ item, lang, type, dictionary }: CheckoutFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [paymentMethod, setPaymentMethod] = useState<'payme' | 'click' | 'manual'>('payme')
    const [screenshotUrl, setScreenshotUrl] = useState('')
    const [isSuccess, setIsSuccess] = useState(false)
    const [cards, setCards] = useState<{ number: string; owner: string }[]>([])

    useEffect(() => {
        fetch('/api/checkout/config')
            .then(res => res.json())
            .then(data => {
                if (data.success && data.cards) {
                    setCards(data.cards)
                } else if (data.success && data.config) {
                    // Legacy fallback
                    setCards([{
                        number: data.config.MANUAL_CARD_NUMBER || 'Tizimda karta kiritilmagan',
                        owner: data.config.MANUAL_CARD_OWNER || '-'
                    }])
                }
            })
            .catch(console.error)
    }, [])

    // Coupon states
    const [couponCode, setCouponCode] = useState('')
    const [couponId, setCouponId] = useState<string | null>(null)
    const [discountAmount, setDiscountAmount] = useState(0)
    const [isCheckingCoupon, setIsCheckingCoupon] = useState(false)
    const [couponError, setCouponError] = useState<string | null>(null)
    const [couponSuccess, setCouponSuccess] = useState(false)

    const handleValidateCoupon = async () => {
        if (!couponCode.trim()) return
        setIsCheckingCoupon(true)
        setCouponError(null)
        setCouponSuccess(false)

        try {
            const res = await fetch('/api/checkout/validate-coupon', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    code: couponCode,
                    courseId: item.id,
                    amount: Number(item.price)
                })
            })
            const data = await res.json()

            if (data.success) {
                setDiscountAmount(data.discountAmount)
                setCouponId(data.couponId)
                setCouponSuccess(true)
            } else {
                setCouponError(data.error || "Kod noto'g'ri")
            }
        } catch (e) {
            setCouponError("Tekshirishda xatolik")
        } finally {
            setIsCheckingCoupon(false)
        }
    }

    const finalAmount = Number(item.price) - discountAmount

    const handlePayment = async () => {
        if (paymentMethod === 'manual' && !screenshotUrl) {
            alert(lang === 'uz' ? 'Iltimos, to\'lov chekini yuklang' : 'Пожалуйста, загрузите чек об оплате');
            return;
        }

        setLoading(true)
        try {
            const payload = {
                courseId: item.id,
                amount: finalAmount, // Use discounted amount
                type: type,
                couponId: couponId, // Pass coupon ID
                provider: paymentMethod,
                screenshotUrl: paymentMethod === 'manual' ? screenshotUrl : undefined
            }

            const endpoint = paymentMethod === 'manual'
                ? '/api/payments/manual/create'
                : paymentMethod === 'click'
                    ? '/api/payments/click/create'
                    : paymentMethod === 'payme'
                        ? '/api/payments/payme/create'
                        : '/api/payments/mock/create'

            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })

            const data = await res.json()
            if (data.success) {
                if (paymentMethod === 'manual') {
                    setIsSuccess(true)
                } else if (data.paymentUrl) {
                    window.location.href = data.paymentUrl
                }
            } else {
                alert(data.error || 'Xatolik yuz berdi')
            }
        } catch (error) {
            console.error(error)
            alert('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    if (isSuccess) {
        // ... (existing success UI stays the same)
        return (
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white rounded-[2.5rem] p-10 border border-[#114539]/10 shadow-soft text-center space-y-6"
            >
                <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-10 h-10 text-green-500" />
                </div>
                <div className="space-y-2">
                    <h3 className="text-2xl font-editorial font-bold text-[#114539]">
                        {lang === 'uz' ? "Muvaffaqiyatli!" : "Успешно!"}
                    </h3>
                    <p className="text-xs text-[#114539]/60 font-medium leading-relaxed">
                        {lang === 'uz'
                            ? "Sizning to'lovingiz qabul qilindi. Admin tekshiruvidan so'ng kursingiz ochiladi (1-2 soat davomida)."
                            : "Ваш платеж принят. Курс откроется после проверки администратором (в течение 1-2 часов)."}
                    </p>
                </div>
                <Button
                    onClick={() => router.push(`/${lang}/account`)}
                    className="w-full py-5 bg-[#114539] text-white rounded-2xl text-[10px] font-bold uppercase tracking-widest"
                >
                    PANELGA QAYTISH
                </Button>
            </motion.div>
        );
    }

    return (
        <div className="bg-white rounded-[2.5rem] p-8 border border-[#114539]/5 shadow-soft space-y-8">
            {/* Promo Code Section */}
            <div className="space-y-4 p-6 bg-[var(--secondary)] rounded-[2rem] border border-[#114539]/5">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-[#114539]/60">Promo-kod</p>
                    {discountAmount > 0 && (
                        <div className="px-3 py-1 bg-emerald-100 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest">
                            -{new Intl.NumberFormat().format(discountAmount)} UZS
                        </div>
                    )}
                </div>
                <div className="flex gap-2">
                    <input
                        type="text"
                        placeholder="Kodni kiriting"
                        value={couponCode}
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        disabled={couponSuccess}
                        className="flex-1 bg-white border border-[#114539]/10 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#114539]/30 transition-all font-bold uppercase tracking-widest"
                    />
                    <button
                        onClick={handleValidateCoupon}
                        disabled={isCheckingCoupon || couponSuccess || !couponCode}
                        className={`px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${couponSuccess ? 'bg-emerald-500 text-white' : 'bg-[#114539] text-white'}`}
                    >
                        {isCheckingCoupon ? "..." : couponSuccess ? <CheckCircle2 className="w-4 h-4" /> : "Qo'shish"}
                    </button>
                </div>
                {couponError && <p className="text-[9px] font-bold text-rose-500 uppercase tracking-widest pl-2">{couponError}</p>}
                {couponSuccess && <p className="text-[9px] font-bold text-emerald-500 uppercase tracking-widest pl-2">Kupon muvaffaqiyatli qo'shildi!</p>}
            </div>

            <div className="space-y-1">
                <h3 className="text-lg font-editorial font-bold text-[#114539]">
                    {lang === 'uz' ? "To'lov usuli" : "Способ оплаты"}
                </h3>
                {discountAmount > 0 && (
                    <div className="flex justify-between items-center py-2 border-b border-dashed border-[#114539]/10">
                        <span className="text-[10px] font-bold opacity-40 uppercase tracking-widest text-[#114539]">Yangi narx:</span>
                        <span className="text-lg font-black text-[#114539]">{new Intl.NumberFormat().format(finalAmount)} UZS</span>
                    </div>
                )}
                <p className="text-[10px] text-[#114539]/40 font-bold uppercase tracking-widest pt-2">Xavfsiz va tezkor to'lov</p>
            </div>

            <div className="grid grid-cols-1 gap-4">
                {/* PayMe */}
                <button
                    onClick={() => setPaymentMethod('payme')}
                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${paymentMethod === 'payme'
                        ? 'border-[#114539] bg-[#114539]/5 shadow-inner'
                        : 'border-[#114539]/10 hover:border-[#114539]/30'
                        }`}
                >
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#114539]/10 flex items-center justify-center shadow-sm">
                        <CreditCard className={`w-5 h-5 ${paymentMethod === 'payme' ? 'text-[#114539]' : 'text-[#114539]/40'}`} />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="font-bold text-[#114539] text-sm">PayMe</div>
                        <div className="text-[10px] text-[#114539]/40 font-bold uppercase tracking-widest">Uzcard, Humo</div>
                    </div>
                    {paymentMethod === 'payme' && <div className="w-2 h-2 rounded-full bg-[#114539]" />}
                </button>

                {/* Click */}
                <button
                    onClick={() => setPaymentMethod('click')}
                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${paymentMethod === 'click'
                        ? 'border-[#114539] bg-[#114539]/5 shadow-inner'
                        : 'border-[#114539]/10 hover:border-[#114539]/30'
                        }`}
                >
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#114539]/10 flex items-center justify-center shadow-sm">
                        <Wallet className={`w-5 h-5 ${paymentMethod === 'click' ? 'text-[#114539]' : 'text-[#114539]/40'}`} />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="font-bold text-[#114539] text-sm">Click</div>
                        <div className="text-[10px] text-[#114539]/40 font-bold uppercase tracking-widest">Uzcard, Humo</div>
                    </div>
                    {paymentMethod === 'click' && <div className="w-2 h-2 rounded-full bg-[#114539]" />}
                </button>

                {/* Manual Bank Transfer */}
                <button
                    onClick={() => setPaymentMethod('manual')}
                    className={`flex items-center gap-4 p-5 rounded-2xl border transition-all ${paymentMethod === 'manual'
                        ? 'border-[#114539] bg-[#114539]/5 shadow-inner'
                        : 'border-[#114539]/10 hover:border-[#114539]/30'
                        }`}
                >
                    <div className="w-10 h-10 rounded-xl bg-white border border-[#114539]/10 flex items-center justify-center shadow-sm">
                        <Landmark className={`w-5 h-5 ${paymentMethod === 'manual' ? 'text-[#114539]' : 'text-[#114539]/40'}`} />
                    </div>
                    <div className="flex-1 text-left">
                        <div className="font-bold text-[#114539] text-sm">{lang === 'uz' ? "Karta raqamiga" : "На карту"}</div>
                        <div className="text-[10px] text-[#114539]/40 font-bold uppercase tracking-widest">{lang === 'uz' ? "Chek bilan" : "С чеком"}</div>
                    </div>
                    {paymentMethod === 'manual' && <div className="w-2 h-2 rounded-full bg-[#114539]" />}
                </button>
            </div>

            {/* Manual Payment Instructions */}
            <AnimatePresence>
                {paymentMethod === 'manual' && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="space-y-6 pt-4">
                            <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2rem] space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-[#114539]"></div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-[#114539]">Bank rekvizitlari</p>
                                </div>
                                {cards.map((card, idx) => (
                                    <div key={idx} className={`space-y-1 ${idx > 0 ? 'pt-3 border-t border-emerald-200' : ''}`}>
                                        <p className="text-sm text-[#114539] font-bold font-mono tracking-wider">{card.number}</p>
                                        <p className="text-[10px] text-[#114539] uppercase tracking-widest opacity-60">{card.owner}</p>
                                    </div>
                                ))}
                                {cards.length === 0 && (
                                    <p className="text-sm text-[#114539]/40 italic">Tizimda karta kiritilmagan</p>
                                )}
                            </div>

                            <TMAFileUpload
                                onUploadComplete={(url) => setScreenshotUrl(url)}
                                label={lang === 'uz' ? "To'lov chekini yuklang" : "Загрузите чек оплаты"}
                            />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <Button
                onClick={handlePayment}
                disabled={loading || (paymentMethod === 'manual' && !screenshotUrl)}
                className={`w-full py-6 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all shadow-lg ${loading || (paymentMethod === 'manual' && !screenshotUrl)
                    ? 'bg-[#114539]/20 text-[#114539]/40 cursor-not-allowed'
                    : 'bg-[#114539] text-white hover:bg-[#114539]/90'
                    }`}
            >
                {loading ? "..." : (lang === 'uz' ? "TO'LOVNI TASDIQLASH" : "ПОДТВЕРДИТЬ ОПЛАТУ")}
            </Button>
        </div>
    )
}


