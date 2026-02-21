"use client";

import { usePathname } from "next/navigation";
import { AIAgent } from "./AIAgent";

export function AIAgentWrapper({ lang }: { lang: "uz" | "ru" }) {
    const pathname = usePathname();
    const isAdmin = pathname?.includes("/admin");
    const isTma = pathname?.includes("/tma");

    if (isAdmin) return null;

    return <AIAgent lang={lang} />;
}
