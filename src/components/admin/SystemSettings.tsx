"use client"

import { useState, useEffect } from "react"
import { Input } from "@/components/ui/Input"
import { Save, AlertCircle, CheckCircle2 } from "lucide-react"
import FileUpload from "./FileUpload"

export function SystemSettings() {
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
    const [credentials, setCredentials] = useState({
        IS_CONSULTATION_ENABLED: 'true',
        PAYME_MERCHANT_ID: '',
        PAYME_SECRET_KEY: '',
        CLICK_MERCHANT_ID: '',
        CLICK_SERVICE_ID: '',
        CLICK_SECRET_KEY: '',
        MANUAL_CARD_NUMBER: '',
        MANUAL_CARD_OWNER: '',
        FRONTEND_HERO_PHOTO: '',
        FRONTEND_TRAINER_PHOTO: '',
        FRONTEND_MAIN_VIDEO: '',
        FRONTEND_VIDEO_BANNER: '',
        FRONTEND_PROGRAMS_ONLINE_BG: '',
        FRONTEND_PROGRAMS_OFFLINE_BG: '',
        FRONTEND_PROGRAMS_CONSULTATION_BG: '',
        FRONTEND_INSTA_1: '',
        FRONTEND_INSTA_2: '',
        FRONTEND_INSTA_3: '',
        FRONTEND_INSTA_4: '',
        BANNER_ABOUT_US: '',
        BANNER_ONLINE_COURSES: '',
        BANNER_OFFLINE_COURSES: '',
        BANNER_ALL_COURSES: '',
        BANNER_CONSULTATIONS: '',
        BANNER_TMA_DASHBOARD: '',
        // TMA Content
        TMA_INTRO_LOGO: '',
        TMA_INTRO_VIDEO: '',
        TMA_INTRO_TRAINER_NAME: '',
        TMA_INTRO_TITLE_UZ: '',
        TMA_INTRO_TITLE_RU: '',
        TMA_INTRO_SUBTITLE_UZ: '',
        TMA_INTRO_SUBTITLE_RU: '',
        TMA_INTRO_BIO_UZ: '',
        TMA_INTRO_BIO_RU: '',
        TMA_INTRO_MEMBERS_COUNT: '',
        TMA_INTRO_VIDEO_LABEL_UZ: '',
        TMA_INTRO_VIDEO_LABEL_RU: '',
        TMA_DASHBOARD_ONLINE_IMAGE: '',
        TMA_DASHBOARD_OFFLINE_IMAGE: '',
        TMA_DASHBOARD_BADGE_TEXT: '',
        TMA_CONTACT_TELEGRAM: '',
    })

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                const data = await res.json();
                if (data.success && data.settings) {
                    setCredentials(prev => {
                        const s = data.settings;
                        const merged: any = { ...prev };
                        Object.keys(prev).forEach(k => {
                            if (s[k] !== undefined) merged[k] = s[k];
                        });
                        return merged;
                    });
                }
            } catch (error) {
                console.error("Settings error:", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSave = async (key: string, value: string) => {
        setLoading(true);
        setMessage(null);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key, value, isSecret: key.includes('SECRET') })
            });
            const data = await res.json();
            if (data.success) {
                setMessage({ type: 'success', text: `${key} muvaffaqiyatli saqlandi.` });
            } else {
                setMessage({ type: 'error', text: data.error });
            }
        } catch (e: any) {
            setMessage({ type: 'error', text: e.message });
        } finally {
            setLoading(false);
            setTimeout(() => setMessage(null), 3000);
        }
    }

    const renderUploadBlock = (key: keyof typeof credentials, label: string) => (
        <div className="space-y-2 p-6 bg-white rounded-2xl border border-[var(--border)] flex flex-col justify-between">
            <div>
                <label className="text-sm font-bold opacity-70 uppercase tracking-widest block mb-4">{label}</label>
                {credentials[key] && (
                    <div className="mb-4 aspect-video relative rounded-xl overflow-hidden border border-[var(--border)] max-w-[200px]">
                        {String(credentials[key]).match(/\.(mp4|mov|webm)$/i) ? (
                            <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                                <span className="text-xs text-[var(--primary)] font-bold">Video Saqlangan</span>
                            </div>
                        ) : (
                            <img src={credentials[key] as string} alt={label} className="object-cover w-full h-full" />
                        )}
                    </div>
                )}
            </div>
            <div className="flex flex-col gap-3 mt-4">
                <FileUpload
                    path="settings/media"
                    onUploadComplete={(fileName, url) => {
                        setCredentials(prev => ({ ...prev, [key]: url }));
                    }}
                    label={String(credentials[key]).match(/\.(mp4|mov|webm)$/i) ? "Yangi videoni tanlang..." : "Yangi rasmni tanlang..."}
                    accept="image/*,video/*"
                />
                <button
                    disabled={loading || !credentials[key]}
                    onClick={() => handleSave(key, String(credentials[key]))}
                    className="bg-[var(--primary)] text-white w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold disabled:opacity-50"
                >
                    <Save className="w-4 h-4" /> Saqlash
                </button>
            </div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-7xl mx-auto text-left">
            <h3 className="text-2xl font-editorial font-bold text-[var(--primary)] border-b border-[var(--border)] pb-4">Umumiy Sozlamalar (General)</h3>
            <div className="space-y-6">
                <div className="space-y-2 p-6 bg-white rounded-2xl border border-[var(--border)]">
                    <div className="flex items-center justify-between">
                        <div>
                            <label className="text-sm font-bold opacity-70 uppercase tracking-widest block mb-1">Konsultatsiyalarni Yoqish / O'chirish</label>
                            <p className="text-xs text-gray-500">Saytda, TMA da va Foydalanuvchi panelida konsultatsiya bo'limini ko'rsatish/yashirish.</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <select
                                value={credentials.IS_CONSULTATION_ENABLED}
                                onChange={(e) => setCredentials(prev => ({ ...prev, IS_CONSULTATION_ENABLED: e.target.value }))}
                                className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[var(--primary)] focus:border-[var(--primary)] block p-2.5 font-bold"
                            >
                                <option value="true">Yoqilgan (Ko'rinadi)</option>
                                <option value="false">O'chirilgan (Yashirin)</option>
                            </select>
                            <button
                                disabled={loading}
                                onClick={() => handleSave('IS_CONSULTATION_ENABLED', credentials.IS_CONSULTATION_ENABLED)}
                                className="bg-[var(--primary)] text-white px-6 py-2.5 rounded-xl flex items-center gap-2 font-bold disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" /> Saqlash
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-editorial font-bold text-[var(--primary)] border-b border-[var(--border)] pb-4 mt-12">To'lov Tizimi Sozlamalari (PayMe)</h3>

            {message && (
                <div className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold ${message.type === 'error' ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600'}`}>
                    {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle2 className="w-5 h-5" />}
                    {message.text}
                </div>
            )}

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold opacity-70 uppercase tracking-widest pl-4">PayMe Merchant ID</label>
                    <div className="flex gap-4">
                        <Input
                            value={credentials.PAYME_MERCHANT_ID}
                            onChange={(e) => setCredentials(prev => ({ ...prev, PAYME_MERCHANT_ID: e.target.value }))}
                            className="flex-1 bg-white"
                            placeholder="M-1234..."
                        />
                        <button
                            disabled={loading}
                            onClick={() => handleSave('PAYME_MERCHANT_ID', credentials.PAYME_MERCHANT_ID)}
                            className="bg-[var(--primary)] text-white px-6 rounded-2xl flex items-center gap-2 font-bold disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> Saqlash
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold opacity-70 uppercase tracking-widest pl-4">PayMe Secret Key</label>
                    <div className="flex gap-4">
                        <Input
                            type="password"
                            value={credentials.PAYME_SECRET_KEY}
                            onChange={(e) => setCredentials(prev => ({ ...prev, PAYME_SECRET_KEY: e.target.value }))}
                            className="flex-1 bg-white"
                            placeholder="S-1234..."
                        />
                        <button
                            disabled={loading}
                            onClick={() => handleSave('PAYME_SECRET_KEY', credentials.PAYME_SECRET_KEY)}
                            className="bg-[var(--primary)] text-white px-6 rounded-2xl flex items-center gap-2 font-bold disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> Saqlash
                        </button>
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-editorial font-bold text-[var(--primary)] border-b border-[var(--border)] pb-4 mt-12">Click Tizimi Sozlamalari</h3>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold opacity-70 uppercase tracking-widest pl-4">Click Merchant ID</label>
                    <div className="flex gap-4">
                        <Input
                            value={credentials.CLICK_MERCHANT_ID}
                            onChange={(e) => setCredentials(prev => ({ ...prev, CLICK_MERCHANT_ID: e.target.value }))}
                            className="flex-1 bg-white"
                            placeholder="Masalan: 12345"
                        />
                        <button
                            disabled={loading}
                            onClick={() => handleSave('CLICK_MERCHANT_ID', credentials.CLICK_MERCHANT_ID)}
                            className="bg-[var(--primary)] text-white px-6 rounded-2xl flex items-center gap-2 font-bold disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> Saqlash
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold opacity-70 uppercase tracking-widest pl-4">Click Service ID</label>
                    <div className="flex gap-4">
                        <Input
                            value={credentials.CLICK_SERVICE_ID}
                            onChange={(e) => setCredentials(prev => ({ ...prev, CLICK_SERVICE_ID: e.target.value }))}
                            className="flex-1 bg-white"
                            placeholder="Masalan: 12345"
                        />
                        <button
                            disabled={loading}
                            onClick={() => handleSave('CLICK_SERVICE_ID', credentials.CLICK_SERVICE_ID)}
                            className="bg-[var(--primary)] text-white px-6 rounded-2xl flex items-center gap-2 font-bold disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> Saqlash
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold opacity-70 uppercase tracking-widest pl-4">Click Secret Key</label>
                    <div className="flex gap-4">
                        <Input
                            type="password"
                            value={credentials.CLICK_SECRET_KEY}
                            onChange={(e) => setCredentials(prev => ({ ...prev, CLICK_SECRET_KEY: e.target.value }))}
                            className="flex-1 bg-white"
                            placeholder="Secret kiritng..."
                        />
                        <button
                            disabled={loading}
                            onClick={() => handleSave('CLICK_SECRET_KEY', credentials.CLICK_SECRET_KEY)}
                            className="bg-[var(--primary)] text-white px-6 rounded-2xl flex items-center gap-2 font-bold disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> Saqlash
                        </button>
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-editorial font-bold text-[var(--primary)] border-b border-[var(--border)] pb-4 mt-12">Qo'lda O'tkazma Sozlamalari (Manual)</h3>

            <div className="space-y-6">
                <div className="space-y-2">
                    <label className="text-sm font-bold opacity-70 uppercase tracking-widest pl-4">Plastik Karta Raqami</label>
                    <div className="flex gap-4">
                        <Input
                            value={credentials.MANUAL_CARD_NUMBER}
                            onChange={(e) => setCredentials(prev => ({ ...prev, MANUAL_CARD_NUMBER: e.target.value }))}
                            className="flex-1 bg-white font-mono"
                            placeholder="8600 1234 5678 9012"
                        />
                        <button
                            disabled={loading}
                            onClick={() => handleSave('MANUAL_CARD_NUMBER', credentials.MANUAL_CARD_NUMBER)}
                            className="bg-[var(--primary)] text-white px-6 rounded-2xl flex items-center gap-2 font-bold disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> Saqlash
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold opacity-70 uppercase tracking-widest pl-4">Karta Egasi / F.I.SH</label>
                    <div className="flex gap-4">
                        <Input
                            value={credentials.MANUAL_CARD_OWNER}
                            onChange={(e) => setCredentials(prev => ({ ...prev, MANUAL_CARD_OWNER: e.target.value }))}
                            className="flex-1 bg-white"
                            placeholder="SABINA POLATOVA"
                        />
                        <button
                            disabled={loading}
                            onClick={() => handleSave('MANUAL_CARD_OWNER', credentials.MANUAL_CARD_OWNER)}
                            className="bg-[var(--primary)] text-white px-6 rounded-2xl flex items-center gap-2 font-bold disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> Saqlash
                        </button>
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-editorial font-bold text-[var(--primary)] border-b border-[var(--border)] pb-4 mt-12">Sayt Media Sozlamalari (Frontend Assets)</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 p-6 bg-white rounded-2xl border border-[var(--border)] flex flex-col justify-between">
                    <div>
                        <label className="text-sm font-bold opacity-70 uppercase tracking-widest block mb-4">Ilova Qahramoni (Hero Photo)</label>
                        {credentials.FRONTEND_HERO_PHOTO && (
                            <div className="mb-4 aspect-[4/5] relative rounded-xl overflow-hidden border border-[var(--border)] max-w-[200px]">
                                <img src={credentials.FRONTEND_HERO_PHOTO} alt="Hero" className="object-cover w-full h-full" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-3 mt-4">
                        <FileUpload
                            path="settings/media"
                            onUploadComplete={(fileName, url) => {
                                setCredentials(prev => ({ ...prev, FRONTEND_HERO_PHOTO: url }));
                            }}
                            label="Yangi rasmni tanlang..."
                            accept="image/*"
                        />
                        <button
                            disabled={loading || !credentials.FRONTEND_HERO_PHOTO}
                            onClick={() => handleSave('FRONTEND_HERO_PHOTO', credentials.FRONTEND_HERO_PHOTO)}
                            className="bg-[var(--primary)] text-white w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> Saqlash
                        </button>
                    </div>
                </div>

                <div className="space-y-2 p-6 bg-white rounded-2xl border border-[var(--border)] flex flex-col justify-between">
                    <div>
                        <label className="text-sm font-bold opacity-70 uppercase tracking-widest block mb-4">Trener Rasmi (Trainer Photo)</label>
                        {credentials.FRONTEND_TRAINER_PHOTO && (
                            <div className="mb-4 aspect-[3/4] relative rounded-xl overflow-hidden border border-[var(--border)] max-w-[200px]">
                                <img src={credentials.FRONTEND_TRAINER_PHOTO} alt="Trainer" className="object-cover w-full h-full" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-3 mt-4">
                        <FileUpload
                            path="settings/media"
                            onUploadComplete={(fileName, url) => {
                                setCredentials(prev => ({ ...prev, FRONTEND_TRAINER_PHOTO: url }));
                            }}
                            label="Yangi rasmni tanlang..."
                            accept="image/*"
                        />
                        <button
                            disabled={loading || !credentials.FRONTEND_TRAINER_PHOTO}
                            onClick={() => handleSave('FRONTEND_TRAINER_PHOTO', credentials.FRONTEND_TRAINER_PHOTO)}
                            className="bg-[var(--primary)] text-white w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> Saqlash
                        </button>
                    </div>
                </div>

                <div className="space-y-2 p-6 bg-white rounded-2xl border border-[var(--border)] flex flex-col justify-between">
                    <div>
                        <label className="text-sm font-bold opacity-70 uppercase tracking-widest block mb-4">Asosiy Video (Main Video)</label>
                        {credentials.FRONTEND_MAIN_VIDEO && (
                            <div className="mb-4 text-sm text-[var(--primary)]/70 bg-gray-50 p-4 rounded-xl flex items-center justify-center gap-2 truncate border border-[var(--border)] font-bold">
                                Video Saqlangan (mavjud)
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-3 mt-4">
                        <FileUpload
                            path="settings/media"
                            onUploadComplete={(fileName, url) => {
                                setCredentials(prev => ({ ...prev, FRONTEND_MAIN_VIDEO: url }));
                            }}
                            label="Yangi videoni tanlang..."
                            accept="video/*"
                        />
                        <button
                            disabled={loading || !credentials.FRONTEND_MAIN_VIDEO}
                            onClick={() => handleSave('FRONTEND_MAIN_VIDEO', credentials.FRONTEND_MAIN_VIDEO)}
                            className="bg-[var(--primary)] text-white w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> Saqlash
                        </button>
                    </div>
                </div>

                <div className="space-y-2 p-6 bg-white rounded-2xl border border-[var(--border)] flex flex-col justify-between">
                    <div>
                        <label className="text-sm font-bold opacity-70 uppercase tracking-widest block mb-4">Video Orqa Foni (Video Banner)</label>
                        {credentials.FRONTEND_VIDEO_BANNER && (
                            <div className="mb-4 aspect-video relative rounded-xl overflow-hidden border border-[var(--border)] max-w-[200px]">
                                <img src={credentials.FRONTEND_VIDEO_BANNER} alt="Banner" className="object-cover w-full h-full" />
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col gap-3 mt-4">
                        <FileUpload
                            path="settings/media"
                            onUploadComplete={(fileName, url) => {
                                setCredentials(prev => ({ ...prev, FRONTEND_VIDEO_BANNER: url }));
                            }}
                            label="Yangi rasmni tanlang..."
                            accept="image/*"
                        />
                        <button
                            disabled={loading || !credentials.FRONTEND_VIDEO_BANNER}
                            onClick={() => handleSave('FRONTEND_VIDEO_BANNER', credentials.FRONTEND_VIDEO_BANNER)}
                            className="bg-[var(--primary)] text-white w-full py-3 rounded-xl flex items-center justify-center gap-2 font-bold disabled:opacity-50"
                        >
                            <Save className="w-4 h-4" /> Saqlash
                        </button>
                    </div>
                </div>
            </div>

            <h3 className="text-2xl font-editorial font-bold text-[var(--primary)] border-b border-[var(--border)] pb-4 mt-12">Ichki Sahifa Bannerlari (Banners)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {renderUploadBlock('BANNER_ABOUT_US', 'Biz Haqimizda (About Us)')}
                {renderUploadBlock('BANNER_ONLINE_COURSES', 'Online Kurslar')}
                {renderUploadBlock('BANNER_OFFLINE_COURSES', 'Offline Kurslar')}
                {renderUploadBlock('BANNER_ALL_COURSES', 'Barcha Kurslar')}
                {renderUploadBlock('BANNER_CONSULTATIONS', 'Konsultatsiyalar')}
                {renderUploadBlock('BANNER_TMA_DASHBOARD', 'TMA Dashboard (Mini App)')}
            </div>

            <h3 className="text-2xl font-editorial font-bold text-[var(--primary)] border-b border-[var(--border)] pb-4 mt-12">Boshqa Asosiy Sahifa Rasmlari (Main Page)</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {renderUploadBlock('FRONTEND_PROGRAMS_ONLINE_BG', 'Online Kurslar Foni')}
                {renderUploadBlock('FRONTEND_PROGRAMS_OFFLINE_BG', 'Offline Kurslar Foni')}
                {renderUploadBlock('FRONTEND_PROGRAMS_CONSULTATION_BG', 'Konsultatsiya Foni (Asosiy sahifa)')}
                {renderUploadBlock('FRONTEND_INSTA_1', 'Instagram Post 1')}
                {renderUploadBlock('FRONTEND_INSTA_2', 'Instagram Post 2')}
                {renderUploadBlock('FRONTEND_INSTA_3', 'Instagram Post 3')}
                {renderUploadBlock('FRONTEND_INSTA_4', 'Instagram Post 4')}
            </div>

            <h3 className="text-2xl font-editorial font-bold text-[var(--primary)] border-b border-[var(--border)] pb-4 mt-12">📱 TMA Kontent Sozlamalari (Mini App)</h3>

            {/* TMA Images & Video */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {renderUploadBlock('TMA_INTRO_LOGO', 'TMA Intro Logo')}
                {renderUploadBlock('TMA_INTRO_VIDEO', 'TMA Intro Video')}
                {renderUploadBlock('TMA_DASHBOARD_ONLINE_IMAGE', 'TMA Online Kurslar Rasmi')}
                {renderUploadBlock('TMA_DASHBOARD_OFFLINE_IMAGE', 'TMA Offline Kurslar Rasmi')}
                {renderUploadBlock('BANNER_TMA_DASHBOARD', 'TMA Dashboard Banner')}
            </div>

            {/* TMA Text Settings */}
            <h4 className="text-lg font-bold text-[var(--primary)] mt-8">📝 TMA Matnlari (Texts)</h4>
            <div className="space-y-4">
                {[
                    { key: 'TMA_INTRO_TRAINER_NAME', label: 'Trener Ismi (masalan: SABINA POLATOVA)', placeholder: 'SABINA POLATOVA' },
                    { key: 'TMA_INTRO_MEMBERS_COUNT', label: 'A\'zolar soni (masalan: 500+)', placeholder: '500+' },
                    { key: 'TMA_DASHBOARD_BADGE_TEXT', label: 'Dashboard Badge Matni', placeholder: '✦ Premium Yoga Platform' },
                    { key: 'TMA_CONTACT_TELEGRAM', label: 'Telegram Username (masalan: @sabina_polatova)', placeholder: '@sabina_polatova' },
                ].map(({ key, label, placeholder }) => (
                    <div key={key} className="space-y-2">
                        <label className="text-sm font-bold opacity-70 uppercase tracking-widest pl-4">{label}</label>
                        <div className="flex gap-4">
                            <Input
                                value={(credentials as any)[key] || ''}
                                onChange={(e) => setCredentials(prev => ({ ...prev, [key]: e.target.value }))}
                                className="flex-1 bg-white"
                                placeholder={placeholder}
                            />
                            <button
                                disabled={loading}
                                onClick={() => handleSave(key, (credentials as any)[key])}
                                className="bg-[var(--primary)] text-white px-6 rounded-2xl flex items-center gap-2 font-bold disabled:opacity-50"
                            >
                                <Save className="w-4 h-4" /> Saqlash
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* TMA Translatable Texts (UZ/RU) */}
            <h4 className="text-lg font-bold text-[var(--primary)] mt-8">🌐 TMA Tarjimalar (UZ / RU)</h4>
            <div className="space-y-6">
                {[
                    { uzKey: 'TMA_INTRO_TITLE_UZ', ruKey: 'TMA_INTRO_TITLE_RU', label: 'Sarlavha (Title)', uzPlaceholder: 'Baxtli Men', ruPlaceholder: 'Baxtli Men' },
                    { uzKey: 'TMA_INTRO_SUBTITLE_UZ', ruKey: 'TMA_INTRO_SUBTITLE_RU', label: 'Taglavha (Subtitle)', uzPlaceholder: 'Sog\'lomlik va ichki muvozanat', ruPlaceholder: 'Здоровье и внутренний баланс' },
                    { uzKey: 'TMA_INTRO_BIO_UZ', ruKey: 'TMA_INTRO_BIO_RU', label: 'Trener haqida (Bio)', uzPlaceholder: 'Sabina Polatova — 7 yillik tajriba...', ruPlaceholder: 'Сабина Полатова — сертифицированный...' },
                    { uzKey: 'TMA_INTRO_VIDEO_LABEL_UZ', ruKey: 'TMA_INTRO_VIDEO_LABEL_RU', label: 'Video ustidagi matn', uzPlaceholder: 'Metodim bilan tanishing', ruPlaceholder: 'Познакомьтесь с методом' },
                ].map(({ uzKey, ruKey, label, uzPlaceholder, ruPlaceholder }) => (
                    <div key={uzKey} className="p-6 bg-white rounded-2xl border border-[var(--border)] space-y-4">
                        <label className="text-sm font-bold opacity-70 uppercase tracking-widest block">{label}</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-[var(--primary)]/50">🇺🇿 O'zbek</span>
                                <div className="flex gap-2">
                                    {uzKey.includes('BIO') ? (
                                        <textarea
                                            value={(credentials as any)[uzKey] || ''}
                                            onChange={(e) => setCredentials(prev => ({ ...prev, [uzKey]: e.target.value }))}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm min-h-[80px] outline-none focus:border-[var(--primary)]/50"
                                            placeholder={uzPlaceholder}
                                        />
                                    ) : (
                                        <Input
                                            value={(credentials as any)[uzKey] || ''}
                                            onChange={(e) => setCredentials(prev => ({ ...prev, [uzKey]: e.target.value }))}
                                            className="flex-1 bg-gray-50"
                                            placeholder={uzPlaceholder}
                                        />
                                    )}
                                    <button
                                        disabled={loading}
                                        onClick={() => handleSave(uzKey, (credentials as any)[uzKey])}
                                        className="bg-[var(--primary)] text-white px-4 rounded-xl flex items-center gap-1 font-bold disabled:opacity-50 text-xs"
                                    >
                                        <Save className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <span className="text-xs font-bold text-[var(--primary)]/50">🇷🇺 Русский</span>
                                <div className="flex gap-2">
                                    {ruKey.includes('BIO') ? (
                                        <textarea
                                            value={(credentials as any)[ruKey] || ''}
                                            onChange={(e) => setCredentials(prev => ({ ...prev, [ruKey]: e.target.value }))}
                                            className="flex-1 bg-gray-50 border border-gray-200 rounded-xl p-3 text-sm min-h-[80px] outline-none focus:border-[var(--primary)]/50"
                                            placeholder={ruPlaceholder}
                                        />
                                    ) : (
                                        <Input
                                            value={(credentials as any)[ruKey] || ''}
                                            onChange={(e) => setCredentials(prev => ({ ...prev, [ruKey]: e.target.value }))}
                                            className="flex-1 bg-gray-50"
                                            placeholder={ruPlaceholder}
                                        />
                                    )}
                                    <button
                                        disabled={loading}
                                        onClick={() => handleSave(ruKey, (credentials as any)[ruKey])}
                                        className="bg-[var(--primary)] text-white px-4 rounded-xl flex items-center gap-1 font-bold disabled:opacity-50 text-xs"
                                    >
                                        <Save className="w-3 h-3" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
