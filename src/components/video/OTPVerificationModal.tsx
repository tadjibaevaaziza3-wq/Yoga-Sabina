'use client'

import React, { useState, useEffect, useRef } from 'react'
import { Shield, Send, CheckCircle, AlertTriangle, Loader2, X, MessageCircle } from 'lucide-react'

interface OTPVerificationModalProps {
    isOpen: boolean
    onVerified: (sessionToken: string) => void
    onClose: () => void
    lessonId?: string
    lang: string
}

export default function OTPVerificationModal({
    isOpen,
    onVerified,
    onClose,
    lessonId,
    lang
}: OTPVerificationModalProps) {
    const [step, setStep] = useState<'request' | 'verify' | 'success'>('request')
    const [code, setCode] = useState(['', '', '', '', '', ''])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [countdown, setCountdown] = useState(0)
    const [expiresIn, setExpiresIn] = useState(0)
    const inputRefs = useRef<(HTMLInputElement | null)[]>([])

    const t = {
        title: lang === 'ru' ? 'Подтверждение личности' : 'Shaxsni tasdiqlash',
        subtitle: lang === 'ru'
            ? 'Для защиты контента нужна верификация через Telegram'
            : 'Kontentni himoya qilish uchun Telegram orqali tasdiqlash kerak',
        sendCode: lang === 'ru' ? 'Отправить код в Telegram' : 'Telegramga kod yuborish',
        enterCode: lang === 'ru' ? 'Введите код из Telegram' : 'Telegramdan kelgan kodni kiriting',
        verify: lang === 'ru' ? 'Подтвердить' : 'Tasdiqlash',
        resend: lang === 'ru' ? 'Отправить заново' : 'Qayta yuborish',
        success: lang === 'ru' ? 'Верификация пройдена!' : 'Tasdiqlash muvaffaqiyatli!',
        successSub: lang === 'ru' ? 'Приятного просмотра' : 'Yoqimli tomosha',
        expires: lang === 'ru' ? 'Код истекает через' : 'Kod muddati',
        sec: lang === 'ru' ? 'сек' : 'soniya',
    }

    // Countdown timer for code expiry
    useEffect(() => {
        if (expiresIn > 0) {
            const timer = setInterval(() => {
                setExpiresIn(prev => {
                    if (prev <= 1) {
                        clearInterval(timer)
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [expiresIn])

    // Resend countdown
    useEffect(() => {
        if (countdown > 0) {
            const timer = setInterval(() => {
                setCountdown(prev => prev <= 1 ? 0 : prev - 1)
            }, 1000)
            return () => clearInterval(timer)
        }
    }, [countdown])

    const requestOTP = async () => {
        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/video/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'request', lessonId, lang })
            })
            const data = await res.json()

            if (data.success) {
                setStep('verify')
                setExpiresIn(data.expiresIn || 300)
                setCountdown(60) // 60s before resend allowed
                inputRefs.current[0]?.focus()
            } else if (data.bypass) {
                // Admin bypass
                onVerified('')
            } else {
                setError(data.error || 'Failed to send OTP')
            }
        } catch (err) {
            setError(lang === 'ru' ? 'Ошибка сети' : 'Tarmoq xatosi')
        } finally {
            setLoading(false)
        }
    }

    const verifyOTP = async () => {
        const fullCode = code.join('')
        if (fullCode.length !== 6) return

        setLoading(true)
        setError(null)
        try {
            const res = await fetch('/api/video/otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action: 'verify', lessonId, code: fullCode })
            })
            const data = await res.json()

            if (data.verified) {
                setStep('success')
                setTimeout(() => {
                    onVerified(data.videoSessionToken || '')
                }, 1500)
            } else {
                setError(data.error || 'Invalid code')
                setCode(['', '', '', '', '', ''])
                inputRefs.current[0]?.focus()
            }
        } catch (err) {
            setError(lang === 'ru' ? 'Ошибка верификации' : 'Tasdiqlash xatosi')
        } finally {
            setLoading(false)
        }
    }

    const handleCodeInput = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return
        const newCode = [...code]
        newCode[index] = value.slice(-1)
        setCode(newCode)

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus()
        }

        // Auto-verify when all digits entered
        if (newCode.every(d => d) && newCode.join('').length === 6) {
            setTimeout(() => verifyOTP(), 100)
        }
    }

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e: React.ClipboardEvent) => {
        e.preventDefault()
        const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
        if (pasted.length === 6) {
            setCode(pasted.split(''))
            inputRefs.current[5]?.focus()
            setTimeout(() => verifyOTP(), 100)
        }
    }

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] shadow-2xl max-w-md w-full mx-4 overflow-hidden">
                {/* Header */}
                <div className="relative bg-gradient-to-br from-[var(--primary)] to-emerald-700 p-8 text-white text-center">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 rounded-xl bg-white/10 hover:bg-white/20 transition"
                    >
                        <X className="w-4 h-4" />
                    </button>
                    <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-white/20 flex items-center justify-center">
                        {step === 'success' ? (
                            <CheckCircle className="w-8 h-8 text-emerald-300" />
                        ) : (
                            <Shield className="w-8 h-8" />
                        )}
                    </div>
                    <h2 className="text-xl font-serif font-black mb-2">{step === 'success' ? t.success : t.title}</h2>
                    <p className="text-xs text-white/60 font-bold">{step === 'success' ? t.successSub : t.subtitle}</p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-6">
                    {step === 'request' && (
                        <>
                            <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                                <MessageCircle className="w-6 h-6 text-blue-500 flex-shrink-0" />
                                <p className="text-xs text-blue-700 font-medium leading-relaxed">
                                    {lang === 'ru'
                                        ? 'Мы отправим 6-значный код в ваш Telegram для подтверждения доступа к видео.'
                                        : 'Biz sizning Telegram akkauntingizga 6 raqamli kod yuboramiz.'}
                                </p>
                            </div>

                            <button
                                onClick={requestOTP}
                                disabled={loading}
                                className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[var(--primary)]/90 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                {t.sendCode}
                            </button>
                        </>
                    )}

                    {step === 'verify' && (
                        <>
                            <p className="text-center text-sm font-bold text-[var(--foreground)]/60">{t.enterCode}</p>

                            {/* Code Input */}
                            <div className="flex justify-center gap-3" onPaste={handlePaste}>
                                {code.map((digit, i) => (
                                    <input
                                        key={i}
                                        ref={el => { inputRefs.current[i] = el }}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={e => handleCodeInput(i, e.target.value)}
                                        onKeyDown={e => handleKeyDown(i, e)}
                                        className="w-12 h-14 text-center text-xl font-black border-2 border-[var(--border)] rounded-xl focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20 outline-none transition bg-[var(--secondary)]/30"
                                    />
                                ))}
                            </div>

                            {/* Expiry countdown */}
                            {expiresIn > 0 && (
                                <p className="text-center text-[10px] font-bold text-[var(--foreground)]/30">
                                    {t.expires}: {Math.floor(expiresIn / 60)}:{String(expiresIn % 60).padStart(2, '0')}
                                </p>
                            )}

                            <button
                                onClick={verifyOTP}
                                disabled={loading || code.join('').length !== 6}
                                className="w-full py-4 bg-[var(--primary)] text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-[var(--primary)]/90 transition shadow-lg disabled:opacity-50 flex items-center justify-center gap-3"
                            >
                                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                                {t.verify}
                            </button>

                            {/* Resend */}
                            <button
                                onClick={requestOTP}
                                disabled={countdown > 0 || loading}
                                className="w-full py-3 text-[var(--primary)] text-xs font-black uppercase tracking-widest hover:bg-[var(--secondary)] rounded-xl transition disabled:opacity-30"
                            >
                                {countdown > 0 ? `${t.resend} (${countdown}s)` : t.resend}
                            </button>
                        </>
                    )}

                    {step === 'success' && (
                        <div className="text-center py-4">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center animate-in zoom-in">
                                <CheckCircle className="w-8 h-8 text-emerald-600" />
                            </div>
                            <p className="text-sm font-bold text-emerald-600">
                                {lang === 'ru' ? 'Загрузка видео...' : 'Video yuklanmoqda...'}
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="flex items-center gap-3 p-4 bg-red-50 rounded-xl border border-red-100">
                            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
                            <p className="text-xs text-red-600 font-bold">{error}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
