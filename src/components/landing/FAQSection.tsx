"use client"

import { Container } from "../ui/Container"
import { motion } from "framer-motion"
import { Plus } from "lucide-react"
import { useState } from "react"
import { StructuredData } from "../seo/StructuredData"

type FAQItem = {
    question: string;
    answer: string;
}

const faqsUz: FAQItem[] = [
    {
        question: "Kurs yangi boshlovchilar uchun mos keladimi?",
        answer: "Ha, albatta. Bizning dasturlarimiz aynan yangi boshlovchilar uchun mo'ljallangan bo'lib, oson va tushunarli mashqlardan boshlanadi."
    },
    {
        question: "Menga qanday jihozlar kerak bo'ladi?",
        answer: "Sizga faqat yoga gilamchasi va qulay kiyim kerak bo'ladi. Boshqa maxsus jihozlar talab qilinmaydi."
    },
    {
        question: "Kursga kirish qancha vaqt davom etadi?",
        answer: "Kursga kirish muddati tanlangan tarifga bog'liq. Odatda 1 oydan 6 oygacha bo'lgan muddatni o'z ichiga oladi."
    },
    {
        question: "To'lovni qanday amalga oshirish mumkin?",
        answer: "To'lovni PayMe, Click yoki Visa/Mastercard orqali onlayn tarzda amalga oshirishingiz mumkin."
    },
    {
        question: "Agar jonli efirni o'tkazib yuborsam nima bo'ladi?",
        answer: "Barcha jonli efirlar yozib olinadi va shaxsiy kabinetingizda saqlanadi. Ularni istalgan vaqtda ko'rishingiz mumkin."
    }
]

const faqsRu: FAQItem[] = [
    {
        question: "Подходит ли курс для начинающих?",
        answer: "Да, конечно. Наши программы разработаны специально для начинающих и начинаются с простых и понятных упражнений."
    },
    {
        question: "Какое оборудование мне понадобится?",
        answer: "Вам понадобится только коврик для йоги и удобная одежда. Никакого специального оборудования не требуется."
    },
    {
        question: "Сколько длится доступ к курсу?",
        answer: "Срок доступа зависит от выбранного тарифа. Обычно это от 1 до 6 месяцев."
    },
    {
        question: "Как можно оплатить курс?",
        answer: "Оплатить можно онлайн через PayMe, Click или карты Visa/Mastercard."
    },
    {
        question: "Что если я пропущу прямой эфир?",
        answer: "Все прямые эфиры записываются и сохраняются в вашем личном кабинете. Вы можете посмотреть их в любое удобное время."
    }
]

export function FAQSection({ lang = 'uz' }: { lang?: string }) {
    const items = lang === 'ru' ? faqsRu : faqsUz;

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": items.map(item => ({
            "@type": "Question",
            "name": item.question,
            "acceptedAnswer": {
                "@type": "Answer",
                "text": item.answer
            }
        }))
    };

    return (
        <section className="py-24 bg-[var(--card-bg)] relative overflow-hidden">
            <StructuredData data={faqSchema} id="faq-schema" />
            <Container>
                <div className="max-w-3xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-4xl md:text-5xl font-editorial font-bold text-[var(--primary)] mb-6">
                            {lang === 'ru' ? 'Часто задаваемые вопросы' : 'Ko\'p beriladigan savollar'}
                        </h2>
                        <p className="text-lg text-[var(--primary)]/60">
                            {lang === 'ru'
                                ? 'Ответы на самые популярные вопросы о наших курсах'
                                : 'Kurslarimiz haqida eng ko\'p so\'raladigan savollarga javoblar'}
                        </p>
                    </motion.div>

                    <div className="space-y-4">
                        {items.map((item, i) => (
                            <AccordionItem key={i} question={item.question} answer={item.answer} index={i} />
                        ))}
                    </div>
                </div>
            </Container>
        </section>
    )
}

function AccordionItem({ question, answer, index }: { question: string, answer: string, index: number }) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="border-b border-[var(--primary)]/10 last:border-0"
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between py-6 text-left hover:text-[var(--accent)] transition-colors group"
                aria-expanded={isOpen}
            >
                <span className="text-xl font-serif font-medium text-[var(--primary)] group-hover:text-[var(--accent)] pr-8">
                    {question}
                </span>
                <span className={`transform transition-transform duration-300 ${isOpen ? 'rotate-45' : ''}`}>
                    <Plus className="w-6 h-6 text-[var(--accent)]" />
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 mb-6' : 'max-h-0 opacity-0'
                    }`}
            >
                <p className="text-[var(--primary)]/70 leading-relaxed text-lg">
                    {answer}
                </p>
            </div>
        </motion.div>
    )
}
