
"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ChatMessage {
    id: string
    courseId: string
    userId: string
    message: string
    createdAt: string
    course: { title: string }
    user: { firstName: string; lastName: string; email: string }
}

export function AdminChat() {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch('/api/admin/chat')
            .then(res => res.json())
            .then(data => {
                if (data.success) setMessages(data.messages)
            })
            .finally(() => setLoading(false))
    }, [])

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-serif font-black text-[var(--foreground)]">Foydalanuvchi Chatlari</h2>
            <div className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border)] shadow-sm p-6">
                {loading ? (
                    <Loader2 className="w-8 h-8 animate-spin mx-auto text-[var(--primary)]" />
                ) : messages.length === 0 ? (
                    <p className="text-center opacity-40 text-[var(--foreground)] font-bold">Xabarlar yo'q</p>
                ) : (
                    <div className="space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className="border-b border-[var(--border)] pb-4 last:border-0 hover:bg-[var(--primary)]/5 p-4 rounded-2xl transition-all">
                                <div className="flex justify-between mb-2">
                                    <span className="font-bold text-[var(--foreground)]">{msg.user.firstName} {msg.user.lastName}</span>
                                    <span className="text-[10px] opacity-40 uppercase font-black tracking-widest text-[var(--foreground)]">{new Date(msg.createdAt).toLocaleString()}</span>
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-[var(--primary)] opacity-60 mb-2">{msg.course.title}</p>
                                <p className="text-sm text-[var(--foreground)] opacity-80 leading-relaxed font-medium">{msg.message}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}


