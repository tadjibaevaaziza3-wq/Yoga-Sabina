import Script from 'next/script'

export default function TelegramLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
            <div className="min-h-screen bg-[#f6f9fe] text-[#114539]">
                {children}
            </div>
        </>
    )
}
