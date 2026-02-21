
"use client"

import { AdminCourseManagement } from "@/components/admin/CourseManagement"

export default function AdminCoursesPage() {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-editorial font-bold text-[var(--primary)] tracking-tight">Kurslar Boshqaruvi</h1>
            <AdminCourseManagement />
        </div>
    )
}
