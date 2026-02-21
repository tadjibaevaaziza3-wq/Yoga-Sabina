'use client';

/**
 * Course Chat Component
 * 
 * Features:
 * - Real-time chat for course subscribers
 * - Message history with auto-scroll
 * - Emoji support (basic)
 * - Delete own messages
 * - User avatars and names
 * - Auto-refresh every 5 seconds
 */

import { useEffect, useState, useRef } from 'react';
import { Send, Trash2, Smile } from 'lucide-react';
import { useSocket } from '@/hooks/useSocket';

interface ChatMessage {
    id: string;
    message: string;
    createdAt: string;
    user: {
        id: string;
        email: string;
        firstName?: string;
        lastName?: string;
        avatar?: string;
    };
}

interface CourseChatProps {
    courseId: string;
    currentUserId: string;
}

export default function CourseChat({ courseId, currentUserId }: CourseChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isSending, setIsSending] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const { socket, isConnected } = useSocket();

    const COMMON_EMOJIS = ['😊', '👍', '❤️', '🙏', '💪', '🔥', '✨', '🎉'];

    // Fetch messages
    const fetchMessages = async () => {
        try {
            const response = await fetch(`/api/courses/${courseId}/chat`);
            if (response.ok) {
                const data = await response.json();
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('Error fetching messages:', error);
        } finally {
            setIsLoading(false);
        }
    };

    // Initial fetch
    useEffect(() => {
        fetchMessages();
    }, [courseId]);

    // Socket Setup
    useEffect(() => {
        if (!socket) return;

        const roomId = `course-${courseId}`;
        socket.emit('join-room', roomId);

        socket.on('new-message', (data: { message: ChatMessage }) => {
            setMessages((prev) => {
                // Prevent duplicate if we sent it ourselves and already refreshed
                if (prev.find(m => m.id === data.message.id)) return prev;
                return [...prev, data.message];
            });
        });

        return () => {
            socket.off('new-message');
        };
    }, [socket, courseId]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Send message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        try {
            const response = await fetch(`/api/courses/${courseId}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage }),
            });

            if (response.ok) {
                const data = await response.json();
                setNewMessage('');
                // Optimized: already have the message object from response
                setMessages((prev) => [...prev, data.message]);

                // Emit to others
                if (socket) {
                    socket.emit('send-message', {
                        roomId: `course-${courseId}`,
                        message: data.message
                    });
                }
            }
        } catch (error) {
            console.error('Error sending message:', error);
        } finally {
            setIsSending(false);
        }
    };

    // Delete message
    const handleDeleteMessage = async (messageId: string) => {
        try {
            const response = await fetch(`/api/courses/${courseId}/chat/${messageId}`, {
                method: 'DELETE',
            });

            if (response.ok) {
                setMessages(messages.filter(m => m.id !== messageId));
            }
        } catch (error) {
            console.error('Error deleting message:', error);
        }
    };

    // Add emoji to message
    const addEmoji = (emoji: string) => {
        setNewMessage(prev => prev + emoji);
        setShowEmojiPicker(false);
    };

    // Get user display name
    const getUserDisplayName = (user: ChatMessage['user']) => {
        if (user.firstName || user.lastName) {
            return `${user.firstName || ''} ${user.lastName || ''}`.trim();
        }
        return user.email.split('@')[0];
    };

    // Get user initials for avatar
    const getUserInitials = (user: ChatMessage['user']) => {
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

        if (diffInHours < 24) {
            return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        }
        return date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--accent)] mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">Загрузка чата...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px] bg-white rounded-2xl border border-[var(--secondary)] shadow-sm">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[var(--secondary)] bg-gradient-to-r from-[var(--secondary)] to-white">
                <h3 className="font-black text-[var(--primary)] text-lg">Чат курса</h3>
                <p className="text-sm text-gray-600">Общайтесь с другими участниками</p>
            </div>

            {/* Messages */}
            <div
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4"
            >
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                        <p className="text-sm">Пока нет сообщений</p>
                        <p className="text-xs mt-1">Будьте первым, кто напишет!</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isOwnMessage = msg.user.id === currentUserId;
                        return (
                            <div
                                key={msg.id}
                                className={`flex gap-3 ${isOwnMessage ? 'flex-row-reverse' : ''}`}
                            >
                                {/* Avatar */}
                                <div className="flex-shrink-0">
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[var(--accent)]/60 to-[var(--accent)] flex items-center justify-center text-white font-bold text-sm overflow-hidden border border-[var(--primary)]/5">
                                        {msg.user.avatar ? (
                                            <span className="text-xl">{msg.user.avatar}</span>
                                        ) : (
                                            getUserInitials(msg.user)
                                        )}
                                    </div>
                                </div>

                                {/* Message Content */}
                                <div className={`flex-1 ${isOwnMessage ? 'text-right' : ''}`}>
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className={`text-sm font-bold text-gray-900 ${isOwnMessage ? 'order-2' : ''}`}>
                                            {getUserDisplayName(msg.user)}
                                        </span>
                                        <span className={`text-xs text-gray-500 ${isOwnMessage ? 'order-1' : ''}`}>
                                            {formatTime(msg.createdAt)}
                                        </span>
                                    </div>
                                    <div className={`inline-block max-w-[80%] ${isOwnMessage ? 'ml-auto' : ''}`}>
                                        <div
                                            className={`px-4 py-2 rounded-2xl ${isOwnMessage
                                                ? 'bg-[var(--accent)] text-white rounded-tr-sm'
                                                : 'bg-gray-100 text-gray-900 rounded-tl-sm'
                                                }`}
                                        >
                                            <p className="text-sm whitespace-pre-wrap break-words">{msg.message}</p>
                                        </div>
                                        {isOwnMessage && (
                                            <button
                                                onClick={() => handleDeleteMessage(msg.id)}
                                                className="mt-1 text-xs text-red-500 hover:text-red-700 flex items-center gap-1 ml-auto"
                                            >
                                                <Trash2 size={12} />
                                                Удалить
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="px-6 py-4 border-t border-[var(--secondary)] bg-gray-50">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            value={newMessage}
                            onChange={(e) => setNewMessage(e.target.value)}
                            placeholder="Написать сообщение..."
                            className="w-full px-4 py-3 pr-12 rounded-full border border-gray-300 focus:border-[var(--accent)] focus:ring-2 focus:ring-[var(--secondary)] outline-none"
                            disabled={isSending}
                        />
                        <button
                            type="button"
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[var(--accent)]"
                        >
                            <Smile size={20} />
                        </button>

                        {/* Emoji Picker */}
                        {showEmojiPicker && (
                            <div className="absolute bottom-full right-0 mb-2 bg-white border border-gray-200 rounded-lg shadow-lg p-3">
                                <div className="grid grid-cols-4 gap-2">
                                    {COMMON_EMOJIS.map((emoji) => (
                                        <button
                                            key={emoji}
                                            type="button"
                                            onClick={() => addEmoji(emoji)}
                                            className="text-2xl hover:bg-gray-100 rounded p-1"
                                        >
                                            {emoji}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        type="submit"
                        disabled={!newMessage.trim() || isSending}
                        className="px-6 py-3 bg-[var(--accent)] text-white rounded-full hover:bg-[var(--primary)] disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2 font-bold"
                    >
                        <Send size={18} />
                        {isSending ? 'Отправка...' : 'Отправить'}
                    </button>
                </form>
            </div>
        </div>
    );
}


