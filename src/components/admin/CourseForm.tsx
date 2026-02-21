'use client';

/**
 * Course Form Component
 * 
 * Used for both creating and editing courses
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import PhotoUpload from './PhotoUpload';
import CourseModulesEditor from './CourseModulesEditor';
import { Loader2, Plus, Trash2, Save, X, ImageIcon, Video, BookOpen, DollarSign, MapPin, Check } from 'lucide-react';
import { motion } from 'framer-motion';

interface CourseFormProps {
    courseId?: string;
    initialData?: any;
}

interface CourseFormData {
    title: string;
    titleRu?: string;
    description: string;
    descriptionRu?: string;
    price: number;
    type: 'ONLINE' | 'OFFLINE';
    isActive: boolean;
    coverImage: string;
    location?: string;
    locationRu?: string;
    schedule?: string;
    scheduleRu?: string;
    durationDays?: number;
    features: string[];
    featuresRu: string[];
    status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
    region: 'UZ' | 'RU' | 'GLOBAL';
    language: string;
    seoTitle?: string;
    seoDescription?: string;
    seoKeywords?: string;
    targetAudience: 'MEN' | 'WOMEN' | 'ALL';
}

export default function CourseForm({ courseId, initialData }: CourseFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState<CourseFormData>({
        title: initialData?.title || '',
        titleRu: initialData?.titleRu || '',
        description: initialData?.description || '',
        descriptionRu: initialData?.descriptionRu || '',
        price: initialData?.price || 0,
        type: initialData?.type || 'ONLINE',
        isActive: initialData?.isActive ?? true,
        coverImage: initialData?.coverImage || '',
        location: initialData?.location || '',
        locationRu: initialData?.locationRu || '',
        schedule: initialData?.schedule || '',
        scheduleRu: initialData?.scheduleRu || '',
        durationDays: initialData?.durationDays || 30,
        features: initialData?.features || [],
        featuresRu: initialData?.featuresRu || [],
        status: initialData?.status || 'DRAFT',
        region: initialData?.region || 'GLOBAL',
        language: initialData?.language || 'uz',
        seoTitle: initialData?.seoTitle || '',
        seoDescription: initialData?.seoDescription || '',
        seoKeywords: initialData?.seoKeywords || '',
        targetAudience: initialData?.targetAudience || 'ALL',
    });

    const [featureInput, setFeatureInput] = useState('');
    const [featureInputRu, setFeatureInputRu] = useState('');

    const [activeTab, setActiveTab] = useState<'general' | 'modules' | 'seo'>('general');
    const [modules, setModules] = useState<any[]>(initialData?.modules || []);

    // SEO Helper
    const updateSEO = (field: string, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const url = courseId
                ? `/api/admin/courses/${courseId}`
                : '/api/admin/courses';

            const method = courseId ? 'PUT' : 'POST';

            // Allow simplified non-module lessons for backward compat if needed, 
            // but primarily we push 'modules' which contain 'lessons'.
            // The backend needs to handle this structure relation update.
            const payload = {
                ...formData,
                modules: modules // Send complex structure to backend
            };

            const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const data = await response.json();

            if (data.success) {
                router.push('/admin/courses');
            } else {
                console.error("API error response:", data);
                alert(`Xatolik: ${data.error}\n\n${data.details ? JSON.stringify(data.details, null, 2) : ''}`);
            }
        } catch (error) {
            console.error('Error saving course:', error);
            alert('Saqlashda xatolik yuz berdi');
        } finally {
            setLoading(false);
        }
    };

    // ... feature handlers ...

    return (
        <form onSubmit={handleSubmit} className="max-w-5xl mx-auto space-y-8 pb-20">
            {/* Header & Tabs */}
            <div className="flex flex-col gap-6">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-serif font-black text-[var(--foreground)] mb-2">
                            {courseId ? 'Kursni Tahrirlash' : 'Yangi Kurs Yaratish'}
                        </h1>
                        <p className="text-sm font-bold opacity-40 uppercase tracking-[0.2em] text-[var(--foreground)]">
                            {courseId ? `#${courseId.slice(0, 8)}` : 'Yangi o\'quv dasturi'}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="p-4 rounded-2xl border border-[var(--border)] text-[var(--foreground)] hover:bg-[var(--secondary)] transition-all font-bold opacity-60 hover:opacity-100"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-1 bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] w-fit">
                    <button type="button" onClick={() => setActiveTab('general')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'general' ? 'bg-[var(--primary)] text-white shadow-lg' : 'hover:bg-[var(--secondary)] opacity-60'}`}>Asosiy</button>
                    <button type="button" onClick={() => setActiveTab('modules')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'modules' ? 'bg-[var(--primary)] text-white shadow-lg' : 'hover:bg-[var(--secondary)] opacity-60'}`}>Dastur (Modullar)</button>
                    <button type="button" onClick={() => setActiveTab('seo')} className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === 'seo' ? 'bg-[var(--primary)] text-white shadow-lg' : 'hover:bg-[var(--secondary)] opacity-60'}`}>SEO & Sozlamalar</button>
                </div>
            </div>

            {/* Tab Content: GENERAL */}
            {activeTab === 'general' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    {/* Basic Info */}
                    <section className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] shadow-sm p-8 space-y-8">
                        {/* ... Existing Basic Info Fields ... */}
                        <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-[var(--primary)] flex items-center justify-center shadow-lg shadow-[var(--glow)] text-white">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif font-bold text-[var(--foreground)]">Asosiy Ma'lumotlar</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-[var(--foreground)]">Nomi va Tavsifi</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-70 ml-1">
                                    Nomi (UZ) *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-5 py-4 bg-[var(--secondary)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-bold text-[var(--foreground)] transition-all"
                                    placeholder="Kurs nomini kiriting"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-40 ml-1">
                                    Nomi (RU)
                                </label>
                                <input
                                    type="text"
                                    value={formData.titleRu}
                                    onChange={(e) => setFormData({ ...formData, titleRu: e.target.value })}
                                    className="w-full px-5 py-4 bg-[var(--secondary)]/30 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-medium text-[var(--foreground)] transition-all"
                                    placeholder="Название курса"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-70 ml-1">
                                    Tavsif (UZ) *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full px-5 py-4 bg-[var(--secondary)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-medium text-[var(--foreground)] transition-all min-h-[120px]"
                                    placeholder="Kurs haqida batafsil..."
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-40 ml-1">
                                    Tavsif (RU)
                                </label>
                                <textarea
                                    rows={4}
                                    value={formData.descriptionRu}
                                    onChange={(e) => setFormData({ ...formData, descriptionRu: e.target.value })}
                                    className="w-full px-5 py-4 bg-[var(--secondary)]/30 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-medium text-[var(--foreground)] transition-all min-h-[120px]"
                                    placeholder="Подробное описание..."
                                />
                            </div>
                        </div>
                    </section>

                    {/* Cover Image & Price Sections (Keep as is, just wrapped) */}
                    {/* Cover Image */}
                    <section className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] shadow-sm p-8 space-y-8">
                        <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-[var(--glow)] text-white">
                                <ImageIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif font-bold text-[var(--foreground)]">Muqova Rasmi</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-[var(--foreground)]">Kurs ko'rinishi</p>
                            </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-8">
                            {formData.coverImage && (
                                <div className="relative w-full md:w-64 h-40 rounded-2xl overflow-hidden border border-[var(--border)] group shrink-0 shadow-lg">
                                    <img src={formData.coverImage} alt="Cover" className="w-full h-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, coverImage: '' })}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-md opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110"
                                    >
                                        <X size={14} />
                                    </button>
                                </div>
                            )}
                            <div className="flex-1 space-y-4">
                                <PhotoUpload
                                    onUploadComplete={(path, url) => setFormData({ ...formData, coverImage: url })}
                                    bucket="assets"
                                    path="courses/covers"
                                    maxSizeMB={5}
                                    enableCrop={true}
                                    cropAspect={16 / 9}
                                />
                                <div className="flex items-center gap-2 text-[10px] font-bold text-[var(--foreground)] opacity-40 uppercase tracking-wide">
                                    <ImageIcon className="w-3 h-3" />
                                    <span>Tavsiya: 1200x800px. Max: 5MB</span>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Price & Settings */}
                    <section className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] shadow-sm p-8 space-y-8">
                        <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center shadow-lg shadow-[var(--glow)] text-white">
                                <DollarSign className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif font-bold text-[var(--foreground)]">Narx va Sozlamalar</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-[var(--foreground)]">Moliyaviy ma'lumotlar</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-70 ml-1">
                                    Narxi (UZS) *
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        value={formData.price}
                                        onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) })}
                                        className="w-full px-5 py-4 bg-[var(--secondary)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-black text-xl text-[var(--foreground)] transition-all"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">UZS</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-70 ml-1">
                                    Kurs Turi *
                                </label>
                                <select
                                    required
                                    value={formData.type}
                                    onChange={(e) => setFormData({ ...formData, type: e.target.value as 'ONLINE' | 'OFFLINE' })}
                                    className="w-full px-5 py-4 bg-[var(--secondary)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-bold text-[var(--foreground)] transition-all appearance-none cursor-pointer"
                                >
                                    <option value="ONLINE">ONLINE (Masofaviy)</option>
                                    <option value="OFFLINE">OFFLINE (Jonli)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-70 ml-1">
                                    Davomiyligi (kun)
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.durationDays}
                                        onChange={(e) => setFormData({ ...formData, durationDays: parseInt(e.target.value) })}
                                        className="w-full px-5 py-4 bg-[var(--secondary)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-bold text-[var(--foreground)] transition-all"
                                    />
                                    <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[10px] font-black opacity-30">KUN</span>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-70 ml-1">
                                    Mo'ljallangan Audience *
                                </label>
                                <select
                                    required
                                    value={formData.targetAudience}
                                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value as 'MEN' | 'WOMEN' | 'ALL' })}
                                    className="w-full px-5 py-4 bg-[var(--secondary)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-bold text-[var(--foreground)] transition-all appearance-none cursor-pointer"
                                >
                                    <option value="ALL">Barchasi (All)</option>
                                    <option value="MEN">Erkaklar (Men)</option>
                                    <option value="WOMEN">Ayollar (Women)</option>
                                </select>
                            </div>
                        </div>

                        <div className="pt-4">
                            <label className="flex items-center gap-4 cursor-pointer group p-4 rounded-2xl border border-[var(--border)] hover:bg-[var(--secondary)] transition-all max-w-sm">
                                <div className={`w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all ${formData.isActive ? 'bg-[var(--primary)] border-[var(--primary)]' : 'border-[var(--foreground)] opacity-30'}`}>
                                    {formData.isActive && <Check className="w-4 h-4 text-white" />}
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                    className="hidden"
                                />
                                <span className="font-bold text-[var(--foreground)] group-hover:text-[var(--primary)] transition-colors">
                                    Kurs Platformada Faol
                                </span>
                            </label>
                        </div>
                    </section>
                </div>
            )}

            {/* Tab Content: MODULES */}
            {activeTab === 'modules' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    <section className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] shadow-sm p-8 space-y-8">
                        <CourseModulesEditor modules={modules} setModules={setModules} />
                    </section>
                </div>
            )}

            {/* Tab Content: SEO */}
            {activeTab === 'seo' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
                    <section className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] shadow-sm p-8 space-y-8">
                        <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-indigo-500 flex items-center justify-center shadow-lg shadow-[var(--glow)] text-white">
                                <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-xl font-serif font-bold text-[var(--foreground)]">SEO & Metadata</h2>
                                <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-[var(--foreground)]">Qidiruv tizimlari uchun</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-70 ml-1">
                                    SEO Sarlavha (Title)
                                </label>
                                <input
                                    type="text"
                                    value={formData.seoTitle || ''}
                                    onChange={(e) => updateSEO('seoTitle', e.target.value)}
                                    className="w-full px-5 py-4 bg-[var(--secondary)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-medium text-[var(--foreground)] transition-all"
                                    placeholder="Masalan: Baxtli Men - Professional Yoga Kursi"
                                />
                                <p className="text-[10px] opacity-40 ml-2">Tavsiya: 60 belgidan oshmasin</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-70 ml-1">
                                    SEO Tavsif (Description)
                                </label>
                                <textarea
                                    rows={3}
                                    value={formData.seoDescription || ''}
                                    onChange={(e) => updateSEO('seoDescription', e.target.value)}
                                    className="w-full px-5 py-4 bg-[var(--secondary)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-medium text-[var(--foreground)] transition-all"
                                    placeholder="Qidiruv natijalarida ko'rinadigan qisqa tavsif..."
                                />
                                <p className="text-[10px] opacity-40 ml-2">Tavsiya: 155 belgidan oshmasin</p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-70 ml-1">
                                    Kalit so'zlar (Keywords)
                                </label>
                                <input
                                    type="text"
                                    value={formData.seoKeywords || ''}
                                    onChange={(e) => updateSEO('seoKeywords', e.target.value)}
                                    className="w-full px-5 py-4 bg-[var(--secondary)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-medium text-[var(--foreground)] transition-all"
                                    placeholder="yoga, meditatsiya, sog'liq, online kurs"
                                />
                                <p className="text-[10px] opacity-40 ml-2">Vergu bilan ajrating</p>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {/* Offline Course Details (Keep in General tab?? No, logic suggests it should be visible when type is OFFLINE, regardless of tab? Or strictly in General? Let's check logic. It was in main flow. I should put it in General tab) */}

            {/* Offline Course Details */}
            {formData.type === 'OFFLINE' && (
                <section className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] shadow-sm p-8 space-y-8 animate-in slide-in-from-top-4 fade-in duration-500">
                    <div className="flex items-center gap-4 border-b border-[var(--border)] pb-6 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-purple-500 flex items-center justify-center shadow-lg shadow-[var(--glow)] text-white">
                            <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold text-[var(--foreground)]">Offline Tafsilotlar</h2>
                            <p className="text-[10px] font-black uppercase tracking-widest opacity-30 text-[var(--foreground)]">Manzil va Vaqt</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-70 ml-1">
                                Manzil (UZ)
                            </label>
                            <input
                                type="text"
                                value={formData.location}
                                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                className="w-full px-5 py-4 bg-[var(--secondary)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-medium text-[var(--foreground)] transition-all"
                                placeholder="Masalan: Toshkent sh, ..."
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-40 ml-1">
                                Manzil (RU)
                            </label>
                            <input
                                type="text"
                                value={formData.locationRu}
                                onChange={(e) => setFormData({ ...formData, locationRu: e.target.value })}
                                className="w-full px-5 py-4 bg-[var(--secondary)]/30 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-medium text-[var(--foreground)] transition-all"
                                placeholder="Адрес проведения..."
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-70 ml-1">
                                Jadval (UZ)
                            </label>
                            <input
                                type="text"
                                value={formData.schedule}
                                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                                className="w-full px-5 py-4 bg-[var(--secondary)]/50 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-medium text-[var(--foreground)] transition-all"
                                placeholder="Du-Chor-Juma 18:00"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-40 ml-1">
                                Jadval (RU)
                            </label>
                            <input
                                type="text"
                                value={formData.scheduleRu}
                                onChange={(e) => setFormData({ ...formData, scheduleRu: e.target.value })}
                                className="w-full px-5 py-4 bg-[var(--secondary)]/30 border border-[var(--border)] rounded-2xl focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 font-medium text-[var(--foreground)] transition-all"
                                placeholder="Расписание занятий..."
                            />
                        </div>
                    </div>
                </section>
            )}

            {/* Actions */}
            <div className="sticky bottom-6 flex justify-end gap-4 p-4 bg-[var(--background)]/80 backdrop-blur-xl border border-[var(--border)] rounded-[2rem] shadow-2xl shadow-[var(--glow)] z-20">
                <button
                    type="button"
                    onClick={() => router.back()}
                    disabled={loading}
                    className="px-8 py-4 rounded-2xl border border-[var(--border)] text-[var(--foreground)] font-bold hover:bg-[var(--secondary)] transition-all disabled:opacity-50"
                >
                    Bekor qilish
                </button>
                <button
                    type="submit"
                    disabled={loading}
                    className="px-10 py-4 bg-[var(--primary)] text-[var(--primary-foreground)] rounded-2xl font-black text-xs uppercase tracking-widest hover:opacity-90 shadow-xl shadow-[var(--glow)] transition-all active:scale-95 flex items-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                    {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
            </div>
        </form>
    );
}
