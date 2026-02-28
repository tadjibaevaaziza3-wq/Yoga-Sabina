'use client';

import { motion } from 'framer-motion';

interface CourseHeaderProps {
    title: string;
    description: string;
    type: 'ONLINE' | 'OFFLINE';
    lang: 'uz' | 'ru';
}

export function CourseHeader({ title, description, type, lang }: CourseHeaderProps) {
    return (
        <div className="mb-16 text-center max-w-4xl mx-auto">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <span className="inline-block bg-[var(--secondary)] text-[var(--primary)] px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                    {type === 'ONLINE'
                        ? (lang === 'ru' ? '💻 ОНЛАЙН ПРОГРАММА' : '💻 ONLINE PROGRAMMA')
                        : (lang === 'ru' ? '🏢 ОФЛАЙН ПРОГРАММА' : '🏢 OFLAYN PROGRAMMA')
                    }
                </span>
                <h1 className="text-3xl md:text-5xl font-serif font-black text-[var(--primary)] mb-8 leading-tight">
                    {title}
                </h1>
            </motion.div>
        </div>
    );
}


