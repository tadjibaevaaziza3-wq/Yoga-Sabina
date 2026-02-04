import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Container } from "@/components/ui/Container"
import { Header } from "@/components/Header"
import { VideoPlayer } from "@/components/VideoPlayer"
import { EngagementSection } from "@/components/EngagementSection"
import { coursesData } from "@/lib/data/courses"
import { ChevronLeft, PlayCircle } from "lucide-react"
import Link from "next/link"

export default async function LessonPage({
    params,
}: {
    params: Promise<{ lang: Locale; id: string; lessonId: string }>
}) {
    const { lang, id, lessonId } = await params
    const dictionary = await getDictionary(lang)
    const course = coursesData[lang].find((c) => c.id === id)

    // Mock user for now (in real app, get from session)
    const mockUser = {
        id: "user_123",
        name: "Sabina P.",
        isAdmin: false
    }

    if (!course) return <div>Course not found</div>

    return (
        <main className="min-h-screen bg-secondary/20 pb-20">
            <Header lang={lang} dictionary={dictionary} />

            <Container className="py-12">
                <div className="flex items-center gap-4 mb-8">
                    <Link href={`/${lang}/account`} className="p-3 bg-white rounded-2xl border border-primary/5 hover:bg-primary/5 transition-all">
                        <ChevronLeft className="w-5 h-5 text-primary" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-serif text-primary">{course.title}</h1>
                        <p className="text-[10px] text-primary/40 font-black uppercase tracking-widest">{lessonId.replace(/-/g, ' ')}</p>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-12">
                    {/* Video Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <VideoPlayer
                            src="https://vt.tumblr.com/tumblr_o6n7yc8ca91uz4vqd_480.mp4"
                            userId={mockUser.id}
                            userName={mockUser.name}
                        />

                        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] premium-shadow">
                            <h2 className="text-2xl font-serif text-primary mb-6">Dars haqida</h2>
                            <p className="text-primary/70 leading-relaxed font-medium mb-12">
                                Ushbu darsda biz yoga terapevtik asoslari va nafas olish texnikalarini o'rganamiz.
                                Har bir harakatni ehtiyotkorlik bilan bajaring.
                            </p>

                            <hr className="border-primary/5 mb-12" />

                            <EngagementSection
                                lessonId={lessonId}
                                userId={mockUser.id}
                                userName={mockUser.name}
                                isAdmin={mockUser.isAdmin}
                            />
                        </div>
                    </div>

                    {/* Sidebar: Lesson List */}
                    <div className="lg:col-span-1">
                        <div className="glass-card bg-white rounded-[2.5rem] p-8 premium-shadow sticky top-32">
                            <h3 className="text-lg font-black text-primary uppercase tracking-tight mb-6">Kurs mundarijasi</h3>
                            <div className="space-y-4">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div
                                        key={i}
                                        className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${i === 1 ? "bg-primary text-white premium-shadow" : "bg-white text-primary/50 border-primary/5 hover:border-primary/10"
                                            }`}
                                    >
                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black ${i === 1 ? "bg-white/20" : "bg-secondary/30"
                                            }`}>
                                            {i}
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-bold truncate">Lesson {i}: Introduction</div>
                                            <div className="text-[10px] font-black uppercase tracking-widest opacity-50 flex items-center gap-2">
                                                <PlayCircle className="w-3 h-3" /> 12:45
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </Container>
        </main>
    )
}
