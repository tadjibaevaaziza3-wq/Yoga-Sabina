'use client'

import React, { useEffect, useState } from 'react'
import { Shield, Clock, Activity, Camera, LogOut, Key, ChevronDown } from 'lucide-react'
import Image from 'next/image'

interface AdminProfile {
    id: string
    username: string
    displayName: string
    email?: string
    avatar?: string
    role: 'SUPER_ADMIN' | 'ADMIN_ROLE'
    lastLoginAt?: string
    createdAt: string
    actionCount?: number
}

export function AdminProfileCard() {
    const [admin, setAdmin] = useState<AdminProfile | null>(null)
    const [dropdownOpen, setDropdownOpen] = useState(false)
    const [changingPassword, setChangingPassword] = useState(false)
    const [currentPw, setCurrentPw] = useState('')
    const [newPw, setNewPw] = useState('')
    const [pwMsg, setPwMsg] = useState('')

    useEffect(() => {
        fetch('/api/admin/profile')
            .then(r => r.json())
            .then(data => {
                if (data && data.id && data.displayName) {
                    setAdmin(data)
                }
            })
            .catch(() => { })
    }, [])

    const handlePasswordChange = async () => {
        setPwMsg('')
        const res = await fetch('/api/admin/profile/password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw })
        })
        const data = await res.json()
        if (data.success) {
            setPwMsg('✓ Password changed')
            setCurrentPw('')
            setNewPw('')
            setTimeout(() => { setChangingPassword(false); setPwMsg('') }, 2000)
        } else {
            setPwMsg(`✗ ${data.error}`)
        }
    }

    if (!admin) return null

    const roleLabel = admin.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'
    const roleColor = admin.role === 'SUPER_ADMIN' ? 'bg-emerald-500' : 'bg-blue-500'

    return (
        <div className="relative">
            {/* Profile Button in Header */}
            <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 rounded-2xl hover:bg-[var(--primary)]/5 transition-all"
            >
                {admin.avatar ? (
                    <Image src={admin.avatar} alt="" width={36} height={36} className="w-9 h-9 rounded-full object-cover ring-2 ring-[var(--primary)]/20" />
                ) : (
                    <div className="w-9 h-9 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-sm">
                        {admin.displayName[0]?.toUpperCase()}
                    </div>
                )}
                <div className="text-left hidden md:block">
                    <div className="text-xs font-bold text-[var(--foreground)]">{admin.displayName}</div>
                    <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${roleColor}`} />
                        <span className="text-[10px] font-bold text-[var(--primary)] uppercase tracking-wider">{roleLabel}</span>
                    </div>
                </div>
                <ChevronDown className={`w-4 h-4 text-[var(--foreground)]/30 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown */}
            {dropdownOpen && (
                <>
                    <div className="fixed inset-0 z-40" onClick={() => setDropdownOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl border border-[var(--foreground)]/[0.06] shadow-xl z-50 overflow-hidden">
                        {/* Profile Header */}
                        <div className="p-5 border-b border-[var(--foreground)]/[0.04]">
                            <div className="flex items-center gap-3 mb-3">
                                <div className="w-12 h-12 rounded-full bg-[var(--primary)] flex items-center justify-center text-white font-bold text-lg">
                                    {admin.displayName[0]?.toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-bold text-sm">{admin.displayName}</div>
                                    <div className="text-[10px] text-[var(--foreground)]/40">@{admin.username}</div>
                                </div>
                            </div>
                            <div className="flex gap-4 text-[10px] text-[var(--foreground)]/40">
                                <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {roleLabel}</span>
                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleDateString() : 'Never'}</span>
                                <span className="flex items-center gap-1"><Activity className="w-3 h-3" /> {admin.actionCount || 0} actions</span>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="p-2">
                            <button
                                onClick={() => { setChangingPassword(!changingPassword); setPwMsg('') }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium hover:bg-[var(--foreground)]/[0.03] transition-colors"
                            >
                                <Key className="w-4 h-4 text-[var(--foreground)]/30" /> Change Password
                            </button>

                            {changingPassword && (
                                <div className="px-4 pb-3 space-y-2">
                                    <input
                                        type="password"
                                        placeholder="Current password"
                                        value={currentPw}
                                        onChange={e => setCurrentPw(e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--foreground)]/10 focus:border-[var(--primary)] outline-none"
                                    />
                                    <input
                                        type="password"
                                        placeholder="New password"
                                        value={newPw}
                                        onChange={e => setNewPw(e.target.value)}
                                        className="w-full px-3 py-2 text-sm rounded-lg border border-[var(--foreground)]/10 focus:border-[var(--primary)] outline-none"
                                    />
                                    <button
                                        onClick={handlePasswordChange}
                                        disabled={!currentPw || !newPw}
                                        className="w-full py-2 bg-[var(--primary)] text-white text-xs font-bold rounded-lg disabled:opacity-40"
                                    >
                                        Update Password
                                    </button>
                                    {pwMsg && <p className={`text-[10px] font-medium ${pwMsg.startsWith('✓') ? 'text-emerald-500' : 'text-rose-500'}`}>{pwMsg}</p>}
                                </div>
                            )}

                            <button
                                onClick={async () => {
                                    await fetch('/api/admin/logout', { method: 'POST' })
                                    window.location.href = '/'
                                }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-rose-500 hover:bg-rose-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" /> Log Out
                            </button>
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}
