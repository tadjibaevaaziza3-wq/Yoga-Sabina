import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Container } from "@/components/ui/Container"
import { Header } from "@/components/Header"
import { coursesData } from "@/lib/data/courses"
import Image from "next/image"
import { CheckCircle2, Clock, Globe, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/Button"

export default async function CourseDetailPage({
    params,
}: {
    params: Promise<{ lang: Locale; id: string }>
}) {
    const { lang, id } = await params
    const dictionary = await getDictionary(lang)
    const course = coursesData[lang].find((c) => c.id === id)

    if (!course) {
        return <div>Course not found</div>
    }

    return (
        <main className="min-h-screen bg-secondary/20">
            <Header lang={lang} dictionary={dictionary} />

            <section className="py-20">
                <Container>
                    <div className="grid lg:grid-cols-3 gap-12">
                        {/* Left Content */}
                        <div className="lg:col-span-2 space-y-12">
                            <div>
                                <span className="inline-block px-4 py-1.5 rounded-full bg-accent text-primary text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/5">
                                    {course.type === 'ONLINE' ? dictionary.courses.online : dictionary.courses.offline}
                                </span>
                                <h1 className="text-4xl md:text-6xl font-serif text-primary mb-8 leading-tight">
                                    {course.title}
                                </h1>
                                <p className="text-xl text-primary/70 leading-relaxed font-medium">
                                    {course.description}
                                </p>
                            </div>

                            <div className="aspect-video relative rounded-[2.5rem] overflow-hidden premium-shadow">
                                <Image
                                    src="/images/hero.png"
                                    alt={course.title}
                                    fill
                                    className="object-cover"
                                />
                                <div className="absolute inset-0 bg-primary/20" />
                            </div>

                            {/* What you'll learn */}
                            <div className="bg-white p-12 rounded-[2.5rem] premium-shadow">
                                <h2 className="text-2xl font-serif text-primary mb-8">Nimalarni o'rganasiz?</h2>
                                <div className="grid sm:grid-cols-2 gap-6">
                                    {[1, 2, 3, 4].map((i) => (
                                        <div key={i} className="flex gap-4">
                                            <CheckCircle2 className="w-6 h-6 text-wellness-gold shrink-0" />
                                            <p className="text-primary/70 text-sm font-bold">Йога машқлари билан мушакларни мустаҳкамлаш ва эгилувчанликка эришиш.</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Right Sidebar - Pricing & Purchase */}
                        <div className="lg:col-span-1">
                            <div className="sticky top-32 glass-card bg-white rounded-[2.5rem] overflow-hidden">
                                <div className="p-8 md:p-10">
                                    <div className="text-sm font-black text-primary/40 uppercase tracking-widest mb-2">Kurs narxi</div>
                                    <div className="text-4xl font-black text-primary mb-8">
                                        {course.price} <span className="text-base font-bold opacity-50 uppercase">{dictionary.courses.uzs}</span>
                                    </div>

                                    <div className="space-y-6 mb-10">
                                        <div className="flex items-center gap-4 py-4 border-b border-primary/5">
                                            <Clock className="w-5 h-5 text-wellness-gold" />
                                            <div className="text-sm font-bold text-primary/70">
                                                {dictionary.courses.duration}: <span className="text-primary">{course.duration} {dictionary.courses.days}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 py-4 border-b border-primary/5">
                                            <Globe className="w-5 h-5 text-wellness-gold" />
                                            <div className="text-sm font-bold text-primary/70">
                                                Darslar tili: <span className="text-primary">O'zbek / Rus</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-4 py-4">
                                            <ShieldCheck className="w-5 h-5 text-wellness-gold" />
                                            <div className="text-sm font-bold text-primary/70">
                                                Xavfsiz to'lov: <span className="text-primary">PayMe</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Button className="w-full mb-4 py-6 text-lg">
                                        {dictionary.common.buy}
                                    </Button>
                                    <p className="text-[10px] text-center text-primary/40 font-bold uppercase tracking-widest leading-relaxed">
                                        Xarid qilish orqali siz ommaviy ofertani qabul qilgan hisoblanasiz
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </Container>
            </section>
        </main>
    )
}
