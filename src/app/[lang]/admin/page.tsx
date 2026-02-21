"use client"

import { Container } from "@/components/ui/Container"
import AdminDashboard from "@/components/admin/AdminDashboard"
import { UserList, BroadcastTool } from "@/components/admin/Dashboard"
import { AnalyticsView } from "@/components/admin/AnalyticsView"
import { AdminChat } from "@/components/admin/AdminChat"
import { GroupChatManager } from "@/components/admin/GroupChatManager"
import { AdminCourseManagement as CourseManagement } from "@/components/admin/CourseManagement"
import { SubscriptionManagement } from "@/components/admin/SubscriptionManagement"
import { OrderManagement } from "@/components/admin/OrderManagement"
import { LeadsManagement } from "@/components/admin/LeadsManagement"
import { ConsultationCalendar } from "@/components/admin/ConsultationCalendar"
import { FeedbackManager } from "@/components/admin/FeedbackManager"
import VideoUpload from "@/components/admin/VideoUpload"
import { TGUUserManagement } from "@/components/admin/TGUUserManagement"
import { PaymentManagement } from "@/components/admin/PaymentManagement"
import { AIKnowledgeBase } from "@/components/admin/AIKnowledgeBase"
import { CouponManagement } from "@/components/admin/CouponManagement"
import { EnhancedAnalytics } from "@/components/admin/EnhancedAnalytics"
import { SystemSettings } from "@/components/admin/SystemSettings"
import { LayoutDashboard, Users, BookMarked, Settings, BarChart, Layers, DollarSign, Mail, Phone, Calendar, MessageCircle, Video, Ticket } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"
import { useParams } from "next/navigation"

