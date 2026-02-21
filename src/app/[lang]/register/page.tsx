import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Container } from "@/components/ui/Container"
import { UnifiedAuthForm } from "@/components/auth/UnifiedAuthForm"
import Image from "next/image"
import Link from "next/link"

export default async function RegisterPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dictionary = await getDictionary(lang)

    return (
        <main className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <Container className="max-w-4xl py-12">
                <div className="glass-card rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row">
                    {/* Left Side - Image/Info */}
                    <div className="md:w-5/12 relative hidden md:block">
                        <Image
                            src="/images/hero.png"
                            alt="Baxtli Men"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-primary/40 backdrop-blur-[2px] p-12 flex flex-col justify-end text-white">
                            <h2 className="text-3xl font-serif mb-4">
                                {dictionary.landing.heroTitle.split("—")[0]}
                            </h2>
                            <p className="text-sm opacity-90 leading-relaxed font-medium">
                                Sog'lom qomat va ruhiy xotirjamlik sari sayohatimizni birga boshlang.
                            </p>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="md:w-7/12 p-8 md:p-12 lg:p-16 bg-white">
                        <div className="mb-10 text-center md:text-left">
                            <Link href={`/${lang}`} className="mb-8 inline-block mx-auto md:mx-0">
                                <Image src="/images/logo.png" alt="Logo" width={100} height={30} className="h-6 w-auto" />
                            </Link>
                            <h1 className="text-3xl font-serif text-primary mb-2">
                                {dictionary.auth.title}
                            </h1>
                            <p className="text-primary/50 text-sm font-medium">
                                {dictionary.auth.subtitle}
                            </p>
                        </div>

                        <UnifiedAuthForm lang={lang} dictionary={dictionary} initialMode="register" />
                    </div>
                </div>
            </Container>
        </main>
    )
}
