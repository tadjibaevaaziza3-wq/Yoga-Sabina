
"use client"

import { use } from "react"
import CourseForm from "@/components/admin/CourseForm"
import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const [course, setCourse] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch(`/api/admin/courses/${id}`)
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    setCourse(data.course)
                }
            })
            .finally(() => setLoading(false))
    }, [id])

    if (loading) return <Loader2 className="w-8 h-8 animate-spin mx-auto mt-12 text-[var(--primary)]" />

    if (!course) return <div>Course not found</div>

    return (
        <div className="space-y-6">
            <CourseForm courseId={id} initialData={course} />
        </div>
    )
}
