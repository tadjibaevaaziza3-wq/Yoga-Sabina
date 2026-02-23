"use client";

import { usePathname } from "next/navigation";
import { Header } from "./Header";

export const HeaderWrapper = ({ isConsultationEnabled = true }: { isConsultationEnabled?: boolean }) => {
    const pathname = usePathname();
    const isTma = pathname?.includes("/tma");
    const isAdmin = pathname?.includes("/admin");
    const isUserPanel = pathname?.includes("/account") ||
        pathname?.includes("/my-courses") ||
        pathname?.includes("/learn") ||
        pathname?.includes("/dashboard") ||
        pathname?.includes("/profile") ||
        pathname?.includes("/kpi") ||
        pathname?.includes("/chat") ||
        pathname?.includes("/settings") ||
        pathname?.includes("/activity") ||
        pathname?.includes("/courses");

    const isMinimal = isTma || isAdmin || isUserPanel;

    if (isTma || isAdmin) return null;

    return <Header minimal={isMinimal} isAdmin={isAdmin} isConsultationEnabled={isConsultationEnabled} />;
};
