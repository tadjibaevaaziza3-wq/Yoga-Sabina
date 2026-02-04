"use client"

import { useEffect, useState } from "react"
import { Container } from "@/components/ui/Container"
import { coursesData } from "@/lib/data/courses"
import { Sparkles, Activity, BookOpen, UserCircle, MapPin, Phone, Heart, Play, ChevronRight, CheckCircle2, ArrowRight } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { cn } from "@/lib/utils"

export default function TMAPage() {
    const [user, setUser] = useState<any>(null)
    const [isRegistered, setIsRegistered] = useState<boolean | null>(null)
    const [loading, setLoading] = useState(true)
    const [orderLoading, setOrderLoading] = useState<string | null>(null)
    const [selectedCourse, setSelectedCourse] = useState<any>(null)
    const [paymentSuccess, setPaymentSuccess] = useState(false)
    const lang = "uz" // Default locale for TMA

    // Form states
    const [phone, setPhone] = useState("")
    const [location, setLocation] = useState("")
    const [healthGoals, setHealthGoals] = useState("")

    useEffect(() => {
        if (typeof window !== "undefined" && (window as any).Telegram?.WebApp) {
            const tg = (window as any).Telegram.WebApp
            tg.expand()
            tg.backgroundColor = "#F5F8F8"
            tg.headerColor = "#F5F8F8"
            const tgUser = tg.initDataUnsafe?.user
            setUser(tgUser)

            if (tgUser?.id) {
                checkRegistration(tgUser.id)
            } else {
                setLoading(false)
            }
        } else {
            setLoading(false)
        }
    }, [])

    const checkRegistration = async (id: number) => {
        try {
            const res = await fetch(`/api/tma/register?telegramId=${id}`)
            const data = await res.json()
            setIsRegistered(data.isRegistered)
        } catch (err) {
            console.error("Check Reg error:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!user?.id) return
        setLoading(true)
        try {
            const res = await fetch('/api/tma/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    phone,
                    location,
                    healthGoals
                })
            })
            if (res.ok) setIsRegistered(true)
        } catch (err) {
            console.error("Register error:", err)
        } finally {
            setLoading(false)
        }
    }

    const handleOrder = async (course: any) => {
        if (!user?.id) return
        setOrderLoading(course.id)

        try {
            const res = await fetch('/api/telegram/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId: user.id,
                    firstName: user.first_name,
                    lastName: user.last_name,
                    courseId: course.id,
                    amount: course.price.replace(/,/g, "")
                })
            })
            const result = await res.json()
            if (result.success && result.paymentUrl) {
                if ((window as any).Telegram?.WebApp) {
                    (window as any).Telegram.WebApp.openLink(result.paymentUrl)
                    // Mocking success for demo if needed, usually webhook handles this
                    // setTimeout(() => setPaymentSuccess(true), 3000) 
                } else {
                    window.open(result.paymentUrl, "_blank")
                }
            }
        } catch (err) {
            console.error("Order error:", err)
        } finally {
            setOrderLoading(null)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#F5F8F8]">
                <div className="w-8 h-8 border-4 border-[#FF6B4E] border-t-transparent rounded-full animate-spin"></div>
            </div>
        )
    }

    if (paymentSuccess) {
        return (
            <main className="min-h-screen bg-[#F5F8F8] flex items-center p-6">
                <div className="w-full text-center space-y-8 animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 bg-[#144243] rounded-full flex items-center justify-center mx-auto shadow-2xl shadow-primary/20">
                        <CheckCircle2 className="w-12 h-12 text-white" />
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-3xl font-serif text-[#144243]">To'lov muvaffaqiyatli!</h1>
                        <p className="text-[#144243]/60 font-medium">
                            Xush kelibsiz, {user?.first_name}! Siz endi bizning hamjamiyatimiz a'zosisiz.
                        </p>
                    </div>
                    <div className="p-8 bg-white rounded-[2.5rem] border border-[#144243]/5">
                        <p className="text-xs font-black uppercase tracking-widest text-[#144243]/30 mb-4">Shaxsiy kabinetga kiring</p>
                        <Link
                            href={`/${lang}/account`}
                            className="btn-primary w-full py-5 inline-flex items-center justify-center gap-2 group"
                        >
                            Darslarni boshlash
                            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                </div>
            </main>
        )
    }

    if (isRegistered === false) {
        return (
            <main className="min-h-screen pt-12 pb-24 bg-[#F5F8F8]">
                <Container>
                    <div className="mb-10 text-center">
                        <div className="w-20 h-20 bg-[#144243] rounded-[2.5rem] flex items-center justify-center text-white mx-auto mb-6 shadow-2xl shadow-primary/20">
                            <UserCircle className="w-12 h-12" />
                        </div>
                        <h1 className="text-3xl font-serif text-[#144243] mb-2">Xush kelibsiz!</h1>
                        <p className="text-[#144243]/60 text-sm font-bold uppercase tracking-widest">Akademiya Baxtli Men</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-6">
                        <div className="space-y-4">
                            <input
                                required
                                type="tel"
                                placeholder="Telefon raqamingiz"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full bg-white border border-[#144243]/5 rounded-2xl py-6 px-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B4E] transition-all"
                            />
                            <input
                                required
                                type="text"
                                placeholder="Sizning shahringiz"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-white border border-[#144243]/5 rounded-2xl py-6 px-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF6B4E] transition-all"
                            />
                            <textarea
                                required
                                placeholder="Sog'liq bo'yicha maqsadlaringiz..."
                                value={healthGoals}
                                onChange={(e) => setHealthGoals(e.target.value)}
                                className="w-full bg-white border border-[#144243]/5 rounded-[2rem] py-6 px-8 text-sm min-h-[150px] focus:outline-none focus:ring-2 focus:ring-[#FF6B4E] transition-all"
                            />
                        </div>

                        <button
                            type="submit"
                            className="btn-coral w-full py-6 text-sm"
                        >
                            RO'YXATDAN O'TISH
                        </button>
                    </form>
                </Container>
            </main>
        )
    }

    const tmaCourses = coursesData[lang]

    return (
        <main className="bg-[#F5F8F8] min-h-screen pb-32">
            {/* Trainer Hero */}
            <section className="relative h-[45vh] bg-[#144243] rounded-b-[3.5rem] overflow-hidden">
                <Image
                    src="/images/hero.png"
                    alt="Sabina Polatova"
                    fill
                    className="object-cover opacity-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#144243] via-transparent to-transparent" />

                <div className="absolute bottom-8 left-8 right-8 flex items-end justify-between">
                    <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/50">Asoschi & Murabbiy</span>
                        <h1 className="text-3xl font-serif text-white">Sabina Polatova</h1>
                    </div>
                    <button className="w-14 h-14 bg-[#FF6B4E] rounded-full flex items-center justify-center text-white shadow-2xl active:scale-90 transition-all">
                        <Play className="w-6 h-6 fill-current ml-1" />
                    </button>
                </div>
            </section>

            <Container className="mt-8 space-y-10">
                {/* Bio Section */}
                <section className="bg-white p-8 rounded-[2.5rem] border border-[#144243]/5 shadow-sm">
                    <h2 className="text-sm font-black text-[#144243] uppercase tracking-widest mb-4">Men haqimda</h2>
                    <p className="text-sm text-[#144243]/60 leading-relaxed font-medium">
                        20 yillik tajribaga ega yoga va psixologiya bo'yicha mutaxassis.
                        Minglab ayollarga o'zligini kashf etishga yordam berganman.
                    </p>
                </section>

                {/* Courses Feed */}
                <section className="space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-serif text-[#144243]">Dasturlarimiz</h2>
                        <Sparkles className="w-4 h-4 text-[#FF6B4E]" />
                    </div>

                    <div className="space-y-6">
                        {tmaCourses.map((course) => (
                            <div
                                key={course.id}
                                onClick={() => setSelectedCourse(course)}
                                className="bg-white p-6 rounded-[2.5rem] border border-[#144243]/5 flex items-center gap-6 group active:bg-[#F5F8F8]"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-[#F5F8F8] flex items-center justify-center overflow-hidden shrink-0">
                                    <Image src="/images/hero.png" alt={course.title} width={80} height={80} className="object-cover" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-sm font-bold text-[#144243] mb-1 line-clamp-1">{course.title}</h3>
                                    <div className="text-[10px] font-black text-[#FF6B4E] uppercase tracking-widest">{course.price} UZS</div>
                                </div>
                                <ChevronRight className="w-5 h-5 text-[#144243]/20" />
                            </div>
                        ))}
                    </div>
                </section>
            </Container>

            {/* Course Details Modal (Simple Overlay) */}
            {selectedCourse && (
                <div className="fixed inset-0 z-50 bg-[#144243]/90 backdrop-blur-md p-6 flex items-end animate-in slide-in-from-bottom duration-300">
                    <div className="w-full bg-white rounded-[3rem] p-10 space-y-8 max-h-[85vh] overflow-y-auto">
                        <div className="flex justify-between items-start">
                            <h3 className="text-2xl font-serif text-[#144243]">{selectedCourse.title}</h3>
                            <button onClick={() => setSelectedCourse(null)} className="text-[#144243]/20 font-black text-xs uppercase tracking-widest">Yopish</button>
                        </div>

                        <div className="space-y-4">
                            <p className="text-sm text-[#144243]/60 leading-relaxed font-medium">
                                {selectedCourse.description}
                            </p>
                            <div className="space-y-3 pt-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3">
                                        <CheckCircle2 className="w-4 h-4 text-[#FF6B4E]" />
                                        <span className="text-xs font-bold text-[#144243]/60 uppercase tracking-tight">Kengaytirilgan dars dasturi</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-8 border-t border-[#144243]/5">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <div className="text-[10px] font-black text-[#144243]/30 uppercase tracking-widest mb-1">Kurs narxi</div>
                                    <div className="text-2xl font-black text-[#144243]">{selectedCourse.price} UZS</div>
                                </div>
                                <div className="text-[10px] font-bold text-[#FF6B4E] uppercase tracking-widest bg-[#FF6B4E]/10 px-4 py-2 rounded-full">30 kunlik kirish</div>
                            </div>

                            <button
                                onClick={() => handleOrder(selectedCourse)}
                                disabled={!!orderLoading}
                                className="btn-coral w-full py-6 text-sm"
                            >
                                {orderLoading === selectedCourse.id ? "YUKLANMOQDA..." : "SOTIB OLISH"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </main>
    )
}
