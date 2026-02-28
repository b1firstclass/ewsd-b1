import { cn } from "@/lib/utils"

interface SpinnerProps {
  className?: string
  label?: string
}

export function Spinner({ className, label = "Loading" }: SpinnerProps) {
  return (
    <div className={cn("flex flex-col items-center gap-3 text-muted-foreground", className)}>
      <div className="relative h-12 w-12">
        <div className="absolute inset-0 rounded-full border-2 border-primary/20" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-primary border-r-primary/70 animate-spin" />
        <div className="absolute inset-2 rounded-full bg-primary/10 blur-sm" />
      </div>
      <span className="text-xs uppercase tracking-[0.35em]">{label}</span>
    </div>
  )
}
