import { getLocalUser } from "@/lib/auth/server"
import { redirect } from "next/navigation"
import { Locale } from "@/dictionaries/get-dictionary"
import KPIDashboard from "@/components/user/KPIDashboard"

export default async function KPIPage({
    params,
}: {
    params: Promise<{ lang: Locale }>
}) {
    const { lang } = await params
    const user = await getLocalUser()

    if (!user) {
        redirect(`/${lang}/login?redirect=/${lang}/kpi`)
    }

    return (
        <div>
            <KPIDashboard lang={lang} />
        </div>
    )
}
