"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { toast } from "sonner"
import { Plus, Image as ImageIcon, Video, Type } from "lucide-react"

export default function PostsPage() {
    const [posts, setPosts] = useState<any[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [newPost, setNewPost] = useState({
        type: "TEXT",
        content: "",
        mediaUrl: "",
        ctaLink: "",
        ctaText: ""
    })

    useEffect(() => {
        loadPosts()
    }, [])

    const loadPosts = async () => {
        const res = await fetch('/api/admin/content/posts')
        if (res.ok) setPosts(await res.json())
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/admin/content/posts', {
            method: 'POST',
            body: JSON.stringify({ ...newPost, status: 'PUBLISHED' })
        })
        if (res.ok) {
            toast.success("Post published to Feed")
            setIsCreating(false)
            loadPosts()
        }
    }

    return (
        <AdminLayout title="Feed & Community">
            <div className="flex justify-between mb-8">
                <h2 className="text-2xl font-bold">Community Feed</h2>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    <Plus className="w-4 h-4 mr-2" /> New Post
                </Button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border mb-8 space-y-4 max-w-2xl">
                    <div className="flex gap-4 mb-4">
                        {['TEXT', 'IMAGE', 'VIDEO'].map(t => (
                            <button
                                key={t} type="button"
                                onClick={() => setNewPost({ ...newPost, type: t })}
                                className={`px-4 py-2 rounded-lg border ${newPost.type === t ? 'bg-black text-white' : 'bg-gray-50'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>

                    <textarea
                        className="w-full p-4 border rounded-xl h-32"
                        placeholder="What's new?"
                        value={newPost.content} onChange={e => setNewPost({ ...newPost, content: e.target.value })}
                    />

                    {newPost.type !== 'TEXT' && (
                        <Input placeholder="Media URL..." value={newPost.mediaUrl} onChange={e => setNewPost({ ...newPost, mediaUrl: e.target.value })} />
                    )}

                    <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="CTA Link (optional)" value={newPost.ctaLink} onChange={e => setNewPost({ ...newPost, ctaLink: e.target.value })} />
                        <Input placeholder="Button Text" value={newPost.ctaText} onChange={e => setNewPost({ ...newPost, ctaText: e.target.value })} />
                    </div>

                    <div className="flex justify-end">
                        <Button type="submit">Post to Feed</Button>
                    </div>
                </form>
            )}

            <div className="space-y-4 max-w-2xl">
                {posts.map(post => (
                    <div key={post.id} className="bg-white p-6 rounded-xl border">
                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-bold px-2 py-1 bg-gray-100 rounded">{post.type}</span>
                            <span className="text-xs text-gray-400">{new Date(post.createdAt).toLocaleDateString()}</span>
                        </div>
                        <p className="mb-4">{post.content}</p>
                        {post.mediaUrl && (
                            <div className="bg-gray-100 h-48 rounded-lg mb-4 flex items-center justify-center text-gray-400">
                                Media Preview: {post.mediaUrl}
                            </div>
                        )}
                        {post.ctaLink && (
                            <a href={post.ctaLink} target="_blank" rel="noopener noreferrer"
                                className="block w-full text-center py-3 px-6 border border-[var(--primary)]/20 rounded-xl font-bold text-sm text-[var(--primary)] hover:bg-[var(--secondary)] transition-all"
                            >
                                {post.ctaText || "Learn More"}
                            </a>
                        )}
                    </div>
                ))}
            </div>
        </AdminLayout>
    )
}
