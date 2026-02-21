import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Sends a heartbeat to the server to keep the stream reservation active.
 * If the server responds with 401 (Unauthorized) or 409 (Conflict/Busy),
 * it forces the playback to stop.
 */
export function useStreamHeartbeat(isPlaying: boolean, deviceId: string | null) {
    const router = useRouter()
    const intervalRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        // Only run heartbeat if video is playing and we have a device ID
        if (!isPlaying || !deviceId) {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            return
        }

        const sendHeartbeat = async () => {
            try {
                const res = await fetch('/api/auth/stream', {
                    method: 'PATCH',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deviceId })
                })

                if (!res.ok) {
                    const data = await res.json()
                    console.warn('[StreamHeartbeat] Failed:', data.error)

                    if (res.status === 409 || data.error === 'STREAM_BUSY') {
                        // Another device took over
                        alert('Sizning hisobingizdan boshqa qurilma orqali foydalanilmoqda. Stream to\'xtatildi.')
                        window.location.reload() // Force reload to reset state/player
                    }
                }
            } catch (error) {
                console.error('[StreamHeartbeat] Error:', error)
            }
        }

        // Send immediately on play
        sendHeartbeat()

        // Then every 30 seconds
        intervalRef.current = setInterval(sendHeartbeat, 30000)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
    }, [isPlaying, deviceId, router])
}
