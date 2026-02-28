import { getLocalUser } from "@/lib/auth/server";
import CommunityClient from "@/components/user/CommunityClient";
import { redirect } from "next/navigation";

interface Props {
    params: Promise<{ lang: string }>;
}

export default async function CommunityPage({ params }: Props) {
    const { lang } = await params;
    const user = await getLocalUser();
    if (!user) redirect(`/${lang}/login`);

    return <CommunityClient lang={lang as 'uz' | 'ru'} userId={user.id} />;
}
