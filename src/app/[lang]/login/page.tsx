import { getDictionary, Locale } from "@/dictionaries/get-dictionary"
import { Container } from "@/components/ui/Container"
import { UnifiedAuthForm } from "@/components/auth/UnifiedAuthForm"
import Image from "next/image"
import Link from "next/link"

export default async function LoginPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const dictionary = await getDictionary(lang)

    return (
        <main className="min-h-screen bg-secondary flex items-center justify-center p-4">
            <Container className="max-w-md py-12">
                <div className="glass-card rounded-[2.5rem] overflow-hidden bg-white p-8 md:p-12">
                    <div className="mb-10 text-center">
                        <Link href={`/${lang}`} className="mb-8 inline-block mx-auto">
                            <Image src="/images/logo.png" alt="Logo" width={120} height={40} className="h-8 w-auto" />
                        </Link>
                        <h1 className="text-3xl font-serif text-primary mb-2">
                            {dictionary.auth.title}
                        </h1>
                        <p className="text-primary/50 text-sm font-medium">
                            {dictionary.auth.subtitle}
                        </p>
                    </div>

                    <UnifiedAuthForm lang={lang} dictionary={dictionary} initialMode="login" />
                </div>
            </Container>
        </main>
    )
}
