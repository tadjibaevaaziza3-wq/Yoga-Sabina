'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Send, User, Clock } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import { uz, ru } from 'date-fns/locale'

interface CommentUser {
    id: string
    firstName: string | null
    lastName: string | null
    email: string | null
    avatar?: string | null
}

interface VideoComment {
    id: string
    comment: string
    timestamp: number | null
    createdAt: string
    user: CommentUser
    replies?: VideoComment[]
}

interface LessonCommentsProps {
    lessonId: string
    lang: 'uz' | 'ru'
    currentUser: any
}

export default function LessonComments({ lessonId, lang, currentUser }: LessonCommentsProps) {
    const [comments, setComments] = useState<VideoComment[]>([])
    const [newComment, setNewComment] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    const dateLocale = lang === 'uz' ? uz : ru

    const fetchComments = async () => {
        try {
            setIsLoading(true)
            const res = await fetch(`/api/lessons/${lessonId}/comments`)
            const data = await res.json()
            if (data.success) {
                setComments(data.comments)
            } else {
                setError(data.error)
            }
        } catch (err) {
            setError(lang === 'uz' ? 'Xatolik yuz berdi' : 'Произошла ошибка')
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchComments()
    }, [lessonId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newComment.trim() || isSubmitting) return

        try {
            setIsSubmitting(true)
            const res = await fetch(`/api/lessons/${lessonId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: newComment })
            })
            const data = await res.json()

            if (data.success) {
                setComments([data.comment, ...comments])
                setNewComment('')
            } else {
                alert(data.error || 'Error adding comment')
            }
        } catch (err) {
            console.error(err)
            alert(lang === 'uz' ? 'Tarmoq xatosi' : 'Ошибка сети')
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = Math.floor(seconds % 60)
        return `${m}:${s.toString().padStart(2, '0')}`
    }

    return (
        <div className="space-y-6">
            <h3 className="font-serif font-black text-xl flex items-center gap-2 text-[var(--foreground)]">
                <MessageSquare className="w-5 h-5 text-[var(--primary)]" />
                {lang === 'uz' ? 'Fikrlar' : 'Комментарии'}
                <span className="text-sm font-bold bg-[var(--secondary)] text-[var(--primary)] px-2 py-0.5 rounded-full">
                    {comments.length}
                </span>
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="flex gap-3">
                <div className="w-10 h-10 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold shrink-0">
                    {currentUser?.firstName?.[0] || <User className="w-5 h-5" />}
                </div>
                <div className="flex-1 relative">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder={lang === 'uz' ? "Fikringizni qoldiring..." : "Оставьте ваш комментарий..."}
                        className="w-full bg-[var(--background)] border border-[var(--border)] rounded-2xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 min-h-[50px] resize-y custom-scrollbar text-[var(--foreground)]"
                        rows={2}
                    />
                    <button
                        type="submit"
                        disabled={isSubmitting || !newComment.trim()}
                        className="absolute right-3 bottom-3 p-2 bg-[var(--primary)] text-white rounded-xl hover:bg-[var(--primary)]/90 disabled:opacity-50 transition-all shadow-sm"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </form>

            {/* Comments List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--primary)]"></div>
                </div>
            ) : error ? (
                <div className="text-red-500 text-sm text-center py-4 bg-red-50 rounded-xl">{error}</div>
            ) : comments.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[var(--border)] rounded-2xl">
                    <p className="text-[var(--foreground)]/50 text-sm font-medium">
                        {lang === 'uz' ? 'Hali fikrlar yo\'q. Birinchi bo\'ling!' : 'Комментариев пока нет. Будьте первым!'}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <AnimatePresence>
                        {comments.map((comment) => (
                            <motion.div
                                key={comment.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex gap-3 p-4 bg-[var(--background)] rounded-2xl border border-[var(--border)]"
                            >
                                <div className="w-10 h-10 rounded-full bg-[var(--secondary)] text-[var(--primary)] flex items-center justify-center font-bold shrink-0">
                                    {comment.user?.firstName?.[0] || <User className="w-5 h-5" />}
                                </div>
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h5 className="font-bold text-sm text-[var(--foreground)]">
                                            {comment.user?.firstName} {comment.user?.lastName}
                                        </h5>
                                        <span className="text-[10px] text-[var(--foreground)]/40 font-medium">
                                            {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: dateLocale })}
                                        </span>
                                    </div>
                                    <p className="text-sm text-[var(--foreground)]/80 whitespace-pre-wrap leading-relaxed">
                                        {comment.timestamp !== null && (
                                            <button className="text-[var(--primary)] font-mono text-xs font-bold mr-2 hover:underline inline-flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {formatTime(comment.timestamp)}
                                            </button>
                                        )}
                                        {comment.comment}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>
                </div>
            )}
        </div>
    )
}
