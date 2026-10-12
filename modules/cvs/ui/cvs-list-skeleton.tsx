import { Skeleton } from "@/components/ui/skeleton"

const rows = 8

type Props = {
    showSearch?: boolean
}

export const CvsListSkeleton = ({ showSearch = true }: Props) => {
    return (
        <div aria-busy="true" className="mx-auto max-w-7xl space-y-6 p-6">
            {showSearch ? (
                <Skeleton className="h-9 w-80 max-w-full rounded-full" />
            ) : null}
            <div>
                <div className="grid grid-cols-[1fr_1fr_auto] items-center border-b border-border px-2 py-4 lg:grid-cols-[35%_35%_25%_auto]">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="hidden h-4 w-20 lg:block" />
                    <span />
                </div>
                {Array.from({ length: rows }, (_, index) => (
                    <div
                        key={index}
                        className="grid grid-cols-[1fr_1fr_auto] items-center border-b border-border px-2 py-4 lg:grid-cols-[35%_35%_25%_auto]"
                    >
                        <Skeleton className="h-4 w-40 max-w-full" />
                        <Skeleton className="h-4 w-32 max-w-full" />
                        <Skeleton className="hidden h-4 w-36 lg:block" />
                        <Skeleton className="size-4 justify-self-end rounded-full" />
                    </div>
                ))}
            </div>
        </div>
    )
}
