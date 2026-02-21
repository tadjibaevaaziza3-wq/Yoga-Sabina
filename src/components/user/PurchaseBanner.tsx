'use client';

import { motion } from 'framer-motion';

interface PurchaseBannerProps {
    price: number;
    lessonsCount: number;
    hasAccess: boolean;
    lang: 'uz' | 'ru';
    onPurchase: () => void;
}

export function PurchaseBanner({
    price,
    lessonsCount,
    hasAccess,
    lang,
    onPurchase
}: PurchaseBannerProps) {
    if (hasAccess) return null;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="mt-16 bg-gradient-to-br from-[#ff7d52] to-[#ff6a38] rounded-[3rem] p-12 md:p-16 text-white flex flex-col md:flex-row items-center justify-between gap-12 shadow-2xl shadow-orange-500/30 border border-white/20"
        >
            <div className="text-center md:text-left">
                <h3 className="text-3xl md:text-4xl font-serif font-black mb-4">
                    {lang === 'ru' ? 'Получите полный доступ' : 'To\'liq kirishga ega bo\'ling'}
                </h3>
                <p className="text-white/80 text-lg font-medium opacity-90 italic">
                    {lang === 'ru'
                        ? `${lessonsCount} уроков • Пожизненный доступ • Поддержка в чате`
                        : `${lessonsCount} dars • Umrbod kirish • Chatda yordam`}
                </p>
            </div>
            <div className="text-center md:text-right space-y-6">
                <div className="text-5xl font-serif font-black mb-2 flex items-center justify-center md:justify-end gap-2">
                    {price.toLocaleString()}
                    <span className="text-lg opacity-60 font-medium">{lang === 'ru' ? ' сум' : ' so\'m'}</span>
                </div>
                <button
                    onClick={onPurchase}
                    className="w-full md:w-auto px-12 py-6 bg-white text-[#ff7d52] rounded-full hover:bg-[var(--secondary)] transition-all font-black uppercase tracking-widest text-xs shadow-xl hover:-translate-y-1 active:scale-95"
                >
                    {lang === 'ru' ? 'КУПИТЬ КУРС' : 'KURSNI SOTIB OLISH'}
                </button>
            </div>
        </motion.div>
    );
}


