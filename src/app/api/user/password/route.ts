import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getLocalUser } from "@/lib/auth/server";
import bcrypt from "bcrypt";

export async function POST(req: NextRequest) {
    try {
        const userSession = await getLocalUser();
        if (!userSession?.id) {
            return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        if (newPassword.length < 6) {
            return NextResponse.json({ success: false, error: "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak" }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { id: userSession.id }
        });

        if (!user) {
            return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
        }

        if (!user.password) {
            return NextResponse.json({
                success: false,
                error: "Siz ijtimoiy tarmoq (Telegram) orqali kirdingiz. Parolni o'zgartirish faqat email/telefon orqali ro'yxatdan o'tganlarga ruxsat beriladi."
            }, { status: 400 });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return NextResponse.json({ success: false, error: "Joriy parol xato kiritildi" }, { status: 400 });
        }

        const hashedNewPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedNewPassword }
        });

        return NextResponse.json({ success: true, message: "Parol muvaffaqiyatli o'zgartirildi" });

    } catch (e: any) {
        console.error("Password change error:", e);
        return NextResponse.json({ success: false, error: "Ichki xatolik yuz berdi" }, { status: 500 });
    }
}
