import Script from 'next/script'

export default function TMALayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="bg-secondary/20 min-h-screen">
            <Script
                src="https://telegram.org/js/telegram-web-app.js"
                strategy="beforeInteractive"
            />
            {children}
        </div>
    )
}
