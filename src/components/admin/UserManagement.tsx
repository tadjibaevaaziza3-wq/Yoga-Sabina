"use client"

import { useState, useEffect, useCallback } from "react"
import { Search, Plus, Edit, Trash2, Lock, Unlock, Key, ChevronLeft, ChevronRight, X, Eye, EyeOff, UserPlus, Shield } from "lucide-react"

interface User {
    id: string
    userNumber: number
    fullName: string
    firstName: string | null
    lastName: string | null
    email: string | null
    phone: string | null
    telegramUsername: string | null
    role: string
    isBlocked: boolean
    createdAt: string
    registrationSource: string
    activeSubscription: { status: string; startsAt: string; endsAt: string } | null
    totalPurchases: number
    subscriptions: any[]
}

export function UserManagement({ lang = 'uz' }: { lang?: string }) {
    const [users, setUsers] = useState<User[]>([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [search, setSearch] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [subFilter, setSubFilter] = useState("all")
    const [loading, setLoading] = useState(false)
    const [selectedUser, setSelectedUser] = useState<User | null>(null)
    const [modal, setModal] = useState<'edit' | 'create' | 'resetPassword' | 'delete' | null>(null)

    // Form states
    const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '' })
    const [newPassword, setNewPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [actionLoading, setActionLoading] = useState(false)

    const fetchUsers = useCallback(async () => {
        setLoading(true)
        try {
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '20',
                ...(search && { search }),
                ...(statusFilter !== 'all' && { status: statusFilter }),
                ...(subFilter !== 'all' && { subscription: subFilter }),
            })
            const res = await fetch(`/api/admin/users?${params}`)
            const data = await res.json()
            if (data.success) {
                setUsers(data.users)
                setTotal(data.total)
                setTotalPages(data.totalPages)
            }
        } catch (err) {
            console.error('Failed to fetch users:', err)
        } finally {
            setLoading(false)
        }
    }, [page, search, statusFilter, subFilter])

    useEffect(() => { fetchUsers() }, [fetchUsers])

    const handleCreate = async () => {
        if (!form.firstName || !form.password) return
        setActionLoading(true)
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form),
            })
            const data = await res.json()
            if (data.success) {
                setModal(null)
                setForm({ firstName: '', lastName: '', email: '', phone: '', password: '' })
                fetchUsers()
            } else {
                alert(data.error)
            }
        } finally { setActionLoading(false) }
    }

    const handleEdit = async () => {
        if (!selectedUser) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    firstName: form.firstName,
                    lastName: form.lastName,
                    email: form.email,
                    phone: form.phone,
                }),
            })
            const data = await res.json()
            if (data.success) {
                setModal(null)
                fetchUsers()
            } else { alert(data.error) }
        } finally { setActionLoading(false) }
    }

    const handleToggleBlock = async (user: User) => {
        if (!confirm(user.isBlocked
            ? `Unblock ${user.fullName}?`
            : `Block ${user.fullName}? They won't be able to log in.`
        )) return
        try {
            await fetch(`/api/admin/users/${user.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isBlocked: !user.isBlocked }),
            })
            fetchUsers()
        } catch (err) { console.error(err) }
    }

    const handleResetPassword = async () => {
        if (!selectedUser || !newPassword) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword }),
            })
            const data = await res.json()
            if (data.success) {
                setModal(null)
                setNewPassword('')
                alert('Password reset. User will be forced to change it on next login.')
            } else { alert(data.error) }
        } finally { setActionLoading(false) }
    }

    const handleDelete = async () => {
        if (!selectedUser) return
        setActionLoading(true)
        try {
            const res = await fetch(`/api/admin/users/${selectedUser.id}`, { method: 'DELETE' })
            const data = await res.json()
            if (data.success) {
                setModal(null)
                fetchUsers()
            } else { alert(data.error) }
        } finally { setActionLoading(false) }
    }

    const openEdit = (user: User) => {
        setSelectedUser(user)
        setForm({
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            email: user.email || '',
            phone: user.phone || '',
            password: '',
        })
        setModal('edit')
    }

    const formatDate = (d: string) => new Date(d).toLocaleDateString(lang === 'uz' ? 'uz-UZ' : 'ru-RU')

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-[var(--foreground)]">
                        {lang === 'uz' ? "Foydalanuvchilar" : "Пользователи"}
                    </h2>
                    <p className="text-sm text-[var(--foreground)]/50 font-bold">
                        {lang === 'uz' ? `Jami: ${total}` : `Всего: ${total}`}
                    </p>
                </div>
                <button
                    onClick={() => { setForm({ firstName: '', lastName: '', email: '', phone: '', password: '' }); setModal('create') }}
                    className="flex items-center gap-2 px-6 py-3 bg-[var(--primary)] text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[var(--primary)]/90 transition shadow-lg"
                >
                    <UserPlus className="w-4 h-4" />
                    {lang === 'uz' ? "Yangi foydalanuvchi" : "Новый пользователь"}
                </button>
            </div>

            {/* Search & Filters */}
            <div className="flex flex-col md:flex-row gap-3">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--foreground)]/30" />
                    <input
                        value={search}
                        onChange={e => { setSearch(e.target.value); setPage(1) }}
                        placeholder={lang === 'uz' ? "Ism, email, telefon bo'yicha qidirish..." : "Поиск по имени, email, телефону..."}
                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20"
                    />
                </div>
                <select
                    value={statusFilter}
                    onChange={e => { setStatusFilter(e.target.value); setPage(1) }}
                    className="px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-sm font-bold"
                >
                    <option value="all">{lang === 'uz' ? "Barcha holat" : "Все статусы"}</option>
                    <option value="active">{lang === 'uz' ? "Faol" : "Активные"}</option>
                    <option value="blocked">{lang === 'uz' ? "Bloklangan" : "Заблокированные"}</option>
                </select>
                <select
                    value={subFilter}
                    onChange={e => { setSubFilter(e.target.value); setPage(1) }}
                    className="px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card-bg)] text-sm font-bold"
                >
                    <option value="all">{lang === 'uz' ? "Barcha obuna" : "Все подписки"}</option>
                    <option value="active">{lang === 'uz' ? "Faol obuna" : "Активная подписка"}</option>
                    <option value="none">{lang === 'uz' ? "Obunasiz" : "Без подписки"}</option>
                </select>
            </div>

            {/* Users Table */}
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-[var(--secondary)]/30 border-b border-[var(--border)]">
                            <tr>
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">#</th>
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">{lang === 'uz' ? "Ism" : "Имя"}</th>
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">Email / Login</th>
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">{lang === 'uz' ? "Telefon" : "Телефон"}</th>
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">{lang === 'uz' ? "Obuna" : "Подписка"}</th>
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">{lang === 'uz' ? "Ro'yxatdan" : "Регистрация"}</th>
                                <th className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">{lang === 'uz' ? "Holat" : "Статус"}</th>
                                <th className="text-right px-4 py-3 text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">{lang === 'uz' ? "Amallar" : "Действия"}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={8} className="text-center py-12 text-[var(--foreground)]/30 font-bold">
                                    <div className="w-6 h-6 border-2 border-[var(--primary)]/20 border-t-[var(--primary)] rounded-full animate-spin mx-auto" />
                                </td></tr>
                            ) : users.length === 0 ? (
                                <tr><td colSpan={8} className="text-center py-12 text-[var(--foreground)]/30 font-bold">
                                    {lang === 'uz' ? "Foydalanuvchilar topilmadi" : "Пользователи не найдены"}
                                </td></tr>
                            ) : users.map(user => (
                                <tr key={user.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--secondary)]/10 transition">
                                    <td className="px-4 py-3 text-xs text-[var(--foreground)]/40 font-mono">{user.userNumber}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-[var(--foreground)]">{user.fullName}</div>
                                        {user.telegramUsername && <div className="text-xs text-blue-500">@{user.telegramUsername}</div>}
                                    </td>
                                    <td className="px-4 py-3 text-[var(--foreground)]/70">{user.email || '—'}</td>
                                    <td className="px-4 py-3 text-[var(--foreground)]/70">{user.phone || '—'}</td>
                                    <td className="px-4 py-3">
                                        {user.activeSubscription ? (
                                            <div>
                                                <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase">
                                                    {lang === 'uz' ? "Faol" : "Активна"}
                                                </span>
                                                <div className="text-[10px] text-[var(--foreground)]/40 mt-1">
                                                    {formatDate(user.activeSubscription.startsAt)} — {formatDate(user.activeSubscription.endsAt)}
                                                </div>
                                            </div>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-gray-100 text-gray-500 text-[10px] font-black uppercase">
                                                {lang === 'uz' ? "Yo'q" : "Нет"}
                                            </span>
                                        )}
                                        {user.totalPurchases > 0 && (
                                            <div className="text-[10px] text-[var(--foreground)]/30 mt-1">
                                                {user.totalPurchases}x {lang === 'uz' ? "xarid" : "покупок"}
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-xs text-[var(--foreground)]/50">{formatDate(user.createdAt)}</td>
                                    <td className="px-4 py-3">
                                        {user.isBlocked ? (
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-red-100 text-red-600 text-[10px] font-black uppercase">
                                                <Lock className="w-3 h-3 mr-1" />{lang === 'uz' ? "Bloklangan" : "Заблокирован"}
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">
                                                {lang === 'uz' ? "Faol" : "Активен"}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => openEdit(user)} title="Edit" className="p-2 rounded-lg hover:bg-[var(--secondary)] transition">
                                                <Edit className="w-4 h-4 text-[var(--foreground)]/40" />
                                            </button>
                                            <button onClick={() => { setSelectedUser(user); setNewPassword(''); setModal('resetPassword') }} title="Reset password" className="p-2 rounded-lg hover:bg-[var(--secondary)] transition">
                                                <Key className="w-4 h-4 text-amber-500" />
                                            </button>
                                            <button onClick={() => handleToggleBlock(user)} title={user.isBlocked ? "Unblock" : "Block"} className="p-2 rounded-lg hover:bg-[var(--secondary)] transition">
                                                {user.isBlocked ? <Unlock className="w-4 h-4 text-emerald-500" /> : <Lock className="w-4 h-4 text-red-400" />}
                                            </button>
                                            <button onClick={() => { setSelectedUser(user); setModal('delete') }} title="Delete" className="p-2 rounded-lg hover:bg-red-50 transition">
                                                <Trash2 className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="flex items-center justify-between px-4 py-3 border-t border-[var(--border)]">
                        <div className="text-xs text-[var(--foreground)]/40 font-bold">
                            {lang === 'uz' ? `Sahifa ${page} / ${totalPages}` : `Страница ${page} / ${totalPages}`}
                        </div>
                        <div className="flex items-center gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)} className="p-2 rounded-lg hover:bg-[var(--secondary)] transition disabled:opacity-30">
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button disabled={page >= totalPages} onClick={() => setPage(p => p + 1)} className="p-2 rounded-lg hover:bg-[var(--secondary)] transition disabled:opacity-30">
                                <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* === MODALS === */}
            {modal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => setModal(null)}>
                    <div className="bg-[var(--card-bg)] rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5" onClick={e => e.stopPropagation()}>

                        {/* Create / Edit User */}
                        {(modal === 'create' || modal === 'edit') && (
                            <>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-[var(--foreground)]">
                                        {modal === 'create'
                                            ? (lang === 'uz' ? "Yangi foydalanuvchi" : "Новый пользователь")
                                            : (lang === 'uz' ? "Tahrirlash" : "Редактирование")}
                                    </h3>
                                    <button onClick={() => setModal(null)} className="p-2 hover:bg-[var(--secondary)] rounded-lg transition"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">{lang === 'uz' ? "Ism" : "Имя"} *</label>
                                        <input value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">{lang === 'uz' ? "Familiya" : "Фамилия"}</label>
                                        <input value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">Email</label>
                                    <input value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">{lang === 'uz' ? "Telefon" : "Телефон"}</label>
                                    <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+998"
                                        className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
                                </div>
                                {modal === 'create' && (
                                    <div className="space-y-1">
                                        <label className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">{lang === 'uz' ? "Parol" : "Пароль"} *</label>
                                        <div className="relative">
                                            <input value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                                                type={showPassword ? "text" : "password"} placeholder="******"
                                                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 pr-12" />
                                            <button type="button" onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/30 hover:text-[var(--foreground)] transition">
                                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                            </button>
                                        </div>
                                    </div>
                                )}
                                <button onClick={modal === 'create' ? handleCreate : handleEdit} disabled={actionLoading}
                                    className="w-full py-3 bg-[var(--primary)] text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-[var(--primary)]/90 transition disabled:opacity-50">
                                    {actionLoading ? '...' : (modal === 'create' ? (lang === 'uz' ? "Yaratish" : "Создать") : (lang === 'uz' ? "Saqlash" : "Сохранить"))}
                                </button>
                            </>
                        )}

                        {/* Reset Password */}
                        {modal === 'resetPassword' && selectedUser && (
                            <>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-[var(--foreground)]">
                                        <Key className="w-5 h-5 inline mr-2 text-amber-500" />
                                        {lang === 'uz' ? "Parolni tiklash" : "Сброс пароля"}
                                    </h3>
                                    <button onClick={() => setModal(null)} className="p-2 hover:bg-[var(--secondary)] rounded-lg transition"><X className="w-5 h-5" /></button>
                                </div>
                                <p className="text-sm text-[var(--foreground)]/60">
                                    {lang === 'uz'
                                        ? `${selectedUser.fullName} uchun yangi parol o'rnating. Foydalanuvchi keyingi kirishda parolni o'zgartirishi shart bo'ladi.`
                                        : `Установите новый пароль для ${selectedUser.fullName}. Пользователь будет обязан сменить пароль при следующем входе.`}
                                </p>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-wider text-[var(--foreground)]/40">{lang === 'uz' ? "Yangi parol" : "Новый пароль"}</label>
                                    <div className="relative">
                                        <input value={newPassword} onChange={e => setNewPassword(e.target.value)}
                                            type={showPassword ? "text" : "password"} placeholder="******" minLength={6}
                                            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 pr-12" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--foreground)]/30 hover:text-[var(--foreground)] transition">
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 text-amber-700 text-xs font-bold">
                                    <Shield className="w-4 h-4 flex-shrink-0" />
                                    {lang === 'uz' ? "Parol shifrlangan holda saqlanadi" : "Пароль хранится в зашифрованном виде"}
                                </div>
                                <button onClick={handleResetPassword} disabled={actionLoading || newPassword.length < 6}
                                    className="w-full py-3 bg-amber-500 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-amber-600 transition disabled:opacity-50">
                                    {actionLoading ? '...' : (lang === 'uz' ? "Parolni tiklash" : "Сбросить пароль")}
                                </button>
                            </>
                        )}

                        {/* Delete Confirmation */}
                        {modal === 'delete' && selectedUser && (
                            <>
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-black text-red-600">
                                        <Trash2 className="w-5 h-5 inline mr-2" />
                                        {lang === 'uz' ? "Foydalanuvchini o'chirish" : "Удаление пользователя"}
                                    </h3>
                                    <button onClick={() => setModal(null)} className="p-2 hover:bg-[var(--secondary)] rounded-lg transition"><X className="w-5 h-5" /></button>
                                </div>
                                <div className="p-4 rounded-xl bg-red-50 border border-red-200">
                                    <p className="text-sm text-red-700 font-bold mb-2">
                                        {lang === 'uz'
                                            ? `Haqiqatan ham ${selectedUser.fullName} ni o'chirmoqchimisiz?`
                                            : `Вы уверены, что хотите удалить ${selectedUser.fullName}?`}
                                    </p>
                                    <p className="text-xs text-red-500">
                                        {lang === 'uz' ? "Bu amalni qaytarib bo'lmaydi. Barcha ma'lumotlar o'chiriladi." : "Это действие необратимо. Все данные будут удалены."}
                                    </p>
                                </div>
                                <div className="flex gap-3">
                                    <button onClick={() => setModal(null)} className="flex-1 py-3 border border-[var(--border)] rounded-xl text-xs font-black uppercase tracking-wider hover:bg-[var(--secondary)] transition">
                                        {lang === 'uz' ? "Bekor qilish" : "Отмена"}
                                    </button>
                                    <button onClick={handleDelete} disabled={actionLoading}
                                        className="flex-1 py-3 bg-red-500 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-red-600 transition disabled:opacity-50">
                                        {actionLoading ? '...' : (lang === 'uz' ? "O'chirish" : "Удалить")}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
