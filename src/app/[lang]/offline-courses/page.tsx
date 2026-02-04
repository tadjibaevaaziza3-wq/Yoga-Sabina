import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Header } from "@/components/Header"
import { Container } from "@/components/ui/Container"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { motion } from "framer-motion"

export default async function OfflineCoursesPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dictionary = await getDictionary(lang)

    const courses = await prisma.course.findMany({
        where: {
            isActive: true,
            type: 'OFFLINE'
        },
        orderBy: {
            createdAt: 'desc'
        }
    })

    return (
        <main className="min-h-screen bg-white">
            <Header lang={lang} dictionary={dictionary} />

            <section className="pt-32 pb-20 bg-emerald-900 text-white">
                <Container>
                    <h1 className="text-5xl md:text-6xl font-serif font-black mb-6">
                        Offline Kurslar
                    </h1>
                    <p className="text-emerald-100/60 max-w-2xl leading-relaxed">
                        Toshkentdagi studiyamizda "Baxtli Men" oilasiga qo'shiling.
                        Jonli muloqot va mentorlarimiz nazorati ostida jismoniy va ruxiy yuksalish.
                    </p>
                </Container>
            </section>

            <section className="py-20">
                <Container>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {courses.map((course, index) => (
                            <div key={course.id} className="group bg-white border border-emerald-100 rounded-[2.5rem] overflow-hidden hover:shadow-2xl hover:shadow-emerald-900/10 transition-all duration-500">
                                <div className="aspect-[4/3] relative overflow-hidden">
                                    <img
                                        src={course.coverImage || "/images/hero.png"}
                                        alt={course.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute top-6 left-6">
                                        <span className="bg-emerald-900 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest text-white">
                                            Offline
                                        </span>
                                    </div>
                                </div>

                                <div className="p-8">
                                    <h3 className="text-2xl font-serif font-black text-emerald-900 mb-4 leading-tight">
                                        {course.title}
                                    </h3>
                                    <p className="text-emerald-900/50 text-sm mb-8 line-clamp-2">
                                        {course.description}
                                    </p>

                                    <div className="flex items-center justify-between pt-8 border-t border-emerald-50">
                                        <div>
                                            <div className="text-[10px] font-black uppercase tracking-widest text-emerald-900/30 mb-1">Narxi</div>
                                            <div className="text-2xl font-black text-emerald-900">
                                                {new Intl.NumberFormat('uz-UZ').format(Number(course.price))} <span className="text-xs">UZS</span>
                                            </div>
                                        </div>
                                        <Link
                                            href={`/${lang}/courses/${course.id}`}
                                            className="w-14 h-14 rounded-2xl bg-emerald-900 flex items-center justify-center text-white hover:bg-emerald-800 transition-colors"
                                        >
                                            →
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {courses.length === 0 && (
                        <div className="text-center py-20 bg-emerald-50 rounded-[3rem]">
                            <p className="text-emerald-900/40 font-bold uppercase tracking-widest">Hozircha kurslar mavjud emas</p>
                        </div>
                    )}
                </Container>
            </section>
        </main>
    )
}
