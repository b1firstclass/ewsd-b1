import * as React from "react"
import type { ReactNode } from "react"

import { cn } from "@/lib/utils"

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
  children?: ReactNode
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, children, ...props }, ref) => {
    return (
      <div>
        <div className="flex items-center">
          {children}
          <input
            type={type}
            ref={ref}
            className={cn(
              "flex h-11 w-full rounded-2xl border border-input bg-background/80 px-4 py-2 text-sm shadow-sm shadow-black/5 transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-0 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-destructive focus-visible:ring-2 focus-visible:ring-destructive focus-visible:ring-offset-0"
                : "",
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-600">{error}</p>
        )}
      </div>
    )
  }
)
Input.displayName = "Input"

export { Input }
