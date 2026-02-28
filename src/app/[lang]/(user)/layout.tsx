"use client"

import React from 'react';
import { UserSidebar } from '@/components/user/UserSidebar';
import { usePathname } from 'next/navigation';

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname() || ''
    const lang = pathname.startsWith('/ru') ? 'ru' : 'uz'

    // Check if we're on a video learning page (fullscreen layout, no sidebar)
    const isLearnPage = pathname.includes('/learn/')
    const isChatPage = pathname.includes('/chat')

    if (isLearnPage) {
        return (
            <div data-theme="user" className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--primary)] selection:text-white">
                {children}
            </div>
        )
    }

    return (
        <div data-theme="user" className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--primary)] selection:text-white">
            <UserSidebar lang={lang as 'uz' | 'ru'} />
            {/* Main content — offset by sidebar width on desktop */}
            <div className="lg:pl-[260px] pt-14 lg:pt-0 pb-20 lg:pb-0">
                <div className={isChatPage ? "mx-auto px-4 md:px-6 py-6" : "max-w-[1200px] mx-auto px-4 md:px-8 py-8"}>
                    {children}
                </div>
            </div>
        </div>
    );
}
