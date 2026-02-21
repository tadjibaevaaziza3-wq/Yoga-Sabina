import * as React from "react"
import { cn } from "@/lib/utils"

export interface InputProps
    extends React.InputHTMLAttributes<HTMLInputElement> {
    error?: boolean
    errorMessage?: string
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className, type, error, errorMessage, id, ...props }, ref) => {
        const errorId = id ? `${id}-error` : undefined

        return (
            <div className="w-full">
                <input
                    type={type}
                    id={id}
                    className={cn(
                        "flex h-12 w-full rounded-2xl border bg-white px-4 py-2 text-sm",
                        "ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium",
                        "placeholder:text-[var(--primary)]/40",
                        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                        "disabled:cursor-not-allowed disabled:opacity-50",
                        "transition-all duration-300",
                        error
                            ? "border-red-400 ring-red-400/20 bg-red-50/30"
                            : "border-[var(--primary)]/10",
                        className
                    )}
                    ref={ref}
                    aria-invalid={error || undefined}
                    aria-describedby={error && errorId ? errorId : undefined}
                    {...props}
                />
                {error && errorMessage && (
                    <p
                        id={errorId}
                        className="mt-1.5 ml-4 text-xs font-semibold text-red-500 animate-in fade-in slide-in-from-top-1"
                        role="alert"
                    >
                        {errorMessage}
                    </p>
                )}
            </div>
        )
    }
)
Input.displayName = "Input"

export { Input }
