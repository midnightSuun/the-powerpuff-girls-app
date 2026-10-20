import { Skeleton } from "@/components/ui/skeleton"

export type AdminTableSkeletonColumn = {
    id: string
    className?: string
    headerClassName?: string
    cellClassName: string
}

type Props = {
    columns: AdminTableSkeletonColumn[]
    rows?: number
    className?: string
    showActions?: boolean
}

export const AdminTableSkeleton = ({
    columns,
    rows = 8,
    className,
    showActions = true,
}: Props) => {
    return (
        <div aria-busy="true" className={className}>
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="h-12 border-b border-[#383838]">
                            {columns.map((column) => (
                                <th
                                    key={column.id}
                                    className={`px-4 align-middle font-medium text-foreground ${column.className ?? ""}`}
                                >
                                    {column.headerClassName ? (
                                        <Skeleton
                                            className={column.headerClassName}
                                        />
                                    ) : null}
                                </th>
                            ))}
                            {showActions ? (
                                <th className="w-10 px-4 align-middle" />
                            ) : null}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: rows }, (_, rowIndex) => (
                            <tr
                                key={rowIndex}
                                className="h-14 border-b border-[#383838]"
                            >
                                {columns.map((column) => (
                                    <td
                                        key={column.id}
                                        className={`px-4 align-middle ${column.className ?? ""}`}
                                    >
                                        <Skeleton
                                            className={column.cellClassName}
                                        />
                                    </td>
                                ))}
                                {showActions ? (
                                    <td className="relative px-4 text-right align-middle">
                                        <Skeleton className="ml-auto size-4" />
                                    </td>
                                ) : null}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    )
}
