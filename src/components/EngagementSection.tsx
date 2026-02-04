"use client"

import { useState, useEffect } from "react"
import { Heart, MessageSquare, Send, Trash2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

interface EngagementSectionProps {
    lessonId: string
    userId: string
    userName: string
    isAdmin?: boolean
}

export function EngagementSection({ lessonId, userId, userName, isAdmin }: EngagementSectionProps) {
    const [liked, setLiked] = useState(false)
    const [likeCount, setLikeCount] = useState(0)
    const [comments, setComments] = useState<any[]>([])
    const [newComment, setNewComment] = useState("")
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [lessonId, userId])

    const fetchData = async () => {
        setLoading(true)
        try {
            const [likeRes, commentRes] = await Promise.all([
                fetch(`/api/social/like?lessonId=${lessonId}&userId=${userId}`),
                fetch(`/api/social/comment?lessonId=${lessonId}`)
            ])
            const likeData = await likeRes.json()
            const commentData = await commentRes.json()

            if (likeData.success) {
                setLiked(likeData.isLiked)
                setLikeCount(likeData.count)
            }
            if (commentData.success) {
                setComments(commentData.comments)
            }
        } catch (error) {
            console.error("Failed to fetch engagement data", error)
        } finally {
            setLoading(false)
        }
    }

    const handleLike = async () => {
        const originalLiked = liked
        const originalCount = likeCount

        // Optimistic UI
        setLiked(!liked)
        setLikeCount(prev => liked ? prev - 1 : prev + 1)

        try {
            const res = await fetch("/api/social/like", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, lessonId })
            })
            const data = await res.json()
            if (!data.success) throw new Error()
        } catch (error) {
            // Revert on error
            setLiked(originalLiked)
            setLikeCount(originalCount)
        }
    }

    const handlePostComment = async () => {
        if (!newComment.trim()) return
        const text = newComment
        setNewComment("")

        try {
            const res = await fetch("/api/social/comment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, lessonId, text })
            })
            const data = await res.json()
            if (data.success) {
                setComments(prev => [data.comment, ...prev])
            }
        } catch (error) {
            console.error("Failed to post comment")
        }
    }

    const handleDeleteComment = async (id: string) => {
        try {
            const res = await fetch(`/api/social/comment?id=${id}`, { method: "DELETE" })
            if (res.ok) {
                setComments(prev => prev.filter(c => c.id !== id))
            }
        } catch (error) {
            console.error("Delete failed")
        }
    }

    if (loading) return <div className="animate-pulse h-40 bg-secondary/20 rounded-[2.5rem]" />

    return (
        <div className="space-y-8">
            {/* Like Section */}
            <div className="flex items-center gap-6">
                <button
                    onClick={handleLike}
                    className={`flex items-center gap-2 px-6 py-3 rounded-2xl transition-all font-black text-sm uppercase tracking-widest ${liked ? "bg-red-500 text-white shadow-lg shadow-red-500/20" : "bg-white text-primary/40 border border-primary/5 hover:border-primary/20"
                        }`}
                >
                    <Heart className={`w-5 h-5 ${liked ? "fill-current" : ""}`} />
                    {likeCount} {liked ? "Yoqdi" : "Yoqtirish"}
                </button>
                <div className="flex items-center gap-2 text-primary/40 text-sm font-bold">
                    <MessageSquare className="w-5 h-5" />
                    {comments.length} Fikrlar
                </div>
            </div>

            {/* Comment Input */}
            <div className="relative group">
                <textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Fikringizni qoldiring..."
                    className="w-full bg-white border border-primary/5 rounded-[2rem] p-6 text-sm min-h-[100px] focus:outline-none focus:ring-2 focus:ring-wellness-gold transition-all shadow-sm group-hover:shadow-md"
                />
                <button
                    onClick={handlePostComment}
                    disabled={!newComment.trim()}
                    className="absolute bottom-4 right-4 p-3 bg-primary text-white rounded-xl shadow-xl hover:bg-wellness-gold disabled:opacity-50 transition-all active:scale-95"
                >
                    <Send className="w-4 h-4" />
                </button>
            </div>

            {/* Comments List */}
            <div className="space-y-4">
                <AnimatePresence>
                    {comments.map((comment) => (
                        <motion.div
                            key={comment.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-white p-6 rounded-3xl border border-primary/5 shadow-sm group"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-black text-primary text-sm tracking-tight">{comment.user.name}</div>
                                    <div className="text-[10px] text-primary/30 font-bold uppercase tracking-widest">
                                        {new Date(comment.createdAt).toLocaleDateString()}
                                    </div>
                                </div>
                                {(isAdmin || comment.userId === userId) && (
                                    <button
                                        onClick={() => handleDeleteComment(comment.id)}
                                        className="opacity-0 group-hover:opacity-100 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                )}
                            </div>
                            <p className="text-sm text-primary/70 leading-relaxed font-medium">
                                {comment.text}
                            </p>
                        </motion.div>
                    ))}
                </AnimatePresence>

                {comments.length === 0 && (
                    <div className="text-center py-12 text-primary/20 font-black uppercase tracking-widest text-xs">
                        Birinchi bo'lib fikr qoldiring
                    </div>
                )}
            </div>
        </div>
    )
}
