"use client";

import { usePathname } from "next/navigation";
import { AIAgent } from "./AIAgent";

export function AIAgentWrapper({ lang }: { lang: "uz" | "ru" }) {
    const pathname = usePathname();
    const isAdmin = pathname?.includes("/admin");
    const isTma = pathname?.includes("/tma");
    const isLearnPage = pathname?.includes("/learn/");

    // Hide on admin, TMA, and learn pages (learn has its own built-in chat)
    if (isAdmin || isLearnPage) return null;

    return <AIAgent lang={lang} />;
}
