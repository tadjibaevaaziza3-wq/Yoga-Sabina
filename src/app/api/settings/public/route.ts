import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * Public API for fetching non-secret system settings.
 * Accepts a comma-separated list of keys via the 'keys' query parameter.
 */
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const keysParam = searchParams.get('keys');

        if (!keysParam) {
            return NextResponse.json({ success: false, error: "No keys provided" }, { status: 400 });
        }

        const keys = keysParam.split(',').map(k => k.trim());

        const settings = await prisma.systemSetting.findMany({
            where: {
                key: { in: keys },
                isSecret: false // Security check: never return secret keys publicly
            }
        });

        // Convert to record format: { [key]: value }
        const result: Record<string, string> = {};
        settings.forEach(s => {
            result[s.key] = s.value;
        });

        return NextResponse.json(result);
    } catch (e: any) {
        console.error("Public settings API error:", e);
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
