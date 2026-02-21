"use client"

import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"

interface PublicOfferModalProps {
    isOpen: boolean
    onClose: () => void
    lang: string
}

export function PublicOfferModal({ isOpen, onClose, lang }: PublicOfferModalProps) {
    const isUz = lang === 'uz'

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[var(--primary)]/40 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="bg-white w-full max-w-4xl rounded-[2.5rem] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        <div className="p-8 border-b border-[var(--secondary)] flex items-center justify-between sticky top-0 bg-white z-10">
                            <h2 className="text-xl md:text-2xl font-serif font-black text-[var(--primary)] leading-tight pr-8">
                                {isUz ? 'OMMAVIY OFERTA' : 'ПУБЛИЧНАЯ ОФЕРТА'}
                            </h2>
                            <button onClick={onClose} className="p-2 hover:bg-[var(--secondary)] rounded-full transition-colors shrink-0">
                                <X className="w-6 h-6 text-[var(--primary)]/30" />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-8 prose prose-emerald max-w-none text-[var(--primary)]/70">
                            <h3 className="text-center font-bold mb-8">
                                {isUz
                                    ? "BIR MARTALIK TOʻLOV ASOSIDA VIDEOKURSLARNI XARID QILISH BOʻYICHA OMMAVIY OFERTA"
                                    : "ПУБЛИЧНАЯ ОФЕРТА ПО ПОКУПКЕ ВИДЕОКУРСОВ НА ОСНОВЕ ЕДИНОРАЗОВОЙ ОПЛАТЫ"
                                }
                            </h3>

                            <div className="space-y-6 text-sm leading-relaxed">
                                <section>
                                    <h4 className="font-bold text-[var(--primary)] uppercase">1. UMUMIY QOIDALAR / ОБЩИЕ ПОЛОЖЕНИЯ</h4>
                                    <p>1.1. Ushbu oferta Xaridorlarni (jismoniy shaxslarni) roʻyxatdan oʻtkazish, identifikatsiya qilish va tasdiqlash tartibini, «Baxtli Men» platformasida elektron Shartnomalar tuzish tartibini belgilaydi...</p>
                                </section>

                                <section>
                                    <h4 className="font-bold text-[var(--primary)] uppercase">2. ASOSIY TUSHUNCHALAR / ОСНОВНЫЕ ПОНЯТИЯ</h4>
                                    <p><strong>Aksept</strong> - Xaridor tomonidan bir martalik toʻlovni amalga oshirganligi oferta shartnomasining shartlariga rozi bo‘lib, qabul (aksept) qilgani va taraflar o‘rtasida shartnoma tuzilganini bildiradi.</p>
                                </section>

                                <section>
                                    <h4 className="font-bold text-[var(--primary)] uppercase">3. SHARTNOMA PREDMETI / ПРЕДМЕТ ДОГОВОРА</h4>
                                    <p>3.1. Mazkur oferta shartlariga muvofiq Sotuvchi Xaridor tomonidan tanlangan onlayn oʻquv kurslari boʻyicha oʻqitish xizmatlarini koʻrsatish, Xaridor esa ushbu xizmatlarni qabul qilib, ularning qiymatini toʻlash majburiyatini oladi.</p>
                                </section>

                                <section>
                                    <h4 className="font-bold text-[var(--primary)] uppercase">4. RO'YXATDAN O'TISH TARTIBI / ПОРЯДОК РЕГИСТРАЦИИ</h4>
                                    <p>4.1. «Baxtli Men» platformasida harakatlarni amalga oshirish va xizmat(lar)ni bir martalik toʻlovga sotib olish uchun Xaridor dastlab roʻyxatdan oʻtishi kerak.</p>
                                </section>

                                <section>
                                    <h4 className="font-bold text-[var(--primary)] uppercase">5. TARAFLARNING HUQUQ VA MAJBURIYATLARI / ПРАВА И ОБЯЗАННОСТИ</h4>
                                    <p>5.1. Sotuvchi xizmatlar sifatini oshirish maqsadida Xaridor bilan bo‘lgan telefon suhbatlarni yozib olish huquqiga ega.</p>
                                </section>

                                <section>
                                    <h4 className="font-bold text-[var(--primary)] uppercase">6. TO'LOV TARTIBI / ПОРЯДОК ОПЛАТЫ</h4>
                                    <p>6.1. Kursning narxi «Baxtli Men» platformasida ko‘rsatiladi. Toʻlov amalga oshirilgandan keyin mablagʻ qaytarilmaydi.</p>
                                </section>

                                <section className="p-6 bg-[var(--secondary)] rounded-2xl border border-[var(--secondary)]">
                                    <p className="m-0 font-medium italic">
                                        {isUz
                                            ? "Ushbu shartnoma aksept qilingan paytdan boshlab yuridik kuchga ega hisoblanadi."
                                            : "Данный договор вступает в силу с момента акцепта."
                                        }
                                    </p>
                                </section>
                            </div>
                        </div>

                        <div className="p-8 border-t border-[var(--secondary)] bg-[var(--secondary)]/30 flex justify-end">
                            <button
                                onClick={onClose}
                                className="px-10 py-4 bg-[var(--primary)] text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-[var(--primary)]/20 hover:bg-[var(--primary)] transition-all active:scale-[0.98]"
                            >
                                {isUz ? "TUSHUNARLI" : "ПОНЯТНО"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}


