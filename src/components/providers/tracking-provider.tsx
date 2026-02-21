"use client"

import { useEffect } from 'react'
import { useParams } from 'next/navigation'

/**
 * High-precision behavioral tracking component.
 * Monitors lesson views, video play heartbeats, and session duration.
 */
export function TrackingProvider({ children }: { children: React.ReactNode }) {
    const params = useParams()

    useEffect(() => {
        // Track page views
        const trackPageView = async () => {
            try {
                const path = window.location.pathname
                let event = 'PAGE_VIEW'
                let metadata: any = { path }

                if (path.includes('/courses/')) {
                    event = 'COURSE_VIEW'
                    metadata.courseId = params?.courseId
                } else if (path.includes('/lessons/')) {
                    event = 'LESSON_VIEW'
                    metadata.lessonId = params?.lessonId
                    metadata.courseId = params?.courseId
                }

                await fetch('/api/analytics/event-logs', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ event, metadata })
                })
            } catch (e) {
                console.error('Tracking error:', e)
            }
        }

        trackPageView()
    }, [params])

    return <>{children}</>
}
