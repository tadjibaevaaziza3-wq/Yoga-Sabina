import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Container } from "@/components/ui/Container"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import Image from "next/image"
import { MapPin, Clock, Calendar, ChevronRight, Video, MessageCircle } from "lucide-react"
import { coursesData } from "@/lib/data/courses"
import { Button } from "@/components/ui/Button"
import { CourseCard } from "@/components/CourseCard"

export default async function OfflineCoursesPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dictionary = await getDictionary(lang)

    let courses: any[] = []
    try {
        const dbCourses = await prisma.course.findMany({
            where: {
                isActive: true,
                type: 'OFFLINE'
            },
            orderBy: {
                createdAt: 'desc'
            }
        })

        if (dbCourses.length > 0) {
            courses = dbCourses.map((c: any) => ({
                ...c,
                title: lang === 'ru' ? (c.titleRu || c.title) : c.title,
                description: lang === 'ru' ? (c.descriptionRu || c.description) : c.description,
                location: lang === 'ru' ? (c.locationRu || c.location) : c.location,
                schedule: lang === 'ru' ? (c.scheduleRu || c.schedule) : c.schedule,
                times: lang === 'ru' ? (c.timesRu || c.times) : c.times,
            }))
        }
    } catch (e) {
        console.error("Database connection failed", e)
    }

    const bannerSetting = await prisma.systemSetting.findUnique({
        where: { key: 'BANNER_OFFLINE_COURSES' }
    })
    const bannerUrl = bannerSetting?.value || "/images/sabina-intro.png"

    if (courses.length === 0) {
        courses = coursesData[lang].filter(c => c.type === 'OFFLINE')
    }

    return (
        <main className="min-h-screen bg-[#F8FAFA]">

            {/* Hero Section */}
            <section className="pt-32 pb-20 bg-[#064E3B] text-white relative overflow-hidden">
                <Container className="relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="space-y-8">
                            <h1 className="text-4xl md:text-6xl font-serif font-black leading-tight italic">
                                {lang === 'uz' ? "Jonli uchrashuvlar va chuqur ish" : "Живые встречи и глубокая работа"}
                            </h1>
                            <p className="text-xl text-[var(--secondary)]/70 max-w-xl leading-relaxed">
                                {lang === 'uz'
                                    ? "Bizning oflayn mashg'ulotlarimizga qo'shiling yoki tana va ruh uyg'unligi uchun individual psixologik maslahatga yoziling."
                                    : "Присоединяйтесь к нашим офлайн классам или запишитесь на индивидуальную психологическую консультацию для гармонии тела и души."}
                            </p>
                            <div className="flex flex-wrap gap-4 pt-4">
                                <Link href="#locations">
                                    <Button className="bg-white text-[#064E3B] hover:bg-[var(--secondary)] rounded-full px-8 py-6 text-sm font-bold uppercase tracking-widest">
                                        {lang === 'uz' ? "Oflayn mashg'ulotlar" : "Офлайн занятия"}
                                    </Button>
                                </Link>
                                <Link href={`/${lang}/consultations`}>
                                    <Button className="bg-transparent border-2 border-white/20 hover:border-white/40 text-white rounded-full px-8 py-6 text-sm font-bold uppercase tracking-widest">
                                        {lang === 'uz' ? "Konsultatsiya" : "Консультация"}
                                    </Button>
                                </Link>
                            </div>
                        </div>

                        <div className="relative flex justify-center lg:justify-end hidden lg:block h-[500px]">
                            <Image
                                src={bannerUrl}
                                alt="Offline Yoga Class"
                                fill
                                className="object-cover rounded-[2.5rem] shadow-2xl"
                                priority
                            />
                        </div>
                    </div>
                </Container>

                {/* Decoration */}
                <div className="absolute top-1/2 right-0 w-96 h-96 bg-emerald-400/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            </section>

            {/* Location Section */}
            <section id="locations" className="py-24">
                <Container>
                    <div className="text-center mb-16 space-y-4">
                        <span className="text-[var(--accent)] font-bold uppercase tracking-[0.3em] text-[10px]">
                            {lang === 'uz' ? "LOKATSIYALAR" : "ЛОКАЦИИ"}
                        </span>
                        <h2 className="text-3xl md:text-4xl font-serif font-black text-[var(--primary)]">
                            {lang === 'uz' ? "Oflayn yoga mashg'ulotlari" : "Офлайн занятия йогой"}
                        </h2>
                        <p className="text-[var(--primary)]/50 max-w-2xl mx-auto">
                            {lang === 'uz'
                                ? "O'zingizga qulay studiya va vaqtni tanlang. O'z tanangiz haqida hamfikrlar davrasida qayg'uring."
                                : "Выберите удобную студию и время для практики. Заботьтесь о своем теле в кругу единомышленников."}
                        </p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course) => (
                            <CourseCard
                                key={course.id}
                                id={course.id}
                                title={course.title}
                                description={course.description}
                                price={course.price.toString()}
                                duration={course.duration || course.durationLabel || ""}
                                type="OFFLINE"
                                imageUrl={course.image || course.coverImage}
                                features={course.features}
                                lang={lang}
                                dictionary={dictionary}
                                targetAudience={course.targetAudience}
                            />
                        ))}
                    </div>
                </Container>
            </section>
        </main>
    )
}
