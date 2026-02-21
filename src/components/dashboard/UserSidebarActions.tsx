'use client';

import { useRouter, usePathname } from 'next/navigation';
import { LogOut, Globe, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UserSidebarActionsProps {
    lang: 'uz' | 'ru';
}

export default function UserSidebarActions({ lang }: UserSidebarActionsProps) {
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push(`/${lang}/login`);
            router.refresh();
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const toggleLang = () => {
        const newLang = lang === 'uz' ? 'ru' : 'uz';
        const newPathname = pathname?.replace(`/${lang}`, `/${newLang}`);
        if (newPathname) {
            router.push(newPathname);
        }
    };

    return (
        <div className="space-y-4 pt-8 border-t border-[var(--border)]">
            <button
                onClick={toggleLang}
                className="w-full flex items-center justify-between px-6 py-4 rounded-2xl bg-[var(--secondary)]/30 text-[var(--foreground)]/60 hover:bg-[var(--secondary)] hover:text-[var(--primary)] transition-all group"
            >
                <div className="flex items-center gap-4">
                    <Globe className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                    <span className="text-sm font-bold uppercase tracking-widest">
                        {lang === 'uz' ? "Russian" : "O'zbekcha"}
                    </span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-20" />
            </button>

            <button
                onClick={handleLogout}
                className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-red-500/60 hover:bg-red-50 hover:text-red-600 transition-all font-bold text-sm"
            >
                <LogOut className="w-5 h-5" />
                <span className="uppercase tracking-widest">{lang === 'uz' ? "Chiqish" : "Выход"}</span>
            </button>
        </div>
    );
}
