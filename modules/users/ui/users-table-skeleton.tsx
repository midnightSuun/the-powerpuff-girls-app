import type { ReactNode } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

const DEFAULT_ROW_COUNT = 10

const textColumns: {
    id: string
    headerClassName: string
    cellClassName: string
    className?: string
}[] = [
    { id: "firstName", headerClassName: "h-4 w-20", cellClassName: "h-4 w-24" },
    { id: "lastName", headerClassName: "h-4 w-20", cellClassName: "h-4 w-28" },
    {
        id: "email",
        headerClassName: "h-4 w-12",
        cellClassName: "h-4 w-40",
        className: "hidden lg:table-cell",
    },
    {
        id: "department",
        headerClassName: "h-4 w-24",
        cellClassName: "h-4 w-28",
    },
    {
        id: "position",
        headerClassName: "h-4 w-16",
        cellClassName: "h-4 w-24",
        className: "hidden lg:table-cell",
    },
]

type Props = {
    label?: ReactNode
    rows?: number
}

const UsersPaginationSkeleton = () => {
    return (
        <div className="flex justify-center px-4 py-4">
            <div className="flex items-center gap-1.5">
                <Skeleton className="h-9 w-24 rounded-lg" />
                <Skeleton className="size-9 rounded-lg" />
                <Skeleton className="size-9 rounded-lg" />
                <Skeleton className="size-9 rounded-lg" />
                <Skeleton className="h-9 w-20 rounded-lg" />
            </div>
        </div>
    )
}

export const UsersTableSkeleton = ({
    label,
    rows = DEFAULT_ROW_COUNT,
}: Props) => {
    return (
        <div aria-busy="true" aria-live="polite" role="status">
            {label ? <span className="sr-only">{label}</span> : null}
            <Table>
                <TableHeader>
                    <TableRow className="hover:bg-transparent">
                        <TableHead className="w-12" />
                        {textColumns.map((column) => (
                            <TableHead
                                key={column.id}
                                className={column.className}
                            >
                                <Skeleton className={column.headerClassName} />
                            </TableHead>
                        ))}
                        <TableHead className="w-10" />
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }, (_, rowIndex) => (
                        <TableRow
                            key={rowIndex}
                            className="hover:bg-transparent"
                        >
                            <TableCell>
                                <Skeleton className="size-8 rounded-full" />
                            </TableCell>
                            {textColumns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    className={column.className}
                                >
                                    <Skeleton
                                        className={column.cellClassName}
                                    />
                                </TableCell>
                            ))}
                            <TableCell>
                                <Skeleton className="size-6 rounded-full" />
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <UsersPaginationSkeleton />
        </div>
    )
}
