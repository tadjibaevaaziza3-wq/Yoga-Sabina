import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: {
                    in: ['MANUAL_CARD_NUMBER', 'MANUAL_CARD_OWNER']
                }
            }
        });

        const config: Record<string, string> = {
            MANUAL_CARD_NUMBER: 'Tizimda karta kiritilmagan',
            MANUAL_CARD_OWNER: '-'
        };

        for (const s of settings) {
            config[s.key] = s.value;
        }

        return NextResponse.json({ success: true, config });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
