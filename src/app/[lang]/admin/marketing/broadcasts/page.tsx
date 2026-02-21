"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { toast } from "sonner"
import { Send, Users, Image as ImageIcon, Video, Music, Loader2 } from "lucide-react"

export default function BroadcastsPage() {
    const [targetAudience, setTargetAudience] = useState<'ALL' | 'COURSE' | 'SPECIFIC'>('ALL')
    const [selectedCourseId, setSelectedCourseId] = useState('')
    const [specificTelegramId, setSpecificTelegramId] = useState('')

    const [messageText, setMessageText] = useState('')
    const [mediaType, setMediaType] = useState<'TEXT' | 'PHOTO' | 'VIDEO' | 'AUDIO'>('TEXT')
    const [mediaUrl, setMediaUrl] = useState('')

    const [isSending, setIsSending] = useState(false)
    const [courses, setCourses] = useState<any[]>([])

    useEffect(() => {
        // Fetch courses for the dropdown
        fetch('/api/admin/courses')
            .then(res => res.json())
            .then(data => setCourses(data))
            .catch(err => console.error("Failed to fetch courses", err))
    }, [])

    const handleSendBroadcast = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!messageText.trim() && mediaType === 'TEXT') {
            toast.error("Please enter a message")
            return
        }

        if (mediaType !== 'TEXT' && !mediaUrl.trim()) {
            toast.error(`Please provide a valid ${mediaType.toLowerCase()} URL`)
            return
        }

        setIsSending(true)
        try {
            const res = await fetch('/api/admin/marketing/broadcasts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    target: targetAudience,
                    courseId: selectedCourseId,
                    telegramId: specificTelegramId,
                    type: mediaType,
                    content: messageText,
                    mediaUrl: mediaType !== 'TEXT' ? mediaUrl : null
                })
            })

            const data = await res.json()
            if (data.success) {
                toast.success(`Message sent successfully to ${data.sentCount} user(s)!`)
                setMessageText('')
                setMediaUrl('')
            } else {
                toast.error(data.error || "Failed to send broadcast")
            }
        } catch (error) {
            toast.error("An error occurred while sending")
        } finally {
            setIsSending(false)
        }
    }

    return (
        <AdminLayout title="Telegram Broadcasts">
            <div className="max-w-4xl mx-auto space-y-8">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            <Send className="w-5 h-5 text-blue-500" />
                            New Broadcast
                        </h2>
                    </div>

                    <form onSubmit={handleSendBroadcast} className="space-y-6">

                        {/* 1. Target Audience */}
                        <div className="space-y-3">
                            <label className="text-sm font-semibold text-gray-700">1. Select Target Audience</label>
                            <div className="flex gap-4">
                                {(["ALL", "COURSE", "SPECIFIC"] as const).map((type) => (
                                    <label key={type} className={`flex-1 flex flex-col items-center gap-2 p-4 border rounded-xl cursor-pointer transition-all ${targetAudience === type ? 'border-primary bg-primary/5 shadow-sm' : 'hover:bg-gray-50'}`}>
                                        <input
                                            type="radio"
                                            name="audience"
                                            value={type}
                                            checked={targetAudience === type}
                                            onChange={() => setTargetAudience(type)}
                                            className="sr-only"
                                        />
                                        <Users className={`w-6 h-6 ${targetAudience === type ? 'text-primary' : 'text-gray-400'}`} />
                                        <span className={`font-medium ${targetAudience === type ? 'text-primary' : 'text-gray-600'}`}>
                                            {type === 'ALL' ? 'All Users' : type === 'COURSE' ? 'Course Students' : 'Specific User'}
                                        </span>
                                    </label>
                                ))}
                            </div>

                            {/* Conditional Target Inputs */}
                            {targetAudience === 'COURSE' && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Select Course</label>
                                    <select
                                        value={selectedCourseId}
                                        onChange={(e) => setSelectedCourseId(e.target.value)}
                                        className="w-full p-3 rounded-lg border focus:ring-2 focus:ring-primary/20 outline-none"
                                        required
                                    >
                                        <option value="">-- Choose a course --</option>
                                        {courses.map(c => (
                                            <option key={c.id} value={c.id}>{c.titleRu || c.title}</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {targetAudience === 'SPECIFIC' && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-in fade-in slide-in-from-top-2">
                                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Telegram User ID / Chat ID</label>
                                    <Input
                                        placeholder="e.g. 123456789"
                                        value={specificTelegramId}
                                        onChange={(e) => setSpecificTelegramId(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {/* 2. Message Type */}
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <label className="text-sm font-semibold text-gray-700">2. Message Type</label>
                            <div className="flex gap-4">
                                {[
                                    { type: 'TEXT', icon: Send, label: 'Text Only' },
                                    { type: 'PHOTO', icon: ImageIcon, label: 'Photo + Text' },
                                    { type: 'VIDEO', icon: Video, label: 'Video + Text' },
                                    { type: 'AUDIO', icon: Music, label: 'Audio + Text' },
                                ].map((item) => {
                                    const Icon = item.icon
                                    return (
                                        <label key={item.type} className={`flex-1 flex flex-col items-center gap-2 p-3 border rounded-xl cursor-pointer transition-all ${mediaType === item.type ? 'border-primary bg-primary/5 shadow-sm' : 'hover:bg-gray-50'}`}>
                                            <input
                                                type="radio"
                                                name="mediaType"
                                                value={item.type}
                                                checked={mediaType === item.type}
                                                onChange={() => setMediaType(item.type as any)}
                                                className="sr-only"
                                            />
                                            <Icon className={`w-5 h-5 ${mediaType === item.type ? 'text-primary' : 'text-gray-400'}`} />
                                            <span className={`text-xs font-medium ${mediaType === item.type ? 'text-primary' : 'text-gray-600'}`}>
                                                {item.label}
                                            </span>
                                        </label>
                                    )
                                })}
                            </div>

                            {/* Media URL Input */}
                            {mediaType !== 'TEXT' && (
                                <div className="mt-4 p-4 bg-gray-50 rounded-lg animate-in fade-in slide-in-from-top-2">
                                    <div className="flex justify-between items-center mb-2">
                                        <label className="block text-xs font-semibold uppercase tracking-wider text-gray-500">Media URL</label>
                                        <span className="text-[10px] text-gray-400 bg-gray-200 px-2 py-0.5 rounded">MUST BE PUBLIC</span>
                                    </div>
                                    <Input
                                        placeholder={`https://example.com/path/to/${mediaType.toLowerCase()}`}
                                        value={mediaUrl}
                                        onChange={(e) => setMediaUrl(e.target.value)}
                                        required
                                    />
                                </div>
                            )}
                        </div>

                        {/* 3. Message Content */}
                        <div className="space-y-3 pt-4 border-t border-gray-100">
                            <label className="text-sm font-semibold text-gray-700">3. Message Text {mediaType !== 'TEXT' && '(Caption)'}</label>
                            <textarea
                                className="w-full p-4 border rounded-xl h-40 focus:ring-2 focus:ring-primary/20 outline-none resize-none font-medium text-sm"
                                placeholder="Type your message here. Markdown is supported (e.g. **bold**, *italic*)..."
                                value={messageText}
                                onChange={e => setMessageText(e.target.value)}
                                required={mediaType === 'TEXT'}
                            />
                        </div>

                        <div className="pt-6 border-t border-gray-100 flex justify-end">
                            <Button type="submit" size="lg" disabled={isSending} className="min-w-[200px] h-14 text-base relative overflow-hidden group shadow-lg">
                                {isSending ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Sending Broadcast...
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-5 h-5 mr-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                                        Send Message
                                    </>
                                )}
                            </Button>
                        </div>

                    </form>
                </div>
            </div>
        </AdminLayout>
    )
}
