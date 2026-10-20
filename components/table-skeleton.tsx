import { Skeleton } from "@/components/ui/skeleton"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

export type TableSkeletonColumn = {
    id: string
    className?: string
    headerClassName?: string
    cellClassName: string
}

type Props = {
    columns: TableSkeletonColumn[]
    rows?: number
    className?: string
}

export const TableSkeleton = ({ columns, rows = 8, className }: Props) => {
    return (
        <div aria-busy="true" className={className}>
            <Table>
                <TableHeader>
                    <TableRow>
                        {columns.map((column) => (
                            <TableHead
                                key={column.id}
                                className={column.className}
                            >
                                {column.headerClassName ? (
                                    <Skeleton
                                        className={column.headerClassName}
                                    />
                                ) : null}
                            </TableHead>
                        ))}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {Array.from({ length: rows }, (_, rowIndex) => (
                        <TableRow
                            key={rowIndex}
                            className="hover:bg-transparent"
                        >
                            {columns.map((column) => (
                                <TableCell
                                    key={column.id}
                                    className={column.className}
                                >
                                    <Skeleton
                                        className={column.cellClassName}
                                    />
                                </TableCell>
                            ))}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    )
}
