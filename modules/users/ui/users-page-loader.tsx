import type { ReactNode } from "react"

type Props = {
    label?: ReactNode
}

export const UsersPageLoader = ({ label }: Props) => {
    return (
        <div
            aria-live="polite"
            role="status"
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
        >
            {label ? <span className="sr-only">{label}</span> : null}
            <span className="relative size-12 rounded-full bg-background/80">
                <span className="absolute inset-0 rounded-full border-4 border-[#e6e6e6] dark:border-white/20" />
                <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#c63031]" />
            </span>
        </div>
    )
}
