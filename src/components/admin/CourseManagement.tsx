import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye, EyeOff, Video, Search, Filter, Loader2, BookOpen, Users, ShoppingBag } from 'lucide-react';
import { motion } from 'framer-motion';

interface Course {
    id: string;
    title: string;
    titleRu?: string;
    description: string;
    price: number;
    type: 'ONLINE' | 'OFFLINE';
    isActive: boolean;
    lessons: { id: string; title: string; order: number }[];
    _count: {
        lessons: number;
        purchases: number;
        subscriptions: number;
    };
    createdAt: string;
}

export function AdminCourseManagement() {
    const [courses, setCourses] = useState<Course[]>([]);
    const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'ALL' | 'ONLINE' | 'OFFLINE'>('ALL');
    const [searchTerm, setSearchTerm] = useState('');
    const [showInactive, setShowInactive] = useState(true);

    useEffect(() => {
        fetchCourses();
    }, []);

    useEffect(() => {
        let result = courses;
        if (filter !== 'ALL') result = result.filter(c => c.type === filter);
        if (!showInactive) result = result.filter(c => c.isActive);
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(c =>
                c.title.toLowerCase().includes(term) ||
                c.description.toLowerCase().includes(term)
            );
        }
        setFilteredCourses(result);
    }, [filter, showInactive, searchTerm, courses]);

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/admin/courses?all=true`);
            const data = await response.json();
            if (data.success) setCourses(data.courses);
        } catch (error) {
            console.error('Error fetching courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Haqiqatdan ham ushbu kursni o\'chirmoqchimisiz?')) return;
        try {
            const response = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
            if ((await response.json()).success) fetchCourses();
        } catch (error) {
            alert('O\'chirishda xatolik');
        }
    };

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const response = await fetch(`/api/admin/courses/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus }),
            });
            if ((await response.json()).success) fetchCourses();
        } catch (error) {
            console.error('Error toggling status');
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center p-20 min-h-[400px]">
            <Loader2 className="w-10 h-10 text-[var(--primary)] animate-spin" />
        </div>
    );

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <h2 className="text-4xl font-editorial font-bold text-[var(--primary)] mb-2 tracking-tight">Curriculum Management</h2>
                    <p className="text-[11px] font-bold text-[var(--accent)] uppercase tracking-[0.4em]">Designing transformative yoga experiences</p>
                </div>
                <a
                    href="/admin/courses/new"
                    className="btn-luxury px-10 py-5 text-[11px] font-bold uppercase tracking-[0.4em] shadow-button active:scale-95 transition-all"
                >
                    <Plus className="w-5 h-5 mr-3" />
                    NEW COURSE
                </a>
            </div>

            {/* Controls Area */}
            <div className="bg-white p-6 rounded-[2.5rem] border border-[var(--primary)]/5 shadow-soft flex flex-col xl:flex-row gap-6 items-stretch xl:items-center">
                <div className="relative flex-grow">
                    <input
                        type="text"
                        placeholder="Search educational programs..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-6 py-5 bg-[var(--background)] rounded-2xl text-[13px] border border-[var(--primary)]/5 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/5 font-medium text-[var(--primary)] placeholder:text-[var(--primary)]/30 transition-all"
                    />
                    <Search className="w-5 h-5 text-[var(--primary)] absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex bg-[var(--background)] p-1.5 rounded-2xl border border-[var(--primary)]/5">
                        {['ALL', 'ONLINE', 'OFFLINE'].map((t) => (
                            <button
                                key={t}
                                onClick={() => setFilter(t as any)}
                                className={`px-6 py-3 rounded-xl text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${filter === t ? 'bg-white text-[var(--primary)] shadow-soft' : 'text-[var(--primary)] opacity-30 hover:opacity-100'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={() => setShowInactive(!showInactive)}
                        className={`px-8 py-4 rounded-2xl border text-[10px] font-bold uppercase tracking-[0.2em] transition-all ${showInactive ? 'bg-[var(--primary)]/5 border-[var(--primary)]/10 text-[var(--primary)]' : 'bg-white border-[var(--primary)]/5 opacity-30 text-[var(--primary)]'}`}
                    >
                        {showInactive ? 'SHOW ALL' : 'ACTIVE ONLY'}
                    </button>
                </div>
            </div>

            {/* Courses Grid */}
            {filteredCourses.length === 0 ? (
                <div className="bg-[var(--card-bg)] p-20 rounded-[3rem] border border-[var(--border)] text-center">
                    <div className="opacity-10 mb-6 flex justify-center text-[var(--foreground)]">
                        <BookOpen className="w-16 h-16" />
                    </div>
                    <p className="opacity-30 font-black uppercase tracking-widest text-xs text-[var(--foreground)]">Kurslar topilmadi</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {filteredCourses.map((course) => (
                        <motion.div
                            key={course.id}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className={`group bg-white rounded-[3rem] border transition-all hover:shadow-button relative overflow-hidden ${!course.isActive ? 'border-dashed border-[var(--primary)]/10 opacity-70' : 'border-[var(--primary)]/5 shadow-soft'}`}
                        >
                            {!course.isActive && (
                                <div className="absolute top-8 right-8 z-10">
                                    <span className="px-4 py-1 bg-red-50 text-red-500 text-[9px] font-bold uppercase tracking-[0.2em] rounded-full border border-red-100">
                                        ARCHIVED
                                    </span>
                                </div>
                            )}

                            <div className="p-10">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="px-5 py-2 bg-[var(--accent)]/10 text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.3em] rounded-full">
                                        {course.type} YOGA
                                    </div>
                                    <div className="text-2xl font-editorial font-bold text-[var(--primary)] tracking-tight">
                                        {new Intl.NumberFormat('uz-UZ').format(course.price)} <span className="text-[10px] uppercase font-bold text-[var(--accent)] ml-1">UZS</span>
                                    </div>
                                </div>

                                <h3 className="text-2xl font-editorial font-bold text-[var(--primary)] mb-3 leading-tight tracking-tight group-hover:text-[var(--accent)] transition-colors">
                                    {course.title}
                                </h3>
                                <p className="text-[13px] text-[var(--primary)]/50 leading-relaxed line-clamp-2 h-10 mb-8 font-medium italic">
                                    "{course.description}"
                                </p>

                                <div className="grid grid-cols-3 gap-6 mb-10">
                                    <div className="bg-[var(--background)] rounded-[1.5rem] p-5 text-center transition-colors group-hover:bg-[var(--primary)]/5 border border-[var(--primary)]/5">
                                        <div className="text-lg font-bold text-[var(--primary)]">{course._count.lessons}</div>
                                        <div className="text-[8px] font-bold text-[var(--accent)] uppercase tracking-[0.2em] mt-1">MODULES</div>
                                    </div>
                                    <div className="bg-[var(--background)] rounded-[1.5rem] p-5 text-center transition-colors group-hover:bg-[var(--primary)]/5 border border-[var(--primary)]/5">
                                        <div className="text-lg font-bold text-[var(--primary)]">{course._count.subscriptions}</div>
                                        <div className="text-[8px] font-bold text-[var(--accent)] uppercase tracking-[0.2em] mt-1">JOURNEYS</div>
                                    </div>
                                    <div className="bg-[var(--background)] rounded-[1.5rem] p-5 text-center transition-colors group-hover:bg-[var(--primary)]/5 border border-[var(--primary)]/5">
                                        <div className="text-lg font-bold text-[var(--primary)]">{course._count.purchases}</div>
                                        <div className="text-[8px] font-bold text-[var(--accent)] uppercase tracking-[0.2em] mt-1">TOTAL SALES</div>
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <a
                                        href={`/admin/courses/${course.id}`}
                                        className="flex-grow flex items-center justify-center gap-3 py-5 bg-[var(--primary)] text-white rounded-[1.5rem] text-[10px] font-bold uppercase tracking-[0.3em] hover:opacity-90 transition-all active:scale-95 shadow-button"
                                    >
                                        <Edit className="w-4 h-4" />
                                        EDIT
                                    </a>
                                    <button
                                        onClick={() => toggleActive(course.id, course.isActive)}
                                        className={`p-5 rounded-[1.5rem] border transition-all active:scale-90 ${course.isActive ? 'border-[var(--primary)]/10 text-[var(--primary)]/40 hover:text-[var(--primary)] hover:bg-[var(--primary)]/5' : 'bg-[var(--accent)] text-white border-[var(--accent)] shadow-button'}`}
                                    >
                                        {course.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                    <button
                                        onClick={() => handleDelete(course.id)}
                                        className="p-5 rounded-[1.5rem] border border-red-50 text-red-200 hover:text-red-500 hover:bg-red-50 transition-all active:scale-90"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}


