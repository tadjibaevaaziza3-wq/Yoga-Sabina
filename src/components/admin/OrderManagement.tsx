"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Loader2, DollarSign, Calendar, Filter, Search, CheckCircle, XCircle, Clock, RefreshCw } from "lucide-react"

interface Order {
    id: string
    userId: string
    courseId: string
    amount: number
    status: string
    provider: string
    providerTxnId?: string
    screenshotUrl?: string
    verifiedByAdmin: boolean
    createdAt: string
    user: {
        firstName?: string
        lastName?: string
        email?: string
        phone?: string
    }
    course: {
        title: string
        type: string
    }
}

export function OrderManagement() {
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('ALL')
    const [searchTerm, setSearchTerm] = useState('')
    const [stats, setStats] = useState<any>(null)

    useEffect(() => {
        fetchOrders()
    }, [filter])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams()
            if (filter !== 'ALL') {
                params.append('status', filter)
            }

            const res = await fetch(`/api/admin/orders?${params}`)
            const data = await res.json()
            if (data.success) {
                setOrders(data.purchases)
                setStats({
                    total: data.total,
                    revenue: data.totalRevenue,
                    byStatus: data.byStatus
                })
            }
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const filteredOrders = orders.filter(order => {
        if (!searchTerm) return true
        const userName = `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email || ''
        const courseName = order.course.title || ''
        return userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            courseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase())
    })

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'PAID':
                return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-purple-500/10 text-purple-500 border border-purple-500/20 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> To'langan
                </span>
            case 'PENDING':
                return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Kutilmoqda
                </span>
            case 'FAILED':
                return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-500/10 text-red-500 border border-red-500/20 flex items-center gap-1">
                    <XCircle className="w-3 h-3" /> Muvaffaqiyatsiz
                </span>
            case 'REFUNDED':
                return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center gap-1">
                    <RefreshCw className="w-3 h-3" /> Qaytarilgan
                </span>
            default:
                return <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-gray-500/10 text-gray-500 border border-gray-500/20">{status}</span>
        }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center p-20">
                <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
            </div>
        )
    }

    return (
        <div className="space-y-8">
            {/* Header with Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gradient-to-br from-blue-500 to-indigo-600 p-6 rounded-[2rem] text-white shadow-xl shadow-blue-500/20">
                    <div className="flex items-center gap-3 mb-2">
                        <DollarSign className="w-6 h-6" />
                        <span className="text-xs font-black uppercase tracking-widest opacity-80">Umumiy Daromad</span>
                    </div>
                    <p className="text-3xl font-black">{new Intl.NumberFormat('uz-UZ').format(stats?.revenue || 0)} сум</p>
                </div>
                <div className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border)] shadow-sm">
                    <div className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2">Jami Buyurtmalar</div>
                    <p className="text-3xl font-black text-[var(--foreground)]">{stats?.total || 0}</p>
                </div>
                <div className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border)] shadow-sm">
                    <div className="text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)] mb-2">To'langan</div>
                    <p className="text-3xl font-black text-[var(--foreground)]">{stats?.byStatus?.PAID || 0}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 opacity-30 text-[var(--foreground)]" />
                    <input
                        type="text"
                        placeholder="Qidiruv (foydalanuvchi, kurs, ID)..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--primary)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/10 font-medium text-[var(--foreground)]"
                    />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {['ALL', 'PAID', 'PENDING', 'FAILED', 'REFUNDED'].map((status) => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-6 py-4 rounded-2xl text-sm font-extrabold transition-all ${filter === status
                                ? 'bg-[var(--primary)] text-white shadow-xl shadow-[var(--glow)]'
                                : 'bg-[var(--card-bg)] text-[var(--foreground)] opacity-60 border border-[var(--border)] hover:opacity-100'
                                }`}
                        >
                            {status === 'ALL' ? 'Hammasi' : status}
                        </button>
                    ))}
                </div>
            </div>

            {/* Orders Table */}
            <div className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-[var(--primary)]/5 text-xs font-black uppercase tracking-widest opacity-40 text-[var(--foreground)]">
                                <th className="px-6 py-4 text-left">Buyurtma ID</th>
                                <th className="px-6 py-4 text-left">Foydalanuvchi</th>
                                <th className="px-6 py-4 text-left">Kurs</th>
                                <th className="px-6 py-4 text-left">Summa</th>
                                <th className="px-6 py-4 text-left">Sana</th>
                                <th className="px-6 py-4 text-left">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {filteredOrders.map((order) => (
                                <OrderRow key={order.id} order={order} onUpdate={fetchOrders} getStatusBadge={getStatusBadge} />
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredOrders.length === 0 && (
                    <div className="text-center p-20 opacity-30 font-black uppercase tracking-widest text-xs text-[var(--foreground)]">
                        Buyurtmalar topilmadi
                    </div>
                )}
            </div>
        </div>
    )
}

