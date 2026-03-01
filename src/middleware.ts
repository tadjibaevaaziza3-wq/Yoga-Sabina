import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'
import { verifyTokenEdge } from '@/lib/auth/edge-verify'

const locales = ['uz', 'ru']
const defaultLocale = 'uz'

function getLocale(request: NextRequest): string | undefined {
    try {
        const negotiatorHeaders: Record<string, string> = {}
        request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

        // @ts-ignore locales are readonly
        const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

        // Filter out any potentially invalid locale tags
        const validLanguages = languages.filter(lang => {
            try {
                Intl.getCanonicalLocales(lang)
                return true
            } catch {
                return false
            }
        })

        const locale = matchLocale(validLanguages, locales, defaultLocale)
        return locale
    } catch (error) {
        console.error('Locale matching error:', error)
        return defaultLocale
    }
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname

    // ── TMA FAST PATH: skip all auth checks, just add headers ──
    if (pathname.includes('/tma')) {
        // Check locale (TMA always has locale in URL from Telegram link)
        const pathnameIsMissingLocale = locales.every(
            (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
        )
        if (pathnameIsMissingLocale) {
            return NextResponse.redirect(
                new URL(`/uz${pathname.startsWith('/') ? '' : '/'}${pathname}`, request.url)
            )
        }

        const response = NextResponse.next();
        response.headers.delete('X-Powered-By');
        response.headers.set('X-Content-Type-Options', 'nosniff');
        response.headers.set('X-Frame-Options', 'ALLOWALL');
        response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
        response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
        // Minimal CSP for TMA (faster parsing)
        response.headers.set('Content-Security-Policy', [
            "default-src 'self'",
            "script-src 'self' 'unsafe-inline' https://telegram.org",
            "style-src 'self' 'unsafe-inline'",
            "img-src 'self' data: https: blob: https://storage.googleapis.com",
            "font-src 'self' data:",
            "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://storage.googleapis.com",
            "media-src 'self' https://*.supabase.co blob: https://storage.googleapis.com",
            "frame-ancestors 'self' https://t.me https://web.telegram.org",
        ].join('; '));
        return response;
    }

    const token = request.cookies.get('auth_token')?.value
    const adminSession = request.cookies.get('admin_session')?.value

    // Protect Admin routes
    if (pathname.includes('/admin') && !pathname.includes('/admin/login')) {
        const isValidAdmin = adminSession ? !!(await verifyTokenEdge(adminSession)) : false;
        if (!isValidAdmin) {
            const locale = getLocale(request) || defaultLocale
            const url = new URL(`/${locale}/admin/login`, request.url)
            return NextResponse.redirect(url)
        }
    }

    // Protect User Account routes
    if (pathname.includes('/account')) {
        const isValidUser = token ? !!(await verifyTokenEdge(token)) : false;
        if (!isValidUser) {
            const locale = getLocale(request) || defaultLocale
            const url = new URL(`/${locale}/login`, request.url)
            return NextResponse.redirect(url)
        }
    }

    // Check if there is any supported locale in the pathname
    const pathnameIsMissingLocale = locales.every(
        (locale) => !pathname.startsWith(`/${locale}/`) && pathname !== `/${locale}`
    )

    // Redirect if there is no locale
    if (pathnameIsMissingLocale) {
        const locale = getLocale(request) || defaultLocale

        return NextResponse.redirect(
            new URL(
                `/${locale}${pathname.startsWith('/') ? '' : '/'}${pathname}`,
                request.url
            )
        )
    }

    // Add security headers
    const response = NextResponse.next();

    // Remove server signature
    response.headers.delete('X-Powered-By');

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');

    // Allow iframing for TMA routes
    if (pathname.includes('/tma')) {
        response.headers.set('X-Frame-Options', 'ALLOWALL'); // Or remove it
    } else {
        response.headers.set('X-Frame-Options', 'DENY');
    }

    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

    // Content Security Policy
    const csp = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' https://telegram.org https://vercel.live",
        "style-src 'self' 'unsafe-inline'",
        "img-src 'self' data: https: blob: https://storage.googleapis.com",
        "font-src 'self' data:",
        "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://vercel.live https://storage.googleapis.com",
        "media-src 'self' https://*.supabase.co blob: https://storage.googleapis.com",
        "frame-ancestors 'self' https://t.me https://web.telegram.org",
        "base-uri 'self'",
        "form-action 'self'",
    ].join('; ');

    response.headers.set('Content-Security-Policy', csp);

    return response;
}

export const config = {
    // Matcher ignoring `/_next/`, `/api/`, and static assets like .mp4, .png, .jpg
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt|.*\\.mp4|.*\\.png|.*\\.jpg|.*\\.svg).*)'],
}
