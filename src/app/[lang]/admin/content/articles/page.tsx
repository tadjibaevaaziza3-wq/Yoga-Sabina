"use client"

import { useState, useEffect } from "react"
import { AdminLayout } from "@/components/admin/AdminLayout"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { toast } from "sonner"
import { Plus } from "lucide-react"

export default function ArticlesPage() {
    const [articles, setArticles] = useState<any[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [newArticle, setNewArticle] = useState({
        titleUz: "",
        titleRu: "",
        contentUz: "",
        contentRu: ""
    })

    useEffect(() => {
        loadArticles()
    }, [])

    const loadArticles = async () => {
        const res = await fetch('/api/admin/content/articles')
        if (res.ok) setArticles(await res.json())
    }

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await fetch('/api/admin/content/articles', {
            method: 'POST',
            body: JSON.stringify({
                title: { uz: newArticle.titleUz, ru: newArticle.titleRu },
                content: { uz: newArticle.contentUz, ru: newArticle.contentRu },
                status: 'PUBLISHED'
            })
        })
        if (res.ok) {
            toast.success("Article published")
            setIsCreating(false)
            loadArticles()
        }
    }

    return (
        <AdminLayout title="Articles & Blog">
            <div className="flex justify-between mb-8">
                <h2 className="text-2xl font-bold">Library</h2>
                <Button onClick={() => setIsCreating(!isCreating)}>
                    <Plus className="w-4 h-4 mr-2" /> Write Article
                </Button>
            </div>

            {isCreating && (
                <form onSubmit={handleCreate} className="bg-white p-6 rounded-xl border mb-8 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <Input placeholder="Title (UZ)" value={newArticle.titleUz} onChange={e => setNewArticle({ ...newArticle, titleUz: e.target.value })} />
                        <Input placeholder="Title (RU)" value={newArticle.titleRu} onChange={e => setNewArticle({ ...newArticle, titleRu: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <textarea
                            className="w-full p-4 border rounded-xl" placeholder="Content (UZ)..."
                            value={newArticle.contentUz} onChange={e => setNewArticle({ ...newArticle, contentUz: e.target.value })}
                        />
                        <textarea
                            className="w-full p-4 border rounded-xl" placeholder="Content (RU)..."
                            value={newArticle.contentRu} onChange={e => setNewArticle({ ...newArticle, contentRu: e.target.value })}
                        />
                    </div>
                    <div className="flex justify-end">
                        <Button type="submit">Publish</Button>
                    </div>
                </form>
            )}

            <div className="grid gap-4">
                {articles.map(a => (
                    <div key={a.id} className="bg-white p-4 rounded-xl border">
                        <h3 className="font-bold">{a.title?.uz || "No Title"}</h3>
                        <p className="text-sm text-gray-500">{new Date(a.createdAt).toLocaleDateString()}</p>
                    </div>
                ))}
            </div>
        </AdminLayout>
    )
}
