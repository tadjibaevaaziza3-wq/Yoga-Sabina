'use client'

import React, { useEffect, useState } from 'react'
import { ClipboardList, Filter, ChevronLeft, ChevronRight } from 'lucide-react'

interface LogEntry {
    id: string
    adminId: string
    admin?: { displayName: string; username: string }
    action: string
    entity?: string
    entityId?: string
    details?: any
    ipAddress?: string
    createdAt: string
}

export function AdminActivityLog({ adminId }: { adminId?: string }) {
    const [logs, setLogs] = useState<LogEntry[]>([])
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [total, setTotal] = useState(0)
    const [loading, setLoading] = useState(true)
    const [actionFilter, setActionFilter] = useState('')

    const fetchLogs = async () => {
        setLoading(true)
        try {
            const url = adminId
                ? `/api/admin/profile/activity?page=${page}&limit=20`
                : `/api/admin/logs?page=${page}&limit=20${actionFilter ? `&action=${actionFilter}` : ''}`
            const res = await fetch(url)
            const data = await res.json()
            setLogs(data.logs || [])
            setTotal(data.total || 0)
            setTotalPages(data.totalPages || 1)
        } catch { } finally { setLoading(false) }
    }

    useEffect(() => { fetchLogs() }, [page, actionFilter])

    const actionColors: Record<string, string> = {
        'LOGIN_SUCCESS': 'bg-emerald-50 text-emerald-600',
        'LOGIN_FAILED': 'bg-rose-50 text-rose-600',
        'ADMIN_CREATED': 'bg-blue-50 text-blue-600',
        'ADMIN_UPDATED': 'bg-amber-50 text-amber-600',
        'ADMIN_DEACTIVATED': 'bg-rose-50 text-rose-600',
        'PASSWORD_CHANGED': 'bg-violet-50 text-violet-600',
        'PROFILE_UPDATED': 'bg-sky-50 text-sky-600',
        'USER_CREATED': 'bg-emerald-50 text-emerald-600',
        'USER_BLOCKED': 'bg-rose-50 text-rose-600',
        'USER_DELETED': 'bg-rose-50 text-rose-600',
        'SUBSCRIPTION_GRANTED': 'bg-emerald-50 text-emerald-600',
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <ClipboardList className="w-5 h-5 text-[var(--primary)]" />
                    <h2 className="text-lg font-bold">Activity Log</h2>
                    <span className="text-[10px] font-bold bg-[var(--foreground)]/5 text-[var(--foreground)]/40 px-2 py-0.5 rounded-md">{total} entries</span>
                </div>
                <select
                    value={actionFilter}
                    onChange={e => { setActionFilter(e.target.value); setPage(1) }}
                    className="px-3 py-2 rounded-xl border border-[var(--foreground)]/10 text-xs font-medium focus:border-[var(--primary)] outline-none"
                >
                    <option value="">All Actions</option>
                    <option value="LOGIN_SUCCESS">Logins</option>
                    <option value="ADMIN_CREATED">Admin Created</option>
                    <option value="USER_CREATED">User Created</option>
                    <option value="PASSWORD_CHANGED">Password Changed</option>
                    <option value="SUBSCRIPTION_GRANTED">Subscription Granted</option>
                </select>
            </div>

            {loading ? (
                <div className="p-12 text-center opacity-50 text-xs font-bold uppercase tracking-widest">Loading...</div>
            ) : logs.length === 0 ? (
                <div className="p-12 text-center opacity-30 text-xs font-bold uppercase tracking-widest">No activity logged yet</div>
            ) : (
                <div className="space-y-2">
                    {logs.map(log => (
                        <div key={log.id} className="bg-white rounded-xl border border-[var(--foreground)]/[0.04] p-4 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <span className={`text-[9px] font-bold px-2 py-1 rounded-md ${actionColors[log.action] || 'bg-gray-50 text-gray-500'}`}>
                                    {log.action.replace(/_/g, ' ')}
                                </span>
                                <div>
                                    {log.admin && (
                                        <span className="text-[10px] font-bold text-[var(--foreground)]/60 mr-2">{log.admin.displayName}</span>
                                    )}
                                    {log.entity && (
                                        <span className="text-[10px] text-[var(--foreground)]/30">{log.entity} {log.entityId ? `#${log.entityId.slice(0, 8)}` : ''}</span>
                                    )}
                                </div>
                            </div>
                            <div className="text-[10px] text-[var(--foreground)]/25 flex items-center gap-3">
                                {log.ipAddress && <span>{log.ipAddress}</span>}
                                <span>{new Date(log.createdAt).toLocaleString()}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-3">
                    <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 disabled:opacity-30">
                        <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-[var(--foreground)]/40">{page} / {totalPages}</span>
                    <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 disabled:opacity-30">
                        <ChevronRight className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    )
}
