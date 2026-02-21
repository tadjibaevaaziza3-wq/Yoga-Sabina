"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { DollarSign, CheckCircle2, XCircle, Clock, Eye, Download, ShieldCheck, Loader2, ImageIcon, AlertCircle } from "lucide-react"
import { format } from "date-fns"

interface Purchase {
    id: string
    userName: string
    userPhone: string | null
    courseName: string
    amount: number
    method: string
    status: string
    txnId: string | null
    createdAt: string
    screenshotUrl: string | null
    verified: boolean
}

export function PaymentManagement() {
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [loading, setLoading] = useState(true)
    const [verifying, setVerifying] = useState<string | null>(null)
    const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)

    useEffect(() => {
        fetchPurchases()
    }, [])

    const fetchPurchases = async () => {
        try {
            const res = await fetch('/api/admin/purchases')
            const data = await res.json()
            if (data.success) {
                setPurchases(data.purchases)
            }
            setLoading(false)
        } catch (error) {
            console.error('Fetch purchases error:', error)
            setLoading(false)
        }
    }

    const handleVerify = async (purchaseId: string, action: 'APPROVE' | 'REJECT') => {
        setVerifying(purchaseId)
        try {
            const res = await fetch('/api/admin/purchases', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ purchaseId, action })
            })
            const data = await res.json()
            if (data.success) {
                await fetchPurchases()
            }
        } catch (error) {
            console.error('Verification error:', error)
        }
        setVerifying(null)
        setSelectedScreenshot(null)
    }

    if (loading) return (
        <div className="flex flex-col items-center justify-center p-20 space-y-4">
            <Loader2 className="w-12 h-12 text-[var(--primary)] animate-spin" />
            <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--primary)]/40">Loading Ledger...</p>
        </div>
    )

    return (
        <div className="space-y-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-editorial font-bold text-[var(--primary)] tracking-tight">Revenue Dashboard</h2>
                    <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.4em] mt-1">Transaction audit & payment verification</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-8 bg-emerald-50/50 border border-emerald-100 rounded-[2rem] flex items-center gap-6 shadow-soft">
                    <div className="w-14 h-14 rounded-2xl bg-emerald-500 text-white flex items-center justify-center">
                        <ShieldCheck className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-emerald-600/60 uppercase tracking-widest mb-1">Auto-Verified</div>
                        <div className="text-2xl font-editorial font-bold text-emerald-700">Click / Payme</div>
                    </div>
                </div>
                <div className="p-8 bg-orange-50/50 border border-orange-100 rounded-[2rem] flex items-center gap-6 shadow-soft">
                    <div className="w-14 h-14 rounded-2xl bg-orange-500 text-white flex items-center justify-center">
                        <ImageIcon className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-orange-600/60 uppercase tracking-widest mb-1">Manual Review</div>
                        <div className="text-2xl font-editorial font-bold text-orange-700">Bank Transfers</div>
                    </div>
                </div>
                <div className="p-8 bg-blue-50/50 border border-blue-100 rounded-[2rem] flex items-center gap-6 shadow-soft">
                    <div className="w-14 h-14 rounded-2xl bg-blue-500 text-white flex items-center justify-center">
                        <DollarSign className="w-7 h-7" />
                    </div>
                    <div>
                        <div className="text-[10px] font-bold text-blue-600/60 uppercase tracking-widest mb-1">Coming Soon</div>
                        <div className="text-2xl font-editorial font-bold text-blue-700">Apple In-App</div>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-[2.5rem] border border-[var(--primary)]/5 overflow-hidden shadow-soft">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--primary)]/5">
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40">Timestamp</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40">User</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40">Course</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40">Amount / Method</th>
                                <th className="px-8 py-6 text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--primary)]/40">Status</th>
                                <th className="px-8 py-6 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            <AnimatePresence>
                                {purchases.map((p, idx) => (
                                    <motion.tr
                                        key={p.id}
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: idx * 0.03 }}
                                        className="group hover:bg-[var(--primary)]/5 transition-colors border-b border-[var(--primary)]/5 last:border-0"
                                    >
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col opacity-60">
                                                <span className="text-xs font-bold">{format(new Date(p.createdAt), 'MMM dd')}</span>
                                                <span className="text-[10px] font-medium">{format(new Date(p.createdAt), 'HH:mm')}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold text-[var(--primary)]">{p.userName}</span>
                                                <span className="text-[11px] opacity-60 font-medium">{p.userPhone}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <span className="text-xs font-bold text-[var(--accent)]">{p.courseName}</span>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-[var(--primary)]">
                                                    {new Intl.NumberFormat('uz-UZ').format(p.amount)} <span className="text-[9px] opacity-40 uppercase tracking-tighter">UZS</span>
                                                </span>
                                                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent)] mt-1">{p.method}</span>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6">
                                            <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${p.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' :
                                                    p.status === 'PENDING' ? 'bg-orange-50 text-orange-600' :
                                                        'bg-red-50 text-red-600'
                                                }`}>
                                                {p.status}
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                {p.screenshotUrl && (
                                                    <button
                                                        onClick={() => setSelectedScreenshot(p.screenshotUrl)}
                                                        className="p-3 rounded-xl bg-[var(--primary)]/5 text-[var(--primary)] hover:bg-[var(--primary)] transition-all hover:text-white"
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {p.status === 'PENDING' && (
                                                    <div className="flex gap-1">
                                                        <button
                                                            disabled={verifying === p.id}
                                                            onClick={() => handleVerify(p.id, 'APPROVE')}
                                                            className="p-3 rounded-xl bg-emerald-50 text-emerald-600 hover:bg-emerald-500 transition-all hover:text-white"
                                                        >
                                                            {verifying === p.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                                                        </button>
                                                        <button
                                                            disabled={verifying === p.id}
                                                            onClick={() => handleVerify(p.id, 'REJECT')}
                                                            className="p-3 rounded-xl bg-red-50 text-red-600 hover:bg-red-500 transition-all hover:text-white"
                                                        >
                                                            <XCircle className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))}
                            </AnimatePresence>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Screenshot Modal */}
            {selectedScreenshot && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-12 bg-black/80 backdrop-blur-xl">
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="relative max-w-4xl w-full bg-white rounded-[3rem] overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-8 right-8 z-10">
                            <button
                                onClick={() => setSelectedScreenshot(null)}
                                className="w-12 h-12 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center transition-all"
                            >
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="flex flex-col lg:flex-row h-[70vh]">
                            <div className="lg:w-2/3 bg-slate-100 flex items-center justify-center overflow-hidden">
                                <img src={selectedScreenshot} alt="Payment Proof" className="max-h-full object-contain" />
                            </div>
                            <div className="lg:w-1/3 p-12 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <h3 className="text-2xl font-editorial font-bold text-[var(--primary)]">Manual Verification</h3>
                                    <div className="p-6 bg-orange-50 border border-orange-100 rounded-2xl flex items-start gap-4">
                                        <AlertCircle className="w-5 h-5 text-orange-500 shrink-0 mt-1" />
                                        <p className="text-sm font-medium text-orange-700 leading-relaxed">
                                            Please verify the transaction date, amount, and recipient details in the bank receipt before approving.
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <button
                                        onClick={() => handleVerify(purchases.find(p => p.screenshotUrl === selectedScreenshot)?.id!, 'APPROVE')}
                                        className="w-full py-5 btn-luxury font-black uppercase tracking-widest shadow-button"
                                    >
                                        Approve Payment
                                    </button>
                                    <button
                                        onClick={() => setSelectedScreenshot(null)}
                                        className="w-full py-5 border border-[var(--primary)]/10 text-[var(--primary)]/60 font-bold uppercase tracking-widest hover:bg-[var(--primary)]/5 rounded-2xl transition-all"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </div>
    )
}
