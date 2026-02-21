import { cn } from "@/lib/utils"

interface SkeletonProps {
    className?: string
    variant?: 'text' | 'card' | 'circle' | 'kpi'
}

export function Skeleton({ className, variant = 'text' }: SkeletonProps) {
    const variants = {
        text: "h-4 w-full rounded-lg",
        card: "h-64 w-full rounded-[2.5rem]",
        circle: "w-14 h-14 rounded-full",
        kpi: "h-40 w-full rounded-[2.5rem]",
    }

    return (
        <div
            className={cn(
                "skeleton-pulse",
                variants[variant],
                className
            )}
            role="status"
            aria-label="Loading..."
        >
            <span className="sr-only">Loading...</span>
        </div>
    )
}

export function SkeletonKPIGrid() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} variant="kpi" />
            ))}
        </div>
    )
}

export function SkeletonCard() {
    return (
        <div className="space-y-4">
            <Skeleton variant="card" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
        </div>
    )
}
