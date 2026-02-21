"use client"

import React, { useState, useEffect } from "react"
import {
    Ticket,
    Plus,
    Trash2,
    Calendar,
    Users,
    Hash,
    Loader2,
    CheckCircle2,
    XCircle,
    Copy,
    AlertCircle,
    Percent,
    Banknote
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Coupon {
    id: string
    code: string
    discountType: 'PERCENTAGE' | 'FIXED_AMOUNT'
    discountValue: number
    maxUses: number | null
    usedCount: number
    expiresAt: string | null
    isActive: boolean
    courseId: string | null
    course?: {
        title: string
    }
}

export function CouponManagement() {
    const [coupons, setCoupons] = useState<Coupon[]>([])
    const [courses, setCourses] = useState<{ id: string, title: string }[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreateModal, setShowCreateModal] = useState(false)
    const [isCreating, setIsCreating] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        code: "",
        discountType: "PERCENTAGE",
        discountValue: "",
        maxUses: "",
        expiresAt: "",
        courseId: ""
    })

    useEffect(() => {
        fetchCoupons()
        fetchCourses()
    }, [])

    const fetchCoupons = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/coupons')
            const data = await res.json()
            if (data.success) setCoupons(data.coupons)
        } catch (e) {
            console.error(e)
        } finally {
            setLoading(false)
        }
    }

    const fetchCourses = async () => {
        try {
            const res = await fetch('/api/admin/courses')
            const data = await res.json()
            if (data.success) setCourses(data.courses)
        } catch (e) {
            console.error(e)
        }
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsCreating(true)
        try {
            const res = await fetch('/api/admin/coupons', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            })
            const data = await res.json()
            if (data.success) {
                setShowCreateModal(false)
                setFormData({
                    code: "",
                    discountType: "PERCENTAGE",
                    discountValue: "",
                    maxUses: "",
                    expiresAt: "",
                    courseId: ""
                })
                fetchCoupons()
            } else {
                alert(data.error)
            }
        } catch (e) {
            alert("Xatolik yuz berdi")
        } finally {
            setIsCreating(false)
        }
    }

    const toggleStatus = async (id: string, current: boolean) => {
        try {
            await fetch(`/api/admin/coupons/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !current })
            })
            fetchCoupons()
        } catch (e) {
            console.error(e)
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("O'chirib tashlamoqchimisiz?")) return
        try {
            await fetch(`/api/admin/coupons/${id}`, { method: 'DELETE' })
            fetchCoupons()
        } catch (e) {
            console.error(e)
        }
    }

    const copyCode = (code: string) => {
        navigator.clipboard.writeText(code)
        alert(`Nusxa olindi: ${code}`)
    }

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-serif font-black text-[var(--primary)] mb-2">Promo-kodlar Boshqaruvi</h2>
                    <p className="text-xs font-black opacity-40 uppercase tracking-[0.3em]">Chegirmalar va aksiyalar</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="px-6 py-4 bg-[var(--primary)] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[var(--primary)]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    Promo-kod qo'shish
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-[var(--accent)]" />
                </div>
            ) : coupons.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[3rem] border border-[var(--border)]">
                    <Ticket className="w-16 h-16 mx-auto mb-4 opacity-10" />
                    <p className="text-sm font-bold opacity-30 uppercase tracking-widest">Hozircha promo-kodlar yo'q</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {coupons.map((coupon) => (
                        <motion.div
                            key={coupon.id}
                            layout
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`p-8 rounded-[2.5rem] border bg-white shadow-sm transition-all relative overflow-hidden group ${!coupon.isActive ? 'opacity-60 grayscale' : 'hover:shadow-xl hover:border-[var(--accent)]/30'}`}
                        >
                            {/* Status Indicator */}
                            <div className="absolute top-0 right-0 p-4">
                                {coupon.isActive ? (
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-rose-500" />
                                )}
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white ${coupon.discountType === 'PERCENTAGE' ? 'bg-[var(--accent)]' : 'bg-indigo-500'}`}>
                                    {coupon.discountType === 'PERCENTAGE' ? <Percent className="w-6 h-6" /> : <Banknote className="w-6 h-6" />}
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xl font-black tracking-tight">{coupon.code}</h3>
                                        <button onClick={() => copyCode(coupon.code)} className="opacity-0 group-hover:opacity-40 hover:opacity-100 transition-opacity">
                                            <Copy className="w-3 h-3" />
                                        </button>
                                    </div>
                                    <p className="text-2xl font-serif font-bold text-[var(--primary)]">
                                        {coupon.discountValue}{coupon.discountType === 'PERCENTAGE' ? '%' : ' UZS'}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-8">
                                <div className="flex items-center gap-3 text-sm opacity-60 font-bold">
                                    <Hash className="w-4 h-4 text-[var(--accent)]" />
                                    <span>{coupon.course?.title || "Barcha kurslar uchun"}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm opacity-60 font-bold">
                                    <Users className="w-4 h-4 text-[var(--accent)]" />
                                    <span>{coupon.usedCount} / {coupon.maxUses || 'тИЮ'} ishlatilgan</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm opacity-60 font-bold">
                                    <Calendar className="w-4 h-4 text-[var(--accent)]" />
                                    <span>{coupon.expiresAt ? new Date(coupon.expiresAt).toLocaleDateString() : 'Muddatsiz'}</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <button
                                    onClick={() => toggleStatus(coupon.id, coupon.isActive)}
                                    className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${coupon.isActive ? 'hover:bg-rose-50 border-rose-100 text-rose-500' : 'hover:bg-emerald-50 border-emerald-100 text-emerald-500'}`}
                                >
                                    {coupon.isActive ? "O'chirish" : "Yoqish"}
                                </button>
                                <button
                                    onClick={() => handleDelete(coupon.id)}
                                    className="p-3 rounded-xl border border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white transition-all"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
                        <motion.div
                            initial={{ opacity: 0, y: 100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white rounded-[3rem] p-10 max-w-xl w-full shadow-2xl relative overflow-hidden"
                        >
                            <div className="relative z-10">
                                <h3 className="text-3xl font-serif font-black text-[var(--primary)] mb-8">Yangi Promo-kod</h3>

                                <form onSubmit={handleCreate} className="space-y-6">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="col-span-2">
                                            <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-2 block">Kod (masalan: YOGA2026)</label>
                                            <input
                                                required
                                                type="text"
                                                value={formData.code}
                                                onChange={e => setFormData({ ...formData, code: e.target.value })}
                                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[var(--accent)] transition-all font-bold uppercase"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-2 block">Turi</label>
                                            <select
                                                value={formData.discountType}
                                                onChange={e => setFormData({ ...formData, discountType: e.target.value })}
                                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[var(--accent)] transition-all font-bold appearance-none"
                                            >
                                                <option value="PERCENTAGE">Foiz (%)</option>
                                                <option value="FIXED_AMOUNT">Aniq summa (UZS)</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-2 block">Miqdori</label>
                                            <input
                                                required
                                                type="number"
                                                value={formData.discountValue}
                                                onChange={e => setFormData({ ...formData, discountValue: e.target.value })}
                                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[var(--accent)] transition-all font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-2 block">Maks. ishlatish soni</label>
                                            <input
                                                type="number"
                                                placeholder="Cheksiz bo'lsa bo'sh qoldiring"
                                                value={formData.maxUses}
                                                onChange={e => setFormData({ ...formData, maxUses: e.target.value })}
                                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[var(--accent)] transition-all font-bold"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-2 block">Amal qilish muddati</label>
                                            <input
                                                type="date"
                                                value={formData.expiresAt}
                                                onChange={e => setFormData({ ...formData, expiresAt: e.target.value })}
                                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[var(--accent)] transition-all font-bold"
                                            />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[10px] uppercase font-black tracking-widest opacity-40 mb-2 block">Kursga bog'lash (ixtiyoriy)</label>
                                            <select
                                                value={formData.courseId}
                                                onChange={e => setFormData({ ...formData, courseId: e.target.value })}
                                                className="w-full px-6 py-4 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:border-[var(--accent)] transition-all font-bold appearance-none"
                                            >
                                                <option value="">Barcha kurslar uchun</option>
                                                {courses.map(course => (
                                                    <option key={course.id} value={course.id}>{course.title}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-6">
                                        <button
                                            type="button"
                                            onClick={() => setShowCreateModal(false)}
                                            className="flex-1 px-8 py-5 border border-gray-100 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-gray-50 transition-all"
                                        >
                                            Bekor qilish
                                        </button>
                                        <button
                                            disabled={isCreating}
                                            className="flex-[2] px-8 py-5 bg-[var(--primary)] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-[var(--primary)]/20 hover:opacity-90 transition-all flex items-center justify-center gap-2"
                                        >
                                            {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Saqlash"}
                                        </button>
                                    </div>
                                </form>
                            </div>

                            {/* Decorative background element */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--accent)]/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}
