'use client'

import React, { useEffect, useState } from 'react'
import { Shield, Plus, Edit2, Trash2, Eye, EyeOff, Check, X, UserCog } from 'lucide-react'

const ALL_PERMISSIONS = [
    { group: 'Users', perms: ['users.view', 'users.edit', 'users.delete', 'users.create'] },
    { group: 'Subscriptions', perms: ['subscriptions.view', 'subscriptions.grant', 'subscriptions.manage'] },
    { group: 'Courses', perms: ['courses.view', 'courses.create', 'courses.edit', 'courses.delete'] },
    { group: 'Payments', perms: ['payments.view', 'payments.verify'] },
    { group: 'Leads', perms: ['leads.view', 'leads.message'] },
    { group: 'Analytics', perms: ['analytics.view', 'analytics.export'] },
    { group: 'Automation', perms: ['automation.view', 'automation.manage'] },
    { group: 'Messages', perms: ['messages.send', 'messages.broadcast'] },
    { group: 'Settings', perms: ['settings.view', 'settings.edit'] },
    { group: 'Logs', perms: ['logs.view'] },
]

interface Admin {
    id: string
    username: string
    displayName: string
    email?: string
    role: 'SUPER_ADMIN' | 'ADMIN_ROLE'
    permissions: string[]
    isActive: boolean
    lastLoginAt?: string
    createdAt: string
    _count?: { actionLogs: number }
}

