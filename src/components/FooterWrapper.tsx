"use client";

import { usePathname } from "next/navigation";
import { Footer } from "./Footer";

export const FooterWrapper = ({ isConsultationEnabled = true }: { isConsultationEnabled?: boolean }) => {
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

    if (isTma || isAdmin || isUserPanel) return null;

    return <Footer isConsultationEnabled={isConsultationEnabled} />;
};


