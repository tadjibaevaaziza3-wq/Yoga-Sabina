"use client"

import React, { useState, useEffect } from "react"
import {
    MessageCircle,
    Search,
    AlertCircle,
    Loader2,
    MessageSquare,
    Hash
} from "lucide-react"
import CourseChat from "@/components/user/CourseChat"

interface ChatRoom {
    id: string
    title: string
    titleRu: string | null
    type: string
    coverImage: string | null
    messageCount: number
}

interface UserChatManagerProps {
    currentUserId: string
    lang: 'uz' | 'ru'
}

export function UserChatManager({ currentUserId, lang }: UserChatManagerProps) {
    const [rooms, setRooms] = useState<ChatRoom[]>([])
    const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null)
    const [loadingRooms, setLoadingRooms] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    useEffect(() => {
        fetchRooms()
    }, [])

    const fetchRooms = async () => {
        setLoadingRooms(true)
        try {
            const res = await fetch('/api/user/chat/rooms')
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

    const filteredRooms = rooms.filter(r => {
        const title = r.title?.toLowerCase() || ''
        const titleRu = r.titleRu?.toLowerCase() || ''
        const search = searchQuery.toLowerCase()
        return title.includes(search) || titleRu.includes(search)
    })

    const selectedRoom = rooms.find(r => r.id === selectedRoomId)

    const getText = (uz: string, ru?: string | null) => {
        return lang === 'ru' && ru ? ru : uz;
    }

    return (
        <div className="flex h-[750px] bg-white rounded-[3rem] border border-[var(--border)] overflow-hidden shadow-2xl">
            {/* Rooms Sidebar */}
            <div className="w-80 border-r border-[var(--border)] flex flex-col bg-[#f8fafc]">
                <div className="p-8 border-b border-[var(--border)] bg-white">
                    <h2 className="text-2xl font-editorial font-bold text-[var(--primary)] mb-6 flex items-center gap-2">
                        <MessageSquare className="w-6 h-6 text-[var(--accent)]" />
                        {lang === 'ru' ? 'Мои Чаты' : 'Mening Chatlarim'}
                    </h2>
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder={lang === 'ru' ? 'Поиск...' : 'Qidirish...'}
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
                            <p className="text-[10px] font-bold uppercase tracking-widest">
                                {lang === 'ru' ? 'Чаты не найдены' : 'Chatlar topilmadi'}
                            </p>
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
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 overflow-hidden ${selectedRoomId === room.id ? "bg-white/20" : "bg-white border border-[var(--border)]"
                                        }`}>
                                        {room.coverImage ? (
                                            <img src={room.coverImage} alt={room.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <Hash className="w-4 h-4" />
                                        )}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="text-sm font-bold truncate leading-none mb-1">
                                            {getText(room.title, room.titleRu)}
                                        </p>
                                        <p className={`text-[10px] uppercase tracking-widest font-black opacity-50 ${selectedRoomId === room.id ? "text-white" : "text-[var(--accent)]"
                                            }`}>
                                            {room.type}
                                        </p>
                                    </div>
                                </div>
                            </button>
                        ))
                    )}
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col bg-white overflow-hidden relative">
                {selectedRoomId ? (
                    <CourseChat
                        key={selectedRoomId} // Force remount when course changes
                        courseId={selectedRoomId}
                        currentUserId={currentUserId}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center p-20 text-center">
                        <div className="max-w-md">
                            <div className="w-32 h-32 mx-auto rounded-[2.5rem] bg-[var(--primary)]/5 flex items-center justify-center text-[var(--primary)]/20 mb-8 animate-pulse">
                                <MessageCircle className="w-16 h-16" />
                            </div>
                            <h3 className="text-3xl font-editorial font-bold text-[var(--primary)] mb-4 tracking-tight">
                                {lang === 'ru' ? 'Сообщения Курсов' : 'Kurs Xabarlari'}
                            </h3>
                            <p className="text-sm text-[var(--primary)]/60 leading-relaxed font-medium italic">
                                {lang === 'ru'
                                    ? 'Выберите курс из списка слева, чтобы начать общение с другими студентами и преподавателями.'
                                    : 'Chap tomondagi ro\'yxatdan biror kursni tanlab, boshqa talabalar va o\'qituvchilar bilan muloqotni boshlang.'}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
