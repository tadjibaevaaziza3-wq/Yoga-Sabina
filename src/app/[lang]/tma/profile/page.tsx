'use client';

import React, { useEffect, useState } from 'react';
import { Container } from "@/components/ui/Container";
import { User, Phone, MapPin, Target, Save, LogOut, CheckCircle2, Activity, BookOpen, Star, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter, useParams } from 'next/navigation';

export default function TMAProfile() {
    const router = useRouter();
    const params = useParams();
    const lang = (params?.lang as string) || 'uz';
    const [userData, setUserData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [success, setSuccess] = useState(false);

    // Form states
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [healthGoals, setHealthGoals] = useState("");

    useEffect(() => {
        fetch('/api/tma/me')
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setUserData(data.user);
                    setFullName(data.user.profile?.name || data.user.firstName || "");
                    setPhone(data.user.phone || "");
                    setLocation(data.user.profile?.location || "");
                    setHealthGoals(data.user.profile?.healthIssues || "");
                }
            })
            .finally(() => setLoading(false));
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/tma/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    telegramId: userData.telegramId,
                    fullName,
                    phone,
                    location,
                    healthGoals
                })
            });

            if (res.ok) {
                setSuccess(true);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            console.error("Profile Save Error:", err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#f6f9fe] flex items-center justify-center">
                <div className="w-10 h-10 border-t-2 border-[#114539] rounded-full animate-spin" />
            </div>
        );
    }

    if (!userData) {
        return (
            <div className="min-h-screen bg-[#f6f9fe] flex flex-col items-center justify-center gap-4 px-6">
                <div className="w-16 h-16 rounded-[1.5rem] bg-white shadow-soft flex items-center justify-center border border-[#114539]/5">
                    <User className="w-8 h-8 text-[#114539]/30" />
                </div>
                <p className="text-sm font-bold text-[#114539]/50 text-center">Profil ma'lumotlari yuklanmadi.<br />Iltimos, qayta urinib ko'ring.</p>
                <button onClick={() => window.location.reload()} className="btn-luxury px-8 py-3 text-[10px] uppercase tracking-widest">
                    Qayta yuklash
                </button>
            </div>
        );
    }

    return (
        <main className="pb-32 bg-[#f6f9fe] min-h-screen">
            <Container className="pt-12 px-6 space-y-10">
                {/* Header */}
                <header className="space-y-2 text-center">
                    <div className="w-24 h-24 rounded-[2rem] bg-white shadow-soft mx-auto flex items-center justify-center border border-[#114539]/5 mb-6">
                        <User className="w-10 h-10 text-[#114539]" />
                    </div>
                    <h1 className="text-3xl font-editorial font-bold text-[#114539]">Profil</h1>
                    <p className="text-[10px] font-bold text-[#114539]/40 uppercase tracking-widest">Ma'lumotlaringizni boshqaring</p>
                </header>

                {/* Form */}
                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                        <div className="relative">
                            <label className="text-[9px] font-bold text-[#114539]/40 uppercase tracking-widest pl-4 mb-2 block">To'liq ism</label>
                            <div className="relative">
                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#114539]/20" />
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="w-full bg-white border border-[#114539]/5 rounded-2xl py-5 pl-14 pr-6 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#114539]/20 transition-all shadow-soft"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[9px] font-bold text-[#114539]/40 uppercase tracking-widest pl-4 mb-2 block">Telefon raqam</label>
                            <div className="relative">
                                <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#114539]/20" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="w-full bg-white border border-[#114539]/5 rounded-2xl py-5 pl-14 pr-6 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#114539]/20 transition-all shadow-soft"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[9px] font-bold text-[#114539]/40 uppercase tracking-widest pl-4 mb-2 block">Manzil</label>
                            <div className="relative">
                                <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#114539]/20" />
                                <input
                                    type="text"
                                    value={location}
                                    onChange={(e) => setLocation(e.target.value)}
                                    className="w-full bg-white border border-[#114539]/5 rounded-2xl py-5 pl-14 pr-6 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#114539]/20 transition-all shadow-soft"
                                />
                            </div>
                        </div>

                        <div className="relative">
                            <label className="text-[9px] font-bold text-[#114539]/40 uppercase tracking-widest pl-4 mb-2 block">Yoga maqsadlari</label>
                            <div className="relative">
                                <Target className="absolute left-6 top-6 w-4 h-4 text-[#114539]/20" />
                                <textarea
                                    value={healthGoals}
                                    onChange={(e) => setHealthGoals(e.target.value)}
                                    className="w-full bg-white border border-[#114539]/5 rounded-2xl py-5 pl-14 pr-6 text-xs font-medium min-h-[120px] focus:outline-none focus:ring-2 focus:ring-[#114539]/20 transition-all shadow-soft"
                                />
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={saving}
                        className="w-full btn-luxury py-6 text-[10px] flex items-center justify-center gap-3 shadow-xl relative overflow-hidden"
                    >
                        <AnimatePresence mode="wait">
                            {success ? (
                                <motion.div
                                    key="success"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <CheckCircle2 className="w-4 h-4 text-white" /> SAQLANDI
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="idle"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    exit={{ y: -20, opacity: 0 }}
                                    className="flex items-center gap-2"
                                >
                                    <Save className="w-4 h-4" /> SAQLASH
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </button>
                </form>

                {/* Account Actions */}
                <div className="pt-8 border-t border-[#114539]/5">
                    <button className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl border border-red-500/10 text-red-500 text-[10px] font-bold uppercase tracking-widest hover:bg-red-500/5 transition-all">
                        <LogOut className="w-4 h-4" /> Akkauntdan chiqish
                    </button>
                    <p className="text-[8px] text-[#114539]/20 text-center font-bold uppercase tracking-widest mt-6">Telegram ID: {userData?.telegramId || 'N/A'}</p>
                </div>
            </Container>

            {/* Bottom Nav Bar (Global) */}
            <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-xl border-t border-[#114539]/5 p-6 pb-10 flex justify-around z-50">
                <Link href={`/${lang}/tma/dashboard`} className="flex flex-col items-center gap-2">
                    <Activity className="w-6 h-6 text-[#114539]/20" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]/20">Panel</span>
                </Link>
                <Link href={`/${lang}/tma/courses`} className="flex flex-col items-center gap-2">
                    <BookOpen className="w-6 h-6 text-[#114539]/20" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]/20">Kurslar</span>
                </Link>
                <Link href={`/${lang}/tma/profile`} className="flex flex-col items-center gap-2">
                    <Star className="w-6 h-6 text-[#114539]" />
                    <span className="text-[8px] font-bold uppercase tracking-widest text-[#114539]">Profil</span>
                </Link>
            </div>
        </main>
    );
}
