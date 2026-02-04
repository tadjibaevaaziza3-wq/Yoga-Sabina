import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Container } from "@/components/ui/Container"
import { LoginForm } from "@/components/auth/LoginForm"
import Image from "next/image"
import Link from "next/link"

export default async function AdminLoginPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dictionary = await getDictionary(lang)

    return (
        <main className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <Container className="max-w-md py-12">
                <div className="glass-card rounded-[2.5rem] overflow-hidden bg-white p-8 md:p-12 shadow-2xl">
                    <div className="mb-10 text-center">
                        <Link href={`/${lang}`} className="mb-8 inline-block mx-auto">
                            <span className="text-2xl font-serif font-black tracking-tight text-emerald-900 leading-none">Baxtli Men</span>
                            <span className="block text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600/40 leading-none mt-1 text-center">Admin Panel</span>
                        </Link>
                        <h1 className="text-3xl font-serif text-emerald-900 mb-2">
                            Admin Login
                        </h1>
                        <p className="text-emerald-600/50 text-sm font-medium">
                            Please sign in to access the dashboard.
                        </p>
                    </div>

                    <LoginForm lang={lang} dictionary={dictionary} isAdmin={true} />
                </div>
            </Container>
        </main>
    )
}
