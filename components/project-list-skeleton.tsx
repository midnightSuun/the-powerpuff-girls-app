import { Skeleton } from "@/components/ui/skeleton"

type Props = {
    rows?: number
}

export const ProjectListSkeleton = ({ rows = 4 }: Props) => {
    return (
        <div aria-busy="true" className="space-y-3">
            <Skeleton className="h-7.5 w-full max-w-77.5 rounded-full" />
            <div>
                {Array.from({ length: rows }, (_, index) => (
                    <div
                        key={index}
                        className="space-y-2 border-b border-border px-2 py-3"
                    >
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="hidden h-4 w-20 lg:block" />
                            <Skeleton className="hidden h-4 w-20 lg:block" />
                        </div>
                        <Skeleton className="h-3 w-full max-w-xl" />
                    </div>
                ))}
            </div>
        </div>
    )
}
