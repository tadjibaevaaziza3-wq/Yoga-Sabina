"use client"

import React, { useState, useEffect, useRef } from "react"
import {
    MessageCircle,
    Search,
    Send,
    Trash2,
    Users,
    Hash,
    Loader2,
    ShieldCheck,
    MoreVertical,
    ChevronRight,
    MessageSquare,
    AlertCircle
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { useSocket } from "@/hooks/useSocket"

interface ChatRoom {
    id: string
    title: string
    titleRu: string | null
    type: string
    messageCount: number
}

interface ChatMessage {
    id: string
    userId: string
    message: string
    createdAt: string
    user: {
        id: string
        firstName: string | null
        lastName: string | null
        email: string
        role: string
        avatar?: string | null
    }
}

export function GroupChatManager() {
    const [rooms, setRooms] = useState<ChatRoom[]>([])
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [loadingRooms, setLoadingRooms] = useState(true)
    const [loadingMessages, setLoadingMessages] = useState(false)
    const [newMessage, setNewMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const { socket } = useSocket()

    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        fetchRooms()
    }, [])

    useEffect(() => {
        if (selectedRoomId) {
            fetchMessages(selectedRoomId)
        }
    }, [selectedRoomId])

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages])

    // Socket integration
    useEffect(() => {
        if (!socket || !selectedRoomId) return;

        const roomId = `course-${selectedRoomId}`;
        socket.emit('join-room', roomId);

        socket.on('new-message', (data: { message: ChatMessage }) => {
            setMessages((prev) => {
                if (prev.find(m => m.id === data.message.id)) return prev;
                return [...prev, data.message];
            });
        });

        return () => {
            socket.off('new-message');
        };
    }, [socket, selectedRoomId]);

    const fetchRooms = async () => {
        setLoadingRooms(true)
        try {
            const res = await fetch('/api/admin/chat/rooms')
            const data = await res.json()
            if (data.success) {
                setRooms(data.rooms)
            }
        } catch (e) {
            console.error('Failed to fetch chat rooms:', e)
        } finally {
            setLoadingRooms(false)
        }
    }

    const fetchMessages = async (courseId: string) => {
        setLoadingMessages(true)
        try {
            const res = await fetch(`/api/admin/chat/${courseId}`)
            const data = await res.json()
            if (data.success) {
                setMessages(data.messages)
            }
        } catch (e) {
            console.error('Failed to fetch messages:', e)
        } finally {
            setLoadingMessages(false)
        }
    }

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedRoomId || !newMessage.trim() || sending) return

        setSending(true)
        try {
            const res = await fetch(`/api/admin/chat/${selectedRoomId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message: newMessage.trim() })
            })
            const data = await res.json()
            if (data.success) {
                setMessages([...messages, data.message])
                setNewMessage("")

                if (socket) {
                    socket.emit('send-message', {
                        roomId: `course-${selectedRoomId}`,
                        message: data.message
                    });
                }
            }
        } catch (e) {
            console.error('Failed to send message:', e)
        } finally {
            setSending(false)
        }
    }

    const handleDeleteMessage = async (messageId: string) => {
        if (!confirm("Ushbu xabarni o'chirib tashlamoqchimisiz?")) return

        try {
            const res = await fetch(`/api/admin/chat/${selectedRoomId}?messageId=${messageId}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            if (data.success) {
                setMessages(messages.filter(m => m.id !== messageId))
            }
        } catch (e) {
            console.error('Failed to delete message:', e)
        }
    }

    const filteredRooms = rooms.filter(r =>
        r.title.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const selectedRoom = rooms.find(r => r.id === selectedRoomId)

    return (
        <div className="flex h-[750px] bg-white rounded-[3rem] border border-[var(--border)] overflow-hidden shadow-2xl">
            {/* Rooms Sidebar */}
            <div className="w-80 border-r border-[var(--border)] flex flex-col bg-[#f8fafc]">
                <div className="p-8 border-b border-[var(--border)] bg-white">
                    <h2 className="text-2xl font-editorial font-bold text-[var(--primary)] mb-6 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-[var(--accent)]" />
                        Guruhlar
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Qidirish..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 bg-gray-100 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-[var(--primary)]/10 transition-all border-none"
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    {loadingRooms ? (
                        <div className="flex justify-center py-20 grayscale opacity-20">
                            <Loader2 className="w-6 h-6 animate-spin" />
                        </div>
                    ) : filteredRooms.length === 0 ? (
                        <div className="text-center py-20 opacity-30">
                            <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                            <p className="text-[10px] font-bold uppercase tracking-widest">Guruhlar topilmadi</p>
                        </div>
                    ) : (
                        filteredRooms.map(room => (
                            <button
                                key={room.id}
                                onClick={() => setSelectedRoomId(room.id)}
                                className={`w-full text-left p-4 rounded-2xl transition-all group flex items-center justify-between ${selectedRoomId === room.id
                                    ? "bg-[var(--primary)] text-white shadow-button"
                                    : "hover:bg-white text-[var(--primary)]/60"
                                    }`}
                            >
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${selectedRoomId === room.id ? "bg-white/20" : "bg-white border border-[var(--border)]"
                                        }`}>
                                        <Hash className="w-4 h-4" />
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold truncate leading-none mb-1">
                                            {room.title}
                                        </p>
                                        <p className={`text-[10px] uppercase tracking-widest font-black opacity-50 ${selectedRoomId === room.id ? "text-white" : "text-[var(--accent)]"
                                            }`}>
                                            {room.type}
                                        </p>
                                    </div>
                                </div>
                                <div className={`px-2 py-1 rounded-lg text-[9px] font-black ${selectedRoomId === room.id ? "bg-white/20 text-white" : "bg-[var(--primary)]/10 text-[var(--primary)]"
                                    }`}>
                                    {room.messageCount}
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white">
                {selectedRoomId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-8 border-b border-[var(--border)] flex items-center justify-between bg-white z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] flex items-center justify-center text-white shadow-soft">
                                    <Hash className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-editorial font-bold text-[var(--primary)] truncate">{selectedRoom?.title}</h3>
                                    <p className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-[0.3em]">Moderatsiya Mode</p>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button className="p-3 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                                    <Users className="w-5 h-5" />
                                </button>
                                <button className="p-3 hover:bg-gray-100 rounded-xl text-gray-400 transition-colors">
                                    <MoreVertical className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Messages Area */}
                        <div
                            ref={scrollRef}
                            className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#fbfcfd]"
                        >
                            {loadingMessages ? (
                                <div className="flex items-center justify-center h-full grayscale opacity-20">
                                    <Loader2 className="w-8 h-8 animate-spin" />
                                </div>
                            ) : messages.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full opacity-20 grayscale">
                                    <MessageCircle className="w-16 h-16 mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-[0.3em]">Bu xonada hali xabarlar yo'q</p>
                                </div>
                            ) : (
                                <div className="space-y-6 max-w-4xl mx-auto">
                                    {messages.map((msg, idx) => {
                                        const isAdmin = msg.user.role === 'ADMIN' || msg.user.role === 'SUPER_ADMIN'
                                        return (
                                            <div
                                                key={msg.id}
                                                className={`flex flex-col ${isAdmin ? 'items-end' : 'items-start'} group`}
                                            >
                                                <div className={`flex items-end gap-3 ${isAdmin ? 'flex-row-reverse' : ''}`}>
                                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-black uppercase tracking-tighter overflow-hidden border border-[var(--primary)]/5 ${isAdmin ? 'bg-[var(--primary)] text-white' : 'bg-[var(--accent)]/10 text-[var(--accent)]'
                                                        }`}>
                                                        {msg.user?.avatar ? (
                                                            <span className="text-lg">{msg.user.avatar}</span>
                                                        ) : (
                                                            msg.user.firstName?.[0] || 'U'
                                                        )}
                                                    </div>
                                                    <div className="max-w-md relative">
                                                        <div className={`px-6 py-4 rounded-3xl shadow-sm relative ${isAdmin
                                                            ? 'bg-[var(--primary)] text-white rounded-br-none'
                                                            : 'bg-white border border-[var(--primary)]/5 text-[var(--primary)] rounded-bl-none font-medium'
                                                            }`}>
                                                            {msg.message}
                                                        </div>
                                                        <div className={`mt-2 flex items-center gap-3 px-2 ${isAdmin ? 'justify-end' : ''}`}>
                                                            <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                                                                {msg.user.firstName} тАв {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            <button
                                                                onClick={() => handleDeleteMessage(msg.id)}
                                                                className="opacity-0 group-hover:opacity-100 p-1 text-rose-500 hover:bg-rose-50 rounded transition-all"
                                                                title="Delete message"
                                                            >
                                                                <Trash2 className="w-3 h-3" />
                                                            </button>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-8 border-t border-[var(--border)] bg-white">
                            <form onSubmit={handleSendMessage} className="flex gap-4">
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Xabaringizni yozing..."
                                        className="w-full pl-6 pr-14 py-5 bg-gray-50 rounded-[2rem] border border-[var(--border)] outline-none focus:border-[var(--primary)]/30 focus:bg-white transition-all text-sm font-medium"
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                        <button
                                            type="submit"
                                            disabled={!newMessage.trim() || sending}
                                            className="w-10 h-10 rounded-full bg-[var(--primary)] text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all disabled:opacity-30 disabled:hover:scale-100"
                                        >
                                            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </form>
                            <div className="mt-4 flex items-center gap-2 justify-center opacity-30">
                                <ShieldCheck className="w-3 h-3" />
                                <span className="text-[9px] font-bold uppercase tracking-widest">Administrator Moderatsiya Rejimi</span>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-20 text-center space-y-8">
                        <div className="relative">
                            <div className="w-32 h-32 rounded-[2.5rem] bg-[var(--primary)]/5 flex items-center justify-center text-[var(--primary)]/20 animate-pulse">
                                <MessageCircle className="w-16 h-16" />
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-12 h-12 rounded-2xl bg-[var(--accent)] flex items-center justify-center text-white shadow-button rotate-12">
                                <ShieldCheck className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="max-w-md">
                            <h3 className="text-3xl font-editorial font-bold text-[var(--primary)] mb-4 tracking-tight">Guruh Moderatsiyasi</h3>
                            <p className="text-sm text-[var(--primary)]/60 leading-relaxed font-medium italic">
                                Chap tomondagi ro'yxatdan biror kursni tanlang va talabalar bilan muloqotni boshlang yoki xabarlarni moderatsiya qiling.
                            </p>
                        </div>
                        <div className="flex items-center gap-6 pt-10 border-t border-[var(--border)] w-full max-w-xs">
                            <div className="flex-1 text-center">
                                <p className="text-2xl font-editorial font-bold text-[var(--primary)]">{rooms.length}</p>
                                <p className="text-[10px] uppercase font-black tracking-widest text-[var(--accent)]">Guruhlar</p>
                            </div>
                            <div className="w-px h-10 bg-[var(--border)]" />
                            <div className="flex-1 text-center">
                                <p className="text-2xl font-editorial font-bold text-[var(--primary)]">
                                    {rooms.reduce((acc, r) => acc + r.messageCount, 0)}
                                </p>
                                <p className="text-[10px] uppercase font-black tracking-widest text-[var(--accent)]">Xabarlar</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
