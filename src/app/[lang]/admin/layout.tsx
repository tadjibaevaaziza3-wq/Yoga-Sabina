export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div data-theme="admin" className="min-h-screen bg-[var(--background)] text-[var(--foreground)] font-sans antialiased">
            {children}
        </div>
    )
}
