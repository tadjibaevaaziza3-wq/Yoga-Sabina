'use client';

import { useParams, usePathname, useRouter } from 'next/navigation';
import { Globe } from 'lucide-react';
import { useState } from 'react';

/**
 * Compact language switcher for TMA pages.
 * Shows a small globe icon that expands to UZ/RU toggle.
 * Always accessible from any TMA page.
 */
export default function TMALanguageSwitcher() {
    const params = useParams();
    const pathname = usePathname();
    const router = useRouter();
    const currentLang = (params?.lang as string) || 'uz';
    const [open, setOpen] = useState(false);

    const handleSwitch = (lang: string) => {
        if (lang === currentLang) {
            setOpen(false);
            return;
        }
        // Replace the lang segment in the current path
        const newPath = (pathname || '/uz/tma').replace(`/${currentLang}/`, `/${lang}/`);
        router.push(newPath);
        setOpen(false);
    };

    return (
        <div className="fixed top-4 right-4 z-[60] flex items-center gap-1">
            {open ? (
                <div className="flex items-center gap-1 bg-white/90 backdrop-blur-md rounded-full px-1 py-1 shadow-lg border border-[#114539]/10 animate-in fade-in slide-in-from-right-2 duration-200">
                    {['uz', 'ru'].map((l) => (
                        <button
                            key={l}
                            onClick={() => handleSwitch(l)}
                            className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentLang === l
                                ? 'bg-[#114539] text-white'
                                : 'text-[#114539]/50 hover:text-[#114539] hover:bg-[#114539]/5'
                                }`}
                        >
                            {l === 'uz' ? '🇺🇿 UZ' : '🇷🇺 RU'}
                        </button>
                    ))}
                    <button
                        onClick={() => setOpen(false)}
                        className="ml-0.5 w-7 h-7 rounded-full flex items-center justify-center text-[#114539]/30 hover:text-[#114539]/60 transition-colors"
                    >
                        ✕
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => setOpen(true)}
                    className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-[#114539]/10 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                    title="Tilni o'zgartirish"
                >
                    <Globe className="w-4 h-4 text-[#114539]/60" />
                </button>
            )}
        </div>
    );
}