export function AdminManagement() {
    const [admins, setAdmins] = useState<Admin[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)
    const [editAdmin, setEditAdmin] = useState<Admin | null>(null)

    // Create form
    const [form, setForm] = useState({ username: '', password: '', displayName: '', email: '', role: 'ADMIN_ROLE', permissions: [] as string[] })
    const [showPw, setShowPw] = useState(false)
    const [error, setError] = useState('')

    const fetchAdmins = async () => {
        try {
            const res = await fetch('/api/admin/admins')
            const data = await res.json()
            setAdmins(data.admins || [])
        } catch { } finally { setLoading(false) }
    }

    useEffect(() => { fetchAdmins() }, [])

    const handleCreate = async () => {
        setError('')
        if (!form.username || !form.password || !form.displayName) {
            setError('Username, password, and display name required')
            return
        }
        const res = await fetch('/api/admin/admins', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(form)
        })
        const data = await res.json()
        if (data.success) {
            setShowCreate(false)
            setForm({ username: '', password: '', displayName: '', email: '', role: 'ADMIN_ROLE', permissions: [] })
            fetchAdmins()
        } else {
            setError(data.error)
        }
    }

    const handleUpdate = async () => {
        if (!editAdmin) return
        setError('')
        const res = await fetch(`/api/admin/admins/${editAdmin.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                displayName: editAdmin.displayName,
                role: editAdmin.role,
                permissions: editAdmin.permissions,
                isActive: editAdmin.isActive,
            })
        })
        const data = await res.json()
        if (data.success) {
            setEditAdmin(null)
            fetchAdmins()
        } else {
            setError(data.error)
        }
    }

    const handleDeactivate = async (id: string) => {
        if (!confirm('Deactivate this admin?')) return
        await fetch(`/api/admin/admins/${id}`, { method: 'DELETE' })
        fetchAdmins()
    }

    const togglePerm = (perms: string[], perm: string): string[] => {
        return perms.includes(perm) ? perms.filter(p => p !== perm) : [...perms, perm]
    }

    if (loading) return <div className="p-12 text-center opacity-50 text-xs font-bold uppercase tracking-widest">Loading admins...</div>

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <UserCog className="w-5 h-5 text-[var(--primary)]" />
                    <h2 className="text-lg font-bold">Admin Management</h2>
                    <span className="text-[10px] font-bold bg-[var(--primary)]/10 text-[var(--primary)] px-2 py-0.5 rounded-md">{admins.length} admins</span>
                </div>
                <button
                    onClick={() => setShowCreate(true)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary)] text-white rounded-xl text-xs font-bold hover:opacity-90 transition"
                >
                    <Plus className="w-4 h-4" /> Create Admin
                </button>
            </div>

            {/* Admin List */}
            <div className="space-y-3">
                {admins.map(a => (
                    <div key={a.id} className={`bg-white rounded-2xl border border-[var(--foreground)]/[0.04] p-5 shadow-sm ${!a.isActive ? 'opacity-50' : ''}`}>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-sm ${a.role === 'SUPER_ADMIN' ? 'bg-emerald-500' : 'bg-blue-500'}`}>
                                    {a.displayName[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{a.displayName}</div>
                                    <div className="flex items-center gap-2 text-[10px] text-[var(--foreground)]/40">
                                        <span>@{a.username}</span>
                                        <span>·</span>
                                        <span className={`font-bold uppercase tracking-wider ${a.role === 'SUPER_ADMIN' ? 'text-emerald-500' : 'text-blue-500'}`}>
                                            {a.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                                        </span>
                                        {!a.isActive && <span className="text-rose-500 font-bold">· Inactive</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[9px] text-[var(--foreground)]/30 mr-2">
                                    {a._count?.actionLogs || 0} actions · Last: {a.lastLoginAt ? new Date(a.lastLoginAt).toLocaleDateString() : 'never'}
                                </span>
                                <button
                                    onClick={() => setEditAdmin({ ...a })}
                                    className="p-2 rounded-lg hover:bg-[var(--foreground)]/5 transition"
                                >
                                    <Edit2 className="w-4 h-4 text-[var(--foreground)]/40" />
                                </button>
                                {a.role !== 'SUPER_ADMIN' && (
                                    <button
                                        onClick={() => handleDeactivate(a.id)}
                                        className="p-2 rounded-lg hover:bg-rose-50 transition"
                                    >
                                        <Trash2 className="w-4 h-4 text-rose-400" />
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Permissions chips */}
                        {a.role === 'ADMIN_ROLE' && (a.permissions as string[]).length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                                {(a.permissions as string[]).map(p => (
                                    <span key={p} className="text-[8px] font-bold bg-[var(--primary)]/8 text-[var(--primary)] px-2 py-0.5 rounded-md">
                                        {p}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Create / Edit Modal */}
            {(showCreate || editAdmin) && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" onClick={() => { setShowCreate(false); setEditAdmin(null); setError('') }} />
                    <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto mx-4 p-6">
                        <h3 className="text-lg font-bold mb-4">{editAdmin ? 'Edit Admin' : 'Create Admin'}</h3>

                        {error && <div className="mb-4 p-3 rounded-xl bg-rose-50 text-rose-600 text-xs font-medium">{error}</div>}

                        <div className="space-y-3">
                            {!editAdmin && (
                                <>
                                    <input
                                        placeholder="Username"
                                        value={form.username}
                                        onChange={e => setForm({ ...form, username: e.target.value })}
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--foreground)]/10 text-sm focus:border-[var(--primary)] outline-none"
                                    />
                                    <div className="relative">
                                        <input
                                            type={showPw ? 'text' : 'password'}
                                            placeholder="Password"
                                            value={form.password}
                                            onChange={e => setForm({ ...form, password: e.target.value })}
                                            className="w-full px-4 py-3 rounded-xl border border-[var(--foreground)]/10 text-sm focus:border-[var(--primary)] outline-none pr-10"
                                        />
                                        <button onClick={() => setShowPw(!showPw)} className="absolute right-3 top-3 text-[var(--foreground)]/30">
                                            {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </>
                            )}
                            <input
                                placeholder="Display Name"
                                value={editAdmin ? editAdmin.displayName : form.displayName}
                                onChange={e => editAdmin ? setEditAdmin({ ...editAdmin, displayName: e.target.value }) : setForm({ ...form, displayName: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--foreground)]/10 text-sm focus:border-[var(--primary)] outline-none"
                            />

                            {/* Role */}
                            <select
                                value={editAdmin ? editAdmin.role : form.role}
                                onChange={e => editAdmin ? setEditAdmin({ ...editAdmin, role: e.target.value as any }) : setForm({ ...form, role: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-[var(--foreground)]/10 text-sm focus:border-[var(--primary)] outline-none"
                            >
                                <option value="ADMIN_ROLE">Admin</option>
                                <option value="SUPER_ADMIN">Super Admin</option>
                            </select>

                            {/* Permissions */}
                            {(editAdmin ? editAdmin.role : form.role) === 'ADMIN_ROLE' && (
                                <div className="border border-[var(--foreground)]/10 rounded-xl p-4 space-y-3">
                                    <h4 className="text-xs font-bold text-[var(--foreground)]/50 uppercase tracking-wider">Permissions</h4>
                                    {ALL_PERMISSIONS.map(group => (
                                        <div key={group.group}>
                                            <div className="text-[10px] font-bold text-[var(--foreground)]/30 uppercase tracking-wider mb-1">{group.group}</div>
                                            <div className="flex flex-wrap gap-1">
                                                {group.perms.map(p => {
                                                    const active = editAdmin
                                                        ? (editAdmin.permissions as string[]).includes(p)
                                                        : form.permissions.includes(p)
                                                    return (
                                                        <button
                                                            key={p}
                                                            onClick={() => {
                                                                if (editAdmin) {
                                                                    setEditAdmin({ ...editAdmin, permissions: togglePerm(editAdmin.permissions as string[], p) })
                                                                } else {
                                                                    setForm({ ...form, permissions: togglePerm(form.permissions, p) })
                                                                }
                                                            }}
                                                            className={`text-[9px] font-bold px-2 py-1 rounded-md transition ${active
                                                                ? 'bg-[var(--primary)] text-white'
                                                                : 'bg-[var(--foreground)]/5 text-[var(--foreground)]/40 hover:bg-[var(--foreground)]/10'
                                                                }`}
                                                        >
                                                            {p.split('.')[1]}
                                                        </button>
                                                    )
                                                })}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={() => { setShowCreate(false); setEditAdmin(null); setError('') }}
                                className="flex-1 py-3 border border-[var(--foreground)]/10 rounded-xl text-xs font-bold hover:bg-[var(--foreground)]/[0.03] transition"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={editAdmin ? handleUpdate : handleCreate}
                                className="flex-1 py-3 bg-[var(--primary)] text-white rounded-xl text-xs font-bold hover:opacity-90 transition"
                            >
                                {editAdmin ? 'Save Changes' : 'Create Admin'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
