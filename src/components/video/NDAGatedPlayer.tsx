"use client"

import React, { useState, useEffect } from "react"
import { SecureVideoPlayer } from "./SecureVideoPlayer"
import { LegalAgreement } from "../LegalAgreement"

interface NDAGatedPlayerProps {
    videoUrl: string
    userId: string
    userPhone?: string
    courseTitle: string
    dictionary?: any
}

/**
 * Wraps SecureVideoPlayer with NDA enforcement.
 * Checks if user has signed the agreement; if not, shows LegalAgreement modal.
 * Video only plays after agreement is accepted and recorded.
 */
export function NDAGatedPlayer({
    videoUrl,
    userId,
    userPhone,
    courseTitle,
    dictionary,
}: NDAGatedPlayerProps) {
    const [ndaSigned, setNdaSigned] = useState<boolean | null>(null) // null = loading
    const [showAgreement, setShowAgreement] = useState(false)
    const [saving, setSaving] = useState(false)

    // Check NDA status on mount
    useEffect(() => {
        async function checkNDA() {
            try {
                const response = await fetch('/api/user/agreement')
                const data = await response.json()
                setNdaSigned(data.signed)
                if (!data.signed) {
                    setShowAgreement(true)
                }
            } catch {
                // If check fails, allow viewing (graceful degradation)
                setNdaSigned(true)
            }
        }
        checkNDA()
    }, [])

    const handleAccept = async () => {
        setSaving(true)
        try {
            const response = await fetch('/api/user/agreement', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
            })
            const data = await response.json()
            if (data.success) {
                setNdaSigned(true)
                setShowAgreement(false)
            }
        } catch (error) {
            console.error('Failed to save agreement:', error)
        } finally {
            setSaving(false)
        }
    }

    // Loading state
    if (ndaSigned === null) {
        return (
            <div className="w-full aspect-video bg-[var(--card-bg)] rounded-[2rem] flex items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-[var(--primary)]/50 font-medium">Проверка соглашения...</p>
                </div>
            </div>
        )
    }

    // NDA not signed → show agreement modal
    if (!ndaSigned) {
        return (
            <>
                <div className="w-full aspect-video bg-[var(--card-bg)] rounded-[2rem] flex items-center justify-center relative overflow-hidden">
                    {/* Blurred placeholder */}
                    <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary)]/10 to-[var(--accent)]/10 backdrop-blur-xl" />
                    <div className="relative z-10 text-center p-8">
                        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[var(--accent)]/20 flex items-center justify-center">
                            <svg className="w-8 h-8 text-[var(--accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-serif text-[var(--primary)] mb-2">
                            Требуется соглашение
                        </h3>
                        <p className="text-sm text-[var(--primary)]/60 mb-4">
                            Для просмотра видео необходимо принять пользовательское соглашение о неразглашении
                        </p>
                        <button
                            onClick={() => setShowAgreement(true)}
                            className="px-6 py-3 bg-[var(--accent)] text-white rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
                        >
                            Прочитать и принять
                        </button>
                    </div>
                </div>

                <LegalAgreement
                    isOpen={showAgreement}
                    onClose={() => setShowAgreement(false)}
                    onAccept={handleAccept}
                    dictionary={dictionary}
                />
            </>
        )
    }

    // NDA signed → show video player
    return (
        <SecureVideoPlayer
            videoUrl={videoUrl}
            userId={userId}
            userPhone={userPhone}
            courseTitle={courseTitle}
        />
    )
}
