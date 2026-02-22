import type { ReactNode } from "react"

export const BackgroundTheme = ({ children }: { children: ReactNode }) => {
    return (
        <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(20,184,166,0.25),_transparent_55%),radial-gradient(circle_at_30%_30%,_rgba(248,250,252,0.8),_transparent_45%),linear-gradient(120deg,_#f5f3ef_0%,_#fdfbf7_55%,_#eef7f7_100%)] text-foreground">
            {children}
        </div>
    )
}