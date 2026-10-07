import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"

const profileFields = [
    { id: "firstName", labelClassName: "h-3 w-20" },
    { id: "lastName", labelClassName: "h-3 w-20" },
    { id: "department", labelClassName: "h-3 w-24" },
    { id: "position", labelClassName: "h-3 w-16" },
] as const

type Props = {
    label?: ReactNode
}

export const UserProfileSkeleton = ({ label }: Props) => {
    return (
        <main className="min-h-0 w-full flex-1 bg-background px-6 py-6 text-foreground">
            <div
                aria-busy="true"
                aria-live="polite"
                role="status"
                className="mx-auto w-full max-w-5xl space-y-8 px-4 py-6 sm:px-8"
            >
                {label ? <span className="sr-only">{label}</span> : null}
                <div className="flex flex-col items-center space-y-4 text-center">
                    <div className="flex items-center justify-center gap-4">
                        <Skeleton className="size-28 shrink-0 rounded-full" />
                        <div className="flex flex-col items-start gap-2">
                            <Skeleton className="h-4 w-36" />
                            <Skeleton className="h-3 w-48" />
                        </div>
                    </div>
                    <div className="flex flex-col items-center gap-2">
                        <Skeleton className="h-7 w-48" />
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-44" />
                    </div>
                </div>
                <div className="grid grid-cols-1 gap-x-8 gap-y-6 md:grid-cols-2">
                    {profileFields.map((field) => (
                        <div key={field.id} className="flex flex-col gap-2">
                            <Skeleton className={field.labelClassName} />
                            <Skeleton className="h-12 w-full rounded-md" />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col items-center justify-end gap-4 border-t border-border pt-6 sm:flex-row">
                    <Skeleton className="h-9 w-full rounded-md sm:w-30" />
                    <Skeleton className="h-9 w-full rounded-md sm:w-30" />
                </div>
            </div>
        </main>
    )
}
