import { getLocalUser } from "@/lib/auth/server";
import BodyTrackingClient from "@/components/user/BodyTrackingClient";
import { redirect } from "next/navigation";

interface Props {
    params: Promise<{ lang: string }>;
}

export default async function BodyTrackingPage({ params }: Props) {
    const { lang } = await params;
    const user = await getLocalUser();
    if (!user) redirect(`/${lang}/login`);

    return <BodyTrackingClient lang={lang as 'uz' | 'ru'} />;
}
