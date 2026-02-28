import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const settings = await prisma.systemSetting.findMany({
            where: {
                key: {
                    in: ['MANUAL_CARD_NUMBER', 'MANUAL_CARD_OWNER', 'MANUAL_CARDS']
                }
            }
        });

        const settingsMap: Record<string, string> = {};
        for (const s of settings) {
            settingsMap[s.key] = s.value;
        }

        // Multi-card support: try MANUAL_CARDS (JSON array) first,
        // fallback to legacy single MANUAL_CARD_NUMBER + MANUAL_CARD_OWNER
        let cards: { number: string; owner: string }[] = [];

        if (settingsMap.MANUAL_CARDS) {
            try {
                cards = JSON.parse(settingsMap.MANUAL_CARDS);
            } catch {
                cards = [];
            }
        }

        // Fallback to legacy single card
        if (cards.length === 0 && settingsMap.MANUAL_CARD_NUMBER) {
            cards = [{
                number: settingsMap.MANUAL_CARD_NUMBER,
                owner: settingsMap.MANUAL_CARD_OWNER || '-'
            }];
        }

        // Still nothing? Return placeholder
        if (cards.length === 0) {
            cards = [{ number: 'Tizimda karta kiritilmagan', owner: '-' }];
        }

        return NextResponse.json({
            success: true,
            cards,
            // Legacy compat
            config: {
                MANUAL_CARD_NUMBER: cards[0]?.number || 'Tizimda karta kiritilmagan',
                MANUAL_CARD_OWNER: cards[0]?.owner || '-'
            }
        });
    } catch (e: any) {
        return NextResponse.json({ success: false, error: e.message }, { status: 500 });
    }
}
