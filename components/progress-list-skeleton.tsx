import { Skeleton } from "@/components/ui/skeleton"

type Props = {
    groups?: number
    items?: number
    compact?: boolean
}

export const ProgressListSkeleton = ({
    groups = 2,
    items = 6,
    compact = false,
}: Props) => {
    return (
        <div
            aria-busy="true"
            className={
                compact
                    ? "mx-auto w-full max-w-275"
                    : "w-full max-w-6xl px-6 py-6 lg:pl-50"
            }
        >
            {Array.from({ length: groups }, (_, groupIndex) => (
                <div key={groupIndex} className="mb-8">
                    <Skeleton className="mb-4 h-5 w-36" />
                    <div className="grid grid-cols-2 gap-x-12 gap-y-3.5 lg:grid-cols-3 lg:gap-x-16">
                        {Array.from({ length: items }, (_, itemIndex) => (
                            <div
                                key={itemIndex}
                                className="flex items-center gap-3 px-2 py-1.5"
                            >
                                <Skeleton className="h-1.5 w-16 rounded-none" />
                                <Skeleton className="h-4 w-24" />
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    )
}
