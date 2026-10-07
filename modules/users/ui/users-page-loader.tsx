import type { ReactNode } from "react"

type Props = {
    label?: ReactNode
}

export const UsersPageLoader = ({ label }: Props) => {
    return (
        <div
            aria-busy="true"
            aria-live="polite"
            role="status"
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
        >
            {label ? <span className="sr-only">{label}</span> : null}
            <span className="relative size-12">
                <span className="absolute inset-0 rounded-full border-4 border-white" />
                <span className="absolute inset-0 animate-spin rounded-full border-4 border-transparent border-t-[#c63031]" />
            </span>
        </div>
    )
}
