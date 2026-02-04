'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Purchase {
    id: string
    user: {
        firstName?: string
        lastName?: string
        email?: string
        phone?: string
        telegramId?: string
    }
    course: {
        title: string
        consultationFormat: 'ONLINE' | 'OFFLINE'
    }
    amount: number
    status: string
    consultationStatus: 'NEW' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED' | null
    createdAt: string
}

interface Stats {
    total: number
    revenue: number
    byStatus: {
        new: number
        confirmed: number
        completed: number
        canceled: number
    }
}

export default function AdminConsultationsPage() {
    const [purchases, setPurchases] = useState<Purchase[]>([])
    const [stats, setStats] = useState<Stats | null>(null)
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState<string>('ALL')

    useEffect(() => {
        fetchPurchases()
    }, [])

    const fetchPurchases = async () => {
        try {
            const res = await fetch('/api/admin/consultations')
            const data = await res.json()
            if (data.success) {
                setPurchases(data.purchases)
                setStats(data.stats)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const updateStatus = async (purchaseId: string, newStatus: string) => {
        try {
            const res = await fetch(`/api/admin/consultations/${purchaseId}/status`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: newStatus }),
            })
            const data = await res.json()
            if (data.success) {
                fetchPurchases() // Refresh list
            }
        } catch (error) {
            console.error(error)
        }
    }

    const filteredPurchases = purchases.filter(p => {
        if (filter === 'ALL') return true
        return p.consultationStatus === filter
    })

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <h1 className="text-3xl font-bold text-gray-900 mb-8">Консультации</h1>

                {/* Stats */}
                {stats && (
                    <div className="grid md:grid-cols-4 gap-4 mb-8">
                        <div className="bg-white rounded-lg p-6 shadow">
                            <div className="text-sm text-gray-600">Всего заказов</div>
                            <div className="text-3xl font-bold text-emerald-600">{stats.total}</div>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow">
                            <div className="text-sm text-gray-600">Выручка</div>
                            <div className="text-3xl font-bold text-emerald-600">
                                {(stats.revenue / 1000000).toFixed(1)}M
                            </div>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow">
                            <div className="text-sm text-gray-600">Новые</div>
                            <div className="text-3xl font-bold text-blue-600">{stats.byStatus.new}</div>
                        </div>
                        <div className="bg-white rounded-lg p-6 shadow">
                            <div className="text-sm text-gray-600">Завершённые</div>
                            <div className="text-3xl font-bold text-green-600">{stats.byStatus.completed}</div>
                        </div>
                    </div>
                )}

                {/* Filters */}
                <div className="mb-6 flex gap-2">
                    {['ALL', 'NEW', 'CONFIRMED', 'COMPLETED', 'CANCELED'].map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg font-medium ${filter === status
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-white text-gray-700 hover:bg-gray-100'
                                }`}
                        >
                            {status}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <table className="w-full">
                        <thead className="bg-gray-100 border-b">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Клиент</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Формат</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Сумма</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Дата</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Статус</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Контакт</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {filteredPurchases.map(purchase => (
                                <tr key={purchase.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="font-medium text-gray-900">
                                            {purchase.user.firstName} {purchase.user.lastName}
                                        </div>
                                        <div className="text-sm text-gray-500">{purchase.user.email || purchase.user.phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${purchase.course.consultationFormat === 'ONLINE'
                                                ? 'bg-blue-100 text-blue-800'
                                                : 'bg-orange-100 text-orange-800'
                                            }`}>
                                            {purchase.course.consultationFormat}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium">
                                        {(Number(purchase.amount) / 1000000).toFixed(1)}M
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">
                                        {new Date(purchase.createdAt).toLocaleDateString('ru')}
                                    </td>
                                    <td className="px-6 py-4">
                                        <select
                                            value={purchase.consultationStatus || 'NEW'}
                                            onChange={(e) => updateStatus(purchase.id, e.target.value)}
                                            className="px-3 py-1 rounded border border-gray-300 text-sm"
                                        >
                                            <option value="NEW">NEW</option>
                                            <option value="CONFIRMED">CONFIRMED</option>
                                            <option value="COMPLETED">COMPLETED</option>
                                            <option value="CANCELED">CANCELED</option>
                                        </select>
                                    </td>
                                    <td className="px-6 py-4">
                                        {purchase.user.telegramId && (
                                            <button
                                                onClick={() => navigator.clipboard.writeText(`@${purchase.user.telegramId}`)}
                                                className="text-emerald-600 hover:text-emerald-700 text-sm font-medium"
                                            >
                                                Копировать TG
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {filteredPurchases.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            Нет заказов
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
