"use client"

import React, { useState, useEffect, useRef, useCallback } from "react"
import { Bell, X, Check, CheckCheck, ExternalLink } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface Notification {
    id: string
    type: string
    title: string
    titleRu?: string
    message: string
    messageRu?: string
    link?: string
    isRead: boolean
    createdAt: string
}

interface NotificationCenterProps {
    locale?: 'uz' | 'ru'
}

export function NotificationCenter({ locale = 'uz' }: NotificationCenterProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)

    const fetchNotifications = useCallback(async () => {
        try {
            const res = await fetch('/api/user/notifications?limit=15')
            const data = await res.json()
            if (data.success) {
                setNotifications(data.notifications)
                setUnreadCount(data.unreadCount)
            }
        } catch (e) {
            console.error('Failed to fetch notifications:', e)
        }
    }, [])

    // Initial fetch + polling every 30s
    useEffect(() => {
        fetchNotifications()
        const interval = setInterval(fetchNotifications, 30000)
        return () => clearInterval(interval)
    }, [fetchNotifications])

    // Close on outside click
    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setIsOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const markAsRead = async (ids: string[]) => {
        setNotifications(prev => prev.map(n => ids.includes(n.id) ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - ids.length))
        try {
            await fetch('/api/user/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids }),
            })
        } catch (e) {
            console.error('Failed to mark as read:', e)
        }
    }

    const markAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
        try {
            await fetch('/api/user/notifications', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ all: true }),
            })
        } catch (e) {
            console.error('Failed to mark all as read:', e)
        }
    }

    const getTitle = (n: Notification) => locale === 'ru' && n.titleRu ? n.titleRu : n.title
    const getMessage = (n: Notification) => locale === 'ru' && n.messageRu ? n.messageRu : n.message

    const typeColors: Record<string, string> = {
        info: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
        success: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
        warning: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
        promo: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
        system: 'bg-slate-500/10 text-slate-600 border-slate-500/20',
    }

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr)
        const now = new Date()
        const diff = now.getTime() - date.getTime()
        const minutes = Math.floor(diff / 60000)
        const hours = Math.floor(diff / 3600000)
        const days = Math.floor(diff / 86400000)

        if (minutes < 1) return locale === 'ru' ? 'только что' : 'hozirgina'
        if (minutes < 60) return `${minutes}${locale === 'ru' ? ' мин' : ' daq'}`
        if (hours < 24) return `${hours}${locale === 'ru' ? ' ч' : ' soat'}`
        if (days < 7) return `${days}${locale === 'ru' ? ' д' : ' kun'}`
        return date.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'uz-UZ')
    }

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2.5 rounded-2xl hover:bg-[#114539]/5 transition-all duration-300 group"
                aria-label="Notifications"
            >
                <Bell className="w-5 h-5 text-[#114539]/60 group-hover:text-[#114539] transition-colors" />
                <AnimatePresence>
                    {unreadCount > 0 && (
                        <motion.span
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="absolute -top-0.5 -right-0.5 flex items-center justify-center w-5 h-5 text-[9px] font-black text-white bg-rose-500 rounded-full shadow-lg ring-2 ring-white"
                        >
                            {unreadCount > 9 ? '9+' : unreadCount}
                        </motion.span>
                    )}
                </AnimatePresence>
            </button>

            {/* Dropdown */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -8, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeOut' }}
                        className="absolute right-0 top-full mt-2 w-[380px] max-h-[480px] bg-white rounded-3xl border border-[#114539]/10 shadow-2xl overflow-hidden z-[200]"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-5 py-4 border-b border-[#114539]/5">
                            <div className="flex items-center gap-2.5">
                                <Bell className="w-4 h-4 text-[#114539]" />
                                <h3 className="text-sm font-bold text-[#114539] tracking-wide">
                                    {locale === 'ru' ? 'Уведомления' : 'Bildirishnomalar'}
                                </h3>
                                {unreadCount > 0 && (
                                    <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/10 text-rose-600 rounded-full">
                                        {unreadCount}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-1">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="flex items-center gap-1 px-2.5 py-1.5 text-[10px] font-bold text-[#114539]/60 hover:text-[#114539] hover:bg-[#114539]/5 rounded-xl transition-colors uppercase tracking-wider"
                                    >
                                        <CheckCheck className="w-3.5 h-3.5" />
                                        {locale === 'ru' ? 'Всё' : 'Barchasi'}
                                    </button>
                                )}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-1.5 hover:bg-[#114539]/5 rounded-xl transition-colors"
                                >
                                    <X className="w-4 h-4 text-[#114539]/40" />
                                </button>
                            </div>
                        </div>

                        {/* Notification List */}
                        <div className="overflow-y-auto max-h-[400px] divide-y divide-[#114539]/5">
                            {notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <Bell className="w-8 h-8 text-[#114539]/10 mb-3" />
                                    <p className="text-xs text-[#114539]/40 font-medium">
                                        {locale === 'ru' ? 'Нет уведомлений' : "Bildirishnomalar yo'q"}
                                    </p>
                                </div>
                            ) : (
                                notifications.map((n) => (
                                    <motion.div
                                        key={n.id}
                                        layout
                                        className={`relative px-5 py-4 cursor-pointer hover:bg-[#114539]/[0.02] transition-colors ${!n.isRead ? 'bg-[#114539]/[0.03]' : ''}`}
                                        onClick={() => {
                                            if (!n.isRead) markAsRead([n.id])
                                            if (n.link) window.location.href = n.link
                                        }}
                                    >
                                        {/* Unread dot */}
                                        {!n.isRead && (
                                            <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-[#114539] rounded-full" />
                                        )}

                                        <div className="flex items-start gap-3">
                                            <div className={`mt-0.5 px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider border ${typeColors[n.type] || typeColors.info}`}>
                                                {n.type}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs leading-snug ${!n.isRead ? 'font-bold text-[#114539]' : 'font-medium text-[#114539]/70'}`}>
                                                    {getTitle(n)}
                                                </p>
                                                <p className="text-[11px] text-[#114539]/50 mt-1 line-clamp-2 leading-relaxed">
                                                    {getMessage(n)}
                                                </p>
                                                <div className="flex items-center gap-2 mt-1.5">
                                                    <span className="text-[9px] font-bold text-[#114539]/25 uppercase tracking-wider">
                                                        {formatTime(n.createdAt)}
                                                    </span>
                                                    {n.link && (
                                                        <ExternalLink className="w-3 h-3 text-[#114539]/20" />
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
