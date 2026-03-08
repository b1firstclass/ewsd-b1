import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex cursor-pointer items-center justify-center gap-2 rounded-full text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary/90",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline:
          "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-9 px-4 text-xs",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10 p-0",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: string
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      asChild = false,
      isLoading = false,
      loadingText = "Loading...",
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button"
    const isDisabled = Boolean(disabled || isLoading)
    const isIconButton = size === "icon"
    const loadingContent = (
      <>
        <span
          aria-hidden="true"
          className="h-4 w-4 animate-spin rounded-full border-2 border-current/25 border-t-current"
        />
        {!isIconButton ? <span>{loadingText}</span> : null}
      </>
    )

    const sharedClassName = cn(
      buttonVariants({ variant, size, className }),
      isDisabled ? "cursor-not-allowed" : "",
      asChild && isDisabled ? "pointer-events-none opacity-50" : "",
    )

    if (asChild) {
      return (
        <Comp
          className={sharedClassName}
          ref={ref}
          aria-busy={isLoading || undefined}
          aria-disabled={isDisabled || undefined}
          {...props}
        >
          {isLoading ? loadingContent : children}
        </Comp>
      )
    }

    return (
      <Comp
        className={sharedClassName}
        ref={ref}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? loadingContent : children}
      </Comp>
    )
  },
)
Button.displayName = "Button"

export { Button, buttonVariants }
