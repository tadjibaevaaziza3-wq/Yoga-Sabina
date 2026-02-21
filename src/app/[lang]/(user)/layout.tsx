import React from 'react';

export default function UserLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div data-theme="user" className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans selection:bg-[var(--primary)] selection:text-white">
            {children}
        </div>
    );
}