export default function AdminPage() {
    const [activeTab, setActiveTab] = useState('dashboard')
    const params = useParams() as any
    const lang = params?.lang

    const navItems = [
        { id: 'dashboard', label: "Dashboard", icon: <LayoutDashboard className="w-5 h-5" /> },
        { id: 'orders', label: "Buyurtmalar", icon: <DollarSign className="w-5 h-5" /> },
        { id: 'leads', label: "Lidlar", icon: <Mail className="w-5 h-5" /> },
        { id: 'consultations', label: "Konsultatsiyalar", icon: <Phone className="w-5 h-5" /> },
        { id: 'feedback', label: "Fikrlar", icon: <MessageCircle className="w-5 h-5" /> },
        { id: 'group_chat', label: "Guruh Chatlari", icon: <MessageCircle className="w-5 h-5" /> },
        { id: 'users', label: "Foydalanuvchilar", icon: <Users className="w-5 h-5" /> },
        { id: 'subscriptions', label: "Obunalar", icon: <Layers className="w-5 h-5" /> },
        { id: 'courses', label: "Kurslar CRUD", icon: <BookMarked className="w-5 h-5" /> },
        { id: 'videos', label: "Video Vault", icon: <Video className="w-5 h-5" /> },
        { id: 'analytics', label: "Analitika", icon: <BarChart className="w-5 h-5" /> },
        { id: 'tgu_users', label: "TGU Foydalanuvchilar", icon: <Users className="w-5 h-5" /> },
        { id: 'payments', label: "To'lovlar", icon: <DollarSign className="w-5 h-5" /> },
        { id: 'ai_kb', label: "AI Bilimlar Bazasi", icon: <MessageCircle className="w-5 h-5" /> },
        { id: 'coupons', label: "Promo-kodlar", icon: <Ticket className="w-5 h-5" /> },
        { id: 'settings', label: "Sozlamalar", icon: <Settings className="w-5 h-5" /> },
    ]

    return (
        <main className="min-h-screen bg-[var(--background)]" data-theme="admin">
            {/* Admin Header / Topbar */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-[var(--card-bg)] border-b border-[var(--border)] py-4 backdrop-blur-md">
                <Container className="flex items-center justify-between">
                    <Link href={`/${lang}/admin`} className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center shadow-soft">
                            <Image src="/images/logo.png" alt="Logo" width={28} height={28} className="w-7 h-7 object-contain brightness-0 invert" />
                        </div>
                        <div className="flex flex-col">
                            <span className="text-xl font-editorial font-bold tracking-tight text-[var(--primary)] leading-none">Baxtli Men</span>
                            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-[var(--accent)] leading-none mt-1.5">Management Portal</span>
                        </div>
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="text-right mr-4 hidden md:block">
                            <div className="text-xs font-bold text-[var(--foreground)]">Admin User</div>
                            <div className="text-[10px] text-[var(--primary)] uppercase tracking-widest font-black opacity-80">Super Admin</div>
                        </div>
                        <button className="w-10 h-10 rounded-full bg-[var(--primary)]/10 flex items-center justify-center text-[var(--primary)] hover:bg-[var(--primary)]/20 transition-colors border border-[var(--primary)]/20">
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </Container>
            </header>

            <Container className="pt-28 pb-12">
                <div className="grid lg:grid-cols-5 gap-12">
                    {/* Admin Sidebar */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-28 space-y-2 max-h-[calc(100vh-8rem)] overflow-y-auto pb-4 pr-2 scrollbar-hide">
                            {navItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => setActiveTab(item.id)}
                                    className={`w-full flex items-center gap-4 px-8 py-5 rounded-[2rem] transition-all font-bold text-sm tracking-wide ${activeTab === item.id
                                        ? "bg-[var(--primary)] text-white shadow-button scale-[1.02]"
                                        : "text-[var(--primary)]/40 hover:bg-[var(--primary)]/5 hover:text-[var(--primary)]"
                                        }`}
                                >
                                    <span className={activeTab === item.id ? "text-white" : "text-[var(--accent)]"}>
                                        {item.icon}
                                    </span>
                                    {item.label}
                                </button>
                            ))}
                        </div>
                    </aside>

                    {/* Admin Content */}
                    <div className="lg:col-span-4 space-y-12 text-[var(--foreground)]">
                        {activeTab === 'dashboard' && (
                            <>
                                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div>
                                        <h1 className="text-5xl font-editorial font-bold text-[var(--primary)] mb-3 tracking-tight">Management Dashboard</h1>
                                        <p className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-[0.4em]">Integrated Platform Control & Analytics</p>
                                    </div>
                                    <div className="flex gap-4">
                                        <button className="px-10 py-5 rounded-[2rem] bg-white border border-[var(--primary)]/5 text-[11px] font-bold uppercase tracking-[0.3em] text-[var(--primary)] hover:bg-[var(--primary)]/5 transition-all shadow-soft">
                                            Export
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('courses')}
                                            className="btn-luxury px-10 py-5 text-[11px] font-bold uppercase tracking-[0.3em] shadow-button active:scale-95 transition-all"
                                        >
                                            New Course +
                                        </button>
                                    </div>
                                </div>

                                <AdminDashboard />

                                <section className="bg-[var(--card-bg)] p-8 rounded-[2.5rem] border border-[var(--border)] shadow-sm">
                                    <h2 className="text-xl font-serif font-bold mb-8 border-b border-[var(--border)] pb-4">Broadcast Xabarnoma</h2>
                                    <BroadcastTool />
                                </section>

                                <section className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm">
                                    <h2 className="text-xl font-serif font-bold mb-8 px-4">Oxirgi Ro'yxatdan o'tganlar</h2>
                                    <UserList />
                                </section>
                            </>
                        )}

                        {activeTab === 'courses' && (
                            <div className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm min-h-[600px]">
                                <CourseManagement />
                            </div>
                        )}

                        {activeTab === 'videos' && (
                            <div className="bg-[var(--card-bg)] min-h-[600px]">
                                <div className="mb-12 text-center max-w-2xl mx-auto">
                                    <h2 className="text-4xl font-editorial font-bold text-[var(--primary)] mb-4">Video Vault</h2>
                                    <p className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-[0.4em] leading-relaxed">
                                        Private GCS management for Antigravity content. All uploads are secured with 30-minute signed access URLs.
                                    </p>
                                </div>
                                <VideoUpload onUploadComplete={(name: string, url: string) => console.log('Uploaded:', name, url)} />
                                <div className="mt-12 p-8 bg-white/50 border border-[var(--primary)]/10 rounded-[2.5rem] italic text-[13px] text-[var(--primary)]/60 text-center font-medium">
                                    "Your content, protected by state-of-the-art encryption and dynamic watermarking."
                                </div>
                            </div>
                        )}

                        {activeTab === 'users' && (
                            <div className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm min-h-[600px]">
                                <UserList />
                            </div>
                        )}

                        {activeTab === 'orders' && (
                            <div className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm min-h-[600px]">
                                <OrderManagement />
                            </div>
                        )}

                        {activeTab === 'leads' && (
                            <div className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm min-h-[600px]">
                                <LeadsManagement />
                            </div>
                        )}

                        {activeTab === 'consultations' && (
                            <div className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm min-h-[600px]">
                                <ConsultationCalendar />
                            </div>
                        )}

                        {activeTab === 'subscriptions' && (
                            <div className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm min-h-[600px]">
                                <SubscriptionManagement />
                            </div>
                        )}

                        {activeTab === 'feedback' && (
                            <div className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm min-h-[600px]">
                                <FeedbackManager />
                            </div>
                        )}

                        {activeTab === 'group_chat' && (
                            <div className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm min-h-[600px]">
                                <GroupChatManager />
                            </div>
                        )}

                        {activeTab === 'analytics' && (
                            <div className="space-y-12">
                                <EnhancedAnalytics />
                                <div className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm min-h-[600px]">
                                    <AnalyticsView />
                                </div>
                            </div>
                        )}

                        {activeTab === 'tgu_users' && (
                            <div className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm min-h-[600px]">
                                <TGUUserManagement />
                            </div>
                        )}

                        {activeTab === 'payments' && (
                            <div className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm min-h-[600px]">
                                <PaymentManagement />
                            </div>
                        )}

                        {activeTab === 'ai_kb' && (
                            <div className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm min-h-[600px]">
                                <AIKnowledgeBase />
                            </div>
                        )}

                        {activeTab === 'coupons' && (
                            <div className="bg-[var(--card-bg)] p-8 rounded-[3rem] border border-[var(--border)] shadow-sm min-h-[600px]">
                                <CouponManagement />
                            </div>
                        )}

                        {activeTab === 'settings' && (
                            <div className="bg-[var(--card-bg)] p-12 rounded-[3rem] border border-[var(--border)] shadow-sm">
                                <SystemSettings />
                                <div className="mt-16 pt-16 border-t border-[var(--border)] text-center">
                                    <div className="text-[var(--primary)] text-sm opacity-20 mb-4 flex justify-center">
                                        <Settings className="w-8 h-8" />
                                    </div>
                                    <div className="max-w-md mx-auto space-y-4">
                                        <button
                                            onClick={async () => {
                                                if (confirm("Bazani boshlang'ich ma'lumotlar bilan to'ldirishni xohlaysizmi?")) {
                                                    const res = await fetch('/api/admin/seed', { method: 'POST' });
                                                    const data = await res.json();
                                                    alert(data.success ? "Baza muvaffaqiyatli to'ldirildi!" : "Xatolik: " + data.error);
                                                }
                                            }}
                                            className="w-full py-4 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 transition-all shadow-xl shadow-[var(--glow)]"
                                        >
                                            Bazani Seeding qilish (Dummy Data)
                                        </button>
                                        <p className="text-[10px] opacity-30 uppercase font-black tracking-widest">
                                            Bu amal bazaga asosiy kurslar va konsultastiyalarni qo'shadi.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </Container>
        </main>
    )
}
