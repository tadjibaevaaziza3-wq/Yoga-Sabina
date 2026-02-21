'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function TelegramAuthPage() {
    const [status, setStatus] = useState('Initializing...')
    const router = useRouter()

    useEffect(() => {
        const initAuth = async () => {
            // Wait for script to load if needed, though layout puts it beforeInteractive
            // We can retry a few times if window.Telegram is not available immediately

            let tg: any = window.Telegram?.WebApp

            if (!tg) {
                // simple retry mechanism
                await new Promise(r => setTimeout(r, 500))
                tg = window.Telegram?.WebApp
            }

            if (!tg) {
                setStatus('Telegram WebApp environment not detected.')
                return
            }

            tg.expand()

            const initData = tg.initData
            if (!initData) {
                if (process.env.NODE_ENV === 'development') {
                    setStatus('Dev Mode: Missing initData.')
                    // Optional: You could fetch a mock token here for dev
                } else {
                    setStatus('Auth failed: No Telegram data found.')
                }
                return
            }

            setStatus('Authenticating securely...')

            try {
                const res = await fetch('/api/auth/telegram', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ initData })
                })

                const data = await res.json()

                if (data.success) {
                    setStatus('Success! Redirecting...')

                    // Handle Deep Linking
                    const startParam = tg.initDataUnsafe?.start_param

                    if (startParam && startParam.startsWith('course_')) {
                        const courseId = startParam.split('_')[1]
                        router.replace(`/uz/courses/${courseId}`)
                    } else if (startParam === 'profile') {
                        router.replace('/uz/profile')
                    } else {
                        // Default to dashboard
                        router.replace('/uz/dashboard')
                    }

                } else {
                    console.error('Auth failed', data)
                    setStatus(`Authentication failed: ${data.error}`)
                }
            } catch (e) {
                console.error('Connection error', e)
                setStatus('Connection error. Please check your internet.')
            }
        }

        initAuth()
    }, [router])

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center space-y-4">
            <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <h1 className="text-xl font-medium text-white">{status}</h1>
            <p className="text-sm text-gray-400">
                Connecting to Baxtli Men...
            </p>
        </div>
    )
}
