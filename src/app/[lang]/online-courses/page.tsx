import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Container } from "@/components/ui/Container"
import CourseCatalog from "@/components/user/CourseCatalog"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { prisma } from "@/lib/prisma"

export default async function OnlineCoursesPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dictionary = await getDictionary(lang)

    let bannerUrl = "/images/hero-sabina.png"
    try {
        const setting = await prisma.systemSetting.findUnique({
            where: { key: 'BANNER_ONLINE_COURSES' }
        })
        if (setting?.value) bannerUrl = setting.value
    } catch (e) {
        // SystemSetting table may not exist yet
    }

    return (
        <main className="min-h-screen bg-[var(--background)]">

            {/* Cinematic Luxury Hero Section */}
            <section className="relative pt-48 pb-32 overflow-hidden">
                <div className="absolute inset-0 z-0">
                    <Image
                        src={bannerUrl}
                        alt="Sabina Polatova"
                        fill
                        className="object-cover object-center opacity-20 grayscale brightness-110"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-[var(--background)] via-transparent to-[var(--background)]" />
                </div>

                <Container className="relative z-10 text-center">
                    <div className="max-w-4xl mx-auto space-y-12">
                        <div className="space-y-4">
                            <span className="text-[var(--accent)] font-bold uppercase tracking-[0.5em] text-[11px] block">
                                Sabina Polatova — Yoga & Wellness
                            </span>
                            <h1 className="text-6xl md:text-8xl font-editorial font-bold text-[var(--primary)] leading-[1.1] tracking-tight">
                                {dictionary.courses.title}
                            </h1>
                        </div>

                        <p className="text-xl md:text-2xl text-[var(--primary)]/60 max-w-2xl mx-auto leading-relaxed font-medium">
                            {dictionary.courses.onlineDesc}
                        </p>

                        <div className="flex flex-wrap justify-center gap-6 pt-6">
                            <a href="#courses">
                                <Button className="btn-luxury px-12 py-7 text-xs uppercase tracking-[0.3em] shadow-soft">
                                    {lang === 'uz' ? "Kurslarni ko'rish" : "Выбрать курс"}
                                </Button>
                            </a>
                            <a href="#benefits">
                                <Button className="bg-white/50 backdrop-blur-sm border border-[var(--primary)]/10 text-[var(--primary)] hover:bg-white transition-all rounded-2xl px-12 py-7 text-xs font-bold uppercase tracking-[0.3em]">
                                    {lang === 'uz' ? "Batafsil" : "Подробнее"}
                                </Button>
                            </a>
                        </div>
                    </div>
                </Container>

                {/* Decorative Elements */}
                <div className="absolute top-1/4 -left-20 w-96 h-96 bg-[var(--accent)]/5 rounded-full blur-[100px]" />
                <div className="absolute bottom-0 -right-20 w-[30rem] h-[30rem] bg-[var(--primary)]/3 rounded-full blur-[120px]" />
            </section>


            {/* Benefits Section - Modern Boutique Layout */}
            <section id="benefits" className="py-32 bg-[var(--background)]">
                <Container>
                    <div className="text-center mb-24 space-y-6">
                        <span className="text-[var(--accent)] font-bold uppercase tracking-[0.4em] text-[11px]">
                            {lang === 'uz' ? "AFZALLIKLAR" : "ПРЕИМУЩЕСТВА"}
                        </span>
                        <h2 className="text-4xl md:text-6xl font-editorial font-bold text-[var(--primary)] tracking-tight">
                            {lang === 'uz' ? "Nima uchun Baxtli Men?" : "Почему Baxtli Men?"}
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-12">
                        {[
                            {
                                title: lang === 'uz' ? "Qulay vaqt" : "Удобное время",
                                desc: lang === 'uz' ? "O'zingizga qulay vaqtda dars qiling. 24/7 kurslarga kirish imkoni." : "Занимайтесь в удобное для вас время. Доступ к курсам 24/7.",
                                icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            },
                            {
                                title: lang === 'uz' ? "HD sifat" : "HD качество",
                                desc: lang === 'uz' ? "Yuqori sifatli video darslar. Har bir harakatni aniq ko'ring." : "Видеоуроки высокого качества. Четко видите каждое движение.",
                                icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                            },
                            {
                                title: lang === 'uz' ? "Qo'llab-quvvatlash" : "Поддержка",
                                desc: lang === 'uz' ? "Murabbiy bilan doimiy aloqa. Savollaringizga javob oling." : "Связь с инструктором. Получайте ответы на вопросы.",
                                icon: "M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                            }
                        ].map((benefit, i) => (
                            <div key={i} className="group p-12 rounded-[2.5rem] bg-white border border-[var(--primary)]/5 shadow-soft hover:shadow-xl transition-all duration-700 hover:-translate-y-2">
                                <div className="w-20 h-20 bg-[var(--background)] rounded-2xl flex items-center justify-center mb-8 transition-transform duration-700 group-hover:scale-110 group-hover:bg-[var(--accent)]/10 text-[var(--primary)]">
                                    <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={benefit.icon} />
                                    </svg>
                                </div>
                                <h3 className="font-editorial font-bold text-[var(--primary)] text-3xl mb-4">
                                    {benefit.title}
                                </h3>
                                <p className="text-base text-[var(--primary)]/50 font-medium leading-relaxed">
                                    {benefit.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </Container>
            </section>

            {/* Courses Section */}
            <section id="courses" className="py-24 bg-white">
                <Container>
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[var(--accent)] font-black uppercase tracking-[0.3em] text-[10px]">
                            {lang === 'uz' ? "КУРСЛАР" : "КУРСЫ"}
                        </span>
                        <h2 className="text-3xl md:text-5xl font-editorial font-bold text-[var(--primary)] tracking-tight">
                            {lang === 'uz' ? "Мавжуд онлайн курслар" : "Доступные онлайн курсы"}
                        </h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-lg">
                            {lang === 'uz'
                                ? "Ўзингиз учун мос курсни танланг ва бугундан бошлаб ўзгаришни ҳис қилинг"
                                : "Выберите подходящий курс и почувствуйте изменения уже сегодня"}
                        </p>
                    </div>

                    <CourseCatalog lang={lang} initialType="ONLINE" />
                </Container>
            </section>

            {/* CTA Section - Luxury Modern Boutique */}
            <section className="py-40 bg-[var(--primary)] text-white relative overflow-hidden">
                <Container className="relative z-10">
                    <div className="max-w-4xl mx-auto text-center space-y-12">
                        <h2 className="text-5xl md:text-7xl font-editorial font-bold leading-tight">
                            {lang === 'uz'
                                ? "O'z sayohatingizni bugun boshlang"
                                : "Начните свой путь сегодня"}
                        </h2>
                        <p className="text-xl md:text-2xl text-white/60 leading-relaxed font-medium">
                            {lang === 'uz'
                                ? "Birinchi darsni bepul sinab ko'ring va yoganing kuchini his qiling"
                                : "Попробуйте первый урок бесплатно и почувствуйте силу йоги"}
                        </p>
                        <a href="#courses" className="inline-block mt-8">
                            <Button className="btn-luxury px-16 py-8 text-sm font-bold uppercase tracking-[0.4em]">
                                {lang === 'uz' ? "Boshlash" : "Начать"}
                            </Button>
                        </a>
                    </div>
                </Container>

                {/* Refined Luxury Decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-white/5 rounded-full blur-[140px]" />
                <div className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] bg-[var(--accent)]/5 rounded-full blur-[120px]" />
            </section>
        </main>
    )
}
