"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg' | 'icon'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', children, onClick, ...props }, ref) => {
        const variants = {
            primary: "bg-[var(--primary)] text-white hover:bg-[var(--primary)]/90 shadow-soft",
            secondary: "bg-[var(--secondary)] text-[var(--primary)] hover:bg-[var(--secondary)]/80",
            outline: "border-2 border-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/5",
            ghost: "hover:bg-[var(--primary)]/5 text-[var(--primary)]",
        }

        const sizes = {
            sm: "h-9 px-4 text-xs",
            md: "h-12 px-8 text-sm",
            lg: "h-14 px-10 text-base",
            icon: "h-10 w-10 p-0 flex items-center justify-center",
        }

        const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
            // Ripple effect
            const button = e.currentTarget
            const rect = button.getBoundingClientRect()
            const ripple = document.createElement("span")
            const size = Math.max(rect.width, rect.height)
            ripple.style.width = ripple.style.height = `${size}px`
            ripple.style.left = `${e.clientX - rect.left - size / 2}px`
            ripple.style.top = `${e.clientY - rect.top - size / 2}px`
            ripple.className = "ripple-wave"
            button.appendChild(ripple)
            setTimeout(() => ripple.remove(), 600)

            onClick?.(e)
        }

        return (
            <button
                className={cn(
                    "ripple-container inline-flex items-center justify-center rounded-full font-bold",
                    "transition-all duration-300 ease-out",
                    "disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                onClick={handleClick}
                {...props}
            >
                {children}
            </button>
        )
    }
)
Button.displayName = "Button"

export { Button }
