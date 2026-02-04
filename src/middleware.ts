import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { match as matchLocale } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const locales = ['uz', 'ru']
const defaultLocale = 'uz'

function getLocale(request: NextRequest): string | undefined {
    const negotiatorHeaders: Record<string, string> = {}
    request.headers.forEach((value, key) => (negotiatorHeaders[key] = value))

    // @ts-ignore locales are readonly
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages()

    const locale = matchLocale(languages, locales, defaultLocale)
    return locale
}

export async function middleware(request: NextRequest) {
    const pathname = request.nextUrl.pathname
    const token = request.cookies.get('auth_token')?.value

    // Protect Admin routes
    if (pathname.includes('/admin') && !pathname.includes('/admin/login')) {
        if (!token) {
            const locale = getLocale(request) || defaultLocale
            const url = new URL(`/${locale}/admin/login`, request.url)
            return NextResponse.redirect(url)
        }
    }

    // Protect User Account routes
    if (pathname.includes('/account')) {
        if (!token) {
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
}

export const config = {
    // Matcher ignoring `/_next/` and `/api/`
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