function OrderRow({ order, onUpdate, getStatusBadge }: { order: Order; onUpdate: () => void; getStatusBadge: (status: string) => React.ReactElement }) {
    const [updating, setUpdating] = useState(false)
    const [showProof, setShowProof] = useState(false)

    const handleStatusChange = async (newStatus: string) => {
        if (!confirm(`Buyurtma statusini ${newStatus} ga o'zgartirmoqchimisiz?`)) return

        setUpdating(true)
        try {
            const res = await fetch('/api/admin/orders', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ purchaseId: order.id, status: newStatus })
            })
            const data = await res.json()
            if (data.success) {
                alert('Status yangilandi!')
                onUpdate()
            } else {
                alert('Xatolik: ' + data.error)
            }
        } catch (error) {
            alert('Tarmoq xatoligi')
        } finally {
            setUpdating(false)
        }
    }

    const userName = `${order.user.firstName || ''} ${order.user.lastName || ''}`.trim() || order.user.email || 'N/A'
    const orderDate = new Date(order.createdAt).toLocaleDateString('uz-UZ', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    })

    return (
        <>
            <tr className="hover:bg-[var(--primary)]/5 transition-colors">
                <td className="px-6 py-4">
                    <div className="font-mono text-xs opacity-40 text-[var(--foreground)]">{order.id.slice(0, 8)}...</div>
                </td>
                <td className="px-6 py-4">
                    <div className="font-bold text-[var(--foreground)]">{userName}</div>
                    <div className="text-xs opacity-50 text-[var(--foreground)]">{order.user.phone || order.user.email}</div>
                </td>
                <td className="px-6 py-4">
                    <div className="font-bold text-[var(--foreground)]">{order.course.title}</div>
                    <div className="text-xs opacity-50 text-[var(--foreground)] uppercase">{order.course.type}</div>
                </td>
                <td className="px-6 py-4">
                    <div className="font-black text-[var(--foreground)]">{new Intl.NumberFormat('uz-UZ').format(Number(order.amount))} сум</div>
                    <div className="flex items-center gap-2 mt-1">
                        <span className="text-[9px] font-black uppercase tracking-tighter px-2 py-0.5 bg-[var(--primary)]/10 text-[var(--primary)] rounded-md">
                            {order.provider}
                        </span>
                        {order.screenshotUrl && (
                            <button
                                onClick={() => setShowProof(true)}
                                className="text-[9px] font-bold text-blue-500 underline hover:text-blue-600"
                            >
                                Proof
                            </button>
                        )}
                    </div>
                </td>
                <td className="px-6 py-4">
                    <div className="text-sm opacity-70 text-[var(--foreground)]">{orderDate}</div>
                </td>
                <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                        <select
                            value={order.status}
                            onChange={(e) => handleStatusChange(e.target.value)}
                            disabled={updating}
                            className="bg-transparent border-none text-xs font-bold focus:ring-0 cursor-pointer"
                        >
                            <option value="PENDING">KUTILMOQDA</option>
                            <option value="PAID">TO'LANGAN</option>
                            <option value="FAILED">XATO</option>
                        </select>
                        {getStatusBadge(order.status)}
                        {updating && <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />}
                    </div>
                </td>
            </tr>

            {showProof && order.screenshotUrl && (
                <div className="fixed inset-0 bg-black/80 z-[999] flex items-center justify-center p-8" onClick={() => setShowProof(false)}>
                    <div className="relative max-w-4xl max-h-full bg-white rounded-3xl overflow-hidden shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                            <span className="text-xs font-black uppercase tracking-widest opacity-40">To'lov tasdig'i</span>
                            <button onClick={() => setShowProof(false)} className="text-gray-400 hover:text-gray-600">
                                <XCircle className="w-6 h-6" />
                            </button>
                        </div>
                        <div className="p-2 overflow-auto max-h-[80vh]">
                            <img
                                src={order.screenshotUrl}
                                alt="Payment Proof"
                                className="w-full h-auto rounded-xl shadow-inner"
                            />
                        </div>
                        <div className="p-6 bg-gray-50 flex justify-center gap-4">
                            <button
                                onClick={() => handleStatusChange('PAID')}
                                className="px-8 py-3 bg-[var(--primary)] text-white rounded-2xl text-sm font-black uppercase tracking-widest hover:scale-105 transition-all shadow-xl shadow-[var(--glow)]"
                            >
                                Tasdiqlash (PAID)
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}


