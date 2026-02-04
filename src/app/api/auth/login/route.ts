import { NextResponse } from "next/server";
import { cookies } from "next/headers";

const ADMIN_LOGIN = process.env.ADMIN_LOGIN || "admin123123";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "123123";

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { login, password } = body;

        if (login === ADMIN_LOGIN && password === ADMIN_PASSWORD) {
            const response = NextResponse.json({
                success: true,
                user: { role: "ADMIN", login: ADMIN_LOGIN },
            });

            const cookieStore = await cookies();
            cookieStore.set("auth_token", "admin_session_token", {
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                maxAge: 60 * 60 * 24 * 7, // 7 days
            });

            return response;
        }

        // For now, let's treat the same credentials as a test user if needed, 
        // but the user specifically asked for "test user panel toje day login i parol kak k adminu"
        // So we can just use the same auth for simplicity in this dev phase.

        return NextResponse.json(
            { success: false, message: "Invalid credentials" },
            { status: 401 }
        );
    } catch (error) {
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
