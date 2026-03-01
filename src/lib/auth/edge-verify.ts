/**
 * Edge-compatible token verification for middleware.
 * Uses Web Crypto API instead of Node.js crypto module.
 * 
 * This is a lightweight version of verifyToken from lib/auth/server.ts
 * designed to work in Next.js Edge Runtime (middleware).
 */

const AUTH_SECRET = process.env.AUTH_SECRET || ''

async function hmacSha256(secret: string, data: string): Promise<string> {
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )
    const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(data))
    return Array.from(new Uint8Array(signature))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('')
}

export async function verifyTokenEdge(token: string): Promise<string | null> {
    try {
        if (!AUTH_SECRET) return null

        const decoded = atob(token)
        const parts = decoded.split(':')
        if (parts.length < 3) return null

        const [payload, timestamp, signature] = [parts[0], parts[1], parts.slice(2).join(':')]
        if (!payload || !timestamp || !signature) return null

        const expectedSignature = await hmacSha256(AUTH_SECRET, `${payload}:${timestamp}`)
        if (signature !== expectedSignature) return null

        // 7-day expiry
        const tokenAge = Date.now() - parseInt(timestamp)
        if (tokenAge > 7 * 24 * 60 * 60 * 1000) return null

        return payload
    } catch {
        return null
    }
}
