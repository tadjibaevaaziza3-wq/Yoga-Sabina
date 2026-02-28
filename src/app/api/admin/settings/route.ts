import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export async function GET(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const adminSession = cookieStore.get("admin_session");
        if (!adminSession) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const settings = await prisma.systemSetting.findMany();

        // Convert to record
        const config: Record<string, string> = {};
        for (const s of settings) {
            // For secret keys, we might mask them if needed, but since it's admin, we send it
            config[s.key] = s.value;
        }

        return NextResponse.json({ success: true, settings: config });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const cookieStore = await cookies();
        const adminSession = cookieStore.get("admin_session");
        if (!adminSession) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { key, value, isSecret = false } = body;

        if (!key || value === undefined) {
            return NextResponse.json({ error: "Key and Value are required" }, { status: 400 });
        }

        const setting = await prisma.systemSetting.upsert({
            where: { key },
            update: { value, isSecret, updatedBy: "admin" },
            create: { key, value, isSecret, updatedBy: "admin" }
        });

        // Invalidate the landing page cache so changes appear immediately
        try {
            revalidatePath('/uz');
            revalidatePath('/ru');
        } catch (e) {
            // revalidatePath may fail in dev mode, not critical
        }

        return NextResponse.json({ success: true, setting });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
