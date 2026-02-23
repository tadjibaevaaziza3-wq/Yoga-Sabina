"use client"

import { useState, useRef } from "react"
import { Camera, User, Heart, Calendar, Shield, Save, CheckCircle, Cookie } from "lucide-react"
import Link from "next/link"

interface UserSettingsProps {
    lang: 'uz' | 'ru'
    userId: string
    avatar: string | null
    name: string | null
    email: string | null
    gender: string | null
    birthDate: string | null
    healthIssues: string[] | null
}

export function UserSettings({ lang, userId, avatar, name, email, gender, birthDate, healthIssues }: UserSettingsProps) {
    const [formData, setFormData] = useState({
        name: name || '',
        gender: gender || '',
        birthDate: birthDate || '',
        healthIssues: (healthIssues || []).join(', '),
    })
    const [avatarPreview, setAvatarPreview] = useState<string | null>(avatar)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const fileRef = useRef<HTMLInputElement>(null)

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onloadend = () => setAvatarPreview(reader.result as string)
        reader.readAsDataURL(file)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const payload: Record<string, unknown> = {
                name: formData.name || undefined,
                gender: formData.gender || undefined,
                birthDate: formData.birthDate || undefined,
                healthIssues: formData.healthIssues ? formData.healthIssues.split(',').map(s => s.trim()).filter(Boolean) : undefined,
            }

            if (avatarPreview && avatarPreview !== avatar) {
                payload.avatar = avatarPreview
            }

            await fetch('/api/user/profile', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            })

            setSaved(true)
            setTimeout(() => setSaved(false), 3000)
        } catch { } finally { setSaving(false) }
    }

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-serif font-black text-[var(--foreground)]">
                    {lang === 'uz' ? 'Sozlamalar' : 'Настройки'}
                </h1>
                <p className="text-xs font-bold text-[var(--primary)]/30 uppercase tracking-widest mt-1">
                    {lang === 'uz' ? "Profilingizni boshqaring" : 'Управляйте профилем'}
                </p>
            </div>

            {/* Avatar Upload */}
            <div className="bg-white rounded-[2rem] p-6 premium-shadow border border-primary/5">
                <h3 className="text-[10px] font-black text-[var(--primary)]/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Camera className="w-4 h-4" />
                    {lang === 'uz' ? "Profil surati" : 'Фото профиля'}
                </h3>
                <div className="flex items-center gap-6">
                    <div className="relative group cursor-pointer" onClick={() => fileRef.current?.click()}>
                        {avatarPreview ? (
                            <img src={avatarPreview} alt="Avatar" className="w-20 h-20 rounded-2xl object-cover" />
                        ) : (
                            <div className="w-20 h-20 bg-[var(--primary)]/5 rounded-2xl flex items-center justify-center">
                                <User className="w-8 h-8 text-[var(--primary)]/20" />
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/30 rounded-2xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div>
                        <p className="text-sm font-bold text-[var(--foreground)]">{name || email}</p>
                        <p className="text-xs text-[var(--foreground)]/40">{email}</p>
                        <button onClick={() => fileRef.current?.click()} className="text-xs text-[var(--accent)] font-bold mt-1 hover:underline">
                            {lang === 'uz' ? "Suratni o'zgartirish" : 'Изменить фото'}
                        </button>
                    </div>
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
                </div>
            </div>

            {/* Personal Info */}
            <div className="bg-white rounded-[2rem] p-6 premium-shadow border border-primary/5">
                <h3 className="text-[10px] font-black text-[var(--primary)]/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <User className="w-4 h-4" />
                    {lang === 'uz' ? "Shaxsiy ma'lumotlar" : 'Личные данные'}
                </h3>
                <div className="space-y-4">
                    <div>
                        <label className="text-[10px] font-black text-[var(--primary)]/40 uppercase tracking-widest mb-1 block">
                            {lang === 'uz' ? 'Ism' : 'Имя'}
                        </label>
                        <input type="text" value={formData.name} onChange={e => setFormData(p => ({ ...p, name: e.target.value }))}
                            className="w-full bg-[var(--background)] border border-[var(--primary)]/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-[var(--primary)]/40 uppercase tracking-widest mb-1 block">
                            {lang === 'uz' ? 'Jins' : 'Пол'}
                        </label>
                        <div className="flex gap-2">
                            {[
                                { value: 'male', label: lang === 'uz' ? 'Erkak' : 'Мужской' },
                                { value: 'female', label: lang === 'uz' ? 'Ayol' : 'Женский' },
                            ].map(opt => (
                                <button key={opt.value} onClick={() => setFormData(p => ({ ...p, gender: opt.value }))}
                                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold transition-all ${formData.gender === opt.value
                                        ? 'bg-[var(--primary)] text-white'
                                        : 'bg-[var(--background)] text-[var(--primary)]/50 border border-[var(--primary)]/10'}`}>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black text-[var(--primary)]/40 uppercase tracking-widest mb-1 block flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {lang === 'uz' ? "Tug'ilgan sana" : 'Дата рождения'}
                        </label>
                        <input type="date" value={formData.birthDate} onChange={e => setFormData(p => ({ ...p, birthDate: e.target.value }))}
                            className="w-full bg-[var(--background)] border border-[var(--primary)]/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20" />
                    </div>
                </div>
            </div>

            {/* Health */}
            <div className="bg-white rounded-[2rem] p-6 premium-shadow border border-primary/5">
                <h3 className="text-[10px] font-black text-[var(--primary)]/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Heart className="w-4 h-4" />
                    {lang === 'uz' ? "Sog'liq holati" : 'Состояние здоровья'}
                </h3>
                <div>
                    <label className="text-[10px] font-black text-[var(--primary)]/40 uppercase tracking-widest mb-1 block">
                        {lang === 'uz' ? "Mavjud muammolar (vergul bilan)" : 'Существующие проблемы (через запятую)'}
                    </label>
                    <textarea value={formData.healthIssues} onChange={e => setFormData(p => ({ ...p, healthIssues: e.target.value }))}
                        placeholder={lang === 'uz' ? "Masalan: bel og'rig'i, tizza muammosi" : "Например: боль в спине, проблемы с коленями"}
                        rows={3}
                        className="w-full bg-[var(--background)] border border-[var(--primary)]/10 rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 resize-none" />
                </div>
            </div>

            {/* Quick Links */}
            <div className="bg-white rounded-[2rem] p-6 premium-shadow border border-primary/5">
                <h3 className="text-[10px] font-black text-[var(--primary)]/30 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    {lang === 'uz' ? "Maxfiylik va xavfsizlik" : 'Конфиденциальность и безопасность'}
                </h3>
                <div className="space-y-2">
                    <Link href={`/${lang}/cookie-settings`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--background)] transition-all">
                        <Cookie className="w-4 h-4 text-[var(--primary)]/30" />
                        <span className="text-sm font-medium text-[var(--foreground)]">{lang === 'uz' ? 'Cookie sozlamalari' : 'Настройки cookie'}</span>
                    </Link>
                    <Link href={`/${lang}/privacy`} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--background)] transition-all">
                        <Shield className="w-4 h-4 text-[var(--primary)]/30" />
                        <span className="text-sm font-medium text-[var(--foreground)]">{lang === 'uz' ? 'Maxfiylik siyosati' : 'Политика конфиденциальности'}</span>
                    </Link>
                </div>
            </div>

            {/* Save Button */}
            <button onClick={handleSave} disabled={saving}
                className="w-full bg-[var(--primary)] text-white py-3.5 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-[var(--primary)]/90 transition-all disabled:opacity-50 shadow-lg shadow-[var(--primary)]/20">
                {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                {saved ? (lang === 'uz' ? 'Saqlandi!' : 'Сохранено!') : saving ? (lang === 'uz' ? 'Saqlanmoqda...' : 'Сохраняем...') : (lang === 'uz' ? 'Saqlash' : 'Сохранить')}
            </button>
        </div>
    )
}
