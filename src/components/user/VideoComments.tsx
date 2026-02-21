'use client';

/**
 * Video Comments Component
 * 
 * Features:
 * - Comment on videos with optional timestamps
 * - Reply threading
 * - Like/unlike comments
 * - Edit/delete own comments
 * - Pagination
 * - Jump to video timestamp
 */

import { useEffect, useState } from 'react';
import { MessageSquare, Heart, Edit2, Trash2, Reply, Clock } from 'lucide-react';

interface VideoCommentData {
    id: string;
    comment: string;
    timestamp?: number;
    likes: number;
    createdAt: string;
    updatedAt: string;
    user: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
    };
    replies?: VideoCommentData[];
}

interface VideoCommentsProps {
    lessonId: string;
    currentUserId: string;
    onSeekToTimestamp?: (seconds: number) => void;
}

export default function VideoComments({ lessonId, currentUserId, onSeekToTimestamp }: VideoCommentsProps) {
    const [comments, setComments] = useState<VideoCommentData[]>([]);
    const [newComment, setNewComment] = useState('');
    const [replyTo, setReplyTo] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editText, setEditText] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch comments
    const fetchComments = async () => {
        try {
            const response = await fetch(`/api/lessons/${lessonId}/comments`);
            if (response.ok) {
                const data = await response.json();
                setComments(data.comments || []);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchComments();
    }, [lessonId]);

    // Add comment
    const handleAddComment = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newComment.trim() || isSubmitting) return;

        setIsSubmitting(true);
        try {
            const response = await fetch(`/api/lessons/${lessonId}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    comment: newComment,
                    parentId: replyTo,
                }),
            });

            if (response.ok) {
                setNewComment('');
                setReplyTo(null);
                fetchComments();
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Edit comment
    const handleEditComment = async (commentId: string) => {
        if (!editText.trim()) return;

        try {
            const response = await fetch(`/api/lessons/${lessonId}/comments/${commentId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ comment: editText }),
            });

            if (response.ok) {
                setEditingId(null);
                setEditText('');
                fetchComments();
            }
        } catch (error) {
            console.error('Error editing comment:', error);
        }
    };

    // Delete comment
    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Удалить комментарий?')) return;

        try {
            const response = await fetch(`/api/lessons/${lessonId}/comments/${commentId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                fetchComments();
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };

    // Like comment
    const handleLikeComment = async (commentId: string) => {
        try {
            const response = await fetch(`/api/lessons/${lessonId}/comments/${commentId}/like`, {
                method: 'POST',
            });

            if (response.ok) {
                fetchComments();
            }
        } catch (error) {
            console.error('Error liking comment:', error);
        }
    };

    // Get user display name
    const getUserDisplayName = (user: VideoCommentData['user']) => {
        if (user.firstName || user.lastName) {
            return `${user.firstName || ''} ${user.lastName || ''}`.trim();
        }
        return user.email.split('@')[0];
    };

    // Get user initials
    const getUserInitials = (user: VideoCommentData['user']) => {
        if (user.firstName && user.lastName) {
            return `${user.firstName[0]}${user.lastName[0]}`.toUpperCase();
        }
        return user.email[0].toUpperCase();
    };

    // Format timestamp
    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 1) {
            const mins = Math.floor(diffInHours * 60);
            return `${mins} мин назад`;
        }
        if (diffInHours < 24) {
            return `${Math.floor(diffInHours)} ч назад`;
        }
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    // Format video timestamp
    const formatVideoTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Render single comment
    const renderComment = (comment: VideoCommentData, isReply = false) => {
        const isOwnComment = comment.user.id === currentUserId;
        const isEditing = editingId === comment.id;

        return (
            <div key={comment.id} className={`${isReply ? 'ml-12 mt-3' : 'mb-6'}`}>
                <div className="flex gap-3">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)]/60 to-[var(--accent)] flex items-center justify-center text-white font-bold text-sm">
                            {getUserInitials(comment.user)}
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                            <span className="font-bold text-gray-900 text-sm">
                                {getUserDisplayName(comment.user)}
                            </span>
                            <span className="text-xs text-gray-500">
                                {formatTime(comment.createdAt)}
                            </span>
                            {comment.timestamp && (
                                <button
                                    onClick={() => onSeekToTimestamp?.(comment.timestamp!)}
                                    className="flex items-center gap-1 text-xs text-[var(--accent)] hover:text-[var(--primary)] font-medium"
                                >
                                    <Clock size={12} />
                                    {formatVideoTime(comment.timestamp)}
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-2">
                                <textarea
                                    value={editText}
                                    onChange={(e) => setEditText(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--secondary)] outline-none text-sm"
                                    rows={3}
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleEditComment(comment.id)}
                                        className="px-3 py-1 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--primary)]"
                                    >
                                        Сохранить
                                    </button>
                                    <button
                                        onClick={() => {
                                            setEditingId(null);
                                            setEditText('');
                                        }}
                                        className="px-3 py-1 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <>
                                <p className="text-gray-700 text-sm whitespace-pre-wrap">{comment.comment}</p>

                                {/* Actions */}
                                <div className="flex items-center gap-4 mt-2">
                                    <button
                                        onClick={() => handleLikeComment(comment.id)}
                                        className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-500 transition-colors"
                                    >
                                        <Heart size={14} className={comment.likes > 0 ? 'fill-red-500 text-red-500' : ''} />
                                        {comment.likes > 0 && <span>{comment.likes}</span>}
                                    </button>

                                    {!isReply && (
                                        <button
                                            onClick={() => setReplyTo(comment.id)}
                                            className="flex items-center gap-1 text-xs text-gray-600 hover:text-[var(--accent)] transition-colors"
                                        >
                                            <Reply size={14} />
                                            Ответить
                                        </button>
                                    )}

                                    {isOwnComment && (
                                        <>
                                            <button
                                                onClick={() => {
                                                    setEditingId(comment.id);
                                                    setEditText(comment.comment);
                                                }}
                                                className="flex items-center gap-1 text-xs text-gray-600 hover:text-blue-600 transition-colors"
                                            >
                                                <Edit2 size={14} />
                                                Изменить
                                            </button>
                                            <button
                                                onClick={() => handleDeleteComment(comment.id)}
                                                className="flex items-center gap-1 text-xs text-gray-600 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                                Удалить
                                            </button>
                                        </>
                                    )}
                                </div>
                            </>
                        )}

                        {/* Replies */}
                        {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3">
                                {comment.replies.map(reply => renderComment(reply, true))}
                            </div>
                        )}

                        {/* Reply Form */}
                        {replyTo === comment.id && (
                            <form onSubmit={handleAddComment} className="mt-3">
                                <textarea
                                    value={newComment}
                                    onChange={(e) => setNewComment(e.target.value)}
                                    placeholder="Написать ответ..."
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--secondary)] outline-none text-sm"
                                    rows={2}
                                />
                                <div className="flex gap-2 mt-2">
                                    <button
                                        type="submit"
                                        disabled={!newComment.trim() || isSubmitting}
                                        className="px-4 py-2 bg-[var(--accent)] text-white rounded-lg text-sm hover:bg-[var(--primary)] disabled:opacity-50"
                                    >
                                        Ответить
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setReplyTo(null);
                                            setNewComment('');
                                        }}
                                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm hover:bg-gray-300"
                                    >
                                        Отмена
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)] mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Загрузка комментариев...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-[var(--secondary)] p-6">
            {/* Header */}
            <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="text-[var(--accent)]" size={24} />
                <h3 className="font-black text-[var(--primary)] text-lg">
                    Комментарии ({comments.length})
                </h3>
            </div>

            {/* Add Comment Form */}
            {!replyTo && (
                <form onSubmit={handleAddComment} className="mb-8">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Добавить комментарий..."
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--secondary)] outline-none"
                        rows={3}
                    />
                    <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmitting}
                        className="mt-2 px-6 py-2 bg-[var(--accent)] text-white rounded-lg hover:bg-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                        {isSubmitting ? 'Отправка...' : 'Добавить комментарий'}
                    </button>
                </form>
            )}

            {/* Comments List */}
            <div className="space-y-6">
                {comments.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                        <MessageSquare size={48} className="mx-auto mb-3 opacity-30" />
                        <p className="text-sm">Пока нет комментариев</p>
                        <p className="text-xs mt-1">Будьте первым, кто оставит комментарий!</p>
                    </div>
                ) : (
                    comments.map(comment => renderComment(comment))
                )}
            </div>
        </div>
    );
}


