import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
    size?: 'sm' | 'md' | 'lg'
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: "bg-primary text-white hover:bg-primary/90 premium-shadow",
            secondary: "bg-secondary text-primary hover:bg-secondary/80",
            outline: "border-2 border-primary/10 text-primary hover:bg-primary/5",
            ghost: "hover:bg-primary/5 text-primary",
        }

        const sizes = {
            sm: "h-9 px-4 text-xs",
            md: "h-12 px-8 text-sm",
            lg: "h-14 px-10 text-base",
        }

        return (
            <button
                className={cn(
                    "inline-flex items-center justify-center rounded-full font-bold transition-all disabled:opacity-50 disabled:pointer-events-none active:scale-[0.98]",
                    variants[variant],
                    sizes[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }
